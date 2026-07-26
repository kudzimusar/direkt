import { describe, expect, it } from 'vitest';
import { type DirektEnvironment, environmentSchema } from '../../../src/config/environment';

const MAPS_CONFIG = {
  GOOGLE_MAPS_BACKEND_MODE: 'google_maps',
  GOOGLE_MAPS_SERVER_API_KEY: 'synthetic_maps_server_key_1234567890',
  GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED: 'true',
};

describe('RC7 Google Maps environment boundary', () => {
  it('accepts only an explicitly approved synthetic backend configuration in non-production', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'development',
      DIREKT_DATA_MODE: 'synthetic-only',
      ...MAPS_CONFIG,
    });
    const value = result.value as DirektEnvironment;

    expect(result.error).toBeUndefined();
    expect(value.GOOGLE_MAPS_BACKEND_MODE).toBe('google_maps');
    expect(value.GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED).toBe(true);
  });

  it('rejects Maps activation without the explicit synthetic canary latch', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'development',
      DIREKT_DATA_MODE: 'synthetic-only',
      ...MAPS_CONFIG,
      GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED: 'false',
    });

    expect(result.error?.message).toContain('explicit synthetic Maps approval latch');
  });

  it('rejects the Maps backend in production', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'production',
      DIREKT_DATA_MODE: 'production',
      DIREKT_TRAFFIC_MODE: 'disabled',
      DATABASE_URL: 'postgresql://direkt:direkt_dev@localhost:5432/direkt',
      ACCESS_TOKEN_SECRET: 'a'.repeat(64),
      CONTACT_HASH_PEPPER: 'b'.repeat(64),
      CHALLENGE_HASH_PEPPER: 'c'.repeat(64),
      RATE_LIMIT_HASH_PEPPER: 'd'.repeat(64),
      EVIDENCE_STORAGE_PROVIDER: 'supabase',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SECRET_KEY: 'e'.repeat(32),
      PAYMENT_PROVIDER_MODE: 'disabled',
      ...MAPS_CONFIG,
    });

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('GOOGLE_MAPS_BACKEND_MODE');
  });
});
