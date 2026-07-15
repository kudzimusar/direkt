import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedActor } from '../../src/authorization/authenticated-actor';
import type {
  DiscoveryRepository,
  DiscoverySearchRow,
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

function discoveryRow(overrides: Partial<DiscoverySearchRow> = {}): DiscoverySearchRow {
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

    await expect(service.categories()).resolves.toEqual([{ key: 'plumbing', name: 'Plumbing' }]);
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
    await expect(
      service.search({ cursor: 'not-a-valid-cursor', limit: 20 }),
    ).rejects.toBeInstanceOf(BadRequestException);
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
