export type EvidenceClass =
  | 'contact'
  | 'identity'
  | 'business'
  | 'qualification'
  | 'licence'
  | 'experience'
  | 'location'
  | 'premises'
  | 'field';

export type EvidenceStatus =
  | 'draft'
  | 'processing'
  | 'ready_for_review'
  | 'correction_required'
  | 'approved'
  | 'rejected'
  | 'revoked'
  | 'expired';

export type VerificationCheckFamily =
  | 'contact'
  | 'representative_identity'
  | 'business'
  | 'qualification'
  | 'licence'
  | 'location'
  | 'premises'
  | 'field_visit'
  | 'category_eligibility'
  | 'good_standing';

export type VerificationCaseStatus =
  | 'draft'
  | 'awaiting_evidence'
  | 'ready_for_review'
  | 'assigned'
  | 'in_review'
  | 'correction_required'
  | 'approved'
  | 'rejected'
  | 'revoked'
  | 'expired'
  | 'renewal_required'
  | 'appealed'
  | 'cancelled'
  | 'closed';

export type VerificationAssignmentKind = 'reviewer' | 'field_agent' | 'supervisor';
export type RecommendationResult = 'approve' | 'reject' | 'correction_required' | 'revoke';
export type DecisionResult = 'approved' | 'rejected' | 'correction_required' | 'revoked';

export interface UploadSessionView {
  uploadSessionId: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
  synthetic: true;
}

export interface EvidenceVersionView {
  id: string;
  version: number;
  evidenceClass: EvidenceClass;
  documentType: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  issuingAuthority: string | null;
  issuedAt: string | null;
  validFrom: string | null;
  expiresAt: string | null;
  processingStatus: 'pending_scan' | 'clean' | 'rejected';
  createdAt: string;
}

export interface EvidenceView {
  id: string;
  providerId: string;
  requirementKey: string;
  requirementLabel: string;
  status: EvidenceStatus;
  retentionClass: 'short' | 'standard' | 'regulated' | 'legal_hold';
  currentVersion: EvidenceVersionView | null;
  createdAt: string;
  updatedAt: string;
  synthetic: true;
}

export interface VerificationCaseView {
  id: string;
  providerId: string;
  categoryKey: string;
  requirementKey: string;
  requirementLabel: string;
  checkKey: string;
  checkFamily: VerificationCheckFamily;
  status: VerificationCaseStatus;
  highRisk: boolean;
  policyVersion: string;
  assignedReviewerIdentityId: string | null;
  evidence: EvidenceView[];
  createdAt: string;
  updatedAt: string;
  synthetic: true;
}

export interface VerificationQueueItem {
  caseId: string;
  providerId: string;
  providerDisplayName: string;
  checkKey: string;
  checkFamily: VerificationCheckFamily;
  status: VerificationCaseStatus;
  highRisk: boolean;
  assignedReviewerIdentityId: string | null;
  updatedAt: string;
  synthetic: true;
}

export interface SafeClaimCard {
  providerId: string;
  claimKey: string;
  statement: string;
  limitation: string;
  evidenceClass: VerificationCheckFamily;
  checkedAt: string;
  validUntil: string;
  status: 'active' | 'degraded' | 'revoked' | 'expired';
  policyVersion: string;
}

export interface PrivateEvidenceAccessGrant {
  accessUrl: string;
  expiresAt: string;
  watermark: string;
  synthetic: true;
}
