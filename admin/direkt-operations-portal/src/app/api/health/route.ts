import { NextResponse } from 'next/server';
import {
  configuredCloudRunAudience,
  fetchCloudRunIdentityToken,
} from '@/lib/cloud-run-identity';

export const dynamic = 'force-dynamic';

const HEALTH_TIMEOUT_MS = 5_000;

interface ApiReadinessPayload {
  status?: unknown;
  database?: {
    status?: unknown;
  };
}

export async function GET(): Promise<NextResponse> {
  const apiBaseUrl = process.env.DIREKT_API_BASE_URL?.replace(/\/$/, '');
  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        status: 'not_ready',
        portal: 'ready',
        api: 'unconfigured',
        environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'unknown',
      },
      { status: 503 },
    );
  }

  try {
    const platformIdentityToken = await fetchCloudRunIdentityToken({
      audience: configuredCloudRunAudience(),
    });
    const response = await fetch(`${apiBaseUrl}/api/v1/health/ready`, {
      cache: 'no-store',
      ...(platformIdentityToken
        ? {
            headers: {
              'x-serverless-authorization': `Bearer ${platformIdentityToken}`,
            },
          }
        : {}),
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    const payload = response.ok ? ((await response.json()) as ApiReadinessPayload) : null;

    if (!response.ok || payload?.status !== 'ok' || payload.database?.status !== 'ready') {
      return NextResponse.json(
        {
          status: 'not_ready',
          portal: 'ready',
          api: 'unreachable',
          upstreamStatus: response.status,
          environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'unknown',
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: 'ready',
      portal: 'ready',
      api: 'ready',
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'unknown',
    });
  } catch {
    return NextResponse.json(
      {
        status: 'not_ready',
        portal: 'ready',
        api: 'unreachable',
        environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'unknown',
      },
      { status: 503 },
    );
  }
}
