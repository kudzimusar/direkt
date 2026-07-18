import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHash, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';
import { FirebaseSessionRepository } from '../../src/auth/firebase-session.repository';
import { AppModule } from '../../src/app.module';

function sessionInput(subjectHash: string, contactHash: string) {
  return {
    subjectHash,
    contactHash,
    displayHint: '+260***567',
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
  const pool = new Pool({ connectionString: url, max: 2 });
  let app: INestApplication;
  let repository: FirebaseSessionRepository;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    repository = app.get(FirebaseSessionRepository);
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('reuses the same DIREKT identity only for the same Firebase subject and phone', async () => {
    const subjectHash = 'a'.repeat(64);
    const contactHash = 'b'.repeat(64);
    const first = await repository.createSession(sessionInput(subjectHash, contactHash));
    expect(first.kind).toBe('success');
    if (first.kind !== 'success') {
      throw new Error('Expected first Firebase-bound session creation to succeed.');
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
  });

  it('denies a different Firebase subject from inheriting an existing phone identity', async () => {
    const contactHash = 'c'.repeat(64);
    const first = await repository.createSession(sessionInput('d'.repeat(64), contactHash));
    expect(first.kind).toBe('success');

    const recycledNumberAttempt = await repository.createSession(
      sessionInput('e'.repeat(64), contactHash),
    );
    expect(recycledNumberAttempt).toEqual({ kind: 'identity_conflict' });
  });
});
