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
}

interface FieldWorkResponse {
  workItemId: string;
  caseId: string;
  verificationAssignmentId: string;
  fieldAgentIdentityId: string;
  state: string;
  replacedByWorkItemId: string | null;
  submission: null | {
    submissionId: string;
    outcome: string;
    publicSafeSummary: string;
    evidenceReferenceCount: number;
    advisoryOnly: true;
    privateNotesIncluded: false;
    evidenceIdentifiersIncluded: false;
    privateCoordinatesIncluded: false;
  };
  advisoryOnly: true;
  privateNotesIncluded: false;
  privateCoordinatesIncluded: false;
  evidenceIdentifiersIncluded: false;
  synthetic: true;
}

interface FieldQueueResponse {
  scope: 'mine' | 'all';
  items: FieldWorkResponse[];
}

describe('Phase 7 structured operations field workflow', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let owner: SessionResponse;
  let admin: SessionResponse;
  let fieldAgentA: SessionResponse;
  let fieldAgentB: SessionResponse;
  let reviewer: SessionResponse;
  let providerId: string;

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
        deviceLabel: 'Synthetic Phase 7 field workflow client',
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
      [session.identityId, roleKey, `Synthetic Phase 7 ${roleKey} field workflow role`],
    );
  }

  async function createCase(suffix: string): Promise<string> {
    const response = await request(httpServer())
      .post(`/api/v1/providers/${providerId}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        checkKey: `phase7_field_${suffix}`,
        checkFamily: 'representative_identity',
        highRisk: false,
        policyVersion: 'phase7-field-v1',
      })
      .expect(201);
    return (response.body as CaseResponse).id;
  }

  function schedule(offsetHours: number): { scheduledFor: string; dueAt: string } {
    return {
      scheduledFor: new Date(Date.now() + offsetHours * 60 * 60 * 1000).toISOString(),
      dueAt: new Date(Date.now() + (offsetHours + 4) * 60 * 60 * 1000).toISOString(),
    };
  }

  async function createWork(
    caseId: string,
    fieldAgentIdentityId: string,
    offsetHours: number,
  ): Promise<FieldWorkResponse> {
    const response = await request(httpServer())
      .post('/api/v1/operations/field-work-items')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({
        caseId,
        fieldAgentIdentityId,
        templateKey: 'standard_field_inspection',
        templateVersion: 1,
        ...schedule(offsetHours),
        reason: 'Synthetic scoped field inspection assignment for Phase 7 regression coverage.',
        policyVersion: 'phase7-field-v1',
      })
      .expect(201);
    return response.body as FieldWorkResponse;
  }

  async function acceptAndStart(workItemId: string, agent: SessionResponse): Promise<void> {
    await request(httpServer())
      .post(`/api/v1/operations/field-work-items/${workItemId}/transitions`)
      .set('authorization', `Bearer ${agent.accessToken}`)
      .send({
        targetState: 'accepted',
        reason: 'Field agent accepted the synthetic scoped inspection assignment.',
      })
      .expect(200);
    await request(httpServer())
      .post(`/api/v1/operations/field-work-items/${workItemId}/transitions`)
      .set('authorization', `Bearer ${agent.accessToken}`)
      .send({
        targetState: 'in_progress',
        reason: 'Field agent started the synthetic structured inspection.',
      })
      .expect(200);
  }

  function submission(outcome: string, key: string, summary: string) {
    return {
      clientSubmissionKey: key,
      outcome,
      checklistVersion: 'standard-field-checklist-v1',
      publicSafeSummary: summary,
      privateNotes: 'Synthetic private operations note with no real person or address.',
      observations: [
        { key: 'arrival_and_safety', result: 'confirmed', note: 'Synthetic safe arrival.' },
        {
          key: 'provider_presence',
          result: 'confirmed',
          note: 'Synthetic representative present.',
        },
        {
          key: 'evidence_consistency',
          result: outcome === 'completed' ? 'confirmed' : 'not_confirmed',
          note: 'Synthetic advisory observation only.',
        },
      ],
      evidenceReferences: [],
      policyVersion: 'phase7-field-v1',
      occurredAt: new Date(Date.now() - 60_000).toISOString(),
    };
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase7-field-owner@example.invalid');
    admin = await signIn('phase7-field-admin@example.invalid');
    fieldAgentA = await signIn('phase7-field-agent-a@example.invalid');
    fieldAgentB = await signIn('phase7-field-agent-b@example.invalid');
    reviewer = await signIn('phase7-field-reviewer@example.invalid');
    await grantRole(admin, 'admin');
    await grantRole(fieldAgentA, 'field_agent');
    await grantRole(fieldAgentB, 'field_agent');
    await grantRole(reviewer, 'reviewer');

    const providerResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Phase 7 Field Provider',
        operatingModel: 'fixed_premises',
        localitySummary: 'Synthetic field locality',
        serviceAreaSummary: 'Synthetic field service area',
        registeredBusinessName: 'Synthetic Phase 7 Field Provider Limited',
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
        reason: 'Synthetic provider ready for structured field workflow testing.',
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('enforces role-scoped queues and assigned-agent transitions', async () => {
    const caseId = await createCase('queue_scope');
    const work = await createWork(caseId, fieldAgentA.identityId, 1);

    const ownQueue = await request(httpServer())
      .get('/api/v1/operations/field-work-items')
      .set('authorization', `Bearer ${fieldAgentA.accessToken}`)
      .expect(200);
    expect(ownQueue.body as FieldQueueResponse).toMatchObject({
      scope: 'mine',
      items: [
        expect.objectContaining({
          workItemId: work.workItemId,
          fieldAgentIdentityId: fieldAgentA.identityId,
        }),
      ],
    });

    const otherQueue = await request(httpServer())
      .get('/api/v1/operations/field-work-items')
      .set('authorization', `Bearer ${fieldAgentB.accessToken}`)
      .expect(200);
    expect((otherQueue.body as FieldQueueResponse).items).toEqual([]);

    await request(httpServer())
      .get('/api/v1/operations/field-work-items')
      .set('authorization', `Bearer ${reviewer.accessToken}`)
      .expect(403);

    const allQueue = await request(httpServer())
      .get('/api/v1/operations/field-work-items')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(allQueue.body as FieldQueueResponse).toMatchObject({
      scope: 'all',
      items: expect.arrayContaining([expect.objectContaining({ workItemId: work.workItemId })]),
    });

    await request(httpServer())
      .post(`/api/v1/operations/field-work-items/${work.workItemId}/transitions`)
      .set('authorization', `Bearer ${fieldAgentB.accessToken}`)
      .send({
        targetState: 'accepted',
        reason: 'Wrong field agent must not accept this assignment.',
      })
      .expect(404);
    await acceptAndStart(work.workItemId, fieldAgentA);
  });

  it('persists idempotent offline submissions without creating trust state', async () => {
    const caseId = await createCase('offline_idempotency');
    const work = await createWork(caseId, fieldAgentA.identityId, 2);
    await acceptAndStart(work.workItemId, fieldAgentA);
    const before = await pool.query<{ decisions: string; claims: string }>(
      `SELECT
         (SELECT count(*) FROM verification.decisions WHERE case_id = $1)::text AS decisions,
         (SELECT count(*) FROM verification.claims WHERE case_id = $1)::text AS claims`,
      [caseId],
    );
    const body = submission(
      'completed',
      'offline-field-complete-0001',
      'Synthetic field inspection completed; observations remain advisory only.',
    );
    const firstResponse = await request(httpServer())
      .post(`/api/v1/operations/field-work-items/${work.workItemId}/submissions`)
      .set('authorization', `Bearer ${fieldAgentA.accessToken}`)
      .send(body)
      .expect(201);
    const first = firstResponse.body as FieldWorkResponse;
    expect(first).toMatchObject({
      state: 'submitted',
      advisoryOnly: true,
      privateNotesIncluded: false,
      privateCoordinatesIncluded: false,
      evidenceIdentifiersIncluded: false,
      submission: {
        outcome: 'completed',
        advisoryOnly: true,
        privateNotesIncluded: false,
        evidenceIdentifiersIncluded: false,
        privateCoordinatesIncluded: false,
      },
    });
    const repeatedResponse = await request(httpServer())
      .post(`/api/v1/operations/field-work-items/${work.workItemId}/submissions`)
      .set('authorization', `Bearer ${fieldAgentA.accessToken}`)
      .send(body)
      .expect(201);
    const repeated = repeatedResponse.body as FieldWorkResponse;
    expect(repeated.submission?.submissionId).toBe(first.submission?.submissionId);

    await request(httpServer())
      .post(`/api/v1/operations/field-work-items/${work.workItemId}/submissions`)
      .set('authorization', `Bearer ${fieldAgentA.accessToken}`)
      .send({
        ...body,
        publicSafeSummary: 'Different synthetic payload using the same client key.',
      })
      .expect(409);

    const after = await pool.query<{ decisions: string; claims: string }>(
      `SELECT
         (SELECT count(*) FROM verification.decisions WHERE case_id = $1)::text AS decisions,
         (SELECT count(*) FROM verification.claims WHERE case_id = $1)::text AS claims`,
      [caseId],
    );
    expect(after.rows[0]).toEqual(before.rows[0]);
    const serialized = JSON.stringify(first);
    expect(serialized).not.toContain('Synthetic private operations note');
    expect(serialized).not.toContain('latitude');
    expect(serialized).not.toContain('longitude');
    expect(serialized).not.toContain('objectKey');
    expect(serialized).not.toContain('sha256');
  });

  it('supports atomic reassignment and cancellation', async () => {
    const caseId = await createCase('reassignment');
    const original = await createWork(caseId, fieldAgentA.identityId, 3);
    const reassignedResponse = await request(httpServer())
      .post(`/api/v1/operations/field-work-items/${original.workItemId}/reassign`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({
        fieldAgentIdentityId: fieldAgentB.identityId,
        ...schedule(4),
        reason: 'Synthetic reassignment because the original field agent became unavailable.',
        policyVersion: 'phase7-field-v1',
      })
      .expect(201);
    const replacement = reassignedResponse.body as FieldWorkResponse;
    expect(replacement).toMatchObject({
      caseId,
      fieldAgentIdentityId: fieldAgentB.identityId,
      state: 'scheduled',
    });

    const originalResponse = await request(httpServer())
      .get(`/api/v1/operations/field-work-items/${original.workItemId}`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(originalResponse.body as FieldWorkResponse).toMatchObject({
      state: 'reassigned',
      replacedByWorkItemId: replacement.workItemId,
    });

    const cancelledResponse = await request(httpServer())
      .post(`/api/v1/operations/field-work-items/${replacement.workItemId}/cancel`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({
        reason: 'Synthetic replacement inspection cancelled by the authorized administrator.',
      })
      .expect(200);
    expect(cancelledResponse.body as FieldWorkResponse).toMatchObject({ state: 'cancelled' });
  });

  it.each([
    ['missed', 'missed'],
    ['unable_to_verify', 'unable_to_verify'],
  ])('records %s as an advisory terminal field state', async (outcome, expectedState) => {
    const caseId = await createCase(`terminal_${outcome}`);
    const work = await createWork(caseId, fieldAgentB.identityId, 5);
    await acceptAndStart(work.workItemId, fieldAgentB);
    const response = await request(httpServer())
      .post(`/api/v1/operations/field-work-items/${work.workItemId}/submissions`)
      .set('authorization', `Bearer ${fieldAgentB.accessToken}`)
      .send(
        submission(
          outcome,
          `offline-${outcome}-0001`,
          `Synthetic ${outcome} field outcome recorded without a verification decision.`,
        ),
      )
      .expect(201);
    expect(response.body as FieldWorkResponse).toMatchObject({
      state: expectedState,
      submission: { outcome, advisoryOnly: true },
    });
    const trust = await pool.query<{ decisions: string; claims: string }>(
      `SELECT
         (SELECT count(*) FROM verification.decisions WHERE case_id = $1)::text AS decisions,
         (SELECT count(*) FROM verification.claims WHERE case_id = $1)::text AS claims`,
      [caseId],
    );
    expect(trust.rows[0]).toEqual({ decisions: '0', claims: '0' });
  });
});
