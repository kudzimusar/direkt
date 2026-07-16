export const PERMISSIONS = {
  ACCOUNT_SESSIONS_MANAGE: 'account.sessions.manage',
  ACCOUNT_PROFILE_MANAGE: 'account.profile.manage',
  OPERATIONS_PORTAL_ACCESS: 'operations.portal.access',
  OPERATIONS_PROVIDERS_READ: 'operations.providers.read',
  OPERATIONS_TRIAGE_READ: 'operations.triage.read',
  OPERATIONS_EVIDENCE_ACCESS_REVOKE: 'operations.evidence_access.revoke',
  OPERATIONS_FIELD_WORK_READ: 'operations.field_work.read',
  OPERATIONS_FIELD_WORK_MANAGE: 'operations.field_work.manage',
  OPERATIONS_ESCALATIONS_READ: 'operations.escalations.read',
  OPERATIONS_ESCALATIONS_MANAGE: 'operations.escalations.manage',
  OPERATIONS_OVERRIDE_REQUEST: 'operations.override.request',
  OPERATIONS_OVERRIDE_APPROVE: 'operations.override.approve',
  OPERATIONS_INCIDENTS_READ: 'operations.incidents.read',
  OPERATIONS_INCIDENTS_MANAGE: 'operations.incidents.manage',
  OPERATIONS_REPORTING_READ: 'operations.reporting.read',
  OPERATIONS_REPORTING_EXPORT: 'operations.reporting.export',
  PROVIDER_PROFILE_CREATE: 'provider.profile.create',
  PROVIDER_PROFILE_READ: 'provider.profile.read',
  PROVIDER_PROFILE_MANAGE: 'provider.profile.manage',
  PROVIDER_REPRESENTATIVES_MANAGE: 'provider.representatives.manage',
  PROVIDER_EVIDENCE_MANAGE: 'provider.evidence.manage',
  PROVIDER_AVAILABILITY_MANAGE: 'provider.availability.manage',
  PROVIDER_ENQUIRIES_RESPOND: 'provider.enquiries.respond',
  CATALOG_CATEGORIES_READ: 'catalog.categories.read',
  EVIDENCE_UPLOAD_CREATE: 'evidence.upload.create',
  EVIDENCE_READ_OWN: 'evidence.read.own',
  EVIDENCE_READ_PRIVATE: 'evidence.read.private',
  EVIDENCE_MANAGE: 'evidence.manage',
  VERIFICATION_CASE_CREATE: 'verification.case.create',
  VERIFICATION_CASE_READ: 'verification.case.read',
  VERIFICATION_CASE_ASSIGN: 'verification.case.assign',
  VERIFICATION_FIELD_VISIT_RECORD: 'verification.field_visit.record',
  VERIFICATION_CASE_REVIEW: 'verification.case.review',
  VERIFICATION_FINAL_DECISION: 'verification.final_decision',
  VERIFICATION_CLAIM_READ: 'verification.claim.read',
  VERIFICATION_CLAIM_EXPIRE: 'verification.claim.expire',
  DISCOVERY_PUBLICATION_MANAGE: 'discovery.publication.manage',
  DISCOVERY_PUBLICATION_READ: 'discovery.publication.read',
  DISCOVERY_SAVES_MANAGE: 'discovery.saves.manage',
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
