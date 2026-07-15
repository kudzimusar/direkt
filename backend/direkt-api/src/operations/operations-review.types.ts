import type {
  EvidenceStatus,
  EvidenceVersionView,
  VerificationAssignmentKind,
  VerificationCaseStatus,
  VerificationCheckFamily,
} from '../verification-evidence/verification-evidence.types';

export interface OperationsReviewEvidenceItem {
  evidenceId: string;
  status: EvidenceStatus;
  retentionClass: 'short' | 'standard' | 'regulated' | 'legal_hold';
  requirementKey: string;
  requirementLabel: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: {
    versionId: string;
    versionNumber: number;
    evidenceClass: EvidenceVersionView['evidenceClass'];
    documentType: string;
    contentType: string;
    sizeBytes: number;
    issuingAuthority: string | null;
    issuedAt: string | null;
    validFrom: string | null;
    expiresAt: string | null;
    processingStatus: EvidenceVersionView['processingStatus'];
    createdAt: string;
  };
  checksumIncluded: false;
  objectKeyIncluded: false;
  submitterIdentityIncluded: false;
  synthetic: true;
}

export interface OperationsReviewWorkspace {
  caseId: string;
  providerId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  requirementKey: string;
  requirementLabel: string;
  checkKey: string;
  checkFamily: VerificationCheckFamily;
  status: VerificationCaseStatus;
  highRisk: boolean;
  policyVersion: string;
  assignment: {
    assignmentId: string;
    assignmentKind: Extract<VerificationAssignmentKind, 'reviewer' | 'supervisor'>;
    assignedAt: string;
  };
  evidence: OperationsReviewEvidenceItem[];
  recommendationCount: number;
  decisionRecorded: boolean;
  privateRationaleIncluded: false;
  reviewerNotesIncluded: false;
  privateCoordinatesIncluded: false;
  synthetic: true;
}

export interface OperationsEvidenceReviewGrant {
  grantId: string;
  caseId: string;
  evidenceId: string;
  evidenceVersionId: string;
  assignmentId: string;
  accessUrl: string;
  expiresAt: string;
  watermark: string;
  applicationMediated: true;
  objectKeyIncluded: false;
  synthetic: true;
}

export interface OperationsEvidenceReviewRedemption {
  grantId: string;
  caseId: string;
  evidenceId: string;
  accessUrl: string;
  expiresAt: string;
  watermark: string;
  assignmentRevalidated: true;
  evidenceVersionRevalidated: true;
  objectKeyIncluded: false;
  synthetic: true;
}

export interface RevokedVerificationAssignment {
  assignmentId: string;
  caseId: string;
  status: 'revoked';
  endedAt: string;
  grantsRevoked: number;
  synthetic: true;
}
