import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
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

interface VerificationCaseResponse {
  id: string;
}

interface UploadSessionResponse {
  uploadSessionId: string;
}

interface EvidenceResponse {
  id: string;
}

describe('Evidence confirmation case and upload-session scope', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });
  let app: INestApplication;
  let owner: SessionResponse;
  let provider: ProviderResponse;
  let identityCase: VerificationCaseResponse;
  let experienceCase: VerificationCaseResponse;
  let upload: UploadSessionResponse;

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
        deviceLabel: 'Synthetic evidence-scope regression client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function createCase(
    requirementKey: string,
    checkKey: string,
    checkFamily: string,
  ): Promise<VerificationCaseResponse> {
    const response = await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey,
        checkKey,
        checkFamily,
        highRisk: false,
        policyVersion: 'phase6-scope-v1',
      })
      .expect(201);
    return response.body as VerificationCaseResponse;
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase6-evidence-scope@example.invalid');
    const providerResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Evidence Scope Provider',
        operatingModel: 'mobile',
        localitySummary: 'Synthetic private locality',
        serviceAreaSummary: 'Synthetic Lusaka service area',
        registeredBusinessName: 'Synthetic Evidence Scope Provider Limited',
      })
      .expect(201);
    provider = providerResponse.body as ProviderResponse;

    await request(httpServer())
      .put(`/api/v1/providers/${provider.id}/categories/plumbing`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'ready_for_verification',
        reason: 'Synthetic provider is ready for evidence-scope regression testing',
      })
      .expect(201);

    identityCase = await createCase(
      'identity',
      'phase6_identity_scope_check',
      'representative_identity',
    );
    experienceCase = await createCase(
      'service_experience',
      'phase6_experience_scope_check',
      'category_eligibility',
    );

    const uploadResponse = await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/evidence/upload-sessions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        evidenceClass: 'identity',
        documentType: 'national_identity_document',
        contentType: 'application/pdf',
        maxBytes: 1_048_576,
        consentConfirmed: true,
      })
      .expect(201);
    upload = uploadResponse.body as UploadSessionResponse;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('rolls back confirmation when the case requirement does not match the upload session', async () => {
    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/evidence`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        uploadSessionId: upload.uploadSessionId,
        caseId: experienceCase.id,
        sha256: 'c'.repeat(64),
        sizeBytes: 4096,
        retentionClass: 'regulated',
      })
      .expect(400);

    const state = await pool.query<{
      session_status: string;
      versions: string;
      evidence_items: string;
    }>(
      `SELECT
         sessions.status AS session_status,
         (
           SELECT count(*)
           FROM evidence.versions
           WHERE upload_session_id = sessions.id
         )::text AS versions,
         (
           SELECT count(*)
           FROM evidence.items AS items
           WHERE items.provider_id = sessions.provider_id
             AND items.requirement_id = sessions.requirement_id
             AND items.submitted_by_identity_id = sessions.created_by_identity_id
         )::text AS evidence_items
       FROM evidence.upload_sessions AS sessions
       WHERE sessions.id = $1`,
      [upload.uploadSessionId],
    );
    expect(state.rows[0]).toEqual({
      session_status: 'requested',
      versions: '0',
      evidence_items: '0',
    });
  });

  it('allows the same private upload session to confirm into its matching open case', async () => {
    const response = await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/evidence`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        uploadSessionId: upload.uploadSessionId,
        caseId: identityCase.id,
        sha256: 'c'.repeat(64),
        sizeBytes: 4096,
        retentionClass: 'regulated',
      })
      .expect(201);
    const evidence = response.body as EvidenceResponse;

    const state = await pool.query<{ versions: string; links: string }>(
      `SELECT
         (SELECT count(*) FROM evidence.versions WHERE evidence_id = $1)::text AS versions,
         (
           SELECT count(*)
           FROM verification.case_evidence
           WHERE case_id = $2 AND evidence_id = $1
         )::text AS links`,
      [evidence.id, identityCase.id],
    );
    expect(state.rows[0]).toEqual({ versions: '1', links: '1' });
  });
});
