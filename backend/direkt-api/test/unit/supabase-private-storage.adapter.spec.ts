import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SupabasePrivateStorageAdapter } from '../../src/verification-evidence/supabase-private-storage.adapter';

const SECRET_KEY = ['sb', 'secret', 'test-only-not-a-real-key'].join('_');
const LEGACY_SERVICE_ROLE_KEY = 'legacy-service-role-key-for-tests-only-not-a-real-secret';

function adapter(serverKey = SECRET_KEY): SupabasePrivateStorageAdapter {
  return new SupabasePrivateStorageAdapter(
    new ConfigService({
      SUPABASE_URL: 'https://example-project.supabase.co',
      ...(serverKey.startsWith(['sb', 'secret', ''].join('_'))
        ? { SUPABASE_SECRET_KEY: serverKey }
        : { SUPABASE_SERVICE_ROLE_KEY: serverKey }),
      SUPABASE_EVIDENCE_BUCKET: 'provider-evidence',
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SupabasePrivateStorageAdapter', () => {
  it('creates a private signed upload without exposing the secret key', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          url: '/object/upload/sign/provider-evidence/private/provider/session/object?token=signed',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const grant = await adapter().createUploadGrant({
      providerId: 'provider',
      uploadSessionId: 'session',
      contentType: 'application/pdf',
      maxBytes: 1024,
    });

    expect(grant).toMatchObject({
      synthetic: false,
      requiredHeaders: {
        'content-type': 'application/pdf',
        'x-upsert': 'false',
      },
    });
    expect(grant.uploadUrl).toMatch(/^https:\/\/example-project\.supabase\.co\/storage\/v1\//);
    expect(JSON.stringify(grant)).not.toContain(SECRET_KEY);
    expect(fetchMock).toHaveBeenCalledOnce();
    const request = fetchMock.mock.calls[0]?.[1];
    expect(request?.headers).toMatchObject({ apikey: SECRET_KEY });
    expect(request?.headers).not.toHaveProperty('authorization');
  });

  it('retains bearer authorization for a legacy service-role JWT', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ url: '/object/upload/sign/provider-evidence/object' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await adapter(LEGACY_SERVICE_ROLE_KEY).createUploadGrant({
      providerId: 'provider',
      uploadSessionId: 'session',
      contentType: 'application/pdf',
      maxBytes: 1024,
    });

    const request = fetchMock.mock.calls[0]?.[1];
    expect(request?.headers).toMatchObject({
      apikey: LEGACY_SERVICE_ROLE_KEY,
      authorization: `Bearer ${LEGACY_SERVICE_ROLE_KEY}`,
    });
  });

  it('verifies uploaded bytes, content type, size and checksum', async () => {
    const bytes = Buffer.from('verified evidence bytes');
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ signedURL: '/object/sign/provider-evidence/object?token=read' }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(bytes, {
          status: 200,
          headers: { 'content-type': 'application/pdf' },
        }),
      );

    await expect(
      adapter().confirmUpload({
        objectKey: 'private/provider/session/object',
        contentType: 'application/pdf',
        sizeBytes: bytes.byteLength,
        sha256,
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects a checksum mismatch', async () => {
    const bytes = Buffer.from('different bytes');
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ signedURL: '/object/sign/provider-evidence/object?token=read' }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(bytes, {
          status: 200,
          headers: { 'content-type': 'application/pdf' },
        }),
      );

    await expect(
      adapter().confirmUpload({
        objectKey: 'private/provider/session/object',
        contentType: 'application/pdf',
        sizeBytes: bytes.byteLength,
        sha256: 'a'.repeat(64),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a short-lived private read grant', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ signedURL: '/object/sign/provider-evidence/object?token=read' }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    const grant = await adapter().createReadGrant(
      'private/provider/session/object',
      '12345678-actor',
      'assigned review',
    );

    expect(grant.synthetic).toBe(false);
    expect(grant.accessUrl).toContain('/storage/v1/object/sign/');
    expect(grant.watermark).toContain('12345678');
    expect(grant.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('does not expose Supabase response details through mapped errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'private bucket policy and internal object path must never reach the API client',
        }),
        {
          status: 500,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    let failure: unknown;
    try {
      await adapter().createUploadGrant({
        providerId: 'provider',
        uploadSessionId: 'session',
        contentType: 'application/pdf',
        maxBytes: 1024,
      });
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(ServiceUnavailableException);
    expect((failure as Error).message).toBe('Supabase Storage request failed.');
    expect(JSON.stringify(failure)).not.toContain('private bucket policy');
    expect(JSON.stringify(failure)).not.toContain('internal object path');
  });
});
