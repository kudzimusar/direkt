import { createPublicKey, verify as verifySignature } from 'node:crypto';
import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  DirektDataMode,
  DirektDeploymentEnvironment,
  FirebaseAuthMode,
} from '../config/environment';

const FIREBASE_CERT_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const CLOCK_SKEW_SECONDS = 60;

interface FirebaseTokenHeader {
  alg: string;
  kid: string;
}

interface FirebaseTokenPayload {
  aud: string;
  iss: string;
  sub: string;
  exp: number;
  iat: number;
  authTime: number;
  phoneNumber: string;
  signInProvider: string;
}

export interface VerifiedFirebasePhoneIdentity {
  subject: string;
  phoneNumber: string;
}

@Injectable()
export class FirebaseIdTokenVerifier {
  private readonly mode: FirebaseAuthMode;
  private readonly projectId: string | undefined;
  private readonly maxAuthAgeSeconds: number;
  private readonly environment: DirektDeploymentEnvironment;
  private readonly dataMode: DirektDataMode;
  private readonly entryApproved: boolean;
  private certificates: Record<string, string> = {};
  private certificatesExpireAt = 0;

  constructor(config: ConfigService) {
    this.mode = config.getOrThrow<FirebaseAuthMode>('FIREBASE_AUTH_MODE');
    this.projectId = config.get<string>('FIREBASE_PROJECT_ID');
    this.maxAuthAgeSeconds = config.getOrThrow<number>('FIREBASE_MAX_AUTH_AGE_SECONDS');
    this.environment = config.getOrThrow<DirektDeploymentEnvironment>('DIREKT_ENVIRONMENT');
    this.dataMode = config.getOrThrow<DirektDataMode>('DIREKT_DATA_MODE');
    this.entryApproved = config.getOrThrow<boolean>('PILOT_ENTRY_APPROVED');
  }

  async verify(idToken: string, now = new Date()): Promise<VerifiedFirebasePhoneIdentity> {
    if (
      this.mode !== 'firebase' ||
      !this.projectId ||
      this.environment !== 'pilot' ||
      this.dataMode !== 'controlled-pilot' ||
      !this.entryApproved
    ) {
      throw new ServiceUnavailableException('Pilot authentication is not enabled.');
    }

    const [encodedHeader, encodedPayload, encodedSignature, extra] = idToken.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature || extra) {
      throw this.invalidToken();
    }

    const header = this.parseHeader(encodedHeader);
    const payload = this.parsePayload(encodedPayload);
    if (header.alg !== 'RS256' || !header.kid) {
      throw this.invalidToken();
    }

    const certificates = await this.getCertificates(now);
    const certificate = certificates[header.kid];
    if (!certificate) {
      throw this.invalidToken();
    }

    const signedContent = Buffer.from(`${encodedHeader}.${encodedPayload}`, 'utf8');
    const signature = Buffer.from(encodedSignature, 'base64url');
    const validSignature = verifySignature(
      'RSA-SHA256',
      signedContent,
      createPublicKey(certificate),
      signature,
    );
    if (!validSignature) {
      throw this.invalidToken();
    }

    this.validateClaims(payload, now);
    return {
      subject: payload.sub,
      phoneNumber: payload.phoneNumber,
    };
  }

  private parseHeader(encoded: string): FirebaseTokenHeader {
    const value = this.parseJsonObject(encoded);
    if (typeof value.alg !== 'string' || typeof value.kid !== 'string') {
      throw this.invalidToken();
    }
    return { alg: value.alg, kid: value.kid };
  }

  private parsePayload(encoded: string): FirebaseTokenPayload {
    const value = this.parseJsonObject(encoded);
    const firebase = this.asRecord(value.firebase);
    if (
      typeof value.aud !== 'string' ||
      typeof value.iss !== 'string' ||
      typeof value.sub !== 'string' ||
      typeof value.exp !== 'number' ||
      typeof value.iat !== 'number' ||
      typeof value.auth_time !== 'number' ||
      typeof value.phone_number !== 'string' ||
      typeof firebase.sign_in_provider !== 'string'
    ) {
      throw this.invalidToken();
    }
    return {
      aud: value.aud,
      iss: value.iss,
      sub: value.sub,
      exp: value.exp,
      iat: value.iat,
      authTime: value.auth_time,
      phoneNumber: value.phone_number,
      signInProvider: firebase.sign_in_provider,
    };
  }

  private validateClaims(payload: FirebaseTokenPayload, now: Date): void {
    const nowSeconds = Math.floor(now.getTime() / 1000);
    if (
      payload.aud !== this.projectId ||
      payload.iss !== `https://securetoken.google.com/${this.projectId}` ||
      !payload.sub ||
      payload.sub.length > 128 ||
      !Number.isInteger(payload.exp) ||
      !Number.isInteger(payload.iat) ||
      !Number.isInteger(payload.authTime) ||
      payload.exp <= nowSeconds ||
      payload.iat > nowSeconds + CLOCK_SKEW_SECONDS ||
      payload.authTime > nowSeconds + CLOCK_SKEW_SECONDS ||
      payload.authTime < nowSeconds - this.maxAuthAgeSeconds ||
      payload.signInProvider !== 'phone' ||
      !/^\+260\d{9}$/.test(payload.phoneNumber)
    ) {
      throw this.invalidToken();
    }
  }

  private async getCertificates(now: Date): Promise<Record<string, string>> {
    if (this.certificatesExpireAt > now.getTime() && Object.keys(this.certificates).length > 0) {
      return this.certificates;
    }

    let response: Response;
    try {
      response = await fetch(FIREBASE_CERT_URL, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      throw new ServiceUnavailableException(
        'Authentication verification is temporarily unavailable.',
      );
    }
    if (!response.ok) {
      throw new ServiceUnavailableException(
        'Authentication verification is temporarily unavailable.',
      );
    }

    const body = (await response.json()) as unknown;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ServiceUnavailableException(
        'Authentication verification is temporarily unavailable.',
      );
    }
    const certificates = Object.fromEntries(
      Object.entries(body).filter(
        (entry): entry is [string, string] =>
          typeof entry[0] === 'string' && typeof entry[1] === 'string',
      ),
    );
    if (Object.keys(certificates).length === 0) {
      throw new ServiceUnavailableException(
        'Authentication verification is temporarily unavailable.',
      );
    }

    const cacheControl = response.headers.get('cache-control') ?? '';
    const match = /max-age=(\d+)/i.exec(cacheControl);
    const maxAgeSeconds = match ? Number(match[1]) : 300;
    const boundedMaxAge = Number.isFinite(maxAgeSeconds)
      ? Math.min(Math.max(maxAgeSeconds, 60), 21_600)
      : 300;
    this.certificates = certificates;
    this.certificatesExpireAt = now.getTime() + boundedMaxAge * 1000;
    return certificates;
  }

  private parseJsonObject(encoded: string): Record<string, unknown> {
    try {
      const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as unknown;
      return this.asRecord(parsed);
    } catch {
      throw this.invalidToken();
    }
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw this.invalidToken();
    }
    return value as Record<string, unknown>;
  }

  private invalidToken(): UnauthorizedException {
    return new UnauthorizedException('The Firebase identity token is invalid or expired.');
  }
}
