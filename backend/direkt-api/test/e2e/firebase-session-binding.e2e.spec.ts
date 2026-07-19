import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHash, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';
import { FirebaseSessionRepository } from '../../src/auth/firebase-session.repository';
import { AppModule } from '../../src/app.module';

const NOTICE_VERSION = 'pilot-notice-test-v1';

function sessionInput(subjectHash: string, contactHash: string) {
  return {
    subjectHash,
    contactHash,
    displayHint: '+260***567',
    noticeVersion: NOTICE_VERSION,
    sessionId: randomUUID(),
    familyId: randomUUID(),
    refreshTokenHash: createHash('sha256').update(randomUUID()).digest('hex'),
    sessionExpiresAt: new Date(Date.now() + 60_000),
    deviceLabel: 'Phase 11 binding test',
    userAgentHash: null,
    ipHash: null,
  };
}

describe('Phase 11 Firebase external identity binding', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let repository: FirebaseSessionRepository;
  let createdByIdentityId: string;
  let policyVersionId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const creator = await pool.query<{ id: string }>(
      `INSERT INTO account.identities DEFAULT VALUES RETURNING id`,
    );
    createdByIdentityId = creator.rows[0]?.id ?? '';
    if (!createdByIdentityId) {
      throw new Error('Failed to create pilot invitation owner identity.');
    }
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
      [NOTICE_VERSION, 'a'.repeat(64)],
    );
    policyVersionId = policy.rows[0]?.id ?? '';
    if (!policyVersionId) {
      throw new Error('Failed to create pilot policy version.');
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

  async function createInvitation(contactHash: string): Promise<void> {
    await pool.query(
      `INSERT INTO account.pilot_invitations (
         contact_hash,
         display_hint,
         participant_type,
         cohort_wave,
         policy_version_id,
         expires_at,
         created_by_identity_id
       ) VALUES ($1, '+260***567', 'customer', 1, $2, now() + interval '1 hour', $3)`,
      [contactHash, policyVersionId, createdByIdentityId],
    );
  }

  it('denies an uninvited new phone without creating an identity', async () => {
    const subjectHash = '2'.repeat(64);
    const contactHash = '3'.repeat(64);
    const before = await pool.query<{ count: string }>('SELECT count(*) FROM account.identities');

    const result = await repository.createSession(sessionInput(subjectHash, contactHash));

    expect(result).toEqual({ kind: 'invite_required' });
    const after = await pool.query<{ count: string }>('SELECT count(*) FROM account.identities');
    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);
  });

  it('reuses the same DIREKT identity only for the same Firebase subject and phone', async () => {
    const subjectHash = 'b'.repeat(64);
    const contactHash = 'c'.repeat(64);
    await createInvitation(contactHash);

    const first = await repository.createSession(sessionInput(subjectHash, contactHash));
    expect(first.kind).toBe('success');
    if (first.kind !== 'success') {
      throw new Error('Expected first invited Firebase-bound session creation to succeed.');
    }

    const second = await repository.createSession(sessionInput(subjectHash, contactHash));
    expect(second.kind).toBe('success');
    if (second.kind !== 'success') {
      throw new Error('Expected repeated Firebase-bound session creation to succeed.');
    }
    expect(second.identityId).toBe(first.identityId);

    const binding = await pool.query<{ subject_hash: string }>(
      `SELECT subject_hash
       FROM account.external_identities
       WHERE identity_id = $1 AND provider = 'firebase'`,
      [first.identityId],
    );
    expect(binding.rows).toEqual([{ subject_hash: subjectHash }]);

    const consent = await pool.query<{ status: string }>(
      `SELECT status
       FROM account.consents
       WHERE identity_id = $1 AND policy_version_id = $2
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [first.identityId, policyVersionId],
    );
    expect(consent.rows[0]?.status).toBe('accepted');
  });

  it('denies a different Firebase subject from inheriting an already bound phone identity', async () => {
    const contactHash = 'd'.repeat(64);
    await createInvitation(contactHash);
    const first = await repository.createSession(sessionInput('e'.repeat(64), contactHash));
    expect(first.kind).toBe('success');

    const recycledNumberAttempt = await repository.createSession(
      sessionInput('f'.repeat(64), contactHash),
    );
    expect(recycledNumberAttempt).toEqual({ kind: 'identity_conflict' });
  });

  it('never auto-links an existing legacy unbound phone even when a fresh invite exists', async () => {
    const contactHash = '4'.repeat(64);
    const identity = await pool.query<{ id: string }>(
      `INSERT INTO account.identities DEFAULT VALUES RETURNING id`,
    );
    const identityId = identity.rows[0]?.id;
    if (!identityId) {
      throw new Error('Failed to create legacy identity.');
    }
    await pool.query(
      `INSERT INTO account.contacts (
         identity_id,
         channel,
         value_hash,
         display_hint,
         verified_at
       ) VALUES ($1, 'phone', $2, '+260***567', now())`,
      [identityId, contactHash],
    );
    await createInvitation(contactHash);

    const result = await repository.createSession(sessionInput('5'.repeat(64), contactHash));

    expect(result).toEqual({ kind: 'identity_conflict' });
    const binding = await pool.query<{ count: string }>(
      `SELECT count(*)
       FROM account.external_identities
       WHERE identity_id = $1`,
      [identityId],
    );
    expect(binding.rows[0]?.count).toBe('0');
  });

  it('serializes simultaneous invited first exchanges into one DIREKT identity', async () => {
    const subjectHash = '6'.repeat(64);
    const contactHash = '7'.repeat(64);
    await createInvitation(contactHash);

    const [first, second] = await Promise.all([
      repository.createSession(sessionInput(subjectHash, contactHash)),
      repository.createSession(sessionInput(subjectHash, contactHash)),
    ]);

    expect(first.kind).toBe('success');
    expect(second.kind).toBe('success');
    if (first.kind !== 'success' || second.kind !== 'success') {
      throw new Error('Expected both serialized invited exchanges to create valid sessions.');
    }
    expect(second.identityId).toBe(first.identityId);

    const identities = await pool.query<{ identity_id: string }>(
      `SELECT identity_id
       FROM account.external_identities
       WHERE provider = 'firebase' AND subject_hash = $1`,
      [subjectHash],
    );
    expect(identities.rows).toEqual([{ identity_id: first.identityId }]);
  });
});
