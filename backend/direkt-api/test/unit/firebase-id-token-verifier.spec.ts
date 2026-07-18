import { generateKeyPairSync, sign } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FirebaseIdTokenVerifier } from '../../src/auth/firebase-id-token-verifier';

const PROJECT_ID = 'direkt-dev-502701';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

function buildVerifier(mode: 'disabled' | 'firebase' = 'firebase'): FirebaseIdTokenVerifier {
  return new FirebaseIdTokenVerifier(
    new ConfigService({
      FIREBASE_AUTH_MODE: mode,
      FIREBASE_PROJECT_ID: PROJECT_ID,
      FIREBASE_MAX_AUTH_AGE_SECONDS: 300,
    }),
  );
}

function token(
  overrides: Partial<{
    aud: string;
    iss: string;
    sub: string;
    exp: number;
    iat: number;
    auth_time: number;
    phone_number: string;
    sign_in_provider: string;
  }> = {},
  now = new Date('2026-07-19T00:00:00.000Z'),
): string {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const header = { alg: 'RS256', kid: 'test-key' };
  const payload = {
    aud: PROJECT_ID,
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    sub: 'firebase-subject-123',
    exp: nowSeconds + 600,
    iat: nowSeconds - 30,
    auth_time: nowSeconds - 30,
    phone_number: '+260971234567',
    firebase: { sign_in_provider: overrides.sign_in_provider ?? 'phone' },
    ...overrides,
  };
  delete (payload as { sign_in_provider?: string }).sign_in_provider;
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(
    'RSA-SHA256',
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    privateKey,
  ).toString('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function installCertificateFetch(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify({ 'test-key': publicPem }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=300',
        },
      }),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FirebaseIdTokenVerifier', () => {
  it('accepts a recent signed Zambia phone token for the configured project', async () => {
    installCertificateFetch();
    const now = new Date('2026-07-19T00:00:00.000Z');
    await expect(buildVerifier().verify(token({}, now), now)).resolves.toEqual({
      subject: 'firebase-subject-123',
      phoneNumber: '+260971234567',
    });
  });

  it('rejects a token for a different Firebase project', async () => {
    installCertificateFetch();
    const now = new Date('2026-07-19T00:00:00.000Z');
    await expect(buildVerifier().verify(token({ aud: 'other-project' }, now), now)).rejects.toThrow(
      'invalid or expired',
    );
  });

  it('rejects a non-phone sign-in provider', async () => {
    installCertificateFetch();
    const now = new Date('2026-07-19T00:00:00.000Z');
    await expect(
      buildVerifier().verify(token({ sign_in_provider: 'password' }, now), now),
    ).rejects.toThrow('invalid or expired');
  });

  it('rejects a non-Zambia phone number', async () => {
    installCertificateFetch();
    const now = new Date('2026-07-19T00:00:00.000Z');
    await expect(
      buildVerifier().verify(token({ phone_number: '+819012345678' }, now), now),
    ).rejects.toThrow('invalid or expired');
  });

  it('rejects a stale authentication ceremony even when the token is unexpired', async () => {
    installCertificateFetch();
    const now = new Date('2026-07-19T00:00:00.000Z');
    const nowSeconds = Math.floor(now.getTime() / 1000);
    await expect(
      buildVerifier().verify(token({ auth_time: nowSeconds - 301 }, now), now),
    ).rejects.toThrow('invalid or expired');
  });

  it('fails closed before certificate lookup when Firebase auth is disabled', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    await expect(buildVerifier('disabled').verify('not-a-token')).rejects.toThrow(
      'Pilot authentication is not enabled',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
