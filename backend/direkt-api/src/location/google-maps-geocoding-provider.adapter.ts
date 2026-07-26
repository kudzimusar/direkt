import {
  GeocodingProviderError,
  type GeocodingPrecision,
  type GeocodingProviderPort,
  type NormalizedSearchArea,
} from './geocoding-provider.port';

interface GoogleGeocodingResult {
  formattedAddress?: string;
  postalAddress?: {
    regionCode?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
  };
  granularity?: string;
}

interface GoogleGeocodingResponse {
  results?: GoogleGeocodingResult[];
}

interface MetadataAccessTokenResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface GoogleMapsAccessTokenProvider {
  getAccessToken(): Promise<string>;
}

export const GOOGLE_MAPS_GEOCODING_OAUTH_SCOPE =
  'https://www.googleapis.com/auth/maps-platform.geocode.address';

const DEFAULT_METADATA_TOKEN_ENDPOINT =
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';
const DEFAULT_GEOCODING_ENDPOINT = 'https://geocode.googleapis.com/v4/geocode/address';
const FIELD_MASK =
  'results.location,results.granularity,results.formattedAddress,results.postalAddress.regionCode';

const ZAMBIA_BOUNDS = {
  minLatitude: -18.2,
  maxLatitude: -8.1,
  minLongitude: 21.8,
  maxLongitude: 33.9,
} as const;

const PRECISION: Record<string, GeocodingPrecision> = {
  ROOFTOP: 'rooftop',
  RANGE_INTERPOLATED: 'range_interpolated',
  GEOMETRIC_CENTER: 'geometric_center',
  APPROXIMATE: 'approximate',
};

export class GoogleCloudServiceIdentityAccessTokenProvider
  implements GoogleMapsAccessTokenProvider
{
  private cachedToken?: { value: string; expiresAtMs: number };

  constructor(
    private readonly timeoutMs: number,
    private readonly endpoint = DEFAULT_METADATA_TOKEN_ENDPOINT,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAtMs - now > 60_000) {
      return this.cachedToken.value;
    }

    const url = new URL(this.endpoint);
    if (url.protocol !== 'http:' || url.hostname !== 'metadata.google.internal') {
      throw new GeocodingProviderError(
        'request_denied',
        'Google Maps service identity metadata endpoint is invalid.',
      );
    }
    url.searchParams.set('enforce_scopes', 'true');
    url.searchParams.set('scopes', GOOGLE_MAPS_GEOCODING_OAUTH_SCOPE);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: { 'Metadata-Flavor': 'Google', Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GeocodingProviderError(
          'timeout',
          'Google Maps service identity token request timed out.',
        );
      }
      throw new GeocodingProviderError(
        'provider_unavailable',
        'Google Maps service identity token is unavailable.',
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new GeocodingProviderError(
        'request_denied',
        'Google Maps service identity could not obtain a scoped access token.',
      );
    }

    let payload: MetadataAccessTokenResponse;
    try {
      payload = (await response.json()) as MetadataAccessTokenResponse;
    } catch {
      throw new GeocodingProviderError(
        'invalid_provider_response',
        'Google Maps service identity returned an invalid token response.',
      );
    }

    const token = payload.access_token?.trim();
    const expiresIn = payload.expires_in;
    if (
      !token ||
      token.length < 20 ||
      payload.token_type !== 'Bearer' ||
      typeof expiresIn !== 'number' ||
      !Number.isFinite(expiresIn) ||
      expiresIn < 120
    ) {
      throw new GeocodingProviderError(
        'invalid_provider_response',
        'Google Maps service identity omitted required token fields.',
      );
    }

    this.cachedToken = {
      value: token,
      expiresAtMs: now + expiresIn * 1_000,
    };
    return token;
  }
}

export class GoogleMapsGeocodingProviderAdapter implements GeocodingProviderPort {
  constructor(
    private readonly accessTokenProvider: GoogleMapsAccessTokenProvider,
    private readonly timeoutMs: number,
    private readonly endpoint = DEFAULT_GEOCODING_ENDPOINT,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async normalizeSearchArea(address: string): Promise<NormalizedSearchArea> {
    const normalizedInput = address.trim().replace(/\s+/g, ' ');
    if (normalizedInput.length < 3 || normalizedInput.length > 240) {
      throw new GeocodingProviderError('invalid_input', 'Search area must be 3 to 240 characters.');
    }

    const baseEndpoint = this.endpoint.replace(/\/+$/, '');
    const encodedAddress = encodeURIComponent(normalizedInput).replace(/%20/g, '+');
    const url = new URL(`${baseEndpoint}/${encodedAddress}`);
    url.searchParams.set('regionCode', 'ZM');
    url.searchParams.set('languageCode', 'en');

    const accessToken = await this.accessTokenProvider.getAccessToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GeocodingProviderError('timeout', 'Google Maps Geocoding timed out.');
      }
      throw new GeocodingProviderError(
        'provider_unavailable',
        'Google Maps Geocoding is unavailable.',
      );
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401 || response.status === 403) {
      throw new GeocodingProviderError(
        'request_denied',
        'Google Maps Geocoding denied the bounded OAuth request.',
      );
    }
    if (response.status === 429) {
      throw new GeocodingProviderError(
        'quota_exceeded',
        'Google Maps Geocoding exceeded the bounded quota.',
      );
    }
    if (response.status === 404) {
      throw new GeocodingProviderError('not_found', 'No matching Zambian search area was found.');
    }
    if (!response.ok) {
      throw new GeocodingProviderError(
        'provider_unavailable',
        'Google Maps Geocoding returned an unavailable response.',
      );
    }

    let payload: GoogleGeocodingResponse;
    try {
      payload = (await response.json()) as GoogleGeocodingResponse;
    } catch {
      throw new GeocodingProviderError(
        'invalid_provider_response',
        'Google Maps Geocoding returned an invalid response.',
      );
    }

    const result = payload.results?.[0];
    if (!result) {
      throw new GeocodingProviderError('not_found', 'No matching Zambian search area was found.');
    }

    const latitude = result.location?.latitude;
    const longitude = result.location?.longitude;
    const formattedArea = result.formattedAddress?.trim();
    const countryCode = result.postalAddress?.regionCode?.toUpperCase();
    const precision = PRECISION[result.granularity ?? ''];

    if (
      typeof latitude !== 'number' ||
      !Number.isFinite(latitude) ||
      typeof longitude !== 'number' ||
      !Number.isFinite(longitude) ||
      !formattedArea ||
      formattedArea.length > 240 ||
      !precision
    ) {
      throw new GeocodingProviderError(
        'invalid_provider_response',
        'Google Maps Geocoding omitted required bounded fields.',
      );
    }

    const insideZambia =
      countryCode === 'ZM' &&
      latitude >= ZAMBIA_BOUNDS.minLatitude &&
      latitude <= ZAMBIA_BOUNDS.maxLatitude &&
      longitude >= ZAMBIA_BOUNDS.minLongitude &&
      longitude <= ZAMBIA_BOUNDS.maxLongitude;
    if (!insideZambia) {
      throw new GeocodingProviderError(
        'outside_zambia',
        'The normalized search area is outside Zambia.',
      );
    }

    return {
      provider: 'google_maps',
      formattedArea,
      countryCode: 'ZM',
      point: {
        latitude: Number(latitude.toFixed(5)),
        longitude: Number(longitude.toFixed(5)),
      },
      precision,
      privateLocationPublished: false,
      persistedByAdapter: false,
    };
  }
}
