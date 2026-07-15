export type OperationsRole =
  | 'field_agent'
  | 'reviewer'
  | 'support'
  | 'trust_supervisor'
  | 'finance'
  | 'auditor'
  | 'admin';

export interface OperationsSession {
  synthetic: true;
  identityId: string;
  sessionId: string;
  displayName: string;
  role: OperationsRole;
  permissions: readonly string[];
  expiresAt: string;
  stepUpRequired: boolean;
}

export const syntheticReviewerSession: OperationsSession = {
  synthetic: true,
  identityId: '00000000-0000-4000-8000-000000000401',
  sessionId: '00000000-0000-4000-8000-000000000402',
  displayName: 'Synthetic reviewer',
  role: 'reviewer',
  permissions: [
    'account.sessions.manage',
    'operations.portal.access',
    'operations.providers.read',
    'evidence.read.private',
    'verification.case.read',
    'verification.case.review',
    'verification.final_decision',
    'verification.claim.read',
  ],
  expiresAt: '2026-07-15T23:00:00.000Z',
  stepUpRequired: true,
};

export function hasPermission(session: OperationsSession, permission: string): boolean {
  return session.permissions.includes(permission);
}