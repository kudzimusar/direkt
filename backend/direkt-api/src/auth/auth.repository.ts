import { timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../platform/database/database.service';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import type { ContactChannel } from './contact-normalizer';
import type { ChallengeVerificationResult, SessionRotationResult, SessionView } from './auth.types';

interface ChallengeRow {
  id: string;
  channel: ContactChannel;
  contact_hash: string;
  display_hint: string;
  code_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
  failed_attempts: number;
  max_attempts: number;
}

interface SessionRow {
  id: string;
  identity_id: string;
  family_id: string;
  expires_at: Date;
  revoked_at: Date | null;
  replacement_session_id: string | null;
}

export interface CreateChallengeInput {
  id: string;
  channel: ContactChannel;
  contactHash: string;
  displayHint: string;
  codeHash: string;
  expiresAt: Date;
  requestFingerprint: string | null;
}

export interface VerifyChallengeInput {
  challengeId: string;
  providedCodeHash: string;
  sessionId: string;
  familyId: string;
  refreshTokenHash: string;
  sessionExpiresAt: Date;
  deviceLabel: string;
  userAgentHash: string | null;
  ipHash: string | null;
  requestId?: string;
}

export interface RotateSessionInput {
  currentRefreshTokenHash: string;
  replacementSessionId: string;
  replacementRefreshTokenHash: string;
  replacementExpiresAt: Date;
  deviceLabel: string;
  userAgentHash: string | null;
  ipHash: string | null;
  requestId?: string;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly database: DatabaseService) {}

  async createChallenge(input: CreateChallengeInput): Promise<void> {
    await this.database.query(
      `INSERT INTO account.authentication_challenges (
         id,
         channel,
         contact_hash,
         display_hint,
         code_hash,
         expires_at,
         request_fingerprint
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        input.id,
        input.channel,
        input.contactHash,
        input.displayHint,
        input.codeHash,
        input.expiresAt,
        input.requestFingerprint,
      ],
    );
  }

  verifyChallengeAndCreateSession(
    input: VerifyChallengeInput,
  ): Promise<ChallengeVerificationResult> {
    return this.database.transaction(async (client) => {
      const challengeResult = await client.query<ChallengeRow>(
        `SELECT
           id,
           channel,
           contact_hash,
           display_hint,
           code_hash,
           expires_at,
           consumed_at,
           failed_attempts,
           max_attempts
         FROM account.authentication_challenges
         WHERE id = $1
         FOR UPDATE`,
        [input.challengeId],
      );
      const challenge = challengeResult.rows[0];
      if (!challenge || challenge.consumed_at) {
        return { kind: 'invalid' };
      }
      if (challenge.expires_at.getTime() <= Date.now()) {
        return { kind: 'expired' };
      }
      if (challenge.failed_attempts >= challenge.max_attempts) {
        return { kind: 'locked' };
      }

      const expectedHash = Buffer.from(challenge.code_hash, 'hex');
      const providedHash = Buffer.from(input.providedCodeHash, 'hex');
      const valid =
        expectedHash.length === providedHash.length && timingSafeEqual(expectedHash, providedHash);
      if (!valid) {
        const nextAttempts = challenge.failed_attempts + 1;
        await client.query(
          `UPDATE account.authentication_challenges
           SET failed_attempts = $2
           WHERE id = $1`,
          [challenge.id, nextAttempts],
        );
        return { kind: nextAttempts >= challenge.max_attempts ? 'locked' : 'invalid' };
      }

      await client.query(
        `UPDATE account.authentication_challenges
         SET consumed_at = now()
         WHERE id = $1`,
        [challenge.id],
      );

      const contactResult = await client.query<{
        id: string;
        identity_id: string;
      }>(
        `SELECT id, identity_id
         FROM account.contacts
         WHERE channel = $1 AND value_hash = $2
         FOR UPDATE`,
        [challenge.channel, challenge.contact_hash],
      );

      let identityId: string;
      const existingContact = contactResult.rows[0];
      if (existingContact) {
        identityId = existingContact.identity_id;
        await client.query(
          `UPDATE account.contacts
           SET verified_at = COALESCE(verified_at, now())
           WHERE id = $1`,
          [existingContact.id],
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
           ) VALUES ($1, $2, $3, $4, now())`,
          [identityId, challenge.channel, challenge.contact_hash, challenge.display_hint],
        );
        await client.query(
          `INSERT INTO authz.role_assignments (
             identity_id,
             role_id,
             scope_type,
             reason
           )
           SELECT $1, id, 'global', 'Initial verified contact registration'
           FROM authz.roles
           WHERE role_key = 'customer'`,
          [identityId],
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
        action: 'session_created',
        resourceId: input.sessionId,
        metadata: {
          channel: challenge.channel,
          syntheticChallenge: true,
        },
      });

      return {
        kind: 'success',
        identityId,
        sessionId: input.sessionId,
        sessionExpiresAt: input.sessionExpiresAt.toISOString(),
        channel: challenge.channel,
        displayHint: challenge.display_hint,
      };
    });
  }

  rotateSession(input: RotateSessionInput): Promise<SessionRotationResult> {
    return this.database.transaction(async (client) => {
      const result = await client.query<SessionRow>(
        `SELECT
           id,
           identity_id,
           family_id,
           expires_at,
           revoked_at,
           replacement_session_id
         FROM account.sessions
         WHERE refresh_token_hash = $1
         FOR UPDATE`,
        [input.currentRefreshTokenHash],
      );
      const current = result.rows[0];
      if (!current) {
        return { kind: 'invalid' };
      }

      if (current.revoked_at) {
        if (current.replacement_session_id) {
          await client.query(
            `UPDATE account.sessions
             SET revoked_at = COALESCE(revoked_at, now()),
                 revocation_reason = COALESCE(revocation_reason, 'Refresh token reuse detected'),
                 reuse_detected_at = COALESCE(reuse_detected_at, now())
             WHERE family_id = $1`,
            [current.family_id],
          );
          await this.insertAudit(client, {
            requestId: input.requestId,
            actorId: current.identity_id,
            action: 'refresh_token_reuse_detected',
            resourceId: current.id,
            outcome: 'denied',
            metadata: { familyRevoked: true },
          });
          return { kind: 'reused' };
        }
        return { kind: 'invalid' };
      }

      if (current.expires_at.getTime() <= Date.now()) {
        await client.query(
          `UPDATE account.sessions
           SET revoked_at = now(), revocation_reason = 'Session expired'
           WHERE id = $1`,
          [current.id],
        );
        return { kind: 'expired' };
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
          input.replacementSessionId,
          current.identity_id,
          current.family_id,
          input.replacementRefreshTokenHash,
          input.replacementExpiresAt,
          input.deviceLabel,
          input.userAgentHash,
          input.ipHash,
        ],
      );
      await client.query(
        `UPDATE account.sessions
         SET revoked_at = now(),
             revocation_reason = 'Rotated',
             replacement_session_id = $2
         WHERE id = $1`,
        [current.id, input.replacementSessionId],
      );
      await this.insertAudit(client, {
        requestId: input.requestId,
        actorId: current.identity_id,
        action: 'session_rotated',
        resourceId: current.id,
        metadata: { replacementSessionId: input.replacementSessionId },
      });

      return {
        kind: 'success',
        identityId: current.identity_id,
        sessionId: input.replacementSessionId,
        sessionExpiresAt: input.replacementExpiresAt.toISOString(),
      };
    });
  }

  async findActiveActor(identityId: string, sessionId: string): Promise<AuthenticatedActor | null> {
    const result = await this.database.query<{ identity_id: string; session_id: string }>(
      `SELECT sessions.identity_id, sessions.id AS session_id
       FROM account.sessions AS sessions
       JOIN account.identities AS identities ON identities.id = sessions.identity_id
       WHERE sessions.id = $1
         AND sessions.identity_id = $2
         AND sessions.revoked_at IS NULL
         AND sessions.expires_at > now()
         AND identities.status = 'active'`,
      [sessionId, identityId],
    );
    const row = result.rows[0];
    return row ? { identityId: row.identity_id, sessionId: row.session_id } : null;
  }

  async listSessions(identityId: string, currentSessionId: string): Promise<SessionView[]> {
    const result = await this.database.query<{
      id: string;
      device_label: string;
      created_at: Date;
      expires_at: Date;
      last_seen_at: Date;
      revoked_at: Date | null;
      reuse_detected_at: Date | null;
    }>(
      `SELECT
         id,
         device_label,
         created_at,
         expires_at,
         last_seen_at,
         revoked_at,
         reuse_detected_at
       FROM account.sessions
       WHERE identity_id = $1
       ORDER BY created_at DESC`,
      [identityId],
    );
    return result.rows.map((row) => ({
      id: row.id,
      deviceLabel: row.device_label,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      lastSeenAt: row.last_seen_at.toISOString(),
      revokedAt: row.revoked_at?.toISOString() ?? null,
      current: row.id === currentSessionId,
      reuseDetected: row.reuse_detected_at !== null,
    }));
  }

  async revokeSession(
    actor: AuthenticatedActor,
    sessionId: string,
    reason: string,
    requestId?: string,
  ): Promise<boolean> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `UPDATE account.sessions
         SET revoked_at = now(), revocation_reason = $3
         WHERE id = $1 AND identity_id = $2 AND revoked_at IS NULL
         RETURNING id`,
        [sessionId, actor.identityId, reason],
      );
      const revoked = result.rows[0];
      if (!revoked) {
        return false;
      }
      await this.insertAudit(client, {
        requestId,
        actorId: actor.identityId,
        action: 'session_revoked',
        resourceId: revoked.id,
        metadata: { selfService: true },
      });
      return true;
    });
  }

  async revokeOtherSessions(actor: AuthenticatedActor, requestId?: string): Promise<number> {
    return this.database.transaction(async (client) => {
      const result = await client.query(
        `UPDATE account.sessions
         SET revoked_at = now(), revocation_reason = 'Revoked from current device'
         WHERE identity_id = $1 AND id <> $2 AND revoked_at IS NULL`,
        [actor.identityId, actor.sessionId],
      );
      await this.insertAudit(client, {
        requestId,
        actorId: actor.identityId,
        action: 'other_sessions_revoked',
        resourceId: actor.sessionId,
        metadata: { revokedCount: result.rowCount ?? 0 },
      });
      return result.rowCount ?? 0;
    });
  }

  private async insertAudit(
    client: PoolClient,
    input: {
      requestId: string | undefined;
      actorId: string;
      action: string;
      resourceId: string;
      outcome?: 'success' | 'denied' | 'failed';
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
        input.outcome ?? 'success',
        JSON.stringify(input.metadata),
      ],
    );
  }
}
