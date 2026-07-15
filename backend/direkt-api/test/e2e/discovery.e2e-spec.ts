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

interface SeededProvider {
  providerId: string;
  publicProviderId: string | null;
  privateLongitude: number;
  privateLatitude: number;
}

interface PublicSearchItem {
  publicProviderId: string;
  displayName: string;
  operatingModel: string;
  publicPremises: { latitude: number; longitude: number } | null;
  distanceKm: number | null;
  claims: Array<{ claimKey: string; limitation: string }>;
  reasons: string[];
  image: { lowBandwidthUrl: string | null; standardUrl: string | null };
  synthetic: true;
}

interface SearchResponse {
  items: PublicSearchItem[];
  nextCursor: string | null;
  searchContext: {
    manualArea: string | null;
    usedOneTimeLocation: boolean;
    backgroundLocationUsed: false;
    resultCount: number;
    noResultsSuggestions: string[];
  };
}

interface PublicProfileResponse extends PublicSearchItem {
  imagePolicy: string;
  locationExplanation: string;
  trustSummary: string;
}

interface ShareResponse {
  publicProviderId: string;
  path: string;
  containsPrivateLocation: false;
}

interface SavedProviderResponse {
  publicProviderId: string;
  displayName: string;
  synthetic: true;
}

describe('Phase 5 public-safe customer discovery HTTP contracts', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let customer: SessionResponse;
  let reviewerId: string;
  let fixed: SeededProvider;
  let mobile: SeededProvider;
  let hybrid: SeededProvider;
  let stale: SeededProvider;
  let incomplete: SeededProvider;

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
        deviceLabel: 'Synthetic Phase 5 customer',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function seedProvider(input: {
    displayName: string;
    operatingModel: 'fixed_premises' | 'mobile' | 'hybrid';
    locality: string;
    publicPoint?: { longitude: number; latitude: number };
    privatePoint: { longitude: number; latitude: number };
    serviceAreaWkt: string;
    availability: 'available' | 'limited' | 'unavailable' | 'unknown';
    claimValidUntil: string;
    withImage?: boolean;
    completeClaims?: boolean;
    publish?: boolean;
  }): Promise<SeededProvider> {
    const ownerId = randomUUID();
    const providerId = randomUUID();

    await pool.query('INSERT INTO account.identities (id) VALUES ($1)', [ownerId]);
    await pool.query(
      `INSERT INTO provider.organizations (
         id, pathway, created_by_identity_id, status
       ) VALUES ($1, 'registered_business', $2, 'ready_for_verification')`,
      [providerId, ownerId],
    );
    await pool.query(
      `INSERT INTO provider.profiles (
         provider_id,
         display_name,
         operating_model,
         locality_summary,
         service_area_summary,
         registered_business_name
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        providerId,
        input.displayName,
        input.operatingModel,
        input.locality,
        `${input.locality} synthetic service area`,
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
         private_base,
         public_premises,
         public_premises_consent,
         public_locality,
         service_area,
         source,
         confidence,
         confirmed_at
       ) VALUES (
         $1,
         ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
         CASE
           WHEN $4::double precision IS NULL THEN NULL
           ELSE ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography
         END,
         $4::double precision IS NOT NULL,
         $6,
         ST_GeogFromText($7),
         'synthetic',
         'high',
         now()
       )`,
      [
        providerId,
        input.privatePoint.longitude,
        input.privatePoint.latitude,
        input.publicPoint?.longitude ?? null,
        input.publicPoint?.latitude ?? null,
        input.locality,
        input.serviceAreaWkt,
      ],
    );
    await pool.query(
      `INSERT INTO discovery.provider_availability (
         provider_id, category_id, state, next_available_at
       ) VALUES (
         $1,
         '00000000-0000-4000-8000-000000003001',
         $2,
         CASE WHEN $2 = 'limited' THEN now() + interval '2 days' ELSE NULL END
       )`,
      [providerId, input.availability],
    );

    if (input.withImage) {
      await pool.query(
        `INSERT INTO discovery.public_media (
           provider_id,
           category_id,
           low_bandwidth_url,
           standard_url,
           alt_text
         ) VALUES ($1, '00000000-0000-4000-8000-000000003001', $2, $3, $4)`,
        [
          providerId,
          `https://images.invalid/${providerId}/low.webp`,
          `https://images.invalid/${providerId}/standard.webp`,
          `Synthetic public work image for ${input.displayName}`,
        ],
      );
    }

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
    const selectedRequirements =
      input.completeClaims === false ? requirements.rows.slice(0, 1) : requirements.rows;

    for (const requirement of selectedRequirements) {
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
           'phase5-v1',
           $6
         )`,
        [
          caseId,
          providerId,
          requirement.id,
          `${requirement.requirement_key}_check`,
          requirement.requirement_kind === 'identity'
            ? 'representative_identity'
            : 'category_eligibility',
          ownerId,
        ],
      );
      await pool.query(
        `INSERT INTO verification.assignments (
           case_id,
           assignee_identity_id,
           assignment_kind,
           assigned_by_identity_id,
           reason
         ) VALUES ($1, $2, 'reviewer', $2, $3)`,
        [caseId, reviewerId, 'Independent synthetic reviewer for Phase 5 publication fixture'],
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
           $7,
           'phase5-v1'
         )`,
        [
          caseId,
          reviewerId,
          `Synthetic scoped ${requirement.requirement_key} check passed.`,
          `${requirement.requirement_key}_checked`,
          `${requirement.requirement_key.replaceAll('_', ' ')} checked`,
          'This scoped claim does not guarantee safety, price or future workmanship.',
          input.claimValidUntil,
        ],
      );
    }

    let publicProviderId: string | null = null;
    if (input.publish !== false) {
      const publication = await pool.query<{ publication_id: string }>(
        `SELECT discovery.refresh_publication($1, 'plumbing', 'phase5-v1', now()) AS publication_id`,
        [providerId],
      );
      publicProviderId = publication.rows[0]?.publication_id ?? null;
      if (!publicProviderId) {
        throw new Error('Synthetic publication fixture was not created.');
      }
    }

    return {
      providerId,
      publicProviderId,
      privateLongitude: input.privatePoint.longitude,
      privateLatitude: input.privatePoint.latitude,
    };
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    customer = await signIn('phase5-customer@example.invalid');
    reviewerId = randomUUID();
    await pool.query('INSERT INTO account.identities (id) VALUES ($1)', [reviewerId]);
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'global', $1, $2
       FROM authz.roles
       WHERE role_key = 'reviewer'`,
      [reviewerId, 'Synthetic global reviewer role for Phase 5 discovery fixtures'],
    );

    fixed = await seedProvider({
      displayName: 'Synthetic Woodlands Plumbing',
      operatingModel: 'fixed_premises',
      locality: 'Woodlands, Lusaka',
      publicPoint: { longitude: 28.335, latitude: -15.421 },
      privatePoint: { longitude: 27.101, latitude: -14.101 },
      serviceAreaWkt:
        'POLYGON((28.25 -15.50, 28.45 -15.50, 28.45 -15.30, 28.25 -15.30, 28.25 -15.50))',
      availability: 'available',
      claimValidUntil: '2028-01-01T00:00:00.000Z',
      withImage: true,
    });
    mobile = await seedProvider({
      displayName: 'Synthetic Mobile Plumber',
      operatingModel: 'mobile',
      locality: 'Lusaka Central service area',
      privatePoint: { longitude: 26.202, latitude: -13.202 },
      serviceAreaWkt:
        'POLYGON((28.20 -15.55, 28.50 -15.55, 28.50 -15.25, 28.20 -15.25, 28.20 -15.55))',
      availability: 'limited',
      claimValidUntil: '2028-01-01T00:00:00.000Z',
    });
    hybrid = await seedProvider({
      displayName: 'Synthetic Hybrid Plumbing',
      operatingModel: 'hybrid',
      locality: 'Kabulonga, Lusaka',
      publicPoint: { longitude: 28.36, latitude: -15.42 },
      privatePoint: { longitude: 25.303, latitude: -12.303 },
      serviceAreaWkt:
        'POLYGON((28.28 -15.50, 28.48 -15.50, 28.48 -15.30, 28.28 -15.30, 28.28 -15.50))',
      availability: 'available',
      claimValidUntil: '2028-01-01T00:00:00.000Z',
    });
    stale = await seedProvider({
      displayName: 'Synthetic Soon Stale Plumbing',
      operatingModel: 'mobile',
      locality: 'Lusaka Central service area',
      privatePoint: { longitude: 24.404, latitude: -11.404 },
      serviceAreaWkt:
        'POLYGON((28.20 -15.55, 28.50 -15.55, 28.50 -15.25, 28.20 -15.25, 28.20 -15.55))',
      availability: 'unknown',
      claimValidUntil: '2026-07-16T00:00:00.000Z',
    });
    incomplete = await seedProvider({
      displayName: 'Synthetic Incomplete Claims',
      operatingModel: 'mobile',
      locality: 'Lusaka',
      privatePoint: { longitude: 23.5, latitude: -10.5 },
      serviceAreaWkt:
        'POLYGON((28.20 -15.55, 28.50 -15.55, 28.50 -15.25, 28.20 -15.25, 28.20 -15.55))',
      availability: 'available',
      claimValidUntil: '2028-01-01T00:00:00.000Z',
      completeClaims: false,
      publish: false,
    });
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('rejects direct publication writes and incomplete mandatory claims', async () => {
    await expect(
      pool.query(
        `INSERT INTO discovery.publications (
           provider_id,
           category_id,
           requirement_version_id,
           public_display_name,
           operating_model,
           public_locality,
           public_premises,
           service_area,
           policy_version
         ) VALUES (
           $1,
           '00000000-0000-4000-8000-000000003001',
           '00000000-0000-4000-8000-000000003101',
           'Forbidden direct publication',
           'mobile',
           'Lusaka',
           NULL,
           ST_GeogFromText('POLYGON((28.20 -15.55, 28.50 -15.55, 28.50 -15.25, 28.20 -15.25, 28.20 -15.55))'),
           'forbidden-v1'
         )`,
        [incomplete.providerId],
      ),
    ).rejects.toThrow(/publication policy function/);

    await expect(
      pool.query(`SELECT discovery.refresh_publication($1, 'plumbing', 'phase5-v1', now())`, [
        incomplete.providerId,
      ]),
    ).rejects.toThrow(/current mandatory scoped claims/);
  });

  it('supports manual area search without private coordinates or internal identifiers', async () => {
    const response = await request(httpServer())
      .get('/api/v1/public/providers/search')
      .query({ category: 'plumbing', area: 'Woodlands', limit: 10 })
      .expect(200);
    const body = response.body as SearchResponse;

    expect(body.searchContext).toMatchObject({
      manualArea: 'Woodlands',
      usedOneTimeLocation: false,
      backgroundLocationUsed: false,
    });
    expect(body.items.map((item) => item.publicProviderId)).toContain(fixed.publicProviderId);
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain(String(fixed.privateLongitude));
    expect(serialized).not.toContain(String(fixed.privateLatitude));
    expect(serialized).not.toContain('private_base');
    expect(serialized).not.toContain('providerId');
    expect(serialized).not.toContain('reviewer');
    expect(serialized).not.toContain('evidenceId');
  });

  it('uses public premises for fixed providers and service areas for mobile providers', async () => {
    const response = await request(httpServer())
      .get('/api/v1/public/providers/search')
      .query({
        category: 'plumbing',
        latitude: -15.42,
        longitude: 28.34,
        radiusKm: 20,
        limit: 10,
      })
      .expect(200);
    const body = response.body as SearchResponse;

    const fixedCard = body.items.find((item) => item.publicProviderId === fixed.publicProviderId);
    const mobileCard = body.items.find((item) => item.publicProviderId === mobile.publicProviderId);
    const hybridCard = body.items.find((item) => item.publicProviderId === hybrid.publicProviderId);

    expect(body.searchContext.usedOneTimeLocation).toBe(true);
    expect(fixedCard?.publicPremises).not.toBeNull();
    expect(fixedCard?.distanceKm).not.toBeNull();
    expect(fixedCard?.reasons).toContain('Public premises within selected distance');
    expect(mobileCard?.publicPremises).toBeNull();
    expect(mobileCard?.distanceKm).toBeNull();
    expect(mobileCard?.reasons).toContain('Serves your selected area');
    expect(hybridCard?.publicPremises).not.toBeNull();
    expect(hybridCard?.reasons).toContain('Serves your selected area');
  });

  it('applies claim and availability filters with stable cursor pagination', async () => {
    const first = await request(httpServer())
      .get('/api/v1/public/providers/search')
      .query({
        category: 'plumbing',
        latitude: -15.42,
        longitude: 28.34,
        availability: 'available',
        claim: 'identity_checked',
        limit: 1,
      })
      .expect(200);
    const firstBody = first.body as SearchResponse;

    expect(firstBody.items).toHaveLength(1);
    expect(firstBody.nextCursor).not.toBeNull();

    const second = await request(httpServer())
      .get('/api/v1/public/providers/search')
      .query({
        category: 'plumbing',
        latitude: -15.42,
        longitude: 28.34,
        availability: 'available',
        claim: 'identity_checked',
        limit: 1,
        cursor: firstBody.nextCursor,
      })
      .expect(200);
    const secondBody = second.body as SearchResponse;

    expect(secondBody.items).toHaveLength(1);
    expect(secondBody.items[0]?.publicProviderId).not.toBe(firstBody.items[0]?.publicProviderId);
  });

  it('returns safe profiles, image fallback, claim limitations and share metadata', async () => {
    const fixedResponse = await request(httpServer())
      .get(`/api/v1/public/providers/${fixed.publicProviderId}`)
      .expect(200);
    const fixedProfile = fixedResponse.body as PublicProfileResponse;
    const fixedSerialized = JSON.stringify(fixedProfile);

    expect(fixedProfile.trustSummary).toContain('blanket provider guarantee');
    expect(fixedSerialized).toContain('does not guarantee safety');
    expect(fixedSerialized).toContain('/low.webp');
    expect(fixedSerialized).not.toContain('private_base');
    expect(fixedSerialized).not.toContain('storage');

    const mobileResponse = await request(httpServer())
      .get(`/api/v1/public/providers/${mobile.publicProviderId}`)
      .expect(200);
    const mobileProfile = mobileResponse.body as PublicProfileResponse;

    expect(mobileProfile.imagePolicy).toContain('No public image is required');
    expect(mobileProfile.locationExplanation).toContain('private base');
    expect(JSON.stringify(mobileProfile)).not.toContain(String(mobile.privateLongitude));

    const shareResponse = await request(httpServer())
      .get(`/api/v1/public/providers/${fixed.publicProviderId}/share`)
      .expect(200);
    const share = shareResponse.body as ShareResponse;

    expect(share).toMatchObject({
      publicProviderId: fixed.publicProviderId,
      path: `/providers/${fixed.publicProviderId}`,
      containsPrivateLocation: false,
    });
  });

  it('saves and removes only eligible public identifiers', async () => {
    const savedResponse = await request(httpServer())
      .post(`/api/v1/account/saved-providers/${fixed.publicProviderId}`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .expect(201);
    const saved = savedResponse.body as SavedProviderResponse;

    expect(saved).toMatchObject({
      publicProviderId: fixed.publicProviderId,
      synthetic: true,
    });
    expect(JSON.stringify(saved)).not.toContain(fixed.providerId);

    const listResponse = await request(httpServer())
      .get('/api/v1/account/saved-providers')
      .set('authorization', `Bearer ${customer.accessToken}`)
      .expect(200);
    const list = listResponse.body as SavedProviderResponse[];

    expect(list).toEqual(
      expect.arrayContaining([expect.objectContaining({ publicProviderId: fixed.publicProviderId })]),
    );

    await request(httpServer())
      .delete(`/api/v1/account/saved-providers/${fixed.publicProviderId}`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .expect(200);
  });

  it('dynamically excludes suspended and expired mandatory-claim providers', async () => {
    await pool.query(`UPDATE provider.organizations SET status = 'suspended' WHERE id = $1`, [
      hybrid.providerId,
    ]);
    await pool.query(`SELECT verification.degrade_expired_claims('2026-07-17T00:00:00.000Z')`);

    const response = await request(httpServer())
      .get('/api/v1/public/providers/search')
      .query({ category: 'plumbing', latitude: -15.42, longitude: 28.34, limit: 20 })
      .expect(200);
    const body = response.body as SearchResponse;
    const ids = body.items.map((item) => item.publicProviderId);

    expect(ids).not.toContain(hybrid.publicProviderId);
    expect(ids).not.toContain(stale.publicProviderId);
  });

  it('returns useful no-results recovery without fabricated providers', async () => {
    const response = await request(httpServer())
      .get('/api/v1/public/providers/search')
      .query({ category: 'plumbing', area: 'Area That Does Not Exist', limit: 10 })
      .expect(200);
    const body = response.body as SearchResponse;

    expect(body.items).toEqual([]);
    expect(body.searchContext.noResultsSuggestions.length).toBeGreaterThan(0);
    expect(JSON.stringify(body)).not.toContain('fabricated provider');
  });
});
