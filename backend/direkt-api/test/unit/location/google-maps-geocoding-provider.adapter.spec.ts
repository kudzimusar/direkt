import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  GOOGLE_MAPS_GEOCODING_OAUTH_SCOPE,
  GoogleCloudServiceIdentityAccessTokenProvider,
  GoogleMapsGeocodingProviderAdapter,
  type GoogleMapsAccessTokenProvider,
} from '../../../src/location/google-maps-geocoding-provider.adapter';

const ACCESS_TOKEN = 'synthetic_oauth_access_token_1234567890';

function tokenProvider(): GoogleMapsAccessTokenProvider {
  return { getAccessToken: vi.fn().mockResolvedValue(ACCESS_TOKEN) };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GoogleCloudServiceIdentityAccessTokenProvider', () => {
  it('requests and caches a narrowly scoped token from the Google metadata service', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ access_token: ACCESS_TOKEN, expires_in: 3599, token_type: 'Bearer' }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );
    const provider = new GoogleCloudServiceIdentityAccessTokenProvider(1_000, undefined, fetchMock);

    await expect(provider.getAccessToken()).resolves.toBe(ACCESS_TOKEN);
    await expect(provider.getAccessToken()).resolves.toBe(ACCESS_TOKEN);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.hostname).toBe('metadata.google.internal');
    expect(requestedUrl.searchParams.get('enforce_scopes')).toBe('true');
    expect(requestedUrl.searchParams.get('scopes')).toBe(GOOGLE_MAPS_GEOCODING_OAUTH_SCOPE);
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Metadata-Flavor')).toBe('Google');
  });

  it('fails closed when the metadata endpoint is not the Google metadata host', async () => {
    const provider = new GoogleCloudServiceIdentityAccessTokenProvider(
      1_000,
      'http://example.test/token',
      vi.fn(),
    );

    await expect(provider.getAccessToken()).rejects.toMatchObject({ code: 'request_denied' });
  });
});

describe('GoogleMapsGeocodingProviderAdapter', () => {
  it('normalizes a bounded Zambian search area through Geocoding v4 OAuth', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              formattedAddress: 'Cairo Road, Lusaka, Zambia',
              postalAddress: { regionCode: 'ZM' },
              location: { latitude: -15.4167, longitude: 28.2833 },
              granularity: 'GEOMETRIC_CENTER',
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const tokens = tokenProvider();
    const adapter = new GoogleMapsGeocodingProviderAdapter(tokens, 1_000, undefined, fetchMock);

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
    expect(requestedUrl.origin).toBe('https://geocode.googleapis.com');
    expect(requestedUrl.pathname).toContain('/v4/geocode/address/Cairo+Road%2C+Lusaka');
    expect(requestedUrl.searchParams.get('regionCode')).toBe('ZM');
    expect(requestedUrl.searchParams.get('key')).toBeNull();
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${ACCESS_TOKEN}`);
    expect(headers.get('X-Goog-FieldMask')).toBe(
      'results.location,results.granularity,results.formattedAddress,results.postalAddress.regionCode',
    );
  });

  it('rejects a provider result outside Zambia', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              formattedAddress: 'Outside result',
              postalAddress: { regionCode: 'ZW' },
              location: { latitude: -17.8, longitude: 31.0 },
              granularity: 'APPROXIMATE',
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const adapter = new GoogleMapsGeocodingProviderAdapter(
      tokenProvider(),
      1_000,
      undefined,
      fetchMock,
    );

    await expect(adapter.normalizeSearchArea('Outside')).rejects.toMatchObject({
      code: 'outside_zambia',
    });
  });

  it('distinguishes a bounded quota rejection without reading the provider payload', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'secret quota detail' } }), {
          status: 429,
        }),
      );
    const adapter = new GoogleMapsGeocodingProviderAdapter(
      tokenProvider(),
      1_000,
      undefined,
      fetchMock,
    );

    const result = adapter.normalizeSearchArea('Lusaka');
    await expect(result).rejects.toMatchObject({
      code: 'quota_exceeded',
      message: 'Google Maps Geocoding exceeded the bounded quota.',
    });
    await expect(result).rejects.not.toThrow('secret quota detail');
  });

  it('distinguishes a bounded OAuth authorization denial without exposing the payload', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'secret denial detail' } }), {
          status: 403,
        }),
      );
    const adapter = new GoogleMapsGeocodingProviderAdapter(
      tokenProvider(),
      1_000,
      undefined,
      fetchMock,
    );

    const result = adapter.normalizeSearchArea('Lusaka');
    await expect(result).rejects.toMatchObject({
      code: 'request_denied',
      message: 'Google Maps Geocoding denied the bounded OAuth request.',
    });
    await expect(result).rejects.not.toThrow('secret denial detail');
  });

  it('treats an empty successful response as not found', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ results: [] }), { status: 200 }));
    const adapter = new GoogleMapsGeocodingProviderAdapter(
      tokenProvider(),
      1_000,
      undefined,
      fetchMock,
    );

    await expect(adapter.normalizeSearchArea('Unknown area')).rejects.toMatchObject({
      code: 'not_found',
    });
  });

  it('rejects unbounded input before requesting a token or calling Google', async () => {
    const fetchMock = vi.fn();
    const tokens = tokenProvider();
    const adapter = new GoogleMapsGeocodingProviderAdapter(tokens, 1_000, undefined, fetchMock);

    await expect(adapter.normalizeSearchArea('x'.repeat(241))).rejects.toMatchObject({
      code: 'invalid_input',
    });
    expect(tokens.getAccessToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
