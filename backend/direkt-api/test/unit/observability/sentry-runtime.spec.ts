import { describe, expect, it } from 'vitest';
import {
  redactTelemetryText,
  sanitizeTelemetryError,
} from '../../../src/platform/observability/sentry-privacy';
import { resolveSentryRuntimeConfig } from '../../../src/platform/observability/sentry-runtime';

const RELEASE = '0123456789abcdef0123456789abcdef01234567';
const DSN = 'https://public-key@o0.ingest.sentry.io/123';

describe('RC2 Sentry runtime boundary', () => {
  it('defaults to the disabled kill switch', () => {
    expect(resolveSentryRuntimeConfig({ DIREKT_ENVIRONMENT: 'staging' })).toEqual({
      enabled: false,
      environment: 'staging',
    });
  });

  it('rejects unknown runtime modes', () => {
    expect(() => resolveSentryRuntimeConfig({ SENTRY_MODE: 'unexpected' })).toThrow(
      'SENTRY_MODE must be disabled or enabled.',
    );
  });

  it('rejects non-synthetic activation', () => {
    expect(() =>
      resolveSentryRuntimeConfig({
        SENTRY_MODE: 'enabled',
        DIREKT_DATA_MODE: 'controlled-pilot',
        SENTRY_DSN: DSN,
        SENTRY_RELEASE: RELEASE,
      }),
    ).toThrow('RC2 Sentry activation currently permits synthetic-only data mode.');
  });

  it('requires an HTTPS DSN and exact source SHA release', () => {
    expect(() =>
      resolveSentryRuntimeConfig({
        SENTRY_MODE: 'enabled',
        DIREKT_DATA_MODE: 'synthetic-only',
        SENTRY_DSN: 'http://invalid.example',
        SENTRY_RELEASE: RELEASE,
      }),
    ).toThrow('SENTRY_DSN is required when SENTRY_MODE=enabled.');

    expect(() =>
      resolveSentryRuntimeConfig({
        SENTRY_MODE: 'enabled',
        DIREKT_DATA_MODE: 'synthetic-only',
        SENTRY_DSN: DSN,
        SENTRY_RELEASE: 'not-an-exact-sha',
      }),
    ).toThrow('SENTRY_RELEASE must be the exact 40-character source commit SHA.');
  });

  it('returns only the bounded runtime configuration when valid', () => {
    expect(
      resolveSentryRuntimeConfig({
        SENTRY_MODE: 'enabled',
        DIREKT_ENVIRONMENT: 'staging',
        DIREKT_DATA_MODE: 'synthetic-only',
        SENTRY_DSN: DSN,
        SENTRY_RELEASE: RELEASE,
      }),
    ).toEqual({
      enabled: true,
      dsn: DSN,
      environment: 'staging',
      release: RELEASE,
    });
  });
});

describe('RC2 Sentry privacy boundary', () => {
  it('redacts contact, credential and precise-coordinate patterns', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzeW50aGV0aWMifQ.signature';
    const value = redactTelemetryText(
      `email test@example.com phone +260971234567 Bearer abc.DEF-123 ${jwt} -15.416700, 28.283300`,
    );

    expect(value).toContain('[redacted-email]');
    expect(value).toContain('[redacted-phone]');
    expect(value).toContain('Bearer [redacted-token]');
    expect(value).toContain('[redacted-coordinates]');
    expect(value).not.toContain('test@example.com');
    expect(value).not.toContain('+260971234567');
    expect(value).not.toContain('-15.416700');
  });

  it('sanitizes Error objects and collapses non-Error exceptions', () => {
    const error = new TypeError('Contact test@example.com at -15.416700, 28.283300');
    const sanitized = sanitizeTelemetryError(error);

    expect(sanitized).toBeInstanceOf(Error);
    expect(sanitized.name).toBe('TypeError');
    expect(sanitized.message).toBe(
      'Contact [redacted-email] at [redacted-coordinates]',
    );
    expect(sanitizeTelemetryError({ unsafe: 'value' }).message).toBe(
      'Non-Error exception captured.',
    );
  });

  it('bounds telemetry text length', () => {
    expect(redactTelemetryText('x'.repeat(700))).toHaveLength(500);
  });
});
