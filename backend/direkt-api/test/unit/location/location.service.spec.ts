import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  GeocodingProviderError,
  type GeocodingProviderPort,
  type NormalizedSearchArea,
} from '../../../src/location/geocoding-provider.port';
import { LocationService } from '../../../src/location/location.service';

const NORMALIZED_AREA: NormalizedSearchArea = {
  provider: 'google_maps',
  formattedArea: 'Cairo Road, Lusaka, Zambia',
  countryCode: 'ZM',
  point: { latitude: -15.4167, longitude: 28.2833 },
  precision: 'geometric_center',
  privateLocationPublished: false,
  persistedByAdapter: false,
};

describe('LocationService', () => {
  it('returns the bounded provider result through the application service', async () => {
    const normalizeSearchArea = vi.fn().mockResolvedValue(NORMALIZED_AREA);
    const service = new LocationService({ normalizeSearchArea } as GeocodingProviderPort);

    await expect(service.normalizeSearchArea('Cairo Road, Lusaka')).resolves.toEqual(
      NORMALIZED_AREA,
    );
    expect(normalizeSearchArea).toHaveBeenCalledWith('Cairo Road, Lusaka');
  });

  it('maps invalid or outside-Zambia input to a sanitized manual-fallback response', async () => {
    const normalizeSearchArea = vi
      .fn()
      .mockRejectedValue(new GeocodingProviderError('outside_zambia', 'provider detail'));
    const service = new LocationService({ normalizeSearchArea } as GeocodingProviderPort);

    const error = await service.normalizeSearchArea('Outside').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).getResponse()).toMatchObject({
      code: 'search_area_not_normalized',
      manualFallbackAvailable: true,
      privateLocationPublished: false,
    });
    expect(JSON.stringify((error as BadRequestException).getResponse())).not.toContain(
      'provider detail',
    );
  });

  it('maps disabled, quota and provider failures to a sanitized unavailable response', async () => {
    const normalizeSearchArea = vi
      .fn()
      .mockRejectedValue(new GeocodingProviderError('quota_or_denied', 'secret upstream detail'));
    const service = new LocationService({ normalizeSearchArea } as GeocodingProviderPort);

    const error = await service.normalizeSearchArea('Lusaka').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getResponse()).toMatchObject({
      code: 'map_normalization_unavailable',
      manualFallbackAvailable: true,
      privateLocationPublished: false,
    });
    expect(JSON.stringify((error as ServiceUnavailableException).getResponse())).not.toContain(
      'secret upstream detail',
    );
  });
});
