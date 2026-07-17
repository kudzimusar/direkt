import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../src/app/api/health/route';

const originalApiBaseUrl = process.env.DIREKT_API_BASE_URL;
const originalAppEnvironment = process.env.NEXT_PUBLIC_APP_ENV;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalApiBaseUrl === undefined) delete process.env.DIREKT_API_BASE_URL;
  else process.env.DIREKT_API_BASE_URL = originalApiBaseUrl;
  if (originalAppEnvironment === undefined) delete process.env.NEXT_PUBLIC_APP_ENV;
  else process.env.NEXT_PUBLIC_APP_ENV = originalAppEnvironment;
});

describe('portal deployment health', () => {
  it('fails closed when the DIREKT API base URL is absent', async () => {
    delete process.env.DIREKT_API_BASE_URL;
    process.env.NEXT_PUBLIC_APP_ENV = 'development';

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: 'not_ready',
      portal: 'ready',
      api: 'unconfigured',
      environment: 'development',
    });
  });

  it('reports ready only when the configured API readiness contract succeeds', async () => {
    process.env.DIREKT_API_BASE_URL = 'https://direkt-api.example.invalid/';
    process.env.NEXT_PUBLIC_APP_ENV = 'development';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('{"status":"ok","database":{"status":"ready"}}', { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://direkt-api.example.invalid/api/v1/health/ready',
      expect.objectContaining({ cache: 'no-store' }),
    );
    await expect(response.json()).resolves.toMatchObject({
      status: 'ready',
      portal: 'ready',
      api: 'ready',
    });
  });

  it('fails closed when an upstream 200 does not satisfy the readiness schema', async () => {
    process.env.DIREKT_API_BASE_URL = 'https://direkt-api.example.invalid';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"status":"ok"}', { status: 200 })),
    );

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: 'not_ready',
      api: 'unreachable',
      upstreamStatus: 200,
    });
  });

  it('does not expose the configured upstream URL when the API is unavailable', async () => {
    process.env.DIREKT_API_BASE_URL = 'https://private-api.example.invalid';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failed')));

    const response = await GET();
    const body = JSON.stringify(await response.json());

    expect(response.status).toBe(503);
    expect(body).not.toContain('private-api.example.invalid');
    expect(body).not.toContain('network failed');
  });
});
