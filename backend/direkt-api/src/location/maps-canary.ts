import { environmentSchema } from '../config/environment';
import { GoogleMapsGeocodingProviderAdapter } from './google-maps-geocoding-provider.adapter';

async function main(): Promise<void> {
  const result = environmentSchema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false,
  });
  if (result.error) {
    throw new Error(`RC7 Maps canary configuration is invalid: ${result.error.message}`);
  }

  const environment = result.value;
  if (
    environment.GOOGLE_MAPS_BACKEND_MODE !== 'google_maps' ||
    environment.GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED !== true ||
    environment.DIREKT_DATA_MODE !== 'synthetic-only' ||
    environment.NODE_ENV === 'production'
  ) {
    throw new Error('RC7 Maps canary requires an approved synthetic-only non-production configuration.');
  }

  const adapter = new GoogleMapsGeocodingProviderAdapter(
    environment.GOOGLE_MAPS_SERVER_API_KEY,
    environment.GOOGLE_MAPS_REQUEST_TIMEOUT_MS,
    environment.GOOGLE_MAPS_GEOCODING_ENDPOINT,
  );
  const normalized = await adapter.normalizeSearchArea('Cairo Road, Lusaka, Zambia');
  if (
    normalized.countryCode !== 'ZM' ||
    normalized.privateLocationPublished ||
    normalized.persistedByAdapter
  ) {
    throw new Error('RC7 Maps canary violated the bounded location contract.');
  }

  console.log('RC7_MAPS_CANARY|PASS');
  console.log(
    JSON.stringify({
      provider: normalized.provider,
      countryCode: normalized.countryCode,
      precision: normalized.precision,
      coordinateValuesLogged: false,
      formattedAddressLogged: false,
      privateLocationPublished: false,
      persistedByAdapter: false,
      productionAuthorization: false,
    }),
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown RC7 Maps canary failure.';
  console.error(`RC7_MAPS_CANARY|FAIL|${message}`);
  process.exitCode = 1;
});
