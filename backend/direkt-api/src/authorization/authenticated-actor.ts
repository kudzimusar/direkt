export interface AuthenticatedActor {
  identityId: string;
  sessionId: string;
}

export interface AuthorizationScope {
  providerId?: string;
}
