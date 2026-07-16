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
interface CaseResponse {
  id: string;
}
interface OverrideResponse {
  overrideRequestId: string;
  status: string;
  evidenceVersionCount: number;
  approvalCount: number;
  createsDecision: false;
  createsClaim: false;
  changesPublication: false;
}
interface EscalationResponse {
  escalationId: string;
  status: string;
  severity: string;
  ownerIdentityId: string;
}

describe('Phase 7 escalations and four-eyes high-risk controls', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let owner: SessionResponse;
  let admin: SessionResponse;
  let reviewer: SessionResponse;
  let supervisorOne: SessionResponse;
  let supervisorTwo: SessionResponse;
  let providerId: string;
  let caseId: string;
  let approveReasonCode: string;
  let rejectReasonCode: string;

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
        deviceLabel: 'Synthetic Phase 7 escalation and override client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function grantRole(session: SessionResponse, roleKey: string): Promise<void> {
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'global', $1, $3
       FROM authz.roles
       WHERE role_key = $2`,
      [session.identityId, roleKey, `Synthetic Phase 7 ${roleKey} override role assignment`],
    );
  }

  async function seedMandatoryEvidence(): Promise<void> {
    const requirementResult = await pool.query<{
      requirement_id: string;
      requirement_key: string;
      requirement_kind: string;
      case_requirement_id: string;
    }>(
      `SELECT
         requirements.id AS requirement_id,
         requirements.requirement_key,
         requirements.requirement_kind,
         cases.requirement_id AS case_requirement_id
       FROM verification.cases AS cases
       JOIN catalog.requirements AS requirements
         ON requirements.requirement_version_id = cases.requirement_version_id
        AND requirements.required = true
       WHERE cases.id = $1
       ORDER BY requirements.requirement_key`,
      [caseId],
    );

    for (const requirement of requirementResult.rows) {
      const uploadSessionId = randomUUID();
      const evidenceId = randomUUID();
      const versionId = randomUUID();
      const objectKey = `private/${providerId}/${uploadSessionId}/${versionId}`;
      const evidenceClass =
        requirement.requirement_kind === 'registration' ? 'business' : 'identity';
      await pool.query(
        `INSERT INTO evidence.upload_sessions (
           id,
           provider_id,
           requirement_id,
           created_by_identity_id,
           evidence_class,
           document_type,
           object_key,
           expected_content_type,
           max_bytes,
           consent_confirmed,
           status,
           expires_at,
           completed_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'application/pdf', 4096, true, 'completed', now() + interval '10 minutes', now())`,
        [
          uploadSessionId,
          providerId,
          requirement.requirement_id,
          owner.identityId,
          evidenceClass,
          `synthetic_${requirement.requirement_key}`,
          objectKey,
        ],
      );
      await pool.query(
        `INSERT INTO evidence.items (
           id, provider_id, requirement_id, submitted_by_identity_id, status, retention_class
         ) VALUES ($1, $2, $3, $4, 'ready_for_review', 'regulated')`,
        [evidenceId, providerId, requirement.requirement_id, owner.identityId],
      );
      await pool.query(
        `INSERT INTO evidence.versions (
           id,
           evidence_id,
           version_number,
           upload_session_id,
           object_key,
           evidence_class,
           document_type,
           content_type,
           size_bytes,
           sha256,
           processing_status,
           submitted_by_identity_id
         ) VALUES ($1, $2, 1, $3, $4, $5, $6, 'application/pdf', 2048, $7, 'clean', $8)`,
        [
          versionId,
          evidenceId,
          uploadSessionId,
          objectKey,
          evidenceClass,
          `synthetic_${requirement.requirement_key}`,
          'a'.repeat(64),
          owner.identityId,
        ],
      );
      await pool.query('UPDATE evidence.items SET current_version_id = $2 WHERE id = $1', [
        evidenceId,
        versionId,
      ]);
      if (requirement.requirement_id === requirement.case_requirement_id) {
        await pool.query(
          `INSERT INTO verification.case_evidence (case_id, evidence_id, linked_by_identity_id)
           VALUES ($1, $2, $3)`,
          [caseId, evidenceId, owner.identityId],
        );
      }
    }
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase7-override-owner@example.invalid');
    admin = await signIn('phase7-override-admin@example.invalid');
    reviewer = await signIn('phase7-override-reviewer@example.invalid');
    supervisorOne = await signIn('phase7-override-supervisor-one@example.invalid');
    supervisorTwo = await signIn('phase7-override-supervisor-two@example.invalid');
    await grantRole(admin, 'admin');
    await grantRole(reviewer, 'reviewer');
    await grantRole(supervisorOne, 'trust_supervisor');
    await grantRole(supervisorTwo, 'trust_supervisor');

    const providerResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Four Eyes Provider',
        operatingModel: 'fixed_premises',
        localitySummary: 'Synthetic override locality',
        serviceAreaSummary: 'Synthetic override service area',
        registeredBusinessName: 'Synthetic Four Eyes Provider Limited',
      })
      .expect(201);
    providerId = (providerResponse.body as ProviderResponse).id;
    await request(httpServer())
      .put(`/api/v1/providers/${providerId}/categories/plumbing`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    await request(httpServer())
      .post(`/api/v1/providers/${providerId}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'ready_for_verification',
        reason: 'Synthetic high-risk provider is ready for controlled verification.',
      })
      .expect(201);

    const caseResponse = await request(httpServer())
      .post(`/api/v1/providers/${providerId}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        checkKey: 'phase7_high_risk_identity',
        checkFamily: 'representative_identity',
        highRisk: true,
        policyVersion: 'phase7-override-v1',
      })
      .expect(201);
    caseId = (caseResponse.body as CaseResponse).id;
    await pool.query(
      "UPDATE verification.cases SET status = 'awaiting_evidence' WHERE id = $1 AND status = 'draft'",
      [caseId],
    );
    await pool.query(
      "UPDATE verification.cases SET status = 'ready_for_review' WHERE id = $1 AND status = 'awaiting_evidence'",
      [caseId],
    );
    await request(httpServer())
      .post(`/api/v1/verification-cases/${caseId}/assignments`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({
        assigneeIdentityId: reviewer.identityId,
        assignmentKind: 'reviewer',
        reason: 'Synthetic reviewer assigned to high-risk override case.',
      })
      .expect(201);

    const reasons = await pool.query<{ code: string; outcome: string }>(
      `SELECT code, outcome FROM verification.reason_codes
       WHERE active = true AND outcome IN ('approve', 'reject')
       ORDER BY outcome, code`,
    );
    approveReasonCode = reasons.rows.find((row) => row.outcome === 'approve')?.code ?? '';
    rejectReasonCode = reasons.rows.find((row) => row.outcome === 'reject')?.code ?? '';
    if (!approveReasonCode || !rejectReasonCode) {
      throw new Error('Synthetic approve and reject reason codes are required.');
    }
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('creates, owns and resolves explicit escalations', async () => {
    const createResponse = await request(httpServer())
      .post('/api/v1/operations/escalations')
      .set('authorization', `Bearer ${supervisorOne.accessToken}`)
      .send({
        caseId,
        severity: 'critical',
        reasonCode: 'HIGH_RISK_REVIEW',
        summary: 'Synthetic high-risk case requires explicit supervisor ownership and resolution.',
        ownerIdentityId: supervisorOne.identityId,
        dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        policyVersion: 'phase7-override-v1',
      })
      .expect(201);
    const escalation = createResponse.body as EscalationResponse;
    expect(escalation).toMatchObject({
      severity: 'critical',
      status: 'open',
      ownerIdentityId: supervisorOne.identityId,
    });

    await request(httpServer())
      .post(`/api/v1/operations/escalations/${escalation.escalationId}/start`)
      .set('authorization', `Bearer ${supervisorTwo.accessToken}`)
      .send({ reason: 'Unrelated supervisor must not start another owner’s escalation.' })
      .expect(404);
    await request(httpServer())
      .post(`/api/v1/operations/escalations/${escalation.escalationId}/start`)
      .set('authorization', `Bearer ${supervisorOne.accessToken}`)
      .send({ reason: 'Assigned supervisor began the synthetic escalation review.' })
      .expect(200);
    const resolvedResponse = await request(httpServer())
      .post(`/api/v1/operations/escalations/${escalation.escalationId}/resolve`)
      .set('authorization', `Bearer ${supervisorOne.accessToken}`)
      .send({
        targetStatus: 'resolved',
        resolutionCode: 'SCOPE_CONFIRMED',
        resolutionSummary:
          'Synthetic escalation resolved after review of the scoped case controls.',
      })
      .expect(200);
    expect(resolvedResponse.body as EscalationResponse).toMatchObject({ status: 'resolved' });
  });

  it('requires complete mandatory evidence and compatible reason codes', async () => {
    const base = {
      caseId,
      requestedResult: 'approved',
      rationale:
        'Synthetic high-risk authorization request backed by the current mandatory evidence snapshot.',
      dueAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      policyVersion: 'phase7-override-v1',
    };
    await request(httpServer())
      .post('/api/v1/operations/high-risk-overrides')
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .send({ ...base, reasonCode: approveReasonCode })
      .expect(400);

    await seedMandatoryEvidence();

    await request(httpServer())
      .post('/api/v1/operations/high-risk-overrides')
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .send({ ...base, reasonCode: rejectReasonCode })
      .expect(400);
  });

  it('requires two distinct independent approvers and never creates trust state', async () => {
    const before = await pool.query<{ decisions: string; claims: string; publications: string }>(
      `SELECT
         (SELECT count(*) FROM verification.decisions WHERE case_id = $1)::text AS decisions,
         (SELECT count(*) FROM verification.claims WHERE case_id = $1)::text AS claims,
         (SELECT count(*) FROM discovery.publications WHERE provider_id = $2)::text AS publications`,
      [caseId, providerId],
    );
    const createResponse = await request(httpServer())
      .post('/api/v1/operations/high-risk-overrides')
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .send({
        caseId,
        requestedResult: 'approved',
        reasonCode: approveReasonCode,
        rationale:
          'Synthetic high-risk authorization request backed by complete current mandatory evidence.',
        dueAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        policyVersion: 'phase7-override-v1',
      })
      .expect(201);
    const requestView = createResponse.body as OverrideResponse;
    expect(requestView).toMatchObject({
      status: 'pending',
      approvalCount: 0,
      createsDecision: false,
      createsClaim: false,
      changesPublication: false,
    });
    expect(requestView.evidenceVersionCount).toBeGreaterThan(0);

    await request(httpServer())
      .post(`/api/v1/operations/high-risk-overrides/${requestView.overrideRequestId}/approvals`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .send({
        decision: 'approve',
        rationale: 'Requester must not approve the request they created.',
        policyVersion: 'phase7-override-v1',
      })
      .expect(403);

    const firstResponse = await request(httpServer())
      .post(`/api/v1/operations/high-risk-overrides/${requestView.overrideRequestId}/approvals`)
      .set('authorization', `Bearer ${supervisorOne.accessToken}`)
      .send({
        decision: 'approve',
        rationale:
          'First independent synthetic supervisor approves the evidence-backed authorization.',
        policyVersion: 'phase7-override-v1',
      })
      .expect(201);
    expect(firstResponse.body as OverrideResponse).toMatchObject({
      status: 'pending',
      approvalCount: 1,
    });

    await request(httpServer())
      .post(`/api/v1/operations/high-risk-overrides/${requestView.overrideRequestId}/approvals`)
      .set('authorization', `Bearer ${supervisorOne.accessToken}`)
      .send({
        decision: 'approve',
        rationale: 'Duplicate approval from the same supervisor must not count twice.',
        policyVersion: 'phase7-override-v1',
      })
      .expect(409);

    const secondResponse = await request(httpServer())
      .post(`/api/v1/operations/high-risk-overrides/${requestView.overrideRequestId}/approvals`)
      .set('authorization', `Bearer ${supervisorTwo.accessToken}`)
      .send({
        decision: 'approve',
        rationale: 'Second independent synthetic supervisor completes the four-eyes authorization.',
        policyVersion: 'phase7-override-v1',
      })
      .expect(201);
    expect(secondResponse.body as OverrideResponse).toMatchObject({
      status: 'approved',
      approvalCount: 2,
      createsDecision: false,
      createsClaim: false,
      changesPublication: false,
    });

    const after = await pool.query<{ decisions: string; claims: string; publications: string }>(
      `SELECT
         (SELECT count(*) FROM verification.decisions WHERE case_id = $1)::text AS decisions,
         (SELECT count(*) FROM verification.claims WHERE case_id = $1)::text AS claims,
         (SELECT count(*) FROM discovery.publications WHERE provider_id = $2)::text AS publications`,
      [caseId, providerId],
    );
    expect(after.rows[0]).toEqual(before.rows[0]);
  });
});
