import { describe, expect, it } from 'vitest';
import { environmentSchema, type DirektEnvironment } from '../../../src/config/environment';

const RESEND_KEY = 're_test_key_12345678901234567890';

describe('email environment contract', () => {
  it('permits Resend only in synthetic-only development data mode', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'development',
      DIREKT_DATA_MODE: 'synthetic-only',
      EMAIL_PROVIDER_MODE: 'resend',
      EMAIL_RESEND_API_KEY: RESEND_KEY,
      EMAIL_FROM_ADDRESS: 'DIREKT <canary@notify.direkt.forum>',
    });
    const value = result.value as DirektEnvironment;

    expect(result.error).toBeUndefined();
    expect(value.EMAIL_MAX_ATTEMPTS).toBe(4);
    expect(value.EMAIL_OUTBOX_LOCK_TIMEOUT_MS).toBe(300000);
  });

  it('fails closed when Resend is enabled for controlled-pilot data', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'development',
      DIREKT_DATA_MODE: 'controlled-pilot',
      EMAIL_PROVIDER_MODE: 'resend',
      EMAIL_RESEND_API_KEY: RESEND_KEY,
      EMAIL_FROM_ADDRESS: 'DIREKT <canary@notify.direkt.forum>',
    });

    expect(result.error?.message).toContain(
      'Email provider activation currently permits synthetic-only data mode',
    );
  });

  it('requires the verified Resend sending domain', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'development',
      DIREKT_DATA_MODE: 'synthetic-only',
      EMAIL_PROVIDER_MODE: 'resend',
      EMAIL_RESEND_API_KEY: RESEND_KEY,
      EMAIL_FROM_ADDRESS: 'DIREKT <canary@example.com>',
    });

    expect(result.error?.message).toContain(
      'Resend sender must use the verified notify.direkt.forum domain',
    );
  });

  it('keeps production email delivery disabled', () => {
    const result = environmentSchema.validate({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://direkt:direkt_dev@localhost:5432/direkt',
      RATE_LIMIT_HASH_PEPPER: 'x'.repeat(64),
      ACCESS_TOKEN_SECRET: 'y'.repeat(64),
      CONTACT_HASH_PEPPER: 'z'.repeat(64),
      CHALLENGE_HASH_PEPPER: 'q'.repeat(64),
      EVIDENCE_STORAGE_PROVIDER: 'supabase',
      SUPABASE_URL: 'https://aeeuscifrxcjmnswqwnq.supabase.co',
      SUPABASE_SECRET_KEY: 's'.repeat(32),
      EMAIL_PROVIDER_MODE: 'resend',
      EMAIL_RESEND_API_KEY: RESEND_KEY,
    });

    expect(result.error).toBeDefined();
  });
});
