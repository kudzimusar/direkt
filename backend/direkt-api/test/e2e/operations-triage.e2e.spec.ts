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

interface TriageItemResponse {
  caseId: string;
  ownership: 'mine' | 'unassigned' | 'other';
  slaState: 'on_track' | 'due_soon' | 'overdue' | 'breached';
  priorityBand: 'critical' | 'urgent' | 'high' | 'normal';
  escalationRequired: boolean;
  highRisk: boolean;
  privateEvidenceIncluded: false;
  reviewerNotesIncluded: false;
  privateCoordinatesIncluded: false;
}

interface TriageQueueResponse {
  scope: 'assigned_and_unassigned' | 'all_cases';
  summary: {
    total: number;
    critical: number;
    breached: number;
    overdue: number;
    dueSoon: number;
    unassigned: number;
    highRisk: number;
    escalationRequired: number;
  };
  items: TriageItemResponse[];
  synthetic: true;
}

describe('Phase 7 operations verification triage', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let owner: SessionResponse;
  let reviewerA: SessionResponse;
  let reviewerB: SessionResponse;
  let supervisor: SessionResponse;
  let support: SessionResponse;
  let fieldAgent: SessionResponse;
  let providerId: string;
  let unassignedCaseId: string;
  let reviewerACaseId: string;
  let reviewerBCaseId: string;

  const httpServer = (): Server => app.getHttpServer() as Server;
  const queuePath = (query?: string): string =>
    `/api/v1/operations/verification-queue?providerId=${providerId}${query ? `&${query}` : ''}`;

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
        deviceLabel: 'Synthetic Phase 7 triage client',
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
      [session.identityId, roleKey, `Synthetic Phase 7 ${roleKey} assignment`],
    );
  }

  async function createCase(
    targetProviderId: string,
    checkKey: string,
    highRisk: boolean,
  ): Promise<string> {
    const response = await request(httpServer())
      .post(`/api/v1/providers/${targetProviderId}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        checkKey,
        checkFamily: 'representative_identity',
        highRisk,
        policyVersion: 'phase7-triage-case-v1',
      })
      .expect(201);
    return (response.body as CaseResponse).id;
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase7-triage-owner@example.invalid');
    reviewerA = await signIn('phase7-triage-reviewer-a@example.invalid');
    reviewerB = await signIn('phase7-triage-reviewer-b@example.invalid');
    supervisor = await signIn('phase7-triage-supervisor@example.invalid');
    support = await signIn('phase7-triage-support@example.invalid');
    fieldAgent = await signIn('phase7-triage-field-agent@example.invalid');

    await grantGlobalRole(reviewerA, 'reviewer');
    await grantGlobalRole(reviewerB, 'reviewer');
    await grantGlobalRole(supervisor, 'trust_supervisor');
    await grantGlobalRole(support, 'support');
    await grantGlobalRole(fieldAgent, 'field_agent');

    const providerResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Phase 7 Triage Provider',
        operatingModel: 'mobile',
        localitySummary: 'Synthetic operations locality',
        serviceAreaSummary: 'Synthetic operations service area',
        registeredBusinessName: 'Synthetic Phase 7 Triage Provider Limited',
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
        reason: 'Synthetic provider is ready for Phase 7 triage regression coverage',
      })
      .expect(201);

    unassignedCaseId = await createCase(providerId, 'phase7_triage_unassigned', false);
    reviewerACaseId = await createCase(providerId, 'phase7_triage_reviewer_a', false);
    reviewerBCaseId = await createCase(providerId, 'phase7_triage_reviewer_b', false);
    const caseIds = [unassignedCaseId, reviewerACaseId, reviewerBCaseId];

    await pool.query(
      `UPDATE verification.cases
       SET status = 'awaiting_evidence'
       WHERE id = ANY($1::uuid[])`,
      [caseIds],
    );
    await pool.query(
      `UPDATE verification.cases
       SET status = 'ready_for_review'
       WHERE id = ANY($1::uuid[])`,
      [caseIds],
    );
    await pool.query(
      `INSERT INTO verification.assignments (
         case_id,
         assignee_identity_id,
         assignment_kind,
         assigned_by_identity_id,
         reason
       ) VALUES
         ($1, $2, 'reviewer', $3, 'Synthetic reviewer A ownership'),
         ($4, $5, 'reviewer', $3, 'Synthetic reviewer B ownership')`,
      [
        reviewerACaseId,
        reviewerA.identityId,
        supervisor.identityId,
        reviewerBCaseId,
        reviewerB.identityId,
      ],
    );
    await pool.query(
      `UPDATE verification.cases
       SET status = 'assigned'
       WHERE id = ANY($1::uuid[])`,
      [[reviewerACaseId, reviewerBCaseId]],
    );
    await pool.query(
      `UPDATE verification.cases
       SET updated_at = CASE id
         WHEN $1::uuid THEN now() - interval '3 days'
         WHEN $2::uuid THEN now() - interval '13 hours'
         WHEN $3::uuid THEN now() - interval '1 hour'
         ELSE now()
       END
       WHERE id = ANY($4::uuid[])`,
      [unassignedCaseId, reviewerACaseId, reviewerBCaseId, caseIds],
    );
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('limits reviewers to unassigned cases and their own active assignments', async () => {
    const response = await request(httpServer())
      .get(queuePath())
      .set('authorization', `Bearer ${reviewerA.accessToken}`)
      .expect(200);
    const queue = response.body as TriageQueueResponse;

    expect(queue.scope).toBe('assigned_and_unassigned');
    expect(queue.summary.total).toBe(2);
    expect(queue.items.map((item) => item.caseId)).toEqual(
      expect.arrayContaining([unassignedCaseId, reviewerACaseId]),
    );
    expect(queue.items.map((item) => item.caseId)).not.toContain(reviewerBCaseId);
    expect(queue.items.find((item) => item.caseId === reviewerACaseId)?.ownership).toBe('mine');
    expect(queue.items.find((item) => item.caseId === unassignedCaseId)?.ownership).toBe(
      'unassigned',
    );
  });

  it('allows trust supervisors to see the complete deterministic queue', async () => {
    const response = await request(httpServer())
      .get(queuePath())
      .set('authorization', `Bearer ${supervisor.accessToken}`)
      .expect(200);
    const queue = response.body as TriageQueueResponse;

    expect(queue.scope).toBe('all_cases');
    expect(queue.summary).toMatchObject({
      total: 3,
      critical: 1,
      breached: 1,
      overdue: 1,
      unassigned: 1,
      highRisk: 0,
      escalationRequired: 1,
    });
    expect(queue.items.find((item) => item.caseId === unassignedCaseId)).toMatchObject({
      slaState: 'breached',
      priorityBand: 'critical',
      escalationRequired: true,
    });
    expect(queue.items.find((item) => item.caseId === reviewerACaseId)).toMatchObject({
      slaState: 'overdue',
      escalationRequired: false,
    });
    expect(queue.items.find((item) => item.caseId === reviewerBCaseId)?.ownership).toBe('other');
  });

  it('supports ownership, SLA and escalation filters without widening scope', async () => {
    const mineResponse = await request(httpServer())
      .get(queuePath('ownership=mine'))
      .set('authorization', `Bearer ${reviewerA.accessToken}`)
      .expect(200);
    const mineQueue = mineResponse.body as TriageQueueResponse;
    expect(mineQueue.items.map((item) => item.caseId)).toEqual([reviewerACaseId]);

    const breachedResponse = await request(httpServer())
      .get(queuePath('slaState=breached&highRisk=false&escalationRequired=true'))
      .set('authorization', `Bearer ${supervisor.accessToken}`)
      .expect(200);
    const breachedQueue = breachedResponse.body as TriageQueueResponse;
    expect(breachedQueue.items.map((item) => item.caseId)).toEqual([unassignedCaseId]);
  });

  it('denies support and field-agent roles from the reviewer triage queue', async () => {
    await request(httpServer())
      .get(queuePath())
      .set('authorization', `Bearer ${support.accessToken}`)
      .expect(403);
    await request(httpServer())
      .get(queuePath())
      .set('authorization', `Bearer ${fieldAgent.accessToken}`)
      .expect(403);
  });

  it('returns only privacy-safe queue metadata', async () => {
    const response = await request(httpServer())
      .get(queuePath())
      .set('authorization', `Bearer ${supervisor.accessToken}`)
      .expect(200);
    const queue = response.body as TriageQueueResponse;

    for (const item of queue.items) {
      expect(item).toMatchObject({
        privateEvidenceIncluded: false,
        reviewerNotesIncluded: false,
        privateCoordinatesIncluded: false,
      });
    }
    const serialized = JSON.stringify(queue);
    expect(serialized).not.toContain('objectKey');
    expect(serialized).not.toContain('sha256');
    expect(serialized).not.toContain('privateNotes');
    expect(serialized).not.toContain('latitude');
    expect(serialized).not.toContain('longitude');
    expect(serialized).not.toContain('accessUrl');
  });
});
