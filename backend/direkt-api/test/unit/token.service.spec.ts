import { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import { TokenService } from '../../src/auth/token.service';

function service(): TokenService {
  return new TokenService(
    new ConfigService({
      ACCESS_TOKEN_SECRET:
        'test-access-token-secret-long-enough-for-phase-two-c-000000000000001',
      CONTACT_HASH_PEPPER:
        'test-contact-hash-pepper-long-enough-for-phase-two-c-0000000000001',
      CHALLENGE_HASH_PEPPER:
        'test-challenge-hash-pepper-long-enough-for-phase-two-c-00000000001',
      ACCESS_TOKEN_TTL_SECONDS: 600,
    }),
  );
}

describe('TokenService', () => {
  it('issues a short-lived signed token containing identity and session only', () => {
    const tokens = service();
    const now = new Date('2026-07-15T00:00:00.000Z');
    const issued = tokens.issueAccessToken(
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000202',
      now,
    );
    const claims = tokens.verifyAccessToken(issued.token, now);

    expect(claims).toMatchObject({
      identityId: '00000000-0000-4000-8000-000000000201',
      sessionId: '00000000-0000-4000-8000-000000000202',
      expiresAt: claims.issuedAt + 600,
    });
    expect(issued.token).not.toContain('admin');
  });

  it('rejects tampered and expired access tokens', () => {
    const tokens = service();
    const now = new Date('2026-07-15T00:00:00.000Z');
    const issued = tokens.issueAccessToken('identity', 'session', now);

    expect(() => tokens.verifyAccessToken(`${issued.token}x`, now)).toThrow(/invalid/i);
    expect(() =>
      tokens.verifyAccessToken(issued.token, new Date('2026-07-15T00:11:00.000Z')),
    ).toThrow(/expired/i);
  });

  it('never returns a raw refresh token from its storage hash', () => {
    const tokens = service();
    const refresh = tokens.issueRefreshToken();
    const hash = tokens.hashRefreshToken(refresh);

    expect(refresh).toMatch(/^drt1_/);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(refresh);
  });
});
