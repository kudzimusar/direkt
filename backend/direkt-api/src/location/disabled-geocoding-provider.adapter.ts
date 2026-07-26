import {
  GeocodingProviderError,
  type GeocodingProviderPort,
  type NormalizedSearchArea,
} from './geocoding-provider.port';

export class DisabledGeocodingProviderAdapter implements GeocodingProviderPort {
  normalizeSearchArea(): Promise<NormalizedSearchArea> {
    return Promise.reject(
      new GeocodingProviderError(
        'disabled',
        'Map-backed search-area normalization is disabled; use manual area search.',
      ),
    );
  }
}
