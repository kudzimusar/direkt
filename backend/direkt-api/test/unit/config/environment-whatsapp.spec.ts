import { describe, expect, it } from 'vitest';
import { environmentSchema } from '../../../src/config/environment';

const META_CONFIG = {
  WHATSAPP_PROVIDER_MODE: 'meta_cloud',
  WHATSAPP_ACCESS_TOKEN: 'EAAGsynthetic_token_12345678901234567890',
  WHATSAPP_PHONE_NUMBER_ID: '123456789012345',
  WHATSAPP_BUSINESS_ACCOUNT_ID: '234567890123456',
  WHATSAPP_APP_SECRET: 'meta_app_secret_123456789012345678901234567890',
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'direkt_webhook_verify_token_1234567890',
  WHATSAPP_GRAPH_API_VERSION: 'v99.0',
  WHATSAPP_SYNTHETIC_SEND_APPROVED: 'true',
  WHATSAPP_SYNTHETIC_RECIPIENT: '+260971000000',
  WHATSAPP_SYNTHETIC_TEMPLATE_NAME: 'direkt_rc6_synthetic_canary',
};

describe('RC6 WhatsApp environment boundary', () => {
  it('accepts only an explicitly approved synthetic Meta configuration in non-production', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'development',
      DIREKT_DATA_MODE: 'synthetic-only',
      ...META_CONFIG,
    });

    expect(result.error).toBeUndefined();
    expect(result.value.WHATSAPP_SYNTHETIC_SEND_APPROVED).toBe(true);
    expect(result.value.WHATSAPP_PROVIDER_MODE).toBe('meta_cloud');
  });

  it('rejects Meta activation when the explicit synthetic-send latch is false', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'development',
      DIREKT_DATA_MODE: 'synthetic-only',
      ...META_CONFIG,
      WHATSAPP_SYNTHETIC_SEND_APPROVED: 'false',
    });

    expect(result.error?.message).toContain('explicit synthetic-send approval latch');
  });

  it('rejects WhatsApp provider activation in production', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'production',
      DIREKT_DATA_MODE: 'production',
      DIREKT_TRAFFIC_MODE: 'disabled',
      DATABASE_URL: 'postgresql://direkt:password@db.example.com:5432/direkt',
      ACCESS_TOKEN_SECRET: 'a'.repeat(64),
      CONTACT_HASH_PEPPER: 'b'.repeat(64),
      CHALLENGE_HASH_PEPPER: 'c'.repeat(64),
      RATE_LIMIT_HASH_PEPPER: 'd'.repeat(64),
      EVIDENCE_STORAGE_PROVIDER: 'supabase',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SECRET_KEY: 'e'.repeat(32),
      PAYMENT_PROVIDER_MODE: 'disabled',
      ...META_CONFIG,
    });

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('WHATSAPP_PROVIDER_MODE');
  });
});
