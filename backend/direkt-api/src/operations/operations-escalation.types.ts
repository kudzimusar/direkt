export type OperationsEscalationStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';
export type OperationsEscalationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type OperationsOverrideStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type OperationsOverrideResult = 'approved' | 'rejected' | 'correction_required' | 'revoked';

export interface OperationsEscalationView {
  escalationId: string;
  caseId: string;
  providerId: string;
  providerDisplayName: string;
  checkKey: string;
  severity: OperationsEscalationSeverity;
  reasonCode: string;
  summary: string;
  ownerIdentityId: string;
  dueAt: string;
  status: OperationsEscalationStatus;
  policyVersion: string;
  resolutionCode: string | null;
  resolutionSummary: string | null;
  resolvedAt: string | null;
  createdAt: string;
  privateEvidenceIncluded: false;
  reviewerNotesIncluded: false;
  synthetic: true;
}

export interface OperationsOverrideApprovalView {
  approvalId: string;
  approverIdentityId: string;
  decision: 'approve' | 'reject';
  rationale: string;
  policyVersion: string;
  createdAt: string;
}

export interface OperationsOverrideRequestView {
  overrideRequestId: string;
  caseId: string;
  providerId: string;
  providerDisplayName: string;
  checkKey: string;
  requestedByIdentityId: string;
  requestedResult: OperationsOverrideResult;
  reasonCode: string;
  rationale: string;
  evidenceVersionCount: number;
  status: OperationsOverrideStatus;
  dueAt: string;
  policyVersion: string;
  approvals: OperationsOverrideApprovalView[];
  approvalCount: number;
  distinctApproversRequired: 2;
  createsDecision: false;
  createsClaim: false;
  changesPublication: false;
  createdAt: string;
  resolvedAt: string | null;
  synthetic: true;
}
