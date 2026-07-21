import * as Sentry from '@sentry/nestjs';
import { redactTelemetryText } from './platform/observability/sentry-privacy';
import { resolveSentryRuntimeConfig } from './platform/observability/sentry-runtime';

const config = resolveSentryRuntimeConfig();

if (config.enabled) {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    enableLogs: false,
    maxBreadcrumbs: 0,
    includeLocalVariables: false,
    beforeBreadcrumb() {
      return null;
    },
    beforeSend(event) {
      event.user = undefined;
      event.request = event.request?.method ? { method: event.request.method } : undefined;
      event.contexts = undefined;
      event.extra = undefined;
      event.breadcrumbs = undefined;

      if (event.message) {
        event.message = redactTelemetryText(event.message);
      }

      for (const exception of event.exception?.values ?? []) {
        if (exception.value) {
          exception.value = redactTelemetryText(exception.value);
        }
      }

      const syntheticCanary = event.tags?.['direkt.synthetic_canary'];
      event.tags = {
        'direkt.surface': 'api',
        ...(syntheticCanary ? { 'direkt.synthetic_canary': syntheticCanary } : {}),
      };

      return event;
    },
  });
}
