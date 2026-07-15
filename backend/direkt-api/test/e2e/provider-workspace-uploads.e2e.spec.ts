import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { Pool } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';
import { AppModule } from '../../src/app.module';
import { configureApplication } from '../../src/configure-application';

interface ChallengeResponse {
  challengeId: string;
  synthetic: { code: string };
}

interface SessionResponse {
  identityId: string;
  accessToken: string;
}

interface ProviderResponse {
  id: string;
}

interface UploadIntentResponse {
  uploadIntentId: string;
  caseId: string;
  state: string;
  attemptCount: number;
  activeUploadSessionId: string | null;
  submittedEvidenceId: string | null;
  safeToRetry: boolean;
  privateObjectKeyExposed: false;
  upload?: {
    uploadSessionId: string;
    uploadUrl: string;
    expiresAt: string;
    requiredHeaders: Record<string, string>;
    synthetic: true;
  };
}

interface TimelineEventResponse {
  eventType: string;
  caseId: string;
  message: string;
  reviewerIdentityExposed: false;
  privateRationaleExposed: false;
  privateObjectKeyExposed: false;
}

describe('Phase 6 recoverable provider evidence uploads', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 3 });
  let app: INestApplication;
  let owner: SessionResponse;
  let otherOwner: SessionResponse;
  let provider: ProviderResponse;
  let otherProvider: ProviderResponse;
  let caseId: string;

  const httpServer = (): Server => app.getHttpServer() as Server;

  async function signIn(contact: string): Promise<SessionResponse> {
    const challenge = await request(httpServer())
      .post('/api/v1/auth/challenges')
      .send({ channel: 'email', contact })
      .expect(202);
    const challengeBody = challenge.body as ChallengeResponse;
    const verified = await request(httpServer())
      .post('/api/v1/auth/challenges/verify')
      .send({
        challengeId: challengeBody.challengeId,
        code: challengeBody.synthetic.code,
        deviceLabel: 'Synthetic Phase 6 upload recovery client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function createProvider(
    session: SessionResponse,
    displayName: string,
  ): Promise<ProviderResponse> {
    const response = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${session.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName,
        operatingModel: 'mobile',
        localitySummary: 'Synthetic private base locality',
        serviceAreaSummary: 'Synthetic Lusaka provider service area',
        registeredBusinessName: `${displayName} Limited`,
      })
      .expect(201);
    const created = response.body as ProviderResponse;
    await request(httpServer())
      .put(`/api/v1/providers/${created.id}/categories/plumbing`)
      .set('authorization', `Bearer ${session.accessToken}`)
      .expect(200);
    return created;
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase6-upload-owner@example.invalid');
    otherOwner = await signIn('phase6-upload-other-owner@example.invalid');
    provider = await createProvider(owner, 'Synthetic Recoverable Uploads');
    otherProvider = await createProvider(otherOwner, 'Synthetic Other Upload Workspace');

    const contract = await pool.query<{
      category_id: string;
      requirement_version_id: string;
      requirement_id: string;
    }>(
      `SELECT
         categories.id AS category_id,
         selections.requirement_version_id,
         requirements.id AS requirement_id
       FROM provider.category_selections AS selections
       JOIN catalog.service_categories AS categories ON categories.id = selections.category_id
       JOIN catalog.requirements AS requirements
         ON requirements.requirement_version_id = selections.requirement_version_id
       WHERE selections.provider_id = $1
         AND categories.category_key = 'plumbing'
         AND requirements.requirement_key = 'identity'`,
      [provider.id],
    );
    const row = contract.rows[0];
    if (!row) {
      throw new Error('Synthetic verification requirement was not found.');
    }

    caseId = randomUUID();
    await pool.query(
      `INSERT INTO verification.cases (
         id,
         provider_id,
         category_id,
         requirement_version_id,
         requirement_id,
         check_key,
         check_family,
         status,
         policy_version,
         created_by_identity_id
       ) VALUES ($1, $2, $3, $4, $5, 'identity_check', 'representative_identity', 'awaiting_evidence', 'phase6-v1', $6)`,
      [
        caseId,
        provider.id,
        row.category_id,
        row.requirement_version_id,
        row.requirement_id,
        owner.identityId,
      ],
    );
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('creates one logical intent and reuses it for identical idempotent requests', async () => {
    const body = {
      caseId,
      clientIntentKey: 'android-phase6-identity-front',
      evidenceClass: 'identity',
      documentType: 'national_identity_document',
      contentType: 'image/jpeg',
      maxBytes: 5_000_000,
      consentConfirmed: true,
    };

    const firstResponse = await request(httpServer())
      .post('/api/v1/provider-workspace/me/upload-intents')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send(body)
      .expect(201);
    const first = firstResponse.body as UploadIntentResponse;

    expect(first).toMatchObject({
      caseId,
      state: 'uploading',
      attemptCount: 1,
      safeToRetry: false,
      privateObjectKeyExposed: false,
      upload: { synthetic: true },
    });
    expect(first.upload?.uploadSessionId).toBe(first.activeUploadSessionId);

    const repeatedResponse = await request(httpServer())
      .post('/api/v1/provider-workspace/me/upload-intents')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send(body)
      .expect(201);
    const repeated = repeatedResponse.body as UploadIntentResponse;

    expect(repeated).toMatchObject({
      uploadIntentId: first.uploadIntentId,
      state: 'uploading',
      attemptCount: 1,
      activeUploadSessionId: first.activeUploadSessionId,
    });
    expect(repeated.upload).toBeUndefined();

    await request(httpServer())
      .post('/api/v1/provider-workspace/me/upload-intents')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ ...body, documentType: 'different_document_type' })
      .expect(409);
  });

  it('recovers an interrupted upload with a fresh session and no duplicate intent', async () => {
    const listResponse = await request(httpServer())
      .get('/api/v1/provider-workspace/me/upload-intents')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const initial = (listResponse.body as UploadIntentResponse[])[0];
    if (!initial) {
      throw new Error('Expected the synthetic upload intent.');
    }
    const firstSessionId = initial.activeUploadSessionId;

    const interruptedResponse = await request(httpServer())
      .put(`/api/v1/provider-workspace/me/upload-intents/${initial.uploadIntentId}/interrupted`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ errorCode: 'NETWORK_INTERRUPTED' })
      .expect(200);
    expect(interruptedResponse.body).toMatchObject({
      uploadIntentId: initial.uploadIntentId,
      state: 'interrupted',
      attemptCount: 1,
      activeUploadSessionId: null,
      safeToRetry: true,
    });

    const retryResponse = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/upload-intents/${initial.uploadIntentId}/retry`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(201);
    const retry = retryResponse.body as UploadIntentResponse;

    expect(retry).toMatchObject({
      uploadIntentId: initial.uploadIntentId,
      state: 'uploading',
      attemptCount: 2,
      safeToRetry: false,
      upload: { synthetic: true },
    });
    expect(retry.activeUploadSessionId).not.toBe(firstSessionId);

    const databaseState = await pool.query<{
      intents: string;
      attempts: string;
      cancelled_sessions: string;
    }>(
      `SELECT
         (SELECT count(*) FROM provider_workspace.upload_intents WHERE id = $1)::text AS intents,
         (SELECT count(*) FROM provider_workspace.upload_attempts WHERE upload_intent_id = $1)::text AS attempts,
         (
           SELECT count(*)
           FROM provider_workspace.upload_attempts AS attempts
           JOIN evidence.upload_sessions AS sessions ON sessions.id = attempts.upload_session_id
           WHERE attempts.upload_intent_id = $1 AND sessions.status = 'cancelled'
         )::text AS cancelled_sessions`,
      [initial.uploadIntentId],
    );
    expect(databaseState.rows[0]).toMatchObject({
      intents: '1',
      attempts: '2',
      cancelled_sessions: '1',
    });
  });

  it('confirms exactly one immutable evidence version against the server-owned case', async () => {
    const listResponse = await request(httpServer())
      .get('/api/v1/provider-workspace/me/upload-intents')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const active = (listResponse.body as UploadIntentResponse[])[0];
    if (!active) {
      throw new Error('Expected the active synthetic upload intent.');
    }

    const confirmResponse = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/upload-intents/${active.uploadIntentId}/confirm`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        sha256: 'a'.repeat(64),
        sizeBytes: 4096,
        issuingAuthority: 'Synthetic National Registry',
        issuedAt: '2026-01-01',
        validFrom: '2026-01-01',
        expiresAt: '2028-01-01T00:00:00.000Z',
        retentionClass: 'regulated',
      })
      .expect(201);
    const submitted = confirmResponse.body as UploadIntentResponse;

    expect(submitted).toMatchObject({
      uploadIntentId: active.uploadIntentId,
      caseId,
      state: 'submitted',
      attemptCount: 2,
      safeToRetry: false,
      privateObjectKeyExposed: false,
    });
    expect(submitted.submittedEvidenceId).not.toBeNull();

    const repeated = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/upload-intents/${active.uploadIntentId}/confirm`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        sha256: 'a'.repeat(64),
        sizeBytes: 4096,
        retentionClass: 'regulated',
      })
      .expect(201);
    expect(repeated.body).toMatchObject({
      uploadIntentId: active.uploadIntentId,
      submittedEvidenceId: submitted.submittedEvidenceId,
      state: 'submitted',
    });

    const versions = await pool.query<{ versions: string; links: string }>(
      `SELECT
         (
           SELECT count(*)
           FROM evidence.versions
           WHERE evidence_id = $1
         )::text AS versions,
         (
           SELECT count(*)
           FROM verification.case_evidence
           WHERE case_id = $2 AND evidence_id = $1
         )::text AS links`,
      [submitted.submittedEvidenceId, caseId],
    );
    expect(versions.rows[0]).toEqual({ versions: '1', links: '1' });
  });

  it('returns a provider-safe verification timeline without reviewer or storage data', async () => {
    const response = await request(httpServer())
      .get('/api/v1/provider-workspace/me/verification-timeline')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const events = response.body as TimelineEventResponse[];

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: 'case_created',
          caseId,
          reviewerIdentityExposed: false,
          privateRationaleExposed: false,
          privateObjectKeyExposed: false,
        }),
        expect.objectContaining({
          eventType: 'evidence_submitted',
          caseId,
          message: 'Evidence submitted for private review.',
        }),
      ]),
    );
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain(owner.identityId);
    expect(serialized).not.toContain('object_key');
    expect(serialized).not.toContain('private-evidence/');
    expect(serialized).not.toContain('rationale');
  });

  it('keeps another provider workspace unable to discover or mutate the intent', async () => {
    const listResponse = await request(httpServer())
      .get('/api/v1/provider-workspace/me/upload-intents')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const intent = (listResponse.body as UploadIntentResponse[])[0];
    if (!intent) {
      throw new Error('Expected the submitted synthetic upload intent.');
    }

    const otherList = await request(httpServer())
      .get('/api/v1/provider-workspace/me/upload-intents')
      .set('authorization', `Bearer ${otherOwner.accessToken}`)
      .expect(200);
    expect(otherList.body).toEqual([]);

    await request(httpServer())
      .get(`/api/v1/provider-workspace/me/upload-intents/${intent.uploadIntentId}`)
      .set('authorization', `Bearer ${otherOwner.accessToken}`)
      .expect(404);

    await request(httpServer())
      .delete(`/api/v1/provider-workspace/me/upload-intents/${intent.uploadIntentId}`)
      .set('authorization', `Bearer ${otherOwner.accessToken}`)
      .send({ reason: 'Synthetic cross-provider cancellation must not succeed.' })
      .expect(404);

    expect(otherProvider.id).not.toBe(provider.id);
  });
});
