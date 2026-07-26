import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GeocodingProviderError } from '../../../src/location/geocoding-provider.port';
import { GoogleMapsGeocodingProviderAdapter } from '../../../src/location/google-maps-geocoding-provider.adapter';

const API_KEY = 'synthetic_maps_server_key_1234567890';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GoogleMapsGeocodingProviderAdapter', () => {
  it('normalizes a bounded Zambian search area without persisting or publishing private location', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'OK',
          results: [
            {
              formatted_address: 'Cairo Road, Lusaka, Zambia',
              address_components: [{ short_name: 'ZM', types: ['country'] }],
              geometry: {
                location: { lat: -15.4167, lng: 28.2833 },
                location_type: 'GEOMETRIC_CENTER',
              },
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const adapter = new GoogleMapsGeocodingProviderAdapter(API_KEY, 1_000);

    const result = await adapter.normalizeSearchArea('  Cairo Road, Lusaka  ');

    expect(result).toEqual({
      provider: 'google_maps',
      formattedArea: 'Cairo Road, Lusaka, Zambia',
      countryCode: 'ZM',
      point: { latitude: -15.4167, longitude: 28.2833 },
      precision: 'geometric_center',
      privateLocationPublished: false,
      persistedByAdapter: false,
    });
    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get('components')).toBe('country:ZM');
    expect(requestedUrl.searchParams.get('key')).toBe(API_KEY);
  });

  it('rejects a provider result outside Zambia even when an upstream response says OK', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 'OK',
            results: [
              {
                formatted_address: 'Outside result',
                address_components: [{ short_name: 'ZW', types: ['country'] }],
                geometry: {
                  location: { lat: -17.8, lng: 31.0 },
                  location_type: 'APPROXIMATE',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );
    const adapter = new GoogleMapsGeocodingProviderAdapter(API_KEY, 1_000);

    await expect(
      adapter.normalizeSearchArea('Outside'),
    ).rejects.toMatchObject<GeocodingProviderError>({
      code: 'outside_zambia',
    });
  });

  it('fails closed on quota denial without exposing the provider payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ status: 'OVER_QUERY_LIMIT', error_message: 'secret detail' }),
          {
            status: 200,
          },
        ),
      ),
    );
    const adapter = new GoogleMapsGeocodingProviderAdapter(API_KEY, 1_000);

    await expect(
      adapter.normalizeSearchArea('Lusaka'),
    ).rejects.toMatchObject<GeocodingProviderError>({
      code: 'quota_or_denied',
    });
  });

  it('rejects unbounded input before calling Google', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const adapter = new GoogleMapsGeocodingProviderAdapter(API_KEY, 1_000);

    await expect(
      adapter.normalizeSearchArea('x'.repeat(241)),
    ).rejects.toMatchObject<GeocodingProviderError>({
      code: 'invalid_input',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
