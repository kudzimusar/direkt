import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CloudRunIdentityTokenError,
  configuredCloudRunAudience,
  fetchCloudRunIdentityToken,
} from '../src/lib/cloud-run-identity';

const originalAudience = process.env.DIREKT_API_AUDIENCE;

afterEach(() => {
  if (originalAudience === undefined) {
    delete process.env.DIREKT_API_AUDIENCE;
  } else {
    process.env.DIREKT_API_AUDIENCE = originalAudience;
  }
});

describe('Cloud Run platform identity', () => {
  it('does not contact metadata when no audience is configured', async () => {
    const fetchImplementation = vi.fn<typeof fetch>();

    await expect(
      fetchCloudRunIdentityToken({ audience: null, fetchImplementation }),
    ).resolves.toBeNull();
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('requests a Google-signed audience token from the metadata server', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('header.payload.signature', { status: 200 }));

    await expect(
      fetchCloudRunIdentityToken({
        audience: 'https://direkt-api.example.run.app',
        fetchImplementation,
        metadataHost: 'metadata.test',
      }),
    ).resolves.toBe('header.payload.signature');

    const [request, init] = fetchImplementation.mock.calls[0] ?? [];
    expect(String(request)).toContain('http://metadata.test/computeMetadata/v1/');
    expect(String(request)).toContain(
      'audience=https%3A%2F%2Fdirekt-api.example.run.app',
    );
    expect(init).toEqual(
      expect.objectContaining({
        cache: 'no-store',
        headers: { 'Metadata-Flavor': 'Google' },
      }),
    );
  });

  it('returns a stable safe error without exposing metadata response content', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('sensitive-provider-detail', { status: 403 }));

    await expect(
      fetchCloudRunIdentityToken({
        audience: 'https://direkt-api.example.run.app',
        fetchImplementation,
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<CloudRunIdentityTokenError>>({
        message: 'Cloud Run platform identity was rejected.',
      }),
    );
  });

  it('reads only the explicit API audience configuration', () => {
    process.env.DIREKT_API_AUDIENCE = 'https://direkt-api.example.run.app';
    expect(configuredCloudRunAudience()).toBe('https://direkt-api.example.run.app');
  });
});
