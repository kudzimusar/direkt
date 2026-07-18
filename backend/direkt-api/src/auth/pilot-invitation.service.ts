import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../platform/database/database.service';
import { normalizeContact } from './contact-normalizer';
import type { CreatePilotInvitationDto, RevokePilotInvitationDto } from './pilot-invitation.dto';
import { TokenService } from './token.service';

export interface PilotInvitationView {
  id: string;
  displayHint: string;
  participantType: 'customer' | 'provider';
  cohortWave: number;
  noticeVersion: string;
  status: 'pending' | 'claimed' | 'revoked' | 'expired';
  expiresAt: string;
  createdAt: string;
  claimedAt: string | null;
  revokedAt: string | null;
}

@Injectable()
export class PilotInvitationService {
  private readonly noticeVersion: string | undefined;

  constructor(
    private readonly database: DatabaseService,
    private readonly tokens: TokenService,
    config: ConfigService,
  ) {
    this.noticeVersion = config.get<string>('PILOT_NOTICE_VERSION');
  }

  create(
    dto: CreatePilotInvitationDto,
    actorIdentityId: string,
    requestId?: string,
  ): Promise<PilotInvitationView> {
    const noticeVersion = this.requireNoticeVersion();
    const contact = normalizeContact('phone', dto.phoneNumber);
    const contactHash = this.tokens.hashContact(contact.value);
    const expiresAt = new Date(dto.expiresAt);
    const now = new Date();
    if (
      Number.isNaN(expiresAt.getTime()) ||
      expiresAt <= now ||
      expiresAt.getTime() > now.getTime() + 30 * 24 * 60 * 60 * 1000
    ) {
      throw new BadRequestException('Pilot invitations must expire within the next 30 days.');
    }

    return this.database.transaction(async (client) => {
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [
        `pilot-invite:${contactHash}`,
      ]);
      await client.query(
        `UPDATE account.pilot_invitations
         SET status = 'expired'
         WHERE contact_hash = $1 AND status = 'pending' AND expires_at <= now()`,
        [contactHash],
      );
      const existing = await client.query<{ id: string }>(
        `SELECT id
         FROM account.pilot_invitations
         WHERE contact_hash = $1 AND status = 'pending'
         FOR UPDATE`,
        [contactHash],
      );
      if (existing.rows[0]) {
        throw new ConflictException('A pending pilot invitation already exists for this contact.');
      }

      const policy = await client.query<{ id: string }>(
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
      const policyVersionId = policy.rows[0]?.id;
      if (!policyVersionId) {
        throw new ServiceUnavailableException(
          'The approved pilot notice version is not registered for invitations.',
        );
      }

      const result = await client.query<{
        id: string;
        participant_type: 'customer' | 'provider';
        cohort_wave: number;
        status: 'pending';
        expires_at: Date;
        created_at: Date;
      }>(
        `INSERT INTO account.pilot_invitations (
           contact_hash,
           display_hint,
           participant_type,
           cohort_wave,
           policy_version_id,
           expires_at,
           created_by_identity_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, participant_type, cohort_wave, status, expires_at, created_at`,
        [
          contactHash,
          contact.displayHint,
          dto.participantType,
          dto.cohortWave,
          policyVersionId,
          expiresAt,
          actorIdentityId,
        ],
      );
      const invitation = result.rows[0];
      if (!invitation) {
        throw new Error('Pilot invitation creation returned no row.');
      }
      await this.insertAudit(client, {
        requestId,
        actorId: actorIdentityId,
        action: 'pilot_invitation_created',
        resourceId: invitation.id,
        metadata: {
          participantType: dto.participantType,
          cohortWave: dto.cohortWave,
          noticeVersion,
          displayHint: contact.displayHint,
        },
      });
      return {
        id: invitation.id,
        displayHint: contact.displayHint,
        participantType: invitation.participant_type,
        cohortWave: invitation.cohort_wave,
        noticeVersion,
        status: invitation.status,
        expiresAt: invitation.expires_at.toISOString(),
        createdAt: invitation.created_at.toISOString(),
        claimedAt: null,
        revokedAt: null,
      };
    });
  }

  async list(): Promise<PilotInvitationView[]> {
    await this.database.query(
      `UPDATE account.pilot_invitations
       SET status = 'expired'
       WHERE status = 'pending' AND expires_at <= now()`,
    );
    const result = await this.database.query<{
      id: string;
      display_hint: string;
      participant_type: 'customer' | 'provider';
      cohort_wave: number;
      notice_version: string;
      status: 'pending' | 'claimed' | 'revoked' | 'expired';
      expires_at: Date;
      created_at: Date;
      claimed_at: Date | null;
      revoked_at: Date | null;
    }>(
      `SELECT invitations.id,
              invitations.display_hint,
              invitations.participant_type,
              invitations.cohort_wave,
              policies.version AS notice_version,
              invitations.status,
              invitations.expires_at,
              invitations.created_at,
              invitations.claimed_at,
              invitations.revoked_at
       FROM account.pilot_invitations AS invitations
       JOIN account.policy_versions AS policies ON policies.id = invitations.policy_version_id
       ORDER BY invitations.created_at DESC
       LIMIT 200`,
    );
    return result.rows.map((row) => ({
      id: row.id,
      displayHint: row.display_hint,
      participantType: row.participant_type,
      cohortWave: row.cohort_wave,
      noticeVersion: row.notice_version,
      status: row.status,
      expiresAt: row.expires_at.toISOString(),
      createdAt: row.created_at.toISOString(),
      claimedAt: row.claimed_at?.toISOString() ?? null,
      revokedAt: row.revoked_at?.toISOString() ?? null,
    }));
  }

  revoke(
    invitationId: string,
    dto: RevokePilotInvitationDto,
    actorIdentityId: string,
    requestId?: string,
  ): Promise<{ revoked: true; invitationId: string }> {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `UPDATE account.pilot_invitations
         SET status = 'revoked', revoked_at = now(), revocation_reason = $2
         WHERE id = $1 AND status = 'pending'
         RETURNING id`,
        [invitationId, dto.reason],
      );
      if (!result.rows[0]) {
        throw new NotFoundException('A pending pilot invitation was not found.');
      }
      await this.insertAudit(client, {
        requestId,
        actorId: actorIdentityId,
        action: 'pilot_invitation_revoked',
        resourceId: invitationId,
        metadata: { reason: dto.reason },
      });
      return { revoked: true, invitationId };
    });
  }

  private requireNoticeVersion(): string {
    if (!this.noticeVersion) {
      throw new ServiceUnavailableException('The approved pilot notice version is not configured.');
    }
    return this.noticeVersion;
  }

  private async insertAudit(
    client: PoolClient,
    input: {
      requestId: string | undefined;
      actorId: string;
      action: string;
      resourceId: string;
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
       ) VALUES ($1, 'identity', $2, $3, 'pilot_invitation', $4, 'success', $5::jsonb)`,
      [
        input.requestId ?? null,
        input.actorId,
        input.action,
        input.resourceId,
        JSON.stringify(input.metadata),
      ],
    );
  }
}
