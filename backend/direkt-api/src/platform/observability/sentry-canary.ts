import '../../instrument';
import * as Sentry from '@sentry/nestjs';
import { resolveSentryRuntimeConfig } from './sentry-runtime';

async function main(): Promise<void> {
  const config = resolveSentryRuntimeConfig();
  if (!config.enabled) {
    throw new Error('Sentry canary requires SENTRY_MODE=enabled.');
  }

  Sentry.withScope((scope) => {
    scope.setTag('direkt.synthetic_canary', 'rc2-api');
    Sentry.captureException(new Error('DIREKT_RC2_API_SYNTHETIC_CANARY'));
  });

  const flushed = await Sentry.flush(10_000);
  if (!flushed) {
    throw new Error('Sentry API canary did not flush successfully.');
  }

  process.stdout.write('DIREKT_SENTRY_API_OK\n');
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown Sentry canary failure.';
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
