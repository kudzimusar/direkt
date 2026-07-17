import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SupabasePrivateStorageAdapter } from '../../src/verification-evidence/supabase-private-storage.adapter';

const SERVICE_ROLE_KEY = 'service-role-key-for-tests-only-not-a-real-secret';

function adapter(): SupabasePrivateStorageAdapter {
  return new SupabasePrivateStorageAdapter(
    new ConfigService({
      SUPABASE_URL: 'https://example-project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY,
      SUPABASE_EVIDENCE_BUCKET: 'provider-evidence',
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SupabasePrivateStorageAdapter', () => {
  it('creates a private signed upload without exposing the service role key', async () => {
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
    expect(JSON.stringify(grant)).not.toContain(SERVICE_ROLE_KEY);
    expect(fetchMock).toHaveBeenCalledOnce();
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
});
