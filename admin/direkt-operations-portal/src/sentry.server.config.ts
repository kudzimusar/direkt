import * as Sentry from '@sentry/nextjs';
import { redactPortalTelemetryText } from './lib/observability/sentry-privacy';
import { resolvePortalSentryRuntimeConfig } from './lib/observability/sentry-runtime';

const config = resolvePortalSentryRuntimeConfig();

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
      delete event.user;
      const requestMethod = event.request?.method;
      if (requestMethod) {
        event.request = { method: requestMethod };
      } else {
        delete event.request;
      }
      delete event.contexts;
      delete event.extra;
      delete event.breadcrumbs;

      if (event.message) {
        event.message = redactPortalTelemetryText(event.message);
      }

      for (const exception of event.exception?.values ?? []) {
        if (exception.value) {
          exception.value = redactPortalTelemetryText(exception.value);
        }
      }

      const syntheticCanary = event.tags?.['direkt.synthetic_canary'];
      event.tags = {
        'direkt.surface': 'operations-portal-server',
        ...(syntheticCanary ? { 'direkt.synthetic_canary': syntheticCanary } : {}),
      };

      return event;
    },
  });
}
