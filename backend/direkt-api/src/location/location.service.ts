import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  GEOCODING_PROVIDER,
  GeocodingProviderError,
  type GeocodingProviderPort,
  type NormalizedSearchArea,
} from './geocoding-provider.port';

@Injectable()
export class LocationService {
  constructor(
    @Inject(GEOCODING_PROVIDER)
    private readonly geocodingProvider: GeocodingProviderPort,
  ) {}

  async normalizeSearchArea(address: string): Promise<NormalizedSearchArea> {
    try {
      return await this.geocodingProvider.normalizeSearchArea(address);
    } catch (error) {
      if (error instanceof GeocodingProviderError) {
        switch (error.code) {
          case 'invalid_input':
          case 'not_found':
          case 'outside_zambia':
            throw new BadRequestException({
              code: 'search_area_not_normalized',
              message: 'Enter a Zambian area or landmark and use manual area search if needed.',
              manualFallbackAvailable: true,
              privateLocationPublished: false,
            });
          case 'disabled':
          case 'quota_or_denied':
          case 'timeout':
          case 'provider_unavailable':
          case 'invalid_provider_response':
            throw new ServiceUnavailableException({
              code: 'map_normalization_unavailable',
              message:
                'Map-backed area normalization is unavailable. Manual area search remains available.',
              manualFallbackAvailable: true,
              privateLocationPublished: false,
            });
        }
      }

      throw new ServiceUnavailableException({
        code: 'map_normalization_unavailable',
        message:
          'Map-backed area normalization is unavailable. Manual area search remains available.',
        manualFallbackAvailable: true,
        privateLocationPublished: false,
      });
    }
  }
}
