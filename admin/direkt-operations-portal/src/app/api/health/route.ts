import { NextResponse } from 'next/server';

const HEALTH_TIMEOUT_MS = 5_000;

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
    const response = await fetch(`${apiBaseUrl}/api/v1/health/ready`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });

    if (!response.ok) {
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
