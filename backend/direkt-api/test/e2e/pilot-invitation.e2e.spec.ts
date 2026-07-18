import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';
import { AppModule } from '../../src/app.module';
import { PilotInvitationService } from '../../src/auth/pilot-invitation.service';

const NOTICE_VERSION = 'pilot-invitation-test-v1';

describe('Phase 11 pilot invitation operations', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });
  let app: INestApplication;
  let invitations: PilotInvitationService;
  let actorIdentityId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.PILOT_NOTICE_VERSION = NOTICE_VERSION;
    await runMigrations(url);
    const actor = await pool.query<{ id: string }>(
      `INSERT INTO account.identities DEFAULT VALUES RETURNING id`,
    );
    actorIdentityId = actor.rows[0]?.id ?? '';
    if (!actorIdentityId) {
      throw new Error('Failed to create pilot invitation test actor.');
    }
    await pool.query(
      `INSERT INTO account.policy_versions (
         policy_key,
         version,
         document_hash,
         effective_at
       ) VALUES ('pilot_participation_notice', $1, $2, now() - interval '1 minute')
       ON CONFLICT (policy_key, version) DO UPDATE
       SET document_hash = EXCLUDED.document_hash,
           effective_at = EXCLUDED.effective_at,
           retired_at = NULL`,
      [NOTICE_VERSION, '9'.repeat(64)],
    );

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    invitations = app.get(PilotInvitationService);
  });

  afterAll(async () => {
    delete process.env.PILOT_NOTICE_VERSION;
    await app.close();
    await pool.end();
  });

  it('stores only a contact digest and masked display hint for an invitation', async () => {
    const phoneNumber = '+260971111111';
    const invitation = await invitations.create(
      {
        phoneNumber,
        participantType: 'customer',
        cohortWave: 1,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      actorIdentityId,
      randomUUID(),
    );

    expect(invitation.displayHint).not.toContain(phoneNumber);
    expect(invitation.noticeVersion).toBe(NOTICE_VERSION);
    expect(invitation.status).toBe('pending');

    const stored = await pool.query<{
      contact_hash: string;
      display_hint: string;
    }>(
      `SELECT contact_hash, display_hint
       FROM account.pilot_invitations
       WHERE id = $1`,
      [invitation.id],
    );
    expect(stored.rows[0]?.contact_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored.rows[0]?.contact_hash).not.toContain(phoneNumber);
    expect(stored.rows[0]?.display_hint).toBe(invitation.displayHint);
  });

  it('rejects a second pending invitation for the same contact', async () => {
    const phoneNumber = '+260972222222';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await invitations.create(
      { phoneNumber, participantType: 'provider', cohortWave: 1, expiresAt },
      actorIdentityId,
    );

    await expect(
      invitations.create(
        { phoneNumber, participantType: 'provider', cohortWave: 1, expiresAt },
        actorIdentityId,
      ),
    ).rejects.toThrow('A pending pilot invitation already exists');
  });

  it('revokes an unclaimed invitation and removes it from pending admission', async () => {
    const invitation = await invitations.create(
      {
        phoneNumber: '+260973333333',
        participantType: 'customer',
        cohortWave: 1,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      actorIdentityId,
    );

    await expect(
      invitations.revoke(
        invitation.id,
        { reason: 'Participant withdrew before enrollment' },
        actorIdentityId,
      ),
    ).resolves.toEqual({ revoked: true, invitationId: invitation.id });

    const stored = await pool.query<{ status: string }>(
      `SELECT status FROM account.pilot_invitations WHERE id = $1`,
      [invitation.id],
    );
    expect(stored.rows[0]?.status).toBe('revoked');
  });
});
