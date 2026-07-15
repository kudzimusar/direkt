import { NotFoundException } from '@nestjs/common';
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

  it('builds filtered location search with category, claim and distance gates', async () => {
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
    expect(sql).toContain('JOIN provider.organizations AS organizations');
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
    expect(sql).toContain('NULL::double precision AS distance_km');
    expect(sql).toContain('false AS area_match');
  });

  it('returns eligible public rows and rejects missing profiles', async () => {
    query.mockResolvedValueOnce({ rows: [searchRow()] });
    await expect(repository.searchRow('public-id')).resolves.toMatchObject({
      public_provider_id: '00000000-0000-4000-8000-000000000801',
    });

    query.mockResolvedValueOnce({ rows: [] });
    await expect(repository.searchRow('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps scoped current claims', async () => {
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

  it('rejects ineligible saves and returns a safe saved view', async () => {
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
    expect(String(query.mock.calls[2]?.[0])).toContain(
      'INSERT INTO account.saved_public_providers',
    );
  });

  it('rejects a save whose publication becomes ineligible before response read', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'public-id' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(repository.save('identity-id', 'public-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists and removes saved providers', async () => {
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
  });
});
