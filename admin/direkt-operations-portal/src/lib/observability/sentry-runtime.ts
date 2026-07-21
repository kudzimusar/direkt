export interface PortalSentryRuntimeConfig {
  enabled: boolean;
  dsn?: string;
  environment: string;
  release?: string;
}

type PortalRuntimeEnvironment = Readonly<Record<string, string | undefined>>;

const EXACT_COMMIT_SHA = /^[0-9a-f]{40}$/;

export function resolvePortalSentryRuntimeConfig(
  environment: PortalRuntimeEnvironment = process.env,
): PortalSentryRuntimeConfig {
  const mode = environment.SENTRY_MODE ?? 'disabled';
  const deploymentEnvironment = environment.DIREKT_ENVIRONMENT ?? 'local';

  if (mode !== 'disabled' && mode !== 'enabled') {
    throw new Error('SENTRY_MODE must be disabled or enabled.');
  }

  if (mode === 'disabled') {
    return {
      enabled: false,
      environment: deploymentEnvironment,
    };
  }

  if (environment.DIREKT_DATA_MODE !== 'synthetic-only') {
    throw new Error('RC2 portal Sentry activation currently permits synthetic-only data mode.');
  }

  const dsn = environment.SENTRY_DSN?.trim();
  if (!dsn || !/^https:\/\//.test(dsn)) {
    throw new Error('SENTRY_DSN is required when SENTRY_MODE=enabled.');
  }

  const release = environment.SENTRY_RELEASE?.trim();
  if (!release || !EXACT_COMMIT_SHA.test(release)) {
    throw new Error('SENTRY_RELEASE must be the exact 40-character source commit SHA.');
  }

  return {
    enabled: true,
    dsn,
    environment: deploymentEnvironment,
    release,
  };
}
