import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../platform/database/database.service';

export interface CreateFirebaseSessionInput {
  subjectHash: string;
  contactHash: string;
  displayHint: string;
  noticeVersion: string;
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
  | { kind: 'identity_disabled' }
  | { kind: 'invite_required' }
  | { kind: 'notice_unavailable' };

interface PendingInvitation {
  id: string;
  participant_type: 'customer' | 'provider';
}

@Injectable()
export class FirebaseSessionRepository {
  constructor(private readonly database: DatabaseService) {}

  createSession(input: CreateFirebaseSessionInput): Promise<CreateFirebaseSessionResult> {
    return this.database.transaction(async (client) => {
      await this.lockIdentityBinding(client, input.subjectHash, input.contactHash);
      await client.query(
        `UPDATE account.pilot_invitations
         SET status = 'expired'
         WHERE contact_hash = $1 AND status = 'pending' AND expires_at <= now()`,
        [input.contactHash],
      );
      const policyVersionId = await this.currentPolicyVersionId(client, input.noticeVersion);
      if (!policyVersionId) {
        return { kind: 'notice_unavailable' };
      }

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
          await this.insertDeniedAudit(
            client,
            input,
            identityId,
            'firebase_subject_phone_mismatch',
          );
          return { kind: 'identity_conflict' };
        }

        const admitted = await this.hasCurrentAdmission(client, identityId, policyVersionId);
        if (!admitted) {
          const invitation = await this.pendingInvitation(client, input.contactHash, policyVersionId);
          if (!invitation) {
            await this.insertDeniedAudit(client, input, identityId, 'current_invitation_required');
            return { kind: 'invite_required' };
          }
          await this.claimInvitationAndRecordConsent(
            client,
            invitation,
            identityId,
            policyVersionId,
            input.requestId,
          );
        }
        await client.query(
          `UPDATE account.external_identities
           SET last_seen_at = now()
           WHERE provider = 'firebase' AND subject_hash = $1`,
          [input.subjectHash],
        );
      } else {
        const existingContact = await client.query<{
          identity_id: string;
          status: string;
        }>(
          `SELECT contacts.identity_id, identities.status
           FROM account.contacts AS contacts
           JOIN account.identities AS identities ON identities.id = contacts.identity_id
           WHERE contacts.channel = 'phone' AND contacts.value_hash = $1
           FOR UPDATE OF contacts, identities`,
          [input.contactHash],
        );
        const contact = existingContact.rows[0];
        if (contact) {
          await this.insertDeniedAudit(
            client,
            input,
            contact.identity_id,
            'existing_unbound_phone_requires_recovery',
          );
          return { kind: contact.status === 'active' ? 'identity_conflict' : 'identity_disabled' };
        }

        const invitation = await this.pendingInvitation(client, input.contactHash, policyVersionId);
        if (!invitation) {
          return { kind: 'invite_required' };
        }

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
           SELECT $1, id, 'global', 'Initial invited Firebase verified phone registration'
           FROM authz.roles
           WHERE role_key = 'customer'`,
          [identityId],
        );
        await client.query(
          `INSERT INTO account.external_identities (
             identity_id,
             provider,
             subject_hash
           ) VALUES ($1, 'firebase', $2)`,
          [identityId, input.subjectHash],
        );
        await this.claimInvitationAndRecordConsent(
          client,
          invitation,
          identityId,
          policyVersionId,
          input.requestId,
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
          noticeVersion: input.noticeVersion,
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

  private async currentPolicyVersionId(
    client: PoolClient,
    noticeVersion: string,
  ): Promise<string | null> {
    const result = await client.query<{ id: string }>(
      `SELECT id
       FROM account.policy_versions
       WHERE policy_key = 'pilot_participation_notice'
         AND version = $1
         AND effective_at <= now()
         AND (retired_at IS NULL OR retired_at > now())
       ORDER BY effective_at DESC
       LIMIT 1`,
      [noticeVersion],
    );
    return result.rows[0]?.id ?? null;
  }

  private async hasCurrentAdmission(
    client: PoolClient,
    identityId: string,
    policyVersionId: string,
  ): Promise<boolean> {
    const result = await client.query<{ admitted: boolean }>(
      `SELECT (
         EXISTS (
           SELECT 1
           FROM account.pilot_invitations
           WHERE claimed_identity_id = $1
             AND policy_version_id = $2
             AND status = 'claimed'
         )
         AND COALESCE((
           SELECT status = 'accepted'
           FROM account.consents
           WHERE identity_id = $1 AND policy_version_id = $2
           ORDER BY recorded_at DESC, id DESC
           LIMIT 1
         ), false)
       ) AS admitted`,
      [identityId, policyVersionId],
    );
    return result.rows[0]?.admitted ?? false;
  }

  private async pendingInvitation(
    client: PoolClient,
    contactHash: string,
    policyVersionId: string,
  ): Promise<PendingInvitation | null> {
    const result = await client.query<PendingInvitation>(
      `SELECT id, participant_type
       FROM account.pilot_invitations
       WHERE contact_hash = $1
         AND policy_version_id = $2
         AND status = 'pending'
         AND expires_at > now()
       FOR UPDATE`,
      [contactHash, policyVersionId],
    );
    return result.rows[0] ?? null;
  }

  private async claimInvitationAndRecordConsent(
    client: PoolClient,
    invitation: PendingInvitation,
    identityId: string,
    policyVersionId: string,
    requestId?: string,
  ): Promise<void> {
    const claimed = await client.query<{ id: string }>(
      `UPDATE account.pilot_invitations
       SET status = 'claimed', claimed_identity_id = $2, claimed_at = now()
       WHERE id = $1 AND status = 'pending'
       RETURNING id`,
      [invitation.id, identityId],
    );
    if (!claimed.rows[0]) {
      throw new Error('Pilot invitation could not be claimed.');
    }
    await client.query(
      `INSERT INTO account.consents (
         identity_id,
         policy_version_id,
         status,
         source,
         request_id
       ) VALUES ($1, $2, 'accepted', 'android_firebase_pilot_exchange', $3)`,
      [identityId, policyVersionId, requestId ?? null],
    );
  }

  private async lockIdentityBinding(
    client: PoolClient,
    subjectHash: string,
    contactHash: string,
  ): Promise<void> {
    const lockKeys = [`firebase:${subjectHash}`, `phone:${contactHash}`].sort();
    for (const lockKey of lockKeys) {
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [lockKey]);
    }
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
