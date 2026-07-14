export const PERMISSIONS = {
  ACCOUNT_SESSIONS_MANAGE: 'account.sessions.manage',
  OPERATIONS_PORTAL_ACCESS: 'operations.portal.access',
  PROVIDER_PROFILE_MANAGE: 'provider.profile.manage',
  PROVIDER_ENQUIRIES_RESPOND: 'provider.enquiries.respond',
  VERIFICATION_FIELD_VISIT_RECORD: 'verification.field_visit.record',
  VERIFICATION_CASE_REVIEW: 'verification.case.review',
  VERIFICATION_FINAL_DECISION: 'verification.final_decision',
  SUPPORT_TICKET_MANAGE: 'support.ticket.manage',
  TRUST_PROVIDER_SUSPEND: 'trust.provider.suspend',
  FINANCE_LEDGER_READ: 'finance.ledger.read',
  AUDIT_READ: 'audit.read',
  ADMIN_ROLES_MANAGE: 'admin.roles.manage',
  ADMIN_EMERGENCY_ACTION: 'admin.emergency_action',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type RoleKey =
  | 'customer'
  | 'provider_owner'
  | 'provider_member'
  | 'provider_responder'
  | 'field_agent'
  | 'reviewer'
  | 'support'
  | 'trust_supervisor'
  | 'finance'
  | 'auditor'
  | 'admin';
