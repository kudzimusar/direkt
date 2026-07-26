export const GEOCODING_PROVIDER = Symbol('DIREKT_GEOCODING_PROVIDER');

export type GeocodingPrecision =
  | 'rooftop'
  | 'range_interpolated'
  | 'geometric_center'
  | 'approximate';

export interface SearchAreaPoint {
  latitude: number;
  longitude: number;
}

export interface NormalizedSearchArea {
  provider: 'google_maps';
  formattedArea: string;
  countryCode: 'ZM';
  point: SearchAreaPoint;
  precision: GeocodingPrecision;
  privateLocationPublished: false;
  persistedByAdapter: false;
}

export interface GeocodingProviderPort {
  normalizeSearchArea(address: string): Promise<NormalizedSearchArea>;
}

export type GeocodingProviderErrorCode =
  | 'disabled'
  | 'invalid_input'
  | 'not_found'
  | 'outside_zambia'
  | 'quota_or_denied'
  | 'timeout'
  | 'provider_unavailable'
  | 'invalid_provider_response';

export class GeocodingProviderError extends Error {
  constructor(
    readonly code: GeocodingProviderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GeocodingProviderError';
  }
}
