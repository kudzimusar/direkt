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
  status: string;
  discoverable: boolean;
}

interface VerificationCaseResponse {
  id: string;
  providerId: string;
  status: string;
  evidence: Array<{ id: string; currentVersion: { sha256: string } | null }>;
}

interface UploadSessionResponse {
  uploadSessionId: string;
  uploadUrl: string;
  expiresAt: string;
  synthetic: true;
}

interface EvidenceResponse {
  id: string;
  status: string;
  currentVersion: { sha256: string };
  synthetic: true;
}

interface PrivateAccessResponse {
  accessUrl: string;
  synthetic: true;
}

interface DecisionResponse {
  claims: Array<{
    claimKey: string;
    statement: string;
    status: string;
  }>;
}

interface RevokeResponse {
  affectedClaims: number;
}

describe('Phase 4 verification and private evidence HTTP contracts', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 3 });
  let app: INestApplication;
  let owner: SessionResponse;
  let reviewer: SessionResponse;
  let unassignedReviewer: SessionResponse;
  let finance: SessionResponse;
  let admin: SessionResponse;
  let provider: ProviderResponse;
  let verificationCase: VerificationCaseResponse;
  let evidence: EvidenceResponse;

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
        deviceLabel: 'Synthetic Phase 4 client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function assignGlobalRole(identityId: string, roleKey: string): Promise<void> {
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id,
         role_id,
         scope_type,
         assigned_by_identity_id,
         reason
       )
       SELECT $1, id, 'global', $1, $3
       FROM authz.roles
       WHERE role_key = $2`,
      [identityId, roleKey, `Synthetic ${roleKey} assignment for Phase 4 HTTP tests`],
    );
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase4-owner@example.invalid');
    reviewer = await signIn('phase4-reviewer@example.invalid');
    unassignedReviewer = await signIn('phase4-unassigned@example.invalid');
    finance = await signIn('phase4-finance@example.invalid');
    admin = await signIn('phase4-admin@example.invalid');

    await assignGlobalRole(reviewer.identityId, 'reviewer');
    await assignGlobalRole(unassignedReviewer.identityId, 'reviewer');
    await assignGlobalRole(finance.identityId, 'finance');
    await assignGlobalRole(admin.identityId, 'admin');

    const providerResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Phase 4 Repairs',
        operatingModel: 'fixed_premises',
        localitySummary: 'Woodlands, Lusaka',
        serviceAreaSummary: 'Lusaka District synthetic service area',
        registeredBusinessName: 'Synthetic Phase 4 Repairs Limited',
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
        reason: 'Synthetic Phase 4 profile is ready for private verification testing',
      })
      .expect(201);

    const caseResponse = await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        checkKey: 'representative_identity_check',
        checkFamily: 'representative_identity',
        highRisk: false,
        policyVersion: 'phase4-v1',
      })
      .expect(201);
    verificationCase = caseResponse.body as VerificationCaseResponse;

    const uploadResponse = await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/evidence/upload-sessions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        requirementKey: 'identity',
        evidenceClass: 'identity',
        documentType: 'national_identity_document',
        contentType: 'application/pdf',
        maxBytes: 1_048_576,
        consentConfirmed: true,
      })
      .expect(201);
    const upload = uploadResponse.body as UploadSessionResponse;
    expect(upload.synthetic).toBe(true);
    expect(upload.uploadUrl).toMatch(/^https:\/\/storage\.invalid\/private-upload\//);
    expect(uploadResponse.body).not.toHaveProperty('objectKey');

    const evidenceResponse = await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/evidence`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        uploadSessionId: upload.uploadSessionId,
        caseId: verificationCase.id,
        sha256: 'b'.repeat(64),
        sizeBytes: 4096,
        issuingAuthority: 'Synthetic Authority',
        issuedAt: '2026-01-01',
        validFrom: '2026-01-01',
        expiresAt: '2027-01-01T00:00:00.000Z',
        retentionClass: 'regulated',
      })
      .expect(201);
    evidence = evidenceResponse.body as EvidenceResponse;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('keeps evidence metadata provider-scoped and excludes storage references', async () => {
    const response = await request(httpServer())
      .get(`/api/v1/providers/${provider.id}/evidence/${evidence.id}`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: evidence.id,
      status: 'ready_for_review',
      synthetic: true,
    });
    expect(response.body).not.toHaveProperty('objectKey');
    expect(JSON.stringify(response.body)).not.toContain('private/');
  });

  it('denies an unassigned reviewer even when the role permission is valid', async () => {
    await request(httpServer())
      .post(`/api/v1/verification-cases/${verificationCase.id}/evidence/${evidence.id}/access`)
      .set('authorization', `Bearer ${unassignedReviewer.accessToken}`)
      .expect(404);
  });

  it('denies assigning the provider owner to review their own provider', async () => {
    await request(httpServer())
      .post(`/api/v1/verification-cases/${verificationCase.id}/assignments`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({
        assigneeIdentityId: owner.identityId,
        assignmentKind: 'reviewer',
        reason: 'The provider owner must not review their own provider evidence',
      })
      .expect(400);
  });

  it('assigns an independent reviewer and grants audited short-lived private access', async () => {
    const assigned = await request(httpServer())
      .post(`/api/v1/verification-cases/${verificationCase.id}/assignments`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({
        assigneeIdentityId: reviewer.identityId,
        assignmentKind: 'reviewer',
        reason: 'Independent synthetic reviewer assigned for Phase 4 verification',
      })
      .expect(201);
    verificationCase = assigned.body as VerificationCaseResponse;
    expect(verificationCase.status).toBe('assigned');

    const access = await request(httpServer())
      .post(`/api/v1/verification-cases/${verificationCase.id}/evidence/${evidence.id}/access`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(201);
    const accessBody = access.body as PrivateAccessResponse;
    expect(accessBody).toMatchObject({ synthetic: true });
    expect(accessBody.accessUrl).toMatch(/^https:\/\/storage\.invalid\/private-review\//);
    expect(access.body).not.toHaveProperty('objectKey');

    const audit = await pool.query<{ count: string }>(
      `SELECT count(*)::text AS count
       FROM platform.audit_events
       WHERE action = 'private_evidence_access_granted'
         AND actor_id = $1
         AND resource_id = $2`,
      [reviewer.identityId, evidence.id],
    );
    expect(Number(audit.rows[0]?.count ?? '0')).toBe(1);
  });

  it('denies finance from submitting a verification decision', async () => {
    await request(httpServer())
      .post(`/api/v1/verification-cases/${verificationCase.id}/decisions`)
      .set('authorization', `Bearer ${finance.accessToken}`)
      .send({
        result: 'approved',
        reasonCode: 'CHECK_PASSED',
        rationale: 'Finance must not be allowed to decide verification under any commercial state.',
        claimKey: 'representative_identity_checked',
        claimStatement: 'Representative identity checked',
        limitation: 'This does not verify qualifications, safety or future workmanship.',
        validUntil: '2027-01-01T00:00:00.000Z',
        policyVersion: 'phase4-v1',
      })
      .expect(403);
  });

  it('records immutable review and derives only a safe scoped claim card', async () => {
    await request(httpServer())
      .post(`/api/v1/verification-cases/${verificationCase.id}/recommendations`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .send({
        result: 'approve',
        reasonCode: 'CHECK_PASSED',
        rationale:
          'The synthetic private evidence satisfies the representative identity review checklist.',
        limitation: 'This does not verify qualifications, safety or future workmanship.',
        recommendedValidUntil: '2027-01-01T00:00:00.000Z',
      })
      .expect(201);

    const decision = await request(httpServer())
      .post(`/api/v1/verification-cases/${verificationCase.id}/decisions`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .send({
        result: 'approved',
        reasonCode: 'CHECK_PASSED',
        rationale:
          'The scoped synthetic representative identity check passed after assigned review.',
        claimKey: 'representative_identity_checked',
        claimStatement: 'Representative identity checked',
        limitation: 'This does not verify qualifications, safety or future workmanship.',
        validUntil: '2027-01-01T00:00:00.000Z',
        policyVersion: 'phase4-v1',
      })
      .expect(201);
    const decisionBody = decision.body as DecisionResponse;
    expect(decisionBody.claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          claimKey: 'representative_identity_checked',
          statement: 'Representative identity checked',
          status: 'active',
        }),
      ]),
    );

    const claims = await request(httpServer())
      .get(`/api/v1/providers/${provider.id}/claims`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const serialized = JSON.stringify(claims.body);
    expect(serialized).toContain('Representative identity checked');
    expect(serialized).not.toContain('sha256');
    expect(serialized).not.toContain('objectKey');
    expect(serialized).not.toContain('Synthetic Authority');
  });

  it('degrades the dependent claim when provider evidence is revoked', async () => {
    const revoked = await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/evidence/${evidence.id}/revoke`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ reason: 'Provider withdrew this synthetic evidence record from verification use.' })
      .expect(201);
    const revokedBody = revoked.body as RevokeResponse;
    expect(revokedBody.affectedClaims).toBe(1);

    const claims = await request(httpServer())
      .get(`/api/v1/providers/${provider.id}/claims`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(claims.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          claimKey: 'representative_identity_checked',
          status: 'expired',
        }),
      ]),
    );
  });
});
