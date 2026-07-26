import {
  GeocodingProviderError,
  type GeocodingPrecision,
  type GeocodingProviderPort,
  type NormalizedSearchArea,
} from './geocoding-provider.port';

interface GoogleAddressComponent {
  short_name?: string;
  types?: string[];
}

interface GoogleGeocodingResult {
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
  geometry?: {
    location?: { lat?: number; lng?: number };
    location_type?: string;
  };
}

interface GoogleGeocodingResponse {
  status?: string;
  results?: GoogleGeocodingResult[];
}

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

export class GoogleMapsGeocodingProviderAdapter implements GeocodingProviderPort {
  constructor(
    private readonly apiKey: string,
    private readonly timeoutMs: number,
    private readonly endpoint = 'https://maps.googleapis.com/maps/api/geocode/json',
  ) {}

  async normalizeSearchArea(address: string): Promise<NormalizedSearchArea> {
    const normalizedInput = address.trim().replace(/\s+/g, ' ');
    if (normalizedInput.length < 3 || normalizedInput.length > 240) {
      throw new GeocodingProviderError('invalid_input', 'Search area must be 3 to 240 characters.');
    }

    const url = new URL(this.endpoint);
    url.searchParams.set('address', normalizedInput);
    url.searchParams.set('components', 'country:ZM');
    url.searchParams.set('key', this.apiKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
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

    if (payload.status === 'ZERO_RESULTS') {
      throw new GeocodingProviderError('not_found', 'No matching Zambian search area was found.');
    }
    if (payload.status === 'OVER_QUERY_LIMIT') {
      throw new GeocodingProviderError(
        'quota_exceeded',
        'Google Maps Geocoding exceeded the bounded quota.',
      );
    }
    if (payload.status === 'REQUEST_DENIED') {
      throw new GeocodingProviderError(
        'request_denied',
        'Google Maps Geocoding denied the bounded request.',
      );
    }
    if (payload.status !== 'OK') {
      throw new GeocodingProviderError(
        'provider_unavailable',
        'Google Maps Geocoding could not normalize the search area.',
      );
    }

    const result = payload.results?.[0];
    const latitude = result?.geometry?.location?.lat;
    const longitude = result?.geometry?.location?.lng;
    const formattedArea = result?.formatted_address?.trim();
    const countryCode = result?.address_components
      ?.find((component) => component.types?.includes('country'))
      ?.short_name?.toUpperCase();
    const precision = PRECISION[result?.geometry?.location_type ?? ''];

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
