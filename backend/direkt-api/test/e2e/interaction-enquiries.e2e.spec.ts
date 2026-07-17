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

interface EnquiryResponse {
  enquiryId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  serviceSummary: string;
  status: string;
  revision: number;
  events: Array<{
    sequence: number;
    fromStatus: string | null;
    toStatus: string;
    actorKind: string;
    actorIdentityExposed: false;
  }>;
  fullChatEnabled: false;
  privateContactIncluded: false;
  privateEvidenceIncluded: false;
  internalIdentifiersIncluded: false;
  synthetic: true;
}

interface ProviderQueueResponse {
  providerScope: 'actor_resolved';
  items: EnquiryResponse[];
}

describe('Phase 8 structured enquiry and provider response lifecycle', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let customerA: SessionResponse;
  let customerB: SessionResponse;
  let ownerA: SessionResponse;
  let ownerB: SessionResponse;
  let reviewerId: string;
  let providerAId: string;
  let providerBId: string;
  let publicProviderAId: string;
  let publicProviderBId: string;

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
        deviceLabel: 'Synthetic Phase 8 interaction client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function grantProviderOwner(identityId: string, providerId: string): Promise<void> {
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, provider_id, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'provider', $2, $1, $3
       FROM authz.roles
       WHERE role_key = 'provider_owner'`,
      [identityId, providerId, 'Synthetic Phase 8 provider-owner interaction fixture'],
    );
  }

  async function seedPublishedProvider(input: {
    ownerIdentityId: string;
    displayName: string;
    locality: string;
  }): Promise<{ providerId: string; publicProviderId: string }> {
    const providerId = randomUUID();
    await pool.query(
      `INSERT INTO provider.organizations (
         id, pathway, created_by_identity_id, status
       ) VALUES ($1, 'registered_business', $2, 'ready_for_verification')`,
      [providerId, input.ownerIdentityId],
    );
    await pool.query(
      `INSERT INTO provider.profiles (
         provider_id,
         display_name,
         operating_model,
         locality_summary,
         service_area_summary,
         registered_business_name
       ) VALUES ($1, $2, 'mobile', $3, $4, $5)`,
      [
        providerId,
        input.displayName,
        input.locality,
        `${input.locality} synthetic Phase 8 service area`,
        `${input.displayName} Limited`,
      ],
    );
    await pool.query(
      `INSERT INTO provider.category_selections (
         provider_id, category_id, requirement_version_id
       ) VALUES (
         $1,
         '00000000-0000-4000-8000-000000003001',
         '00000000-0000-4000-8000-000000003101'
       )`,
      [providerId],
    );
    await pool.query(
      `INSERT INTO discovery.provider_locations (
         provider_id,
         public_premises_consent,
         public_locality,
         service_area,
         source,
         confidence,
         confirmed_at
       ) VALUES (
         $1,
         false,
         $2,
         ST_GeogFromText('POLYGON((28.20 -15.55, 28.50 -15.55, 28.50 -15.25, 28.20 -15.25, 28.20 -15.55))'),
         'synthetic',
         'high',
         now()
       )`,
      [providerId, input.locality],
    );

    const requirements = await pool.query<{
      id: string;
      requirement_key: string;
      requirement_kind: string;
    }>(
      `SELECT id, requirement_key, requirement_kind
       FROM catalog.requirements
       WHERE requirement_version_id = '00000000-0000-4000-8000-000000003101'
       ORDER BY requirement_key`,
    );
    for (const requirement of requirements.rows) {
      const caseId = randomUUID();
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
         ) VALUES (
           $1,
           $2,
           '00000000-0000-4000-8000-000000003001',
           '00000000-0000-4000-8000-000000003101',
           $3,
           $4,
           $5,
           'in_review',
           'phase8-fixture-v1',
           $6
         )`,
        [
          caseId,
          providerId,
          requirement.id,
          `phase8_${requirement.requirement_key}_check`,
          requirement.requirement_kind === 'identity'
            ? 'representative_identity'
            : 'category_eligibility',
          input.ownerIdentityId,
        ],
      );
      await pool.query(
        `INSERT INTO verification.assignments (
           case_id, assignee_identity_id, assignment_kind, assigned_by_identity_id, reason
         ) VALUES ($1, $2, 'reviewer', $2, $3)`,
        [caseId, reviewerId, 'Independent synthetic Phase 8 publication reviewer'],
      );
      await pool.query(
        `SELECT verification.record_decision(
           $1,
           $2,
           'approved',
           'CHECK_PASSED',
           $3,
           $4,
           $5,
           $6,
           '2028-01-01T00:00:00.000Z',
           'phase8-fixture-v1'
         )`,
        [
          caseId,
          reviewerId,
          `Synthetic ${requirement.requirement_key} approval for interaction fixture.`,
          `${requirement.requirement_key}_checked`,
          `${requirement.requirement_key.replaceAll('_', ' ')} checked`,
          'This scoped synthetic claim does not guarantee future service outcomes.',
        ],
      );
    }

    const publication = await pool.query<{ publication_id: string }>(
      `SELECT discovery.refresh_publication($1, 'plumbing', 'phase8-fixture-v1', now()) AS publication_id`,
      [providerId],
    );
    const publicProviderId = publication.rows[0]?.publication_id;
    if (!publicProviderId) {
      throw new Error('Synthetic Phase 8 publication was not created.');
    }
    await grantProviderOwner(input.ownerIdentityId, providerId);
    return { providerId, publicProviderId };
  }

  function enquiryPayload(publicProviderId: string) {
    return {
      publicProviderId,
      serviceSummary:
        'A synthetic leaking kitchen tap requires a bounded plumbing assessment without starting a chat thread.',
      timing: 'within_week',
      localitySummary: 'Woodlands, Lusaka',
      preferredChannel: 'whatsapp',
      policyVersion: 'phase8-v1',
    };
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    customerA = await signIn('phase8-customer-a@example.invalid');
    customerB = await signIn('phase8-customer-b@example.invalid');
    ownerA = await signIn('phase8-provider-owner-a@example.invalid');
    ownerB = await signIn('phase8-provider-owner-b@example.invalid');
    reviewerId = randomUUID();
    await pool.query('INSERT INTO account.identities (id) VALUES ($1)', [reviewerId]);
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'global', $1, $2
       FROM authz.roles
       WHERE role_key = 'reviewer'`,
      [reviewerId, 'Synthetic global reviewer for Phase 8 fixtures'],
    );

    const providerA = await seedPublishedProvider({
      ownerIdentityId: ownerA.identityId,
      displayName: 'Synthetic Phase 8 Plumbing A',
      locality: 'Woodlands, Lusaka',
    });
    providerAId = providerA.providerId;
    publicProviderAId = providerA.publicProviderId;
    const providerB = await seedPublishedProvider({
      ownerIdentityId: ownerB.identityId,
      displayName: 'Synthetic Phase 8 Plumbing B',
      locality: 'Kabulonga, Lusaka',
    });
    providerBId = providerB.providerId;
    publicProviderBId = providerB.publicProviderId;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('creates one publication-scoped enquiry per hashed idempotency payload', async () => {
    await request(httpServer())
      .post('/api/v1/enquiries')
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .send(enquiryPayload(publicProviderAId))
      .expect(400);

    const before = await pool.query<{ decisions: string; claims: string; publications: string }>(
      `SELECT
         (SELECT count(*)
          FROM verification.decisions AS decisions
          JOIN verification.cases AS cases ON cases.id = decisions.case_id
          WHERE cases.provider_id = $1)::text AS decisions,
         (SELECT count(*) FROM verification.claims WHERE provider_id = $1)::text AS claims,
         (SELECT count(*) FROM discovery.publications WHERE provider_id = $1)::text AS publications`,
      [providerAId],
    );

    const firstResponse = await request(httpServer())
      .post('/api/v1/enquiries')
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .set('idempotency-key', 'phase8-enquiry-create-0001')
      .send(enquiryPayload(publicProviderAId))
      .expect(201);
    const first = firstResponse.body as EnquiryResponse;
    expect(first).toMatchObject({
      publicProviderId: publicProviderAId,
      providerDisplayName: 'Synthetic Phase 8 Plumbing A',
      categoryKey: 'plumbing',
      status: 'received',
      revision: 1,
      fullChatEnabled: false,
      privateContactIncluded: false,
      privateEvidenceIncluded: false,
      internalIdentifiersIncluded: false,
      synthetic: true,
    });
    expect(first.events).toHaveLength(1);
    expect(first.events[0]).toMatchObject({
      sequence: 1,
      fromStatus: null,
      toStatus: 'received',
      actorKind: 'customer',
      actorIdentityExposed: false,
    });

    const replayResponse = await request(httpServer())
      .post('/api/v1/enquiries')
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .set('idempotency-key', 'phase8-enquiry-create-0001')
      .send(enquiryPayload(publicProviderAId))
      .expect(201);
    expect((replayResponse.body as EnquiryResponse).enquiryId).toBe(first.enquiryId);

    const concurrentResponses = await Promise.all(
      Array.from({ length: 4 }, () =>
        request(httpServer())
          .post('/api/v1/enquiries')
          .set('authorization', `Bearer ${customerA.accessToken}`)
          .set('idempotency-key', 'phase8-enquiry-concurrent-0001')
          .send(enquiryPayload(publicProviderAId))
          .expect(201),
      ),
    );
    expect(
      new Set(concurrentResponses.map((response) => (response.body as EnquiryResponse).enquiryId))
        .size,
    ).toBe(1);

    await request(httpServer())
      .post('/api/v1/enquiries')
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .set('idempotency-key', 'phase8-enquiry-create-0001')
      .send({ ...enquiryPayload(publicProviderAId), localitySummary: 'Different locality' })
      .expect(409);

    const after = await pool.query<{ decisions: string; claims: string; publications: string }>(
      `SELECT
         (SELECT count(*)
          FROM verification.decisions AS decisions
          JOIN verification.cases AS cases ON cases.id = decisions.case_id
          WHERE cases.provider_id = $1)::text AS decisions,
         (SELECT count(*) FROM verification.claims WHERE provider_id = $1)::text AS claims,
         (SELECT count(*) FROM discovery.publications WHERE provider_id = $1)::text AS publications`,
      [providerAId],
    );
    expect(after.rows[0]).toEqual(before.rows[0]);
    expect(JSON.stringify(first)).not.toContain(customerA.identityId);
    expect(JSON.stringify(first)).not.toContain(providerAId);
    expect(JSON.stringify(first)).not.toContain('objectKey');
  });

  it('denies stale publications and cross-customer reads', async () => {
    await pool.query('SELECT discovery.hide_publication($1, $2)', [
      publicProviderBId,
      'Synthetic Phase 8 hidden publication must reject new enquiries.',
    ]);
    await request(httpServer())
      .post('/api/v1/enquiries')
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .set('idempotency-key', 'phase8-hidden-publication-0001')
      .send(enquiryPayload(publicProviderBId))
      .expect(404);

    const created = await request(httpServer())
      .post('/api/v1/enquiries')
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .set('idempotency-key', 'phase8-cross-customer-0001')
      .send(enquiryPayload(publicProviderAId))
      .expect(201);
    const enquiry = created.body as EnquiryResponse;

    await request(httpServer())
      .get(`/api/v1/enquiries/${enquiry.enquiryId}`)
      .set('authorization', `Bearer ${customerB.accessToken}`)
      .expect(404);
    await request(httpServer())
      .get(`/api/v1/enquiries/${enquiry.enquiryId}`)
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .expect(200);
  });

  it('enforces provider scope, optimistic revision and legal response transitions', async () => {
    const created = await request(httpServer())
      .post('/api/v1/enquiries')
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .set('idempotency-key', 'phase8-provider-lifecycle-0001')
      .send(enquiryPayload(publicProviderAId))
      .expect(201);
    const enquiry = created.body as EnquiryResponse;

    const queue = await request(httpServer())
      .get('/api/v1/provider-workspace/me/enquiries')
      .set('authorization', `Bearer ${ownerA.accessToken}`)
      .expect(200);
    expect(queue.body as ProviderQueueResponse).toMatchObject({ providerScope: 'actor_resolved' });
    expect((queue.body as ProviderQueueResponse).items).toEqual(
      expect.arrayContaining([expect.objectContaining({ enquiryId: enquiry.enquiryId })]),
    );

    await request(httpServer())
      .get(`/api/v1/provider-workspace/me/enquiries/${enquiry.enquiryId}`)
      .set('authorization', `Bearer ${ownerB.accessToken}`)
      .expect(404);

    const acknowledgedResponse = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/enquiries/${enquiry.enquiryId}/transitions`)
      .set('authorization', `Bearer ${ownerA.accessToken}`)
      .send({
        targetStatus: 'acknowledged',
        expectedRevision: 1,
        reason: 'Provider acknowledged the synthetic structured enquiry.',
        policyVersion: 'phase8-v1',
      })
      .expect(200);
    const acknowledged = acknowledgedResponse.body as EnquiryResponse;
    expect(acknowledged).toMatchObject({ status: 'acknowledged', revision: 2 });
    expect(acknowledged.events.at(-1)).toMatchObject({
      fromStatus: 'received',
      toStatus: 'acknowledged',
      actorKind: 'provider',
    });

    await request(httpServer())
      .post(`/api/v1/provider-workspace/me/enquiries/${enquiry.enquiryId}/transitions`)
      .set('authorization', `Bearer ${ownerA.accessToken}`)
      .send({
        targetStatus: 'accepted',
        expectedRevision: 1,
        reason: 'Stale provider action must not overwrite the current enquiry.',
        policyVersion: 'phase8-v1',
      })
      .expect(409);

    const acceptedResponse = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/enquiries/${enquiry.enquiryId}/transitions`)
      .set('authorization', `Bearer ${ownerA.accessToken}`)
      .send({
        targetStatus: 'accepted',
        expectedRevision: 2,
        reason: 'Provider accepted the synthetic structured enquiry.',
        policyVersion: 'phase8-v1',
      })
      .expect(200);
    expect(acceptedResponse.body as EnquiryResponse).toMatchObject({
      status: 'accepted',
      revision: 3,
    });

    await request(httpServer())
      .post(`/api/v1/provider-workspace/me/enquiries/${enquiry.enquiryId}/transitions`)
      .set('authorization', `Bearer ${ownerA.accessToken}`)
      .send({
        targetStatus: 'declined',
        expectedRevision: 3,
        reason: 'Accepted enquiry cannot later be declined.',
        policyVersion: 'phase8-v1',
      })
      .expect(400);
  });

  it('allows only the owning customer to cancel an active enquiry', async () => {
    const created = await request(httpServer())
      .post('/api/v1/enquiries')
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .set('idempotency-key', 'phase8-customer-cancel-0001')
      .send(enquiryPayload(publicProviderAId))
      .expect(201);
    const enquiry = created.body as EnquiryResponse;

    await request(httpServer())
      .post(`/api/v1/enquiries/${enquiry.enquiryId}/cancel`)
      .set('authorization', `Bearer ${customerB.accessToken}`)
      .send({
        expectedRevision: 1,
        reason: 'Unrelated customer must not cancel this enquiry.',
        policyVersion: 'phase8-v1',
      })
      .expect(404);

    const cancelled = await request(httpServer())
      .post(`/api/v1/enquiries/${enquiry.enquiryId}/cancel`)
      .set('authorization', `Bearer ${customerA.accessToken}`)
      .send({
        expectedRevision: 1,
        reason: 'Customer no longer requires the synthetic service.',
        policyVersion: 'phase8-v1',
      })
      .expect(200);
    expect(cancelled.body as EnquiryResponse).toMatchObject({ status: 'cancelled', revision: 2 });

    const history = await pool.query<{ event_count: string }>(
      'SELECT count(*)::text AS event_count FROM interaction.enquiry_events WHERE enquiry_id = $1',
      [enquiry.enquiryId],
    );
    expect(history.rows[0]?.event_count).toBe('2');
  });

  it('keeps provider B isolated even after its publication is hidden', async () => {
    const providerBQueue = await request(httpServer())
      .get('/api/v1/provider-workspace/me/enquiries')
      .set('authorization', `Bearer ${ownerB.accessToken}`)
      .expect(200);
    expect((providerBQueue.body as ProviderQueueResponse).items).toEqual([]);
    expect(providerBId).not.toBe(providerAId);
  });
});
