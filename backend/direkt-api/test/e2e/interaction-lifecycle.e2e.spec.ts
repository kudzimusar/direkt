import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHash, randomUUID } from 'node:crypto';
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

interface EnquiryView {
  enquiryId: string;
  status: string;
  revision: number;
}

interface HandoffView {
  handoffId: string;
  interactionId: string;
  enquiryId: string;
  channel: string;
  contactDisplayHint: string;
  status: string;
  deliveryState: 'disabled';
  externalDeliveryAttempted: false;
  rawContactIncluded: false;
}

interface InteractionView {
  interactionId: string;
  enquiryId: string;
  status: string;
  revision: number;
  reviewEligibility: {
    eligible: boolean;
    reasonCode: string;
  };
  handoffs: HandoffView[];
  events: Array<{ eventType: string }>;
  customerContactIncluded: false;
  privateEvidenceIncluded: false;
  internalModerationIncluded: false;
}

interface ReviewView {
  reviewId: string;
  interactionId: string;
  moderationStatus: string;
  revision: number;
  providerResponse: { responseId: string; body: string } | null;
  appeals: Array<{
    appealId: string;
    status: string;
    decisionReasonCode: string | null;
  }>;
  reportsCount: number;
  customerIdentityExposed: false;
  contactIncluded: false;
  interactionPrivateDetailIncluded: false;
  internalRationaleIncluded: false;
  trustOrRankingMutation: false;
}

interface ComplaintView {
  complaintId: string;
  interactionId: string;
  status: string;
  revision: number;
  phase7IncidentLinked: false;
  contactIncluded: false;
  privateInteractionDetailIncluded: false;
  actorIdentityExposed: false;
  trustOrRankingMutation: false;
}

interface TrustStateCounts {
  decisions: string;
  claims: string;
  publications: string;
}

interface OperationsInteractionListView {
  interactionScope: 'privacy_safe';
  items: Array<{
    interactionId: string;
    customerIdentityExposed: false;
    contactIncluded: false;
    privateEvidenceIncluded: false;
    internalModerationRationaleIncluded: false;
    trustOrRankingMutation: false;
  }>;
}

interface OperationsComplaintListView {
  phase7IncidentDataIncluded: false;
  items: ComplaintView[];
}

describe('Phase 8 consent, review, appeal and complaint closed loop', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let customer: SessionResponse;
  let providerOwner: SessionResponse;
  let operator: SessionResponse;
  let reporter: SessionResponse;
  let providerId: string;
  let publicProviderId: string;
  let verifiedPhoneContactId: string;

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
        deviceLabel: 'Synthetic Phase 8 lifecycle client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function grantGlobalRole(
    identityId: string,
    roleKey: string,
    reason: string,
  ): Promise<void> {
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'global', $1, $3
       FROM authz.roles
       WHERE role_key = $2`,
      [identityId, roleKey, reason],
    );
  }

  async function grantProviderOwner(identityId: string, scopedProviderId: string): Promise<void> {
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, provider_id, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'provider', $2, $1, $3
       FROM authz.roles
       WHERE role_key = 'provider_owner'`,
      [identityId, scopedProviderId, 'Synthetic Phase 8 lifecycle provider owner'],
    );
  }

  async function seedPublishedProvider(): Promise<{
    providerId: string;
    publicProviderId: string;
  }> {
    const seededProviderId = randomUUID();
    await pool.query(
      `INSERT INTO provider.organizations (
         id, pathway, created_by_identity_id, status
       ) VALUES ($1, 'registered_business', $2, 'ready_for_verification')`,
      [seededProviderId, providerOwner.identityId],
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
        seededProviderId,
        'Synthetic Phase 8 Lifecycle Plumbing',
        'Woodlands, Lusaka',
        'Woodlands synthetic lifecycle service area',
        'Synthetic Phase 8 Lifecycle Plumbing Limited',
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
      [seededProviderId],
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
      [seededProviderId, 'Woodlands, Lusaka'],
    );

    const reviewerId = randomUUID();
    await pool.query('INSERT INTO account.identities (id) VALUES ($1)', [reviewerId]);
    await grantGlobalRole(
      reviewerId,
      'reviewer',
      'Independent synthetic reviewer for Phase 8 lifecycle fixture',
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
           'phase8-lifecycle-v1',
           $6
         )`,
        [
          caseId,
          seededProviderId,
          requirement.id,
          `phase8_lifecycle_${requirement.requirement_key}`,
          requirement.requirement_kind === 'identity'
            ? 'representative_identity'
            : 'category_eligibility',
          providerOwner.identityId,
        ],
      );
      await pool.query(
        `INSERT INTO verification.assignments (
           case_id, assignee_identity_id, assignment_kind, assigned_by_identity_id, reason
         ) VALUES ($1, $2, 'reviewer', $2, $3)`,
        [caseId, reviewerId, 'Independent synthetic Phase 8 lifecycle review'],
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
           'phase8-lifecycle-v1'
         )`,
        [
          caseId,
          reviewerId,
          `Synthetic ${requirement.requirement_key} approval for lifecycle fixture.`,
          `${requirement.requirement_key}_checked`,
          `${requirement.requirement_key.replaceAll('_', ' ')} checked`,
          'This scoped synthetic claim does not guarantee future service outcomes.',
        ],
      );
    }

    const publication = await pool.query<{ publication_id: string }>(
      `SELECT discovery.refresh_publication(
         $1, 'plumbing', 'phase8-lifecycle-v1', now()
       ) AS publication_id`,
      [seededProviderId],
    );
    const seededPublicProviderId = publication.rows[0]?.publication_id;
    if (!seededPublicProviderId) {
      throw new Error('Synthetic Phase 8 lifecycle publication was not created.');
    }
    await grantProviderOwner(providerOwner.identityId, seededProviderId);
    return {
      providerId: seededProviderId,
      publicProviderId: seededPublicProviderId,
    };
  }

  async function trustState(): Promise<TrustStateCounts> {
    const result = await pool.query<TrustStateCounts>(
      `SELECT
         (SELECT count(*)
          FROM verification.decisions AS decisions
          JOIN verification.cases AS cases ON cases.id = decisions.case_id
          WHERE cases.provider_id = $1)::text AS decisions,
         (SELECT count(*) FROM verification.claims WHERE provider_id = $1)::text AS claims,
         (SELECT count(*) FROM discovery.publications WHERE provider_id = $1)::text AS publications`,
      [providerId],
    );
    const row = result.rows[0];
    if (!row) throw new Error('Trust state count query returned no row.');
    return row;
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    customer = await signIn('phase8-lifecycle-customer@example.invalid');
    providerOwner = await signIn('phase8-lifecycle-provider@example.invalid');
    operator = await signIn('phase8-lifecycle-operator@example.invalid');
    reporter = await signIn('phase8-lifecycle-reporter@example.invalid');
    await grantGlobalRole(
      operator.identityId,
      'trust_supervisor',
      'Synthetic Stage 8 interaction moderation and complaint operator',
    );

    const provider = await seedPublishedProvider();
    providerId = provider.providerId;
    publicProviderId = provider.publicProviderId;

    const phone = await pool.query<{ id: string }>(
      `INSERT INTO account.contacts (
         identity_id, channel, value_hash, display_hint, verified_at
       ) VALUES ($1, 'phone', $2, $3, now())
       RETURNING id`,
      [
        customer.identityId,
        createHash('sha256').update('+260970000104', 'utf8').digest('hex'),
        '+260 ••• •• 104',
      ],
    );
    const contactId = phone.rows[0]?.id;
    if (!contactId) throw new Error('Verified phone fixture was not created.');
    verifiedPhoneContactId = contactId;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('completes the consent, review, appeal and complaint lifecycle without mutating trust', async () => {
    const beforeTrust = await trustState();
    const enquiryPayload = {
      publicProviderId,
      serviceSummary:
        'A synthetic leaking kitchen tap requires a bounded plumbing assessment without chat or attachments.',
      timing: 'within_week',
      localitySummary: 'Woodlands, Lusaka',
      preferredChannel: 'whatsapp',
      policyVersion: 'phase8-lifecycle-v1',
    };

    const createdResponse = await request(httpServer())
      .post('/api/v1/enquiries')
      .set('authorization', `Bearer ${customer.accessToken}`)
      .set('idempotency-key', 'phase8-lifecycle-enquiry-0001')
      .send(enquiryPayload)
      .expect(201);
    const enquiry = createdResponse.body as EnquiryView;

    await request(httpServer())
      .post(`/api/v1/enquiries/${enquiry.enquiryId}/handoffs`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .set('idempotency-key', 'phase8-lifecycle-handoff-too-early')
      .send({
        channel: 'whatsapp',
        contactId: verifiedPhoneContactId,
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(404);

    const acceptedResponse = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/enquiries/${enquiry.enquiryId}/transitions`)
      .set('authorization', `Bearer ${providerOwner.accessToken}`)
      .send({
        targetStatus: 'accepted',
        expectedRevision: 1,
        reason: 'Provider accepted the bounded synthetic service request.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect(acceptedResponse.body as EnquiryView).toMatchObject({ status: 'accepted', revision: 2 });

    const interactionsResponse = await request(httpServer())
      .get('/api/v1/interactions')
      .set('authorization', `Bearer ${customer.accessToken}`)
      .expect(200);
    const interaction = (interactionsResponse.body as InteractionView[]).find(
      (item) => item.enquiryId === enquiry.enquiryId,
    );
    expect(interaction).toBeDefined();
    const interactionId = (interaction as InteractionView).interactionId;
    expect(interaction).toMatchObject({
      status: 'active',
      reviewEligibility: { eligible: false, reasonCode: 'INTERACTION_ACTIVE' },
      customerContactIncluded: false,
      privateEvidenceIncluded: false,
      internalModerationIncluded: false,
    });

    const handoffPayload = {
      channel: 'whatsapp',
      contactId: verifiedPhoneContactId,
      policyVersion: 'phase8-lifecycle-v1',
    };
    const handoffResponse = await request(httpServer())
      .post(`/api/v1/enquiries/${enquiry.enquiryId}/handoffs`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .set('idempotency-key', 'phase8-lifecycle-handoff-0001')
      .send(handoffPayload)
      .expect(201);
    const handoff = handoffResponse.body as HandoffView;
    expect(handoff).toMatchObject({
      interactionId,
      enquiryId: enquiry.enquiryId,
      channel: 'whatsapp',
      contactDisplayHint: '+260 ••• •• 104',
      status: 'active',
      deliveryState: 'disabled',
      externalDeliveryAttempted: false,
      rawContactIncluded: false,
    });
    expect(JSON.stringify(handoff)).not.toContain('+260970000104');

    const replayHandoff = await request(httpServer())
      .post(`/api/v1/enquiries/${enquiry.enquiryId}/handoffs`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .set('idempotency-key', 'phase8-lifecycle-handoff-0001')
      .send(handoffPayload)
      .expect(201);
    expect((replayHandoff.body as HandoffView).handoffId).toBe(handoff.handoffId);

    await request(httpServer())
      .post(`/api/v1/enquiries/${enquiry.enquiryId}/handoffs`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .set('idempotency-key', 'phase8-lifecycle-handoff-0001')
      .send({ ...handoffPayload, channel: 'call' })
      .expect(409);

    const providerHandoff = await request(httpServer())
      .get(`/api/v1/provider-workspace/me/enquiries/${enquiry.enquiryId}/handoff`)
      .set('authorization', `Bearer ${providerOwner.accessToken}`)
      .expect(200);
    expect(providerHandoff.body as HandoffView).toMatchObject({
      handoffId: handoff.handoffId,
      contactDisplayHint: '+260 ••• •• 104',
      rawContactIncluded: false,
    });

    const operationsInteractions = await request(httpServer())
      .get('/api/v1/operations/interactions')
      .set('authorization', `Bearer ${operator.accessToken}`)
      .expect(200);
    const operationsInteractionBody = operationsInteractions.body as OperationsInteractionListView;
    expect(operationsInteractionBody.interactionScope).toBe('privacy_safe');
    const operationsInteraction = operationsInteractionBody.items.find(
      (item) => item.interactionId === interactionId,
    );
    expect(operationsInteraction).toMatchObject({
      interactionId,
      customerIdentityExposed: false,
      contactIncluded: false,
      privateEvidenceIncluded: false,
      internalModerationRationaleIncluded: false,
      trustOrRankingMutation: false,
    });
    expect(JSON.stringify(operationsInteractionBody)).not.toContain('+260 ••• •• 104');
    expect(JSON.stringify(operationsInteractionBody)).not.toContain(customer.identityId);

    const revoked = await request(httpServer())
      .post(`/api/v1/enquiries/${enquiry.enquiryId}/handoffs/${handoff.handoffId}/revoke`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .send({
        reason: 'Customer revoked the synthetic WhatsApp contact handoff.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect(revoked.body as HandoffView).toMatchObject({ status: 'revoked' });

    await request(httpServer())
      .get(`/api/v1/provider-workspace/me/enquiries/${enquiry.enquiryId}/handoff`)
      .set('authorization', `Bearer ${providerOwner.accessToken}`)
      .expect(404);

    const closedResponse = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/enquiries/${enquiry.enquiryId}/transitions`)
      .set('authorization', `Bearer ${providerOwner.accessToken}`)
      .send({
        targetStatus: 'closed',
        expectedRevision: 2,
        reason: 'Provider closed the completed synthetic tracked interaction.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect(closedResponse.body as EnquiryView).toMatchObject({ status: 'closed', revision: 3 });

    const eligibility = await request(httpServer())
      .get(`/api/v1/interactions/${interactionId}/review-eligibility`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .expect(200);
    expect(eligibility.body).toMatchObject({ eligible: true, reasonCode: 'ELIGIBLE' });

    const reviewResponse = await request(httpServer())
      .post(`/api/v1/interactions/${interactionId}/reviews`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .send({
        rating: 4,
        title: 'Clear synthetic plumbing assessment',
        body: 'The provider explained the synthetic issue clearly and completed the bounded tracked interaction.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(201);
    const review = reviewResponse.body as ReviewView;
    expect(review).toMatchObject({
      interactionId,
      moderationStatus: 'pending',
      revision: 1,
      customerIdentityExposed: false,
      contactIncluded: false,
      interactionPrivateDetailIncluded: false,
      internalRationaleIncluded: false,
      trustOrRankingMutation: false,
    });

    await request(httpServer())
      .post(`/api/v1/interactions/${interactionId}/reviews`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .send({
        rating: 5,
        title: 'Duplicate review must fail',
        body: 'A second review for the same tracked interaction must be rejected deterministically.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(409);

    const providerResponse = await request(httpServer())
      .post(`/api/v1/provider-workspace/me/reviews/${review.reviewId}/response`)
      .set('authorization', `Bearer ${providerOwner.accessToken}`)
      .send({
        body: 'Thank you for the bounded synthetic review and clear description of the service outcome.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect((providerResponse.body as ReviewView).providerResponse).toMatchObject({
      body: 'Thank you for the bounded synthetic review and clear description of the service outcome.',
    });

    await request(httpServer())
      .post(`/api/v1/provider-workspace/me/reviews/${review.reviewId}/response`)
      .set('authorization', `Bearer ${providerOwner.accessToken}`)
      .send({
        body: 'A second provider response must never be accepted for this review.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(409);

    const publicBeforeModeration = await request(httpServer())
      .get(`/api/v1/public/providers/${publicProviderId}/reviews`)
      .expect(200);
    expect(publicBeforeModeration.body).toEqual([]);

    await request(httpServer())
      .post(`/api/v1/operations/reviews/${review.reviewId}/moderation`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .send({
        targetStatus: 'withheld',
        expectedRevision: 1,
        reasonCode: 'PRIVACY_REVIEW',
        reason: 'Unauthorized customer moderation must not reach the review state machine.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(403);

    const withheldResponse = await request(httpServer())
      .post(`/api/v1/operations/reviews/${review.reviewId}/moderation`)
      .set('authorization', `Bearer ${operator.accessToken}`)
      .send({
        targetStatus: 'withheld',
        expectedRevision: 1,
        reasonCode: 'PRIVACY_REVIEW',
        reason: 'Operations withheld the synthetic review for a bounded privacy assessment.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect(withheldResponse.body as ReviewView).toMatchObject({
      moderationStatus: 'withheld',
      revision: 2,
    });

    const firstAppealResponse = await request(httpServer())
      .post(`/api/v1/reviews/${review.reviewId}/appeals`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .send({
        reason: 'The synthetic review contains no raw contact data and should be assessed again.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    const firstAppealReview = firstAppealResponse.body as ReviewView;
    expect(firstAppealReview).toMatchObject({ moderationStatus: 'appealed', revision: 3 });
    const firstAppealId = firstAppealReview.appeals.at(-1)?.appealId;
    expect(firstAppealId).toBeDefined();

    const deniedAppeal = await request(httpServer())
      .post(`/api/v1/operations/review-appeals/${firstAppealId as string}/decisions`)
      .set('authorization', `Bearer ${operator.accessToken}`)
      .send({
        decisionStatus: 'denied',
        reasonCode: 'PRIVACY_REMAINS',
        reason:
          'The bounded privacy concern remains and the prior withheld state must be restored.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    const deniedAppealReview = deniedAppeal.body as ReviewView;
    expect(deniedAppealReview).toMatchObject({
      moderationStatus: 'withheld',
      revision: 4,
    });
    const decidedAppeal = deniedAppealReview.appeals.find(
      (appeal) => appeal.appealId === firstAppealId,
    );
    expect(decidedAppeal).toMatchObject({
      appealId: firstAppealId,
      status: 'denied',
      decisionReasonCode: 'PRIVACY_REMAINS',
    });

    const secondAppealResponse = await request(httpServer())
      .post(`/api/v1/reviews/${review.reviewId}/appeals`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .send({
        reason:
          'A corrected synthetic privacy explanation is available for a second bounded appeal.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    const secondAppealReview = secondAppealResponse.body as ReviewView;
    expect(secondAppealReview).toMatchObject({ moderationStatus: 'appealed', revision: 5 });
    const secondAppealId = secondAppealReview.appeals.at(-1)?.appealId;
    expect(secondAppealId).toBeDefined();

    const upheldAppeal = await request(httpServer())
      .post(`/api/v1/operations/review-appeals/${secondAppealId as string}/decisions`)
      .set('authorization', `Bearer ${operator.accessToken}`)
      .send({
        decisionStatus: 'upheld',
        reasonCode: 'CORRECTION_ACCEPTED',
        reason: 'The corrected bounded explanation resolves the synthetic privacy concern.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect(upheldAppeal.body as ReviewView).toMatchObject({
      moderationStatus: 'pending',
      revision: 6,
    });

    const publishedResponse = await request(httpServer())
      .post(`/api/v1/operations/reviews/${review.reviewId}/moderation`)
      .set('authorization', `Bearer ${operator.accessToken}`)
      .send({
        targetStatus: 'published',
        expectedRevision: 6,
        reasonCode: 'PUBLICATION_APPROVED',
        reason: 'Operations approved the corrected synthetic review for public projection.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect(publishedResponse.body as ReviewView).toMatchObject({
      moderationStatus: 'published',
      revision: 7,
    });

    const publicAfterModeration = await request(httpServer())
      .get(`/api/v1/public/providers/${publicProviderId}/reviews`)
      .expect(200);
    expect(publicAfterModeration.body).toEqual([
      expect.objectContaining({
        reviewId: review.reviewId,
        publicProviderId,
        contactIncluded: false,
        interactionIdentifierIncluded: false,
        moderationRationaleIncluded: false,
        synthetic: true,
      }),
    ]);
    expect(JSON.stringify(publicAfterModeration.body)).not.toContain(interactionId);
    expect(JSON.stringify(publicAfterModeration.body)).not.toContain(customer.identityId);

    await request(httpServer())
      .post(`/api/v1/reviews/${review.reviewId}/reports`)
      .set('authorization', `Bearer ${reporter.accessToken}`)
      .send({
        reasonCode: 'OTHER',
        detail: 'Synthetic report used to verify one immutable report per identity.',
      })
      .expect(200);
    await request(httpServer())
      .post(`/api/v1/reviews/${review.reviewId}/reports`)
      .set('authorization', `Bearer ${reporter.accessToken}`)
      .send({
        reasonCode: 'OTHER',
        detail: 'A repeated synthetic report by the same identity must be rejected.',
      })
      .expect(409);

    const complaintPayload = {
      complaintType: 'contact_privacy',
      summary:
        'The customer requests a bounded operations review of the revoked synthetic contact handoff.',
      policyVersion: 'phase8-lifecycle-v1',
    };
    const complaintResponse = await request(httpServer())
      .post(`/api/v1/interactions/${interactionId}/complaints`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .set('idempotency-key', 'phase8-lifecycle-complaint-0001')
      .send(complaintPayload)
      .expect(201);
    const complaint = complaintResponse.body as ComplaintView;
    expect(complaint).toMatchObject({
      interactionId,
      status: 'submitted',
      revision: 1,
      phase7IncidentLinked: false,
      contactIncluded: false,
      privateInteractionDetailIncluded: false,
      actorIdentityExposed: false,
      trustOrRankingMutation: false,
    });

    const complaintReplay = await request(httpServer())
      .post(`/api/v1/interactions/${interactionId}/complaints`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .set('idempotency-key', 'phase8-lifecycle-complaint-0001')
      .send(complaintPayload)
      .expect(201);
    expect((complaintReplay.body as ComplaintView).complaintId).toBe(complaint.complaintId);

    await request(httpServer())
      .post(`/api/v1/interactions/${interactionId}/complaints`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .set('idempotency-key', 'phase8-lifecycle-complaint-0001')
      .send({ ...complaintPayload, complaintType: 'provider_conduct' })
      .expect(409);

    const operationsComplaints = await request(httpServer())
      .get('/api/v1/operations/interaction-complaints')
      .set('authorization', `Bearer ${operator.accessToken}`)
      .expect(200);
    const operationsComplaintBody = operationsComplaints.body as OperationsComplaintListView;
    expect(operationsComplaintBody.phase7IncidentDataIncluded).toBe(false);
    const operationsComplaint = operationsComplaintBody.items.find(
      (item) => item.complaintId === complaint.complaintId,
    );
    expect(operationsComplaint).toMatchObject({
      complaintId: complaint.complaintId,
      phase7IncidentLinked: false,
      contactIncluded: false,
    });

    await request(httpServer())
      .post(`/api/v1/operations/interaction-complaints/${complaint.complaintId}/transitions`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .send({
        targetStatus: 'triaged',
        expectedRevision: 1,
        reason: 'Unauthorized customer complaint transition must be denied.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(403);

    const triaged = await request(httpServer())
      .post(`/api/v1/operations/interaction-complaints/${complaint.complaintId}/transitions`)
      .set('authorization', `Bearer ${operator.accessToken}`)
      .send({
        targetStatus: 'triaged',
        expectedRevision: 1,
        reason: 'Operations triaged the bounded synthetic contact privacy complaint.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect(triaged.body as ComplaintView).toMatchObject({ status: 'triaged', revision: 2 });

    await request(httpServer())
      .post(`/api/v1/operations/interaction-complaints/${complaint.complaintId}/transitions`)
      .set('authorization', `Bearer ${operator.accessToken}`)
      .send({
        targetStatus: 'resolved',
        expectedRevision: 1,
        reason: 'A stale complaint transition must not overwrite the current state.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(409);

    const resolved = await request(httpServer())
      .post(`/api/v1/operations/interaction-complaints/${complaint.complaintId}/transitions`)
      .set('authorization', `Bearer ${operator.accessToken}`)
      .send({
        targetStatus: 'resolved',
        expectedRevision: 2,
        reason: 'Operations resolved the synthetic privacy complaint with a bounded explanation.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect(resolved.body as ComplaintView).toMatchObject({ status: 'resolved', revision: 3 });

    const closedComplaint = await request(httpServer())
      .post(`/api/v1/operations/interaction-complaints/${complaint.complaintId}/transitions`)
      .set('authorization', `Bearer ${operator.accessToken}`)
      .send({
        targetStatus: 'closed',
        expectedRevision: 3,
        reason: 'Operations closed the resolved synthetic complaint after recording the outcome.',
        policyVersion: 'phase8-lifecycle-v1',
      })
      .expect(200);
    expect(closedComplaint.body as ComplaintView).toMatchObject({ status: 'closed', revision: 4 });

    await expect(
      pool.query(
        `SELECT (interaction.moderate_review($1, $2, 'removed', 'UNAUTHORIZED', $3, $4, 7)).id`,
        [
          review.reviewId,
          customer.identityId,
          'Direct database moderation by a customer must be rejected.',
          'phase8-lifecycle-v1',
        ],
      ),
    ).rejects.toThrow(/not authorized/i);
    await expect(
      pool.query('UPDATE interaction.reviews SET body = $2 WHERE id = $1', [
        review.reviewId,
        'Direct content mutation must be blocked by the database lifecycle guard.',
      ]),
    ).rejects.toThrow(/immutable|append-only/i);
    await expect(
      pool.query('DELETE FROM interaction.provider_review_responses WHERE review_id = $1', [
        review.reviewId,
      ]),
    ).rejects.toThrow(/immutable|append-only/i);
    await expect(
      pool.query('DELETE FROM interaction.reviews WHERE id = $1', [review.reviewId]),
    ).rejects.toThrow(/immutable|append-only/i);

    const afterTrust = await trustState();
    expect(afterTrust).toEqual(beforeTrust);
  });
});
