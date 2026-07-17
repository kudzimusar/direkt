export type OperationsRole =
  'field_agent' | 'reviewer' | 'support' | 'trust_supervisor' | 'finance' | 'auditor' | 'admin';

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
    'operations.triage.read',
    'evidence.read.private',
    'verification.case.read',
    'verification.case.review',
    'verification.final_decision',
    'verification.claim.read',
    'discovery.publication.read',
  ],
  expiresAt: '2026-12-31T23:00:00.000Z',
  stepUpRequired: true,
};

export const syntheticSupervisorSession: OperationsSession = {
  synthetic: true,
  identityId: '00000000-0000-4000-8000-000000000701',
  sessionId: '00000000-0000-4000-8000-000000000702',
  displayName: 'Synthetic trust supervisor',
  role: 'trust_supervisor',
  permissions: [
    'account.sessions.manage',
    'operations.portal.access',
    'operations.providers.read',
    'operations.triage.read',
    'operations.evidence_access.revoke',
    'operations.field_work.read',
    'operations.field_work.manage',
    'operations.escalations.read',
    'operations.escalations.manage',
    'operations.override.request',
    'operations.override.approve',
    'operations.incidents.read',
    'operations.incidents.manage',
    'operations.reporting.read',
    'operations.interactions.read',
    'operations.reviews.read',
    'operations.reviews.manage',
    'operations.complaints.read',
    'operations.complaints.manage',
    'evidence.read.private',
    'verification.case.read',
    'verification.case.assign',
    'verification.case.review',
    'verification.final_decision',
    'verification.claim.read',
    'discovery.publication.read',
  ],
  expiresAt: '2026-12-31T23:00:00.000Z',
  stepUpRequired: true,
};

export function hasPermission(session: OperationsSession, permission: string): boolean {
  return session.permissions.includes(permission);
}
