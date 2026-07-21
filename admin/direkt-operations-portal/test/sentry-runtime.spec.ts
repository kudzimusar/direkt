import { describe, expect, it } from 'vitest';
import { redactPortalTelemetryText } from '../src/lib/observability/sentry-privacy';
import { resolvePortalSentryRuntimeConfig } from '../src/lib/observability/sentry-runtime';

const RELEASE = '0123456789abcdef0123456789abcdef01234567';
const DSN = 'https://public-key@o0.ingest.sentry.io/456';

describe('portal RC2 Sentry runtime boundary', () => {
  it('defaults to disabled and preserves the deployment environment label', () => {
    expect(resolvePortalSentryRuntimeConfig({ DIREKT_ENVIRONMENT: 'staging' })).toEqual({
      enabled: false,
      environment: 'staging',
    });
  });

  it('rejects invalid mode and non-synthetic activation', () => {
    expect(() => resolvePortalSentryRuntimeConfig({ SENTRY_MODE: 'unexpected' })).toThrow(
      'SENTRY_MODE must be disabled or enabled.',
    );

    expect(() =>
      resolvePortalSentryRuntimeConfig({
        SENTRY_MODE: 'enabled',
        DIREKT_DATA_MODE: 'controlled-pilot',
        SENTRY_DSN: DSN,
        SENTRY_RELEASE: RELEASE,
      }),
    ).toThrow('RC2 portal Sentry activation currently permits synthetic-only data mode.');
  });

  it('requires an HTTPS DSN and exact source SHA', () => {
    expect(() =>
      resolvePortalSentryRuntimeConfig({
        SENTRY_MODE: 'enabled',
        DIREKT_DATA_MODE: 'synthetic-only',
        SENTRY_DSN: 'http://invalid.example',
        SENTRY_RELEASE: RELEASE,
      }),
    ).toThrow('SENTRY_DSN is required when SENTRY_MODE=enabled.');

    expect(() =>
      resolvePortalSentryRuntimeConfig({
        SENTRY_MODE: 'enabled',
        DIREKT_DATA_MODE: 'synthetic-only',
        SENTRY_DSN: DSN,
        SENTRY_RELEASE: 'not-an-exact-sha',
      }),
    ).toThrow('SENTRY_RELEASE must be the exact 40-character source commit SHA.');
  });

  it('returns the bounded configuration only when all gates pass', () => {
    expect(
      resolvePortalSentryRuntimeConfig({
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

describe('portal RC2 Sentry privacy boundary', () => {
  it('redacts contact, credential and precise-coordinate patterns', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzeW50aGV0aWMifQ.signature';
    const value = redactPortalTelemetryText(
      `email test@example.com phone 0971234567 Bearer abc.DEF-123 ${jwt} -15.416700, 28.283300`,
    );

    expect(value).toContain('[redacted-email]');
    expect(value).toContain('[redacted-phone]');
    expect(value).toContain('Bearer [redacted-token]');
    expect(value).toContain('[redacted-coordinates]');
    expect(value).not.toContain('test@example.com');
    expect(value).not.toContain('0971234567');
    expect(value).not.toContain('-15.416700');
  });

  it('bounds telemetry text length', () => {
    expect(redactPortalTelemetryText('x'.repeat(700))).toHaveLength(500);
  });
});
