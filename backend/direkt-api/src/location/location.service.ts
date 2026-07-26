import { Inject, Injectable } from '@nestjs/common';
import {
  GEOCODING_PROVIDER,
  type GeocodingProviderPort,
  type NormalizedSearchArea,
} from './geocoding-provider.port';

@Injectable()
export class LocationService {
  constructor(
    @Inject(GEOCODING_PROVIDER)
    private readonly geocodingProvider: GeocodingProviderPort,
  ) {}

  normalizeSearchArea(address: string): Promise<NormalizedSearchArea> {
    return this.geocodingProvider.normalizeSearchArea(address);
  }
}
