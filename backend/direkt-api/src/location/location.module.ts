import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DisabledGeocodingProviderAdapter } from './disabled-geocoding-provider.adapter';
import { GEOCODING_PROVIDER } from './geocoding-provider.port';
import {
  GoogleCloudServiceIdentityAccessTokenProvider,
  GoogleMapsGeocodingProviderAdapter,
} from './google-maps-geocoding-provider.adapter';
import { LocationService } from './location.service';

@Module({
  providers: [
    {
      provide: GEOCODING_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mode = configService.get<string>('GOOGLE_MAPS_BACKEND_MODE') ?? 'disabled';
        if (mode === 'disabled') {
          return new DisabledGeocodingProviderAdapter();
        }
        if (mode !== 'google_maps') {
          throw new Error('Unsupported GOOGLE_MAPS_BACKEND_MODE.');
        }
        const timeoutMs = configService.getOrThrow<number>('GOOGLE_MAPS_REQUEST_TIMEOUT_MS');
        return new GoogleMapsGeocodingProviderAdapter(
          new GoogleCloudServiceIdentityAccessTokenProvider(timeoutMs),
          timeoutMs,
          configService.getOrThrow<string>('GOOGLE_MAPS_GEOCODING_ENDPOINT'),
        );
      },
    },
    LocationService,
  ],
  exports: [LocationService],
})
export class LocationModule {}
