import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHash, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';
import { FirebaseSessionRepository } from '../../src/auth/firebase-session.repository';
import { AppModule } from '../../src/app.module';

const NOTICE_VERSION = 'pilot-withdrawal-test-v1';

describe('Phase 11 Firebase pilot consent withdrawal', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });
  let app: INestApplication;
  let repository: FirebaseSessionRepository;
  let creatorIdentityId: string;
  let policyVersionId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const creator = await pool.query<{ id: string }>(
      'INSERT INTO account.identities DEFAULT VALUES RETURNING id',
    );
    creatorIdentityId = creator.rows[0]?.id ?? '';
    const policy = await pool.query<{ id: string }>(
      `INSERT INTO account.policy_versions (
         policy_key,
         version,
         document_hash,
         published_at,
         effective_at
       ) VALUES (
         'pilot_participation_notice',
         $1,
         $2,
         now() - interval '1 minute',
         now() - interval '1 minute'
       )
       ON CONFLICT (policy_key, version) DO UPDATE
       SET document_hash = EXCLUDED.document_hash,
           published_at = EXCLUDED.published_at,
           effective_at = EXCLUDED.effective_at,
           retired_at = NULL
       RETURNING id`,
      [NOTICE_VERSION, '8'.repeat(64)],
    );
    policyVersionId = policy.rows[0]?.id ?? '';
    if (!creatorIdentityId || !policyVersionId) {
      throw new Error('Failed to prepare consent-withdrawal test fixtures.');
    }

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    repository = app.get(FirebaseSessionRepository);
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  function input(subjectHash: string, contactHash: string) {
    return {
      subjectHash,
      contactHash,
      displayHint: '+260***890',
      noticeVersion: NOTICE_VERSION,
      sessionId: randomUUID(),
      familyId: randomUUID(),
      refreshTokenHash: createHash('sha256').update(randomUUID()).digest('hex'),
      sessionExpiresAt: new Date(Date.now() + 60_000),
      deviceLabel: 'Phase 11 withdrawal test',
      userAgentHash: null,
      ipHash: null,
    };
  }

  async function invite(contactHash: string): Promise<void> {
    await pool.query(
      `INSERT INTO account.pilot_invitations (
         contact_hash,
         display_hint,
         participant_type,
         cohort_wave,
         policy_version_id,
         expires_at,
         created_by_identity_id
       ) VALUES ($1, '+260***890', 'customer', 1, $2, now() + interval '1 hour', $3)`,
      [contactHash, policyVersionId, creatorIdentityId],
    );
  }

  it('requires a fresh current-policy invitation after the latest consent is revoked', async () => {
    const subjectHash = 'a'.repeat(64);
    const contactHash = '0'.repeat(64);
    await invite(contactHash);

    const first = await repository.createSession(input(subjectHash, contactHash));
    expect(first.kind).toBe('success');
    if (first.kind !== 'success') {
      throw new Error('Expected the invited participant to enter the pilot.');
    }

    await pool.query(
      `INSERT INTO account.consents (
         identity_id,
         policy_version_id,
         status,
         revoked_at,
         source
       ) VALUES ($1, $2, 'revoked', now(), 'phase11_withdrawal_test')`,
      [first.identityId, policyVersionId],
    );

    const blocked = await repository.createSession(input(subjectHash, contactHash));
    expect(blocked).toEqual({ kind: 'invite_required' });

    await invite(contactHash);
    const reconsented = await repository.createSession(input(subjectHash, contactHash));
    expect(reconsented.kind).toBe('success');
    if (reconsented.kind !== 'success') {
      throw new Error('Expected fresh invitation and consent to restore bounded pilot admission.');
    }
    expect(reconsented.identityId).toBe(first.identityId);
  });
});
