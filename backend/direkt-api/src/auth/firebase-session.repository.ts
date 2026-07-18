import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../platform/database/database.service';

export interface CreateFirebaseSessionInput {
  subjectHash: string;
  contactHash: string;
  displayHint: string;
  sessionId: string;
  familyId: string;
  refreshTokenHash: string;
  sessionExpiresAt: Date;
  deviceLabel: string;
  userAgentHash: string | null;
  ipHash: string | null;
  requestId?: string;
}

export type CreateFirebaseSessionResult =
  | {
      kind: 'success';
      identityId: string;
      sessionId: string;
      sessionExpiresAt: string;
      displayHint: string;
    }
  | { kind: 'identity_conflict' }
  | { kind: 'identity_disabled' };

@Injectable()
export class FirebaseSessionRepository {
  constructor(private readonly database: DatabaseService) {}

  createSession(input: CreateFirebaseSessionInput): Promise<CreateFirebaseSessionResult> {
    return this.database.transaction(async (client) => {
      const boundIdentity = await client.query<{
        identity_id: string;
        status: string;
      }>(
        `SELECT external.identity_id, identities.status
         FROM account.external_identities AS external
         JOIN account.identities AS identities ON identities.id = external.identity_id
         WHERE external.provider = 'firebase'
           AND external.subject_hash = $1
         FOR UPDATE OF external, identities`,
        [input.subjectHash],
      );

      let identityId: string;
      const existingBinding = boundIdentity.rows[0];
      if (existingBinding) {
        if (existingBinding.status !== 'active') {
          return { kind: 'identity_disabled' };
        }
        identityId = existingBinding.identity_id;
        const matchingContact = await client.query<{ id: string }>(
          `SELECT id
           FROM account.contacts
           WHERE identity_id = $1
             AND channel = 'phone'
             AND value_hash = $2
           FOR UPDATE`,
          [identityId, input.contactHash],
        );
        if (!matchingContact.rows[0]) {
          await this.insertDeniedAudit(client, input, identityId, 'firebase_subject_phone_mismatch');
          return { kind: 'identity_conflict' };
        }
        await client.query(
          `UPDATE account.external_identities
           SET last_seen_at = now()
           WHERE provider = 'firebase' AND subject_hash = $1`,
          [input.subjectHash],
        );
      } else {
        const existingContact = await client.query<{
          id: string;
          identity_id: string;
          status: string;
        }>(
          `SELECT contacts.id, contacts.identity_id, identities.status
           FROM account.contacts AS contacts
           JOIN account.identities AS identities ON identities.id = contacts.identity_id
           WHERE contacts.channel = 'phone' AND contacts.value_hash = $1
           FOR UPDATE OF contacts, identities`,
          [input.contactHash],
        );
        const contact = existingContact.rows[0];
        if (contact) {
          if (contact.status !== 'active') {
            return { kind: 'identity_disabled' };
          }
          identityId = contact.identity_id;
          const otherBinding = await client.query<{ subject_hash: string }>(
            `SELECT subject_hash
             FROM account.external_identities
             WHERE identity_id = $1 AND provider = 'firebase'
             FOR UPDATE`,
            [identityId],
          );
          if (otherBinding.rows[0]) {
            await this.insertDeniedAudit(
              client,
              input,
              identityId,
              'phone_already_bound_to_other_firebase_subject',
            );
            return { kind: 'identity_conflict' };
          }
          await client.query(
            `UPDATE account.contacts
             SET verified_at = COALESCE(verified_at, now())
             WHERE id = $1`,
            [contact.id],
          );
        } else {
          const identityResult = await client.query<{ id: string }>(
            `INSERT INTO account.identities DEFAULT VALUES RETURNING id`,
          );
          const identity = identityResult.rows[0];
          if (!identity) {
            throw new Error('Identity creation returned no row.');
          }
          identityId = identity.id;
          await client.query(
            `INSERT INTO account.contacts (
               identity_id,
               channel,
               value_hash,
               display_hint,
               verified_at
             ) VALUES ($1, 'phone', $2, $3, now())`,
            [identityId, input.contactHash, input.displayHint],
          );
          await client.query(
            `INSERT INTO authz.role_assignments (
               identity_id,
               role_id,
               scope_type,
               reason
             )
             SELECT $1, id, 'global', 'Initial Firebase verified phone registration'
             FROM authz.roles
             WHERE role_key = 'customer'`,
            [identityId],
          );
        }

        await client.query(
          `INSERT INTO account.external_identities (
             identity_id,
             provider,
             subject_hash
           ) VALUES ($1, 'firebase', $2)`,
          [identityId, input.subjectHash],
        );
      }

      await client.query(
        `INSERT INTO account.sessions (
           id,
           identity_id,
           family_id,
           refresh_token_hash,
           expires_at,
           device_label,
           user_agent_hash,
           ip_hash
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          input.sessionId,
          identityId,
          input.familyId,
          input.refreshTokenHash,
          input.sessionExpiresAt,
          input.deviceLabel,
          input.userAgentHash,
          input.ipHash,
        ],
      );
      await this.insertAudit(client, {
        requestId: input.requestId,
        actorId: identityId,
        action: 'firebase_session_created',
        resourceId: input.sessionId,
        outcome: 'success',
        metadata: {
          channel: 'phone',
          identityProvider: 'firebase',
          rawProviderSubjectStored: false,
        },
      });

      return {
        kind: 'success',
        identityId,
        sessionId: input.sessionId,
        sessionExpiresAt: input.sessionExpiresAt.toISOString(),
        displayHint: input.displayHint,
      };
    });
  }

  private insertDeniedAudit(
    client: PoolClient,
    input: CreateFirebaseSessionInput,
    actorId: string,
    reason: string,
  ): Promise<void> {
    return this.insertAudit(client, {
      requestId: input.requestId,
      actorId,
      action: 'firebase_identity_binding_denied',
      resourceId: input.sessionId,
      outcome: 'denied',
      metadata: { reason, rawProviderSubjectStored: false },
    });
  }

  private async insertAudit(
    client: PoolClient,
    input: {
      requestId: string | undefined;
      actorId: string;
      action: string;
      resourceId: string;
      outcome: 'success' | 'denied' | 'failed';
      metadata: Record<string, unknown>;
    },
  ): Promise<void> {
    await client.query(
      `INSERT INTO platform.audit_events (
         request_id,
         actor_type,
         actor_id,
         action,
         resource_type,
         resource_id,
         outcome,
         metadata
       ) VALUES ($1, 'identity', $2, $3, 'session', $4, $5, $6::jsonb)`,
      [
        input.requestId ?? null,
        input.actorId,
        input.action,
        input.resourceId,
        input.outcome,
        JSON.stringify(input.metadata),
      ],
    );
  }
}
