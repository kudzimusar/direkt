import type {
  VerificationAssignmentKind,
  VerificationCaseStatus,
  VerificationCheckFamily,
} from '../verification-evidence/verification-evidence.types';

export type OperationsTriageSlaState = 'on_track' | 'due_soon' | 'overdue' | 'breached';
export type OperationsTriageOwnership = 'mine' | 'unassigned' | 'other';
export type OperationsTriageScope = 'assigned_and_unassigned' | 'all_cases';

export interface OperationsTriageItem {
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
  casePolicyVersion: string;
  triagePolicyVersion: string;
  ageMinutes: number;
  waitingMinutes: number;
  reviewDueAt: string;
  escalationDueAt: string;
  slaState: OperationsTriageSlaState;
  assignmentId: string | null;
  assigneeIdentityId: string | null;
  assignmentKind: VerificationAssignmentKind | null;
  assignmentState: 'assigned' | 'unassigned';
  ownership: OperationsTriageOwnership;
  evidenceCount: number;
  readyEvidenceCount: number;
  correctionEvidenceCount: number;
  priorityScore: number;
  priorityBand: 'critical' | 'urgent' | 'high' | 'normal';
  escalationRequired: boolean;
  privateEvidenceIncluded: false;
  reviewerNotesIncluded: false;
  privateCoordinatesIncluded: false;
  synthetic: true;
}

export interface OperationsTriageQueue {
  scope: OperationsTriageScope;
  generatedAt: string;
  summary: {
    total: number;
    critical: number;
    breached: number;
    overdue: number;
    dueSoon: number;
    unassigned: number;
    highRisk: number;
    escalationRequired: number;
  };
  items: OperationsTriageItem[];
  synthetic: true;
}
