import * as Sentry from '@sentry/nextjs';
import { resolvePortalSentryRuntimeConfig } from '@/lib/observability/sentry-runtime';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<Response> {
  if (process.env.SENTRY_CANARY_ENABLED !== 'true') {
    return new Response(null, { status: 404 });
  }

  const config = resolvePortalSentryRuntimeConfig();
  if (!config.enabled) {
    return Response.json({ status: 'disabled' }, { status: 503 });
  }

  let eventId = '';
  Sentry.withScope((scope) => {
    scope.setTag('direkt.synthetic_canary', 'rc2-portal');
    eventId = Sentry.captureException(new Error('DIREKT_RC2_PORTAL_SYNTHETIC_CANARY'));
  });

  if (!/^[0-9a-f]{32}$/.test(eventId)) {
    return Response.json({ status: 'event_id_missing' }, { status: 502 });
  }

  const flushed = await Sentry.flush(10_000);
  if (!flushed) {
    return Response.json({ status: 'flush_failed' }, { status: 502 });
  }

  return Response.json({
    status: 'ok',
    receipt: 'DIREKT_SENTRY_PORTAL_OK',
    eventId,
  });
}
