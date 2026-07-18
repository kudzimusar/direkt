import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { normalizeContact } from './contact-normalizer';
import { AuthRepository } from './auth.repository';
import type {
  AuthenticatedSession,
  ChallengeAccepted,
  SessionTokens,
  SessionView,
} from './auth.types';
import type {
  FirebaseSessionExchangeDto,
  RequestChallengeDto,
  RevokeSessionDto,
  RotateSessionDto,
  VerifyChallengeDto,
} from './auth.dto';
import { FirebaseIdTokenVerifier } from './firebase-id-token-verifier';
import { FirebaseSessionRepository } from './firebase-session.repository';
import { SyntheticChallengeService } from './synthetic-challenge.service';
import { TokenService } from './token.service';

export interface RequestSecurityContext {
  requestId?: string;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AuthService {
  private readonly challengeTtlSeconds: number;
  private readonly refreshTokenTtlDays: number;
  private readonly pilotNoticeVersion: string | undefined;

  constructor(
    private readonly repository: AuthRepository,
    private readonly firebaseSessions: FirebaseSessionRepository,
    private readonly firebaseVerifier: FirebaseIdTokenVerifier,
    private readonly tokens: TokenService,
    private readonly challengeSender: SyntheticChallengeService,
    config: ConfigService,
  ) {
    this.challengeTtlSeconds = config.getOrThrow<number>('CHALLENGE_TTL_SECONDS');
    this.refreshTokenTtlDays = config.getOrThrow<number>('REFRESH_TOKEN_TTL_DAYS');
    this.pilotNoticeVersion = config.get<string>('PILOT_NOTICE_VERSION');
  }

  async requestChallenge(
    dto: RequestChallengeDto,
    context: RequestSecurityContext,
  ): Promise<ChallengeAccepted> {
    const contact = normalizeContact(dto.channel, dto.contact);
    const challengeId = randomUUID();
    const delivery = this.challengeSender.send(contact.channel, contact.displayHint);
    const expiresAt = new Date(Date.now() + this.challengeTtlSeconds * 1000);

    await this.repository.createChallenge({
      id: challengeId,
      channel: contact.channel,
      contactHash: this.tokens.hashContact(contact.value),
      displayHint: contact.displayHint,
      codeHash: this.tokens.hashChallenge(challengeId, delivery.code),
      expiresAt,
      requestFingerprint: this.tokens.hashOptionalFingerprint(
        [context.ip, context.userAgent].filter(Boolean).join('|'),
      ),
    });

    return {
      status: 'accepted',
      challengeId,
      expiresAt: expiresAt.toISOString(),
      message: 'If the contact can receive DIREKT challenges, a code has been prepared.',
      synthetic: {
        code: delivery.code,
        warning: 'Synthetic development challenge. No SMS or email was sent.',
      },
    };
  }

  async verifyChallenge(
    dto: VerifyChallengeDto,
    context: RequestSecurityContext,
  ): Promise<AuthenticatedSession> {
    const sessionId = randomUUID();
    const familyId = randomUUID();
    const refreshToken = this.tokens.issueRefreshToken();
    const refreshExpiresAt = this.refreshExpiry();
    const result = await this.repository.verifyChallengeAndCreateSession({
      challengeId: dto.challengeId,
      providedCodeHash: this.tokens.hashChallenge(dto.challengeId, dto.code),
      sessionId,
      familyId,
      refreshTokenHash: this.tokens.hashRefreshToken(refreshToken),
      sessionExpiresAt: refreshExpiresAt,
      deviceLabel: dto.deviceLabel ?? 'Synthetic DIREKT client',
      userAgentHash: this.tokens.hashOptionalFingerprint(context.userAgent),
      ipHash: this.tokens.hashOptionalFingerprint(context.ip),
      ...(context.requestId ? { requestId: context.requestId } : {}),
    });

    if (result.kind !== 'success') {
      throw new UnauthorizedException('The challenge could not be verified.');
    }

    return {
      identityId: result.identityId,
      sessionId: result.sessionId,
      ...this.buildTokens(
        result.identityId,
        result.sessionId,
        refreshToken,
        result.sessionExpiresAt,
      ),
      contact: {
        channel: result.channel,
        displayHint: result.displayHint,
        verified: true,
      },
    };
  }

  async exchangeFirebaseSession(
    dto: FirebaseSessionExchangeDto,
    context: RequestSecurityContext,
  ): Promise<AuthenticatedSession> {
    if (
      !dto.consentAccepted ||
      !this.pilotNoticeVersion ||
      dto.noticeVersion !== this.pilotNoticeVersion
    ) {
      throw new UnauthorizedException('The approved pilot notice must be accepted before sign-in.');
    }
    const verified = await this.firebaseVerifier.verify(dto.idToken);
    const contact = normalizeContact('phone', verified.phoneNumber);
    const sessionId = randomUUID();
    const familyId = randomUUID();
    const refreshToken = this.tokens.issueRefreshToken();
    const refreshExpiresAt = this.refreshExpiry();
    const result = await this.firebaseSessions.createSession({
      subjectHash: this.tokens.hashExternalSubject('firebase', verified.subject),
      contactHash: this.tokens.hashContact(contact.value),
      displayHint: contact.displayHint,
      noticeVersion: dto.noticeVersion,
      sessionId,
      familyId,
      refreshTokenHash: this.tokens.hashRefreshToken(refreshToken),
      sessionExpiresAt: refreshExpiresAt,
      deviceLabel: dto.deviceLabel ?? 'Firebase Android pilot device',
      userAgentHash: this.tokens.hashOptionalFingerprint(context.userAgent),
      ipHash: this.tokens.hashOptionalFingerprint(context.ip),
      ...(context.requestId ? { requestId: context.requestId } : {}),
    });

    if (result.kind !== 'success') {
      throw new UnauthorizedException('The external identity is not admitted to the pilot.');
    }

    return {
      identityId: result.identityId,
      sessionId: result.sessionId,
      ...this.buildTokens(
        result.identityId,
        result.sessionId,
        refreshToken,
        result.sessionExpiresAt,
      ),
      contact: {
        channel: 'phone',
        displayHint: result.displayHint,
        verified: true,
      },
    };
  }

  async rotateSession(
    dto: RotateSessionDto,
    context: RequestSecurityContext,
  ): Promise<SessionTokens & { identityId: string; sessionId: string }> {
    const replacementSessionId = randomUUID();
    const replacementRefreshToken = this.tokens.issueRefreshToken();
    const replacementExpiresAt = this.refreshExpiry();
    const result = await this.repository.rotateSession({
      currentRefreshTokenHash: this.tokens.hashRefreshToken(dto.refreshToken),
      replacementSessionId,
      replacementRefreshTokenHash: this.tokens.hashRefreshToken(replacementRefreshToken),
      replacementExpiresAt,
      deviceLabel: 'Rotated DIREKT session',
      userAgentHash: this.tokens.hashOptionalFingerprint(context.userAgent),
      ipHash: this.tokens.hashOptionalFingerprint(context.ip),
      ...(context.requestId ? { requestId: context.requestId } : {}),
    });

    if (result.kind !== 'success') {
      throw new UnauthorizedException('The session could not be refreshed.');
    }

    return {
      identityId: result.identityId,
      sessionId: result.sessionId,
      ...this.buildTokens(
        result.identityId,
        result.sessionId,
        replacementRefreshToken,
        result.sessionExpiresAt,
      ),
    };
  }

  listSessions(actor: AuthenticatedActor): Promise<SessionView[]> {
    return this.repository.listSessions(actor.identityId, actor.sessionId);
  }

  async revokeSession(
    actor: AuthenticatedActor,
    sessionId: string,
    dto: RevokeSessionDto,
    requestId?: string,
  ): Promise<{ revoked: true; sessionId: string }> {
    const revoked = await this.repository.revokeSession(
      actor,
      sessionId,
      dto.reason ?? 'Revoked by authenticated account holder',
      requestId,
    );
    if (!revoked) {
      throw new NotFoundException('The session was not found or is already revoked.');
    }
    return { revoked: true, sessionId };
  }

  async revokeOtherSessions(
    actor: AuthenticatedActor,
    requestId?: string,
  ): Promise<{ revokedCount: number }> {
    return {
      revokedCount: await this.repository.revokeOtherSessions(actor, requestId),
    };
  }

  private refreshExpiry(): Date {
    return new Date(Date.now() + this.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  }

  private buildTokens(
    identityId: string,
    sessionId: string,
    refreshToken: string,
    refreshExpiresAt: string,
  ): SessionTokens {
    const access = this.tokens.issueAccessToken(identityId, sessionId);
    return {
      accessToken: access.token,
      accessTokenExpiresAt: access.expiresAt,
      refreshToken,
      refreshTokenExpiresAt: refreshExpiresAt,
      tokenType: 'Bearer',
    };
  }
}
