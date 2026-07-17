import { ConfigService } from '@nestjs/config';
import type { NextFunction, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { DatabaseService } from '../../src/platform/database/database.service';
import type { DirektRequest } from '../../src/platform/http/request-context';
import { AbuseControlMiddleware } from '../../src/platform/security/abuse-control.middleware';

interface TestResponse {
  response: Response;
  headers: Map<string, string>;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}

function config(values: Record<string, unknown>): ConfigService {
  return {
    getOrThrow: <T>(key: string): T => values[key] as T,
  } as ConfigService;
}

function database(result: unknown | Error): {
  service: DatabaseService;
  query: ReturnType<typeof vi.fn>;
} {
  const query = result instanceof Error ? vi.fn().mockRejectedValue(result) : vi.fn().mockResolvedValue(result);
  return { service: { query } as unknown as DatabaseService, query };
}

function request(method: string, path: string): DirektRequest {
  return {
    method,
    path,
    originalUrl: path,
    requestId: '00000000-0000-4000-8000-000000000001',
    ip: '203.0.113.10',
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as DirektRequest;
}

function response(): TestResponse {
  const headers = new Map<string, string>();
  const json = vi.fn();
  const status = vi.fn();
  const value = {
    setHeader: (name: string, headerValue: string) => {
      headers.set(name, headerValue);
      return value;
    },
    status,
    json,
  };
  status.mockReturnValue(value);
  return { response: value as unknown as Response, headers, status, json };
}

function middleware(
  overrides: Record<string, unknown> = {},
  databaseResult: unknown = {
    rows: [
      {
        allowed: true,
        remaining: 4,
        retry_after_seconds: 45,
        current_count: 1,
        window_expires_at: new Date('2026-07-17T09:00:00.000Z'),
      },
    ],
  },
): { middleware: AbuseControlMiddleware; query: ReturnType<typeof vi.fn> } {
  const databaseMock = database(databaseResult);
  const service = new AbuseControlMiddleware(
    config({
      DIREKT_TRAFFIC_MODE: 'internal',
      DIREKT_DATA_MODE: 'synthetic-only',
      RATE_LIMITS_ENABLED: true,
      RATE_LIMIT_HASH_PEPPER:
        'direkt-unit-test-rate-limit-hash-pepper-not-for-production-000000001',
      ...overrides,
    }),
    databaseMock.service,
  );
  return { middleware: service, query: databaseMock.query };
}

describe('Phase 10 abuse-control middleware', () => {
  it('keeps health endpoints available when the traffic kill switch is active', async () => {
    const control = middleware({ DIREKT_TRAFFIC_MODE: 'disabled' });
    const target = response();
    const next: NextFunction = vi.fn();

    await control.middleware.use(request('GET', '/api/v1/health/ready'), target.response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(control.query).not.toHaveBeenCalled();
  });

  it('fails closed for non-health traffic when administratively disabled', async () => {
    const control = middleware({ DIREKT_TRAFFIC_MODE: 'disabled' });
    const target = response();
    const next: NextFunction = vi.fn();

    await control.middleware.use(request('POST', '/api/v1/auth/challenges'), target.response, next);

    expect(target.status).toHaveBeenCalledWith(503);
    expect(target.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 503, title: 'DIREKT traffic is unavailable' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('keeps test counters explicitly disabled without weakening the traffic switch', async () => {
    const control = middleware({ RATE_LIMITS_ENABLED: false });
    const target = response();
    const next: NextFunction = vi.fn();

    await control.middleware.use(request('POST', '/api/v1/auth/challenges'), target.response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(control.query).not.toHaveBeenCalled();
  });

  it('consumes a shared database allowance and exposes bounded retry headers', async () => {
    const control = middleware();
    const target = response();
    const next: NextFunction = vi.fn();

    await control.middleware.use(request('POST', '/api/v1/auth/challenges'), target.response, next);

    expect(control.query).toHaveBeenCalledWith(
      expect.stringContaining('security.consume_rate_limit'),
      expect.arrayContaining(['auth_challenge_request', 300, 5]),
    );
    expect(target.headers.get('RateLimit-Limit')).toBe('5');
    expect(target.headers.get('RateLimit-Remaining')).toBe('4');
    expect(target.headers.get('RateLimit-Reset')).toBe('45');
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns a deterministic 429 response after the allowance is exhausted', async () => {
    const control = middleware({}, {
      rows: [
        {
          allowed: false,
          remaining: 0,
          retry_after_seconds: 37,
          current_count: 6,
          window_expires_at: new Date('2026-07-17T09:00:00.000Z'),
        },
      ],
    });
    const target = response();
    const next: NextFunction = vi.fn();

    await control.middleware.use(request('POST', '/api/v1/auth/challenges'), target.response, next);

    expect(target.status).toHaveBeenCalledWith(429);
    expect(target.headers.get('Retry-After')).toBe('37');
    expect(target.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 429,
        policy: 'auth_challenge_request',
        retryAfterSeconds: 37,
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('fails protected operations closed when the distributed counter is unavailable', async () => {
    const control = middleware({}, new Error('database unavailable'));
    const target = response();
    const next: NextFunction = vi.fn();

    await control.middleware.use(request('POST', '/api/v1/enquiries'), target.response, next);

    expect(target.status).toHaveBeenCalledWith(503);
    expect(target.headers.get('Retry-After')).toBe('60');
    expect(next).not.toHaveBeenCalled();
  });
});
