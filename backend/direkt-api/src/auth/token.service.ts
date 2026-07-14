import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AccessTokenClaims {
  version: 1;
  issuer: 'direkt-api';
  audience: 'direkt-clients';
  identityId: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
}

export interface IssuedAccessToken {
  token: string;
  expiresAt: string;
}

@Injectable()
export class TokenService {
  private readonly accessTokenSecret: string;
  private readonly contactHashPepper: string;
  private readonly challengeHashPepper: string;
  private readonly accessTokenTtlSeconds: number;

  constructor(config: ConfigService) {
    this.accessTokenSecret = config.getOrThrow<string>('ACCESS_TOKEN_SECRET');
    this.contactHashPepper = config.getOrThrow<string>('CONTACT_HASH_PEPPER');
    this.challengeHashPepper = config.getOrThrow<string>('CHALLENGE_HASH_PEPPER');
    this.accessTokenTtlSeconds = config.getOrThrow<number>('ACCESS_TOKEN_TTL_SECONDS');
  }

  issueAccessToken(identityId: string, sessionId: string, now = new Date()): IssuedAccessToken {
    const issuedAt = Math.floor(now.getTime() / 1000);
    const claims: AccessTokenClaims = {
      version: 1,
      issuer: 'direkt-api',
      audience: 'direkt-clients',
      identityId,
      sessionId,
      issuedAt,
      expiresAt: issuedAt + this.accessTokenTtlSeconds,
    };
    const payload = Buffer.from(JSON.stringify(claims), 'utf8').toString('base64url');
    const signature = this.sign(payload);
    return {
      token: `dat1.${payload}.${signature}`,
      expiresAt: new Date(claims.expiresAt * 1000).toISOString(),
    };
  }

  verifyAccessToken(token: string, now = new Date()): AccessTokenClaims {
    const [prefix, payload, providedSignature, extra] = token.split('.');
    if (prefix !== 'dat1' || !payload || !providedSignature || extra) {
      throw new UnauthorizedException('The access token is invalid.');
    }

    const expectedSignature = this.sign(payload);
    const expectedBytes = Buffer.from(expectedSignature);
    const providedBytes = Buffer.from(providedSignature);
    if (
      expectedBytes.length !== providedBytes.length ||
      !timingSafeEqual(expectedBytes, providedBytes)
    ) {
      throw new UnauthorizedException('The access token is invalid.');
    }

    let claims: AccessTokenClaims;
    try {
      claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AccessTokenClaims;
    } catch {
      throw new UnauthorizedException('The access token is invalid.');
    }

    const nowSeconds = Math.floor(now.getTime() / 1000);
    if (
      claims.version !== 1 ||
      claims.issuer !== 'direkt-api' ||
      claims.audience !== 'direkt-clients' ||
      typeof claims.identityId !== 'string' ||
      typeof claims.sessionId !== 'string' ||
      !Number.isInteger(claims.issuedAt) ||
      !Number.isInteger(claims.expiresAt) ||
      claims.expiresAt <= nowSeconds ||
      claims.issuedAt > nowSeconds + 60
    ) {
      throw new UnauthorizedException('The access token is invalid or expired.');
    }

    return claims;
  }

  issueRefreshToken(): string {
    return `drt1_${randomBytes(32).toString('base64url')}`;
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  hashContact(normalizedValue: string): string {
    return createHmac('sha256', this.contactHashPepper)
      .update(normalizedValue, 'utf8')
      .digest('hex');
  }

  hashChallenge(challengeId: string, code: string): string {
    return createHmac('sha256', this.challengeHashPepper)
      .update(`${challengeId}:${code}`, 'utf8')
      .digest('hex');
  }

  hashOptionalFingerprint(value: string | undefined): string | null {
    if (!value?.trim()) {
      return null;
    }
    return createHash('sha256').update(value, 'utf8').digest('hex');
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.accessTokenSecret).update(payload, 'utf8').digest('base64url');
  }
}
