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

interface CaseResponse {
  id: string;
  status: string;
}

interface UploadSessionResponse {
  uploadSessionId: string;
}

interface EvidenceResponse {
  id: string;
  currentVersion: { id: string };
}

interface ReviewWorkspaceResponse {
  caseId: string;
  providerId: string;
  status: string;
  assignment: {
    id: string;
    kind: string;
  };
  evidence: Array<{
    evidenceId: string;
    evidenceVersionId: string;
    accessGrantRequired: true;
    checksumIncluded: false;
    submitterIdentityIncluded: false;
    storageReferenceIncluded: false;
  }>;
  accessPolicy: {
    lifetimeSeconds: 300;
    freshGrantRequired: true;
    assignmentRecheckedOnRedemption: true;
  };
  reviewerNotesIncluded: false;
  privateCoordinatesIncluded: false;
  synthetic: true;
}

interface AccessGrantResponse {
  grantId: string;
  assignmentId: string;
  evidenceId: string;
  evidenceVersionId: string;
  status: 'active';
  accessUrl: string;
  expiresAt: string;
  watermark: string;
  synthetic: true;
}

interface GrantStateResponse {
  grantId: string;
  status: 'revoked' | 'expired';
  expiresAt: string;
  endedAt: string;
  synthetic: true;
}

describe('Phase 7 secure assigned evidence review', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let owner: SessionResponse;
  let reviewer: SessionResponse;
  let unassignedReviewer: SessionResponse;
  let fieldAgent: SessionResponse;
  let supervisor: SessionResponse;
  let admin: SessionResponse;
  let providerId: string;
  let caseId: string;
  let evidenceId: string;
  let evidenceVersionId: string;
  let assignmentId: string;
  let activeGrantId: string;

  const httpServer = (): Server => app.getHttpServer() as Server;

  async function signIn(contact: string): Promise<SessionResponse> {
    const challenge = await request(httpServer())
      .post('/api/v1/auth/challenges')
      .send({ channel: 'email', contact })
      .expect(202);
    const body = challenge.body as ChallengeResponse;
    const verified = await request(httpServer())
      .post('/api/v1/auth/challenges/verify')
      .send({
        challengeId: body.challengeId,
        code: body.synthetic.code,
        deviceLabel: 'Synthetic Phase 7 evidence review client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function grantGlobalRole(session: SessionResponse, roleKey: string): Promise<void> {
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'global', $1, $3
       FROM authz.roles
       WHERE role_key = $2`,
      [session.identityId, roleKey, `Synthetic Phase 7 ${roleKey} evidence review role`],
    );
  }

  async function issueGrant(): Promise<AccessGrantResponse> {
    const response = await request(httpServer())
      .post(`/api/v1/verification-cases/${caseId}/evidence/${evidenceId}/access`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(201);
    return response.body as AccessGrantResponse;
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase7-review-owner@example.invalid');
    reviewer = await signIn('phase7-reviewer@example.invalid');
    unassignedReviewer = await signIn('phase7-review-unassigned@example.invalid');
    fieldAgent = await signIn('phase7-review-field@example.invalid');
    supervisor = await signIn('phase7-review-supervisor@example.invalid');
    admin = await signIn('phase7-review-admin@example.invalid');

    await grantGlobalRole(reviewer, 'reviewer');
    await grantGlobalRole(unassignedReviewer, 'reviewer');
    await grantGlobalRole(fieldAgent, 'field_agent');
    await grantGlobalRole(supervisor, 'trust_supervisor');
    await grantGlobalRole(admin, 'admin');

    const providerResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Phase 7 Evidence Review Provider',
        operatingModel: 'fixed_premises',
        localitySummary: 'Synthetic review locality',
        serviceAreaSummary: 'Synthetic review service area',
        registeredBusinessName: 'Synthetic Phase 7 Evidence Review Limited',
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
        reason: 'Synthetic provider is ready for secure evidence review testing',
      })
      .expect(201);

    const caseResponse = await request(httpServer())
      .post(`/api/v1/providers/${providerId}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        checkKey: 'phase7_secure_evidence_review',
        checkFamily: 'representative_identity',
        highRisk: false,
        policyVersion: 'phase7-evidence-review-v1',
      })
      .expect(201);
    caseId = (caseResponse.body as CaseResponse).id;

    const uploadResponse = await request(httpServer())
      .post(`/api/v1/providers/${providerId}/evidence/upload-sessions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        evidenceClass: 'identity',
        documentType: 'synthetic_identity_document',
        contentType: 'application/pdf',
        maxBytes: 1_048_576,
        consentConfirmed: true,
      })
      .expect(201);
    const upload = uploadResponse.body as UploadSessionResponse;

    const evidenceResponse = await request(httpServer())
      .post(`/api/v1/providers/${providerId}/evidence`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        uploadSessionId: upload.uploadSessionId,
        caseId,
        sha256: 'd'.repeat(64),
        sizeBytes: 4096,
        issuingAuthority: 'Synthetic Phase 7 Authority',
        issuedAt: '2026-01-01',
        validFrom: '2026-01-01',
        expiresAt: '2027-01-01T00:00:00.000Z',
        retentionClass: 'regulated',
      })
      .expect(201);
    const evidence = evidenceResponse.body as EvidenceResponse;
    evidenceId = evidence.id;
    evidenceVersionId = evidence.currentVersion.id;

    const assignmentResponse = await request(httpServer())
      .post(`/api/v1/verification-cases/${caseId}/assignments`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({
        assigneeIdentityId: reviewer.identityId,
        assignmentKind: 'reviewer',
        reason: 'Independent reviewer assigned for secure Phase 7 evidence inspection',
      })
      .expect(201);
    expect((assignmentResponse.body as CaseResponse).status).toBe('assigned');

    const assignment = await pool.query<{ id: string }>(
      `SELECT id
       FROM verification.assignments
       WHERE case_id = $1
         AND assignee_identity_id = $2
         AND assignment_kind = 'reviewer'
         AND status = 'active'`,
      [caseId, reviewer.identityId],
    );
    assignmentId = assignment.rows[0]?.id ?? '';
    if (!assignmentId) {
      throw new Error('Synthetic reviewer assignment was not created.');
    }
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('returns an assignment-bound review workspace with a strict privacy allowlist', async () => {
    const response = await request(httpServer())
      .get(`/api/v1/verification-cases/${caseId}/review-workspace`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(200);
    const workspace = response.body as ReviewWorkspaceResponse;

    expect(workspace).toMatchObject({
      caseId,
      providerId,
      status: 'assigned',
      assignment: { id: assignmentId, kind: 'reviewer' },
      accessPolicy: {
        lifetimeSeconds: 300,
        freshGrantRequired: true,
        assignmentRecheckedOnRedemption: true,
      },
      reviewerNotesIncluded: false,
      privateCoordinatesIncluded: false,
      synthetic: true,
    });
    expect(workspace.evidence).toEqual([
      expect.objectContaining({
        evidenceId,
        evidenceVersionId,
        accessGrantRequired: true,
        checksumIncluded: false,
        submitterIdentityIncluded: false,
        storageReferenceIncluded: false,
      }),
    ]);
    const serialized = JSON.stringify(workspace);
    expect(serialized).not.toContain('objectKey');
    expect(serialized).not.toContain('accessUrl');
    expect(serialized).not.toContain('sha256');
    expect(serialized).not.toContain('submittedByIdentityId');
    expect(serialized).not.toContain('privateNotes');
    expect(serialized).not.toContain('latitude');
    expect(serialized).not.toContain('longitude');
  });

  it('denies unassigned reviewers, provider submitters and field agents', async () => {
    await request(httpServer())
      .get(`/api/v1/verification-cases/${caseId}/review-workspace`)
      .set('authorization', `Bearer ${unassignedReviewer.accessToken}`)
      .expect(404);
    await request(httpServer())
      .post(`/api/v1/verification-cases/${caseId}/evidence/${evidenceId}/access`)
      .set('authorization', `Bearer ${unassignedReviewer.accessToken}`)
      .expect(404);
    await request(httpServer())
      .get(`/api/v1/verification-cases/${caseId}/review-workspace`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(403);
    await request(httpServer())
      .get(`/api/v1/verification-cases/${caseId}/review-workspace`)
      .set('authorization', `Bearer ${fieldAgent.accessToken}`)
      .expect(403);
  });

  it('keeps recommendation scope assignment-bound and transactionally rejects outsiders', async () => {
    await request(httpServer())
      .post(`/api/v1/verification-cases/${caseId}/recommendations`)
      .set('authorization', `Bearer ${unassignedReviewer.accessToken}`)
      .send({
        result: 'approve',
        reasonCode: 'CHECK_PASSED',
        rationale: 'An unassigned reviewer must not record this synthetic recommendation.',
        limitation: 'This synthetic attempt must be rejected without changing case state.',
      })
      .expect(400);

    const caseState = await pool.query<{ status: string }>(
      'SELECT status FROM verification.cases WHERE id = $1',
      [caseId],
    );
    expect(caseState.rows[0]?.status).toBe('assigned');
  });

  it('issues one active authorization, stores no URL or object key, and revalidates on redemption', async () => {
    const first = await issueGrant();
    expect(first).toMatchObject({
      assignmentId,
      evidenceId,
      evidenceVersionId,
      status: 'active',
      synthetic: true,
    });
    expect(first.accessUrl).toMatch(/^https:\/\/storage\.invalid\/private-review\//);

    const second = await issueGrant();
    activeGrantId = second.grantId;
    expect(second.grantId).not.toBe(first.grantId);

    const states = await pool.query<{ id: string; status: string }>(
      `SELECT id, status
       FROM operations.evidence_access_grants
       WHERE case_id = $1
         AND evidence_id = $2
         AND grantee_identity_id = $3
       ORDER BY issued_at`,
      [caseId, evidenceId, reviewer.identityId],
    );
    expect(states.rows).toEqual([
      { id: first.grantId, status: 'revoked' },
      { id: second.grantId, status: 'active' },
    ]);

    const columns = await pool.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'operations'
         AND table_name = 'evidence_access_grants'`,
    );
    const columnNames = columns.rows.map((row) => row.column_name);
    expect(columnNames).not.toContain('object_key');
    expect(columnNames).not.toContain('access_url');

    const redemption = await request(httpServer())
      .post(`/api/v1/operations/evidence-access/${second.grantId}/redeem`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(201);
    expect(redemption.body).toMatchObject({
      grantId: second.grantId,
      status: 'active',
      synthetic: true,
    });
    expect(redemption.body.accessUrl).toMatch(/^https:\/\/storage\.invalid\/private-review\//);
    expect(redemption.body.accessUrl).not.toBe(second.accessUrl);

    const audit = await pool.query<{ action: string; metadata: Record<string, unknown> }>(
      `SELECT action, metadata
       FROM platform.audit_events
       WHERE actor_id = $1
         AND action IN (
           'private_evidence_access_granted',
           'private_evidence_access_redeemed'
         )
       ORDER BY occurred_at`,
      [reviewer.identityId],
    );
    expect(audit.rows.map((row) => row.action)).toEqual(
      expect.arrayContaining([
        'private_evidence_access_granted',
        'private_evidence_access_redeemed',
      ]),
    );
    expect(JSON.stringify(audit.rows)).not.toContain('private/');
    expect(JSON.stringify(audit.rows)).not.toContain('storage.invalid');
  });

  it('lets the reviewer revoke their authorization and blocks later redemption', async () => {
    const revoked = await request(httpServer())
      .post(`/api/v1/operations/evidence-access/${activeGrantId}/revoke`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .send({ reason: 'Reviewer ended this synthetic private evidence authorization.' })
      .expect(200);
    expect(revoked.body as GrantStateResponse).toMatchObject({
      grantId: activeGrantId,
      status: 'revoked',
      synthetic: true,
    });

    await request(httpServer())
      .post(`/api/v1/operations/evidence-access/${activeGrantId}/redeem`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(404);
  });

  it('allows supervisory revocation but not unrelated reviewer revocation', async () => {
    const grant = await issueGrant();
    await request(httpServer())
      .post(`/api/v1/operations/evidence-access/${grant.grantId}/revoke`)
      .set('authorization', `Bearer ${unassignedReviewer.accessToken}`)
      .send({ reason: 'Unrelated reviewers must not revoke another reviewer authorization.' })
      .expect(404);

    await request(httpServer())
      .post(`/api/v1/operations/evidence-access/${grant.grantId}/revoke`)
      .set('authorization', `Bearer ${supervisor.accessToken}`)
      .send({ reason: 'Trust supervisor revoked this synthetic evidence authorization.' })
      .expect(200);
    await request(httpServer())
      .post(`/api/v1/operations/evidence-access/${grant.grantId}/redeem`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(404);
  });

  it('expires stale authorization records before issuing any storage URL', async () => {
    const expiredGrantId = '70000000-0000-4000-8000-000000000007';
    await pool.query(
      `INSERT INTO operations.evidence_access_grants (
         id,
         case_id,
         evidence_id,
         evidence_version_id,
         assignment_id,
         grantee_identity_id,
         granted_by_identity_id,
         purpose,
         issued_at,
         expires_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $6,
         'Synthetic already expired evidence review authorization',
         now() - interval '2 minutes',
         now() - interval '1 minute'
       )`,
      [
        expiredGrantId,
        caseId,
        evidenceId,
        evidenceVersionId,
        assignmentId,
        reviewer.identityId,
      ],
    );

    await request(httpServer())
      .post(`/api/v1/operations/evidence-access/${expiredGrantId}/redeem`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(404);
    const state = await pool.query<{ status: string }>(
      'SELECT status FROM operations.evidence_access_grants WHERE id = $1',
      [expiredGrantId],
    );
    expect(state.rows[0]?.status).toBe('expired');
  });

  it('revokes active authorizations immediately when the assignment ends', async () => {
    const grant = await issueGrant();
    await pool.query(
      `UPDATE verification.assignments
       SET status = 'revoked', ended_at = now()
       WHERE id = $1`,
      [assignmentId],
    );

    const state = await pool.query<{ status: string; end_reason: string }>(
      `SELECT status, end_reason
       FROM operations.evidence_access_grants
       WHERE id = $1`,
      [grant.grantId],
    );
    expect(state.rows[0]).toMatchObject({
      status: 'revoked',
      end_reason: 'Review assignment ended before evidence access expiry',
    });
    await request(httpServer())
      .post(`/api/v1/operations/evidence-access/${grant.grantId}/redeem`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(404);
    await request(httpServer())
      .get(`/api/v1/verification-cases/${caseId}/review-workspace`)
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(404);
  });

  it('keeps provider and field-agent identities outside final decision authority', async () => {
    const decision = {
      result: 'approved',
      reasonCode: 'CHECK_PASSED',
      rationale: 'This synthetic decision must be rejected before any trust state changes.',
      claimKey: 'phase7_forbidden_decision',
      claimStatement: 'Forbidden synthetic decision',
      limitation: 'This must never create a public claim or verification result.',
      validUntil: '2027-01-01T00:00:00.000Z',
      policyVersion: 'phase7-evidence-review-v1',
    };
    await request(httpServer())
      .post(`/api/v1/verification-cases/${caseId}/decisions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send(decision)
      .expect(403);
    await request(httpServer())
      .post(`/api/v1/verification-cases/${caseId}/decisions`)
      .set('authorization', `Bearer ${fieldAgent.accessToken}`)
      .send(decision)
      .expect(403);
  });
});
