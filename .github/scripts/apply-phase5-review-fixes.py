from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


def replace_all(text: str, old: str, new: str, expected: int, label: str) -> str:
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f"{label}: expected {expected} matches, found {count}")
    return text.replace(old, new)


repository_path = Path("backend/direkt-api/src/discovery/discovery.repository.ts")
repository = repository_path.read_text()

repository = replace_once(
    repository,
    "      `organizations.status = 'ready_for_verification'`,\n      `discovery.required_claims_current(",
    "      `organizations.status = 'ready_for_verification'`,\n      `category_selections.status = 'selected'`,\n      `discovery.required_claims_current(",
    "search category-selection condition",
)

repository = replace_all(
    repository,
    "       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id\n",
    "       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id\n"
    "       JOIN provider.category_selections AS category_selections\n"
    "         ON category_selections.provider_id = publications.provider_id\n"
    "        AND category_selections.category_id = publications.category_id\n"
    "        AND category_selections.requirement_version_id = publications.requirement_version_id\n",
    5,
    "existing public query organization joins",
)

repository = replace_all(
    repository,
    "          AND organizations.status = 'ready_for_verification'\n          AND discovery.required_claims_current(",
    "          AND organizations.status = 'ready_for_verification'\n"
    "          AND category_selections.status = 'selected'\n"
    "          AND discovery.required_claims_current(",
    3,
    "existing public query eligibility predicates",
)

repository = replace_once(
    repository,
    "       FROM account.saved_public_providers AS saved\n"
    "       JOIN discovery.publications AS publications ON publications.id = saved.publication_id\n"
    "       JOIN catalog.service_categories AS categories ON categories.id = publications.category_id\n"
    "       WHERE saved.identity_id = $1\n"
    "          AND publications.status = 'published'\n"
    "          AND organizations.status = 'ready_for_verification'",
    "       FROM account.saved_public_providers AS saved\n"
    "       JOIN discovery.publications AS publications ON publications.id = saved.publication_id\n"
    "       JOIN provider.organizations AS organizations ON organizations.id = publications.provider_id\n"
    "       JOIN provider.category_selections AS category_selections\n"
    "         ON category_selections.provider_id = publications.provider_id\n"
    "        AND category_selections.category_id = publications.category_id\n"
    "        AND category_selections.requirement_version_id = publications.requirement_version_id\n"
    "       JOIN catalog.service_categories AS categories ON categories.id = publications.category_id\n"
    "       WHERE saved.identity_id = $1\n"
    "          AND publications.status = 'published'\n"
    "          AND organizations.status = 'ready_for_verification'\n"
    "          AND category_selections.status = 'selected'",
    "saved-provider organization and category joins",
)

repository = replace_once(
    repository,
    "       WHERE saved.identity_id = $1\n          AND saved.publication_id = $2`,",
    "       WHERE saved.identity_id = $1\n"
    "          AND saved.publication_id = $2\n"
    "          AND publications.status = 'published'\n"
    "          AND organizations.status = 'ready_for_verification'\n"
    "          AND category_selections.status = 'selected'\n"
    "          AND discovery.required_claims_current(\n"
    "            publications.provider_id,\n"
    "            publications.category_id,\n"
    "            publications.requirement_version_id,\n"
    "            now()\n"
    "          )`,",
    "saved-provider post-insert eligibility",
)

repository_path.write_text(repository)


e2e_path = Path("backend/direkt-api/test/e2e/discovery.e2e-spec.ts")
e2e = e2e_path.read_text()

e2e = replace_once(
    e2e,
    "  let stale: SeededProvider;\n  let incomplete: SeededProvider;\n",
    "  let stale: SeededProvider;\n"
    "  let incomplete: SeededProvider;\n"
    "  const dayInMilliseconds = 24 * 60 * 60 * 1000;\n"
    "  const staleClaimValidUntil = new Date(Date.now() + dayInMilliseconds).toISOString();\n"
    "  const staleDegradationAsOf = new Date(Date.now() + 2 * dayInMilliseconds).toISOString();\n",
    "relative stale fixture clocks",
)

e2e = replace_once(
    e2e,
    "      claimValidUntil: '2026-07-16T00:00:00.000Z',",
    "      claimValidUntil: staleClaimValidUntil,",
    "stale fixture expiry",
)

e2e = replace_once(
    e2e,
    "    await pool.query(`SELECT verification.degrade_expired_claims('2026-07-17T00:00:00.000Z')`);",
    "    await pool.query(`SELECT verification.degrade_expired_claims($1::timestamptz)`, [\n"
    "      staleDegradationAsOf,\n"
    "    ]);",
    "relative degradation as-of",
)

category_regression = r'''

  it('live-excludes removed category selections from public profiles, search and saves', async () => {
    await request(httpServer())
      .post(`/api/v1/account/saved-providers/${fixed.publicProviderId}`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .expect(201);

    await pool.query(
      `UPDATE provider.category_selections
       SET status = 'removed'
       WHERE provider_id = $1
         AND category_id = '00000000-0000-4000-8000-000000003001'`,
      [fixed.providerId],
    );

    const searchResponse = await request(httpServer())
      .get('/api/v1/public/providers/search')
      .query({ category: 'plumbing', area: 'Woodlands', limit: 20 })
      .expect(200);
    const searchBody = searchResponse.body as SearchResponse;
    expect(searchBody.items.map((item) => item.publicProviderId)).not.toContain(
      fixed.publicProviderId,
    );

    await request(httpServer())
      .get(`/api/v1/public/providers/${fixed.publicProviderId}`)
      .expect(404);

    const claimsResponse = await request(httpServer())
      .get(`/api/v1/public/providers/${fixed.publicProviderId}/claims`)
      .expect(200);
    expect(claimsResponse.body).toEqual([]);

    const savedResponse = await request(httpServer())
      .get('/api/v1/account/saved-providers')
      .set('authorization', `Bearer ${customer.accessToken}`)
      .expect(200);
    const saved = savedResponse.body as SavedProviderResponse[];
    expect(saved.map((item) => item.publicProviderId)).not.toContain(fixed.publicProviderId);

    await request(httpServer())
      .post(`/api/v1/account/saved-providers/${fixed.publicProviderId}`)
      .set('authorization', `Bearer ${customer.accessToken}`)
      .expect(404);
  });
'''

e2e = replace_once(
    e2e,
    "\n  it('dynamically excludes suspended and expired mandatory-claim providers', async () => {",
    category_regression
    + "\n  it('dynamically excludes suspended and expired mandatory-claim providers', async () => {",
    "category-removal HTTP regression",
)

e2e_path.write_text(e2e)


service_spec = r'''import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedActor } from '../../src/authorization/authenticated-actor';
import {
  DiscoveryRepository,
  type DiscoverySearchRow,
} from '../../src/discovery/discovery.repository';
import { DiscoveryService } from '../../src/discovery/discovery.service';
import type { PublicClaimCard } from '../../src/discovery/discovery.types';

const actor: AuthenticatedActor = {
  identityId: '00000000-0000-4000-8000-000000000901',
  sessionId: '00000000-0000-4000-8000-000000000902',
};

const claim: PublicClaimCard = {
  claimKey: 'identity_checked',
  statement: 'Representative identity checked',
  limitation: 'This does not guarantee future workmanship.',
  evidenceClass: 'representative_identity',
  checkedAt: '2026-07-15T00:00:00.000Z',
  validUntil: '2027-07-15T00:00:00.000Z',
  policyVersion: 'phase5-v1',
};

function discoveryRow(
  overrides: Partial<DiscoverySearchRow> = {},
): DiscoverySearchRow {
  return {
    public_provider_id: '00000000-0000-4000-8000-000000000801',
    provider_id: '00000000-0000-4000-8000-000000000802',
    category_id: '00000000-0000-4000-8000-000000000803',
    category_key: 'plumbing',
    category_name: 'Plumbing',
    public_display_name: 'Synthetic Plumber',
    operating_model: 'fixed_premises',
    public_locality: 'Woodlands, Lusaka',
    public_latitude: -15.42,
    public_longitude: 28.34,
    service_area_geojson: { type: 'Polygon', coordinates: [] },
    availability_state: 'available',
    next_available_at: new Date('2026-07-20T00:00:00.000Z'),
    low_bandwidth_url: 'https://images.invalid/low.webp',
    standard_url: 'https://images.invalid/standard.webp',
    alt_text: 'Synthetic provider image',
    policy_version: 'phase5-v1',
    distance_km: 4.26,
    area_match: true,
    ...overrides,
  };
}

describe('DiscoveryService', () => {
  const repository = {
    categories: vi.fn(),
    search: vi.fn(),
    searchRow: vi.fn(),
    claims: vi.fn(),
    refreshPublication: vi.fn(),
    hidePublication: vi.fn(),
    eligibility: vi.fn(),
    save: vi.fn(),
    unsave: vi.fn(),
    saved: vi.fn(),
  };
  let service: DiscoveryService;

  beforeEach(() => {
    service = new DiscoveryService(repository as unknown as DiscoveryRepository);
  });

  it('delegates categories and creates explainable cards with an opaque cursor', async () => {
    repository.categories.mockResolvedValue([{ key: 'plumbing', name: 'Plumbing' }]);
    repository.search.mockResolvedValue({ rows: [discoveryRow()], hasMore: true });
    repository.claims.mockResolvedValue([claim]);

    await expect(service.categories()).resolves.toEqual([
      { key: 'plumbing', name: 'Plumbing' },
    ]);
    const response = await service.search({
      category: 'plumbing',
      area: ' Woodlands ',
      latitude: -15.42,
      longitude: 28.34,
      limit: 1,
    });

    expect(response.items[0]).toMatchObject({
      publicPremises: { latitude: -15.42, longitude: 28.34 },
      reasons: [
        'Current mandatory checks',
        'Serves your selected area',
        'Public premises within selected distance',
        'Currently marked available',
      ],
      distanceKm: 4.3,
      synthetic: true,
    });
    expect(response.searchContext).toMatchObject({
      manualArea: 'Woodlands',
      usedOneTimeLocation: true,
      backgroundLocationUsed: false,
      resultCount: 1,
    });
    expect(response.nextCursor).not.toBeNull();

    repository.search.mockResolvedValueOnce({ rows: [], hasMore: false });
    const next = await service.search({ limit: 1, cursor: response.nextCursor ?? undefined });
    expect(repository.search).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: response.nextCursor }),
      1,
    );
    expect(next.nextCursor).toBeNull();
    expect(next.searchContext.noResultsSuggestions).toHaveLength(3);
  });

  it('rejects partial location pairs and unsupported cursors', async () => {
    await expect(service.search({ latitude: -15.42, limit: 20 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.search({ cursor: 'not-a-valid-cursor', limit: 20 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('describes fixed, mobile and hybrid public location boundaries and image fallbacks', async () => {
    repository.claims.mockResolvedValue([claim]);

    repository.searchRow.mockResolvedValueOnce(discoveryRow());
    const fixed = await service.profile('fixed-public-id');
    expect(fixed.locationExplanation).toContain('consented public premises');
    expect(fixed.imagePolicy).toContain('public-approved image variant');

    repository.searchRow.mockResolvedValueOnce(
      discoveryRow({
        operating_model: 'mobile',
        public_latitude: null,
        public_longitude: null,
        distance_km: null,
        area_match: true,
        availability_state: 'limited',
        next_available_at: null,
        low_bandwidth_url: null,
        standard_url: null,
        alt_text: null,
      }),
    );
    const mobile = await service.profile('mobile-public-id');
    expect(mobile.publicPremises).toBeNull();
    expect(mobile.locationExplanation).toContain('private base');
    expect(mobile.imagePolicy).toContain('No public image is required');

    repository.searchRow.mockResolvedValueOnce(
      discoveryRow({ operating_model: 'hybrid', distance_km: null, area_match: false }),
    );
    const hybrid = await service.profile('hybrid-public-id');
    expect(hybrid.locationExplanation).toContain('separate public service area');
  });

  it('delegates claims, publication, eligibility and authenticated save lifecycle', async () => {
    repository.claims.mockResolvedValue([claim]);
    repository.refreshPublication.mockResolvedValue('public-id');
    repository.searchRow.mockResolvedValue(discoveryRow({ public_provider_id: 'public-id' }));
    repository.hidePublication.mockResolvedValue(undefined);
    repository.eligibility.mockResolvedValue([{ providerId: 'provider-id', eligible: true }]);
    repository.save.mockResolvedValue({ publicProviderId: 'public-id' });
    repository.unsave.mockResolvedValue(undefined);
    repository.saved.mockResolvedValue([{ publicProviderId: 'public-id' }]);

    await expect(service.claims('public-id')).resolves.toEqual([claim]);
    await expect(
      service.refreshPublication('provider-id', 'plumbing', 'phase5-v1'),
    ).resolves.toMatchObject({ publicProviderId: 'public-id' });
    await expect(service.hidePublication('public-id', 'Policy hold')).resolves.toEqual({
      hidden: true,
    });
    await expect(service.eligibility()).resolves.toEqual([
      { providerId: 'provider-id', eligible: true },
    ]);
    await expect(service.save(actor, 'public-id')).resolves.toEqual({
      publicProviderId: 'public-id',
    });
    await expect(service.unsave(actor, 'public-id')).resolves.toEqual({ removed: true });
    await expect(service.saved(actor)).resolves.toEqual([{ publicProviderId: 'public-id' }]);

    expect(repository.save).toHaveBeenCalledWith(actor.identityId, 'public-id');
    expect(repository.unsave).toHaveBeenCalledWith(actor.identityId, 'public-id');
    expect(repository.saved).toHaveBeenCalledWith(actor.identityId);
  });

  it('builds share-safe metadata from the eligible public profile', async () => {
    repository.searchRow.mockResolvedValue(discoveryRow());
    repository.claims.mockResolvedValue([claim]);

    await expect(service.share('public-id')).resolves.toMatchObject({
      publicProviderId: 'public-id',
      title: 'Synthetic Plumber on DIREKT',
      path: '/providers/00000000-0000-4000-8000-000000000801',
      containsPrivateLocation: false,
    });
  });
});
'''

repository_spec = r'''import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscoveryRepository } from '../../src/discovery/discovery.repository';
import type { DatabaseService } from '../../src/platform/database/database.service';

function searchRow(overrides: Record<string, unknown> = {}) {
  return {
    public_provider_id: '00000000-0000-4000-8000-000000000801',
    provider_id: '00000000-0000-4000-8000-000000000802',
    category_id: '00000000-0000-4000-8000-000000000803',
    category_key: 'plumbing',
    category_name: 'Plumbing',
    public_display_name: 'Synthetic Plumber',
    operating_model: 'fixed_premises',
    public_locality: 'Woodlands, Lusaka',
    public_latitude: -15.42,
    public_longitude: 28.34,
    service_area_geojson: { type: 'Polygon', coordinates: [] },
    availability_state: 'available',
    next_available_at: new Date('2026-07-20T00:00:00.000Z'),
    low_bandwidth_url: null,
    standard_url: null,
    alt_text: null,
    policy_version: 'phase5-v1',
    distance_km: 2.5,
    area_match: true,
    ...overrides,
  };
}

describe('DiscoveryRepository', () => {
  const query = vi.fn();
  let repository: DiscoveryRepository;

  beforeEach(() => {
    repository = new DiscoveryRepository({ query } as unknown as DatabaseService);
  });

  it('maps active categories', async () => {
    query.mockResolvedValue({
      rows: [{ category_key: 'plumbing', name: 'Plumbing', description: 'Water services' }],
    });

    await expect(repository.categories()).resolves.toEqual([
      { key: 'plumbing', name: 'Plumbing', description: 'Water services' },
    ]);
  });

  it('builds filtered location search with current category-selection and claim gates', async () => {
    query.mockResolvedValue({ rows: [searchRow(), searchRow({ public_provider_id: 'second' })] });

    const result = await repository.search(
      {
        q: 'Plumber',
        category: 'plumbing',
        area: 'Woodlands',
        operatingModel: 'hybrid',
        availability: 'available',
        claim: 'identity_checked',
        latitude: -15.42,
        longitude: 28.34,
        radiusKm: 15,
        limit: 1,
      },
      4,
    );

    expect(result.rows).toHaveLength(1);
    expect(result.hasMore).toBe(true);
    const sql = String(query.mock.calls[0]?.[0]);
    const values = query.mock.calls[0]?.[1] as unknown[];
    expect(sql).toContain('JOIN provider.category_selections AS category_selections');
    expect(sql).toContain("category_selections.status = 'selected'");
    expect(sql).toContain('ST_DWithin');
    expect(sql).toContain('claims.claim_key');
    expect(values).toEqual(
      expect.arrayContaining(['plumbing', '%Plumber%', '%Woodlands%', 'hybrid', 'available']),
    );
  });

  it('supports bounded no-location search', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repository.search({ limit: 20 }, 0)).resolves.toEqual({
      rows: [],
      hasMore: false,
    });
    const sql = String(query.mock.calls[0]?.[0]);
    expect(sql).toContain('NULL::geography');
    expect(sql).toContain('false AS area_match');
  });

  it('returns only selected eligible public rows and rejects missing profiles', async () => {
    query.mockResolvedValueOnce({ rows: [searchRow()] });
    await expect(repository.searchRow('public-id')).resolves.toMatchObject({
      public_provider_id: '00000000-0000-4000-8000-000000000801',
    });
    expect(String(query.mock.calls[0]?.[0])).toContain("category_selections.status = 'selected'");

    query.mockResolvedValueOnce({ rows: [] });
    await expect(repository.searchRow('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps scoped current claims through the selected category gate', async () => {
    query.mockResolvedValue({
      rows: [
        {
          claim_key: 'identity_checked',
          claim_statement: 'Identity checked',
          limitation: 'Scoped only',
          evidence_class: 'representative_identity',
          checked_at: new Date('2026-07-15T00:00:00.000Z'),
          valid_until: new Date('2027-07-15T00:00:00.000Z'),
          policy_version: 'phase5-v1',
        },
      ],
    });

    await expect(repository.claims('public-id')).resolves.toEqual([
      {
        claimKey: 'identity_checked',
        statement: 'Identity checked',
        limitation: 'Scoped only',
        evidenceClass: 'representative_identity',
        checkedAt: '2026-07-15T00:00:00.000Z',
        validUntil: '2027-07-15T00:00:00.000Z',
        policyVersion: 'phase5-v1',
      },
    ]);
    expect(String(query.mock.calls[0]?.[0])).toContain("category_selections.status = 'selected'");
  });

  it('refreshes and hides publications through policy functions', async () => {
    query.mockResolvedValueOnce({ rows: [{ publication_id: 'public-id' }] });
    await expect(
      repository.refreshPublication('provider-id', 'plumbing', 'phase5-v1'),
    ).resolves.toBe('public-id');

    query.mockResolvedValueOnce({ rows: [] });
    await expect(
      repository.refreshPublication('provider-id', 'plumbing', 'phase5-v1'),
    ).rejects.toThrow('Publication policy returned no public provider identifier.');

    query.mockResolvedValueOnce({ rows: [] });
    await expect(repository.hidePublication('public-id', 'Policy hold')).resolves.toBeUndefined();
  });

  it('maps publication eligibility without exposing private coordinates', async () => {
    query.mockResolvedValue({
      rows: [
        {
          provider_id: 'mobile-provider',
          category_key: 'plumbing',
          display_name: 'Mobile Provider',
          operating_model: 'mobile',
          provider_status: 'ready_for_verification',
          category_status: 'selected',
          public_locality: 'Lusaka',
          has_public_premises: false,
          has_service_area: true,
          mandatory_claims_current: true,
          public_provider_id: 'mobile-public',
          publication_status: 'published',
          refreshed_at: new Date('2026-07-15T00:00:00.000Z'),
        },
        {
          provider_id: 'fixed-provider',
          category_key: 'plumbing',
          display_name: 'Fixed Provider',
          operating_model: 'fixed_premises',
          provider_status: 'draft',
          category_status: 'removed',
          public_locality: null,
          has_public_premises: false,
          has_service_area: true,
          mandatory_claims_current: false,
          public_provider_id: null,
          publication_status: null,
          refreshed_at: null,
        },
      ],
    });

    const result = await repository.eligibility();
    expect(result[0]).toMatchObject({ eligible: true, refreshedAt: '2026-07-15T00:00:00.000Z' });
    expect(result[1]).toMatchObject({ eligible: false, refreshedAt: null });
  });

  it('rejects ineligible saves and returns a safe eligible saved view', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(repository.save('identity-id', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    query
      .mockResolvedValueOnce({ rows: [{ id: 'public-id' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            public_provider_id: 'public-id',
            public_display_name: 'Synthetic Plumber',
            category_name: 'Plumbing',
            public_locality: 'Woodlands',
            saved_at: new Date('2026-07-15T00:00:00.000Z'),
          },
        ],
      });

    await expect(repository.save('identity-id', 'public-id')).resolves.toEqual({
      publicProviderId: 'public-id',
      displayName: 'Synthetic Plumber',
      categoryName: 'Plumbing',
      locality: 'Woodlands',
      savedAt: '2026-07-15T00:00:00.000Z',
      sharePath: '/providers/public-id',
      synthetic: true,
    });
    expect(String(query.mock.calls[1]?.[0])).toContain(
      'INSERT INTO account.saved_public_providers',
    );
    expect(String(query.mock.calls[2]?.[0])).toContain("category_selections.status = 'selected'");
  });

  it('rejects a save whose publication becomes ineligible before the response read', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'public-id' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(repository.save('identity-id', 'public-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists only eligible saved providers and removes saves', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(repository.unsave('identity-id', 'public-id')).resolves.toBeUndefined();

    query.mockResolvedValueOnce({
      rows: [
        {
          public_provider_id: 'public-id',
          public_display_name: 'Synthetic Plumber',
          category_name: 'Plumbing',
          public_locality: 'Woodlands',
          saved_at: new Date('2026-07-15T00:00:00.000Z'),
        },
      ],
    });
    await expect(repository.saved('identity-id')).resolves.toEqual([
      expect.objectContaining({ publicProviderId: 'public-id', synthetic: true }),
    ]);
    const sql = String(query.mock.calls[1]?.[0]);
    expect(sql).toContain('JOIN provider.organizations AS organizations');
    expect(sql).toContain('JOIN provider.category_selections AS category_selections');
    expect(sql).toContain("category_selections.status = 'selected'");
  });
});
'''

Path("backend/direkt-api/test/unit/discovery.service.spec.ts").write_text(service_spec)
Path("backend/direkt-api/test/unit/discovery.repository.spec.ts").write_text(repository_spec)
