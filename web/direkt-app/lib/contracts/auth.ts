export type ContactChannel = "email" | "phone";

export interface SyntheticChallengeAccepted {
  status: "accepted";
  challengeId: string;
  expiresAt: string;
  message: string;
  synthetic?: {
    code: string;
    warning: string;
  };
}

export interface DirektAuthenticatedSession {
  identityId: string;
  sessionId: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  tokenType: "Bearer";
  contact: {
    channel: ContactChannel;
    displayHint: string;
    verified: true;
  };
}

export interface DirektRotatedSession {
  identityId: string;
  sessionId: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  tokenType: "Bearer";
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

export interface BrowserAuthBootstrap {
  authMode: "disabled" | "synthetic" | "firebase-exchange";
  participantAuthenticationEnabled: boolean;
  syntheticAuthenticationEnabled: boolean;
  firebaseExchangeEnabled: boolean;
  csrfToken: string;
  hasSession: boolean;
}

export interface BrowserSessionSummary {
  authenticated: true;
  identityId: string;
  sessionId: string;
  contact: {
    channel: ContactChannel | "unknown";
    displayHint: string;
  };
  profile: Record<string, unknown> | null;
  sessions: SessionView[];
  modes: {
    customer: true;
    provider: boolean;
  };
}
