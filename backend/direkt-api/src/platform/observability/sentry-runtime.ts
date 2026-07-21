export type SentryRuntimeMode = 'disabled' | 'enabled';

export interface SentryRuntimeConfig {
  enabled: boolean;
  dsn?: string;
  environment: string;
  release?: string;
}

const EXACT_COMMIT_SHA = /^[0-9a-f]{40}$/;

export function resolveSentryRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env,
): SentryRuntimeConfig {
  const mode = (environment.SENTRY_MODE ?? 'disabled') as SentryRuntimeMode;

  if (mode !== 'disabled' && mode !== 'enabled') {
    throw new Error('SENTRY_MODE must be disabled or enabled.');
  }

  const deploymentEnvironment = environment.DIREKT_ENVIRONMENT ?? 'local';

  if (mode === 'disabled') {
    return {
      enabled: false,
      environment: deploymentEnvironment,
    };
  }

  if (environment.DIREKT_DATA_MODE !== 'synthetic-only') {
    throw new Error('RC2 Sentry activation currently permits synthetic-only data mode.');
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
