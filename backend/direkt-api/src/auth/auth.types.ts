import type { ContactChannel } from './contact-normalizer';

export interface ChallengeAccepted {
  status: 'accepted';
  challengeId: string;
  expiresAt: string;
  message: string;
  synthetic?: {
    code: string;
    warning: string;
  };
}

export interface SessionTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  tokenType: 'Bearer';
}

export interface AuthenticatedSession extends SessionTokens {
  identityId: string;
  sessionId: string;
  contact: {
    channel: ContactChannel;
    displayHint: string;
    verified: true;
  };
}

export interface SessionView {
  id: string;
  deviceLabel: string;
  createdAt: string;
  expiresAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
  current: boolean;
  reuseDetected: boolean;
}

export type ChallengeVerificationResult =
  | { kind: 'invalid' | 'expired' | 'locked' }
  | {
      kind: 'success';
      identityId: string;
      sessionId: string;
      sessionExpiresAt: string;
      channel: ContactChannel;
      displayHint: string;
    };

export type SessionRotationResult =
  | { kind: 'invalid' | 'expired' | 'reused' }
  | {
      kind: 'success';
      identityId: string;
      sessionId: string;
      sessionExpiresAt: string;
    };
