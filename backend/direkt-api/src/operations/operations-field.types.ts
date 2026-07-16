export type OperationsFieldWorkState =
  | 'scheduled'
  | 'accepted'
  | 'in_progress'
  | 'submitted'
  | 'missed'
  | 'unable_to_verify'
  | 'safety_abort'
  | 'cancelled'
  | 'reassigned';

export type OperationsFieldOutcome =
  | 'completed'
  | 'inconclusive'
  | 'unable_to_access'
  | 'safety_abort'
  | 'missed'
  | 'unable_to_verify';

export type OperationsFieldObservationResult =
  | 'confirmed'
  | 'not_confirmed'
  | 'not_observed'
  | 'not_applicable';

export interface OperationsFieldObservation {
  key: string;
  result: OperationsFieldObservationResult;
  note: string | null;
}

export interface OperationsFieldSubmissionView {
  submissionId: string;
  workItemId: string;
  caseId: string;
  outcome: OperationsFieldOutcome;
  checklistVersion: string;
  publicSafeSummary: string;
  observations: OperationsFieldObservation[];
  evidenceReferenceCount: number;
  policyVersion: string;
  occurredAt: string;
  recordedAt: string;
  advisoryOnly: true;
  privateNotesIncluded: false;
  evidenceIdentifiersIncluded: false;
  privateCoordinatesIncluded: false;
  synthetic: true;
}

export interface OperationsFieldWorkItem {
  workItemId: string;
  caseId: string;
  providerId: string;
  providerDisplayName: string;
  categoryKey: string;
  categoryName: string;
  requirementKey: string;
  requirementLabel: string;
  checkKey: string;
  checkFamily: string;
  verificationAssignmentId: string;
  fieldAgentIdentityId: string;
  template: {
    templateKey: string;
    version: number;
    title: string;
    policyVersion: string;
  };
  state: OperationsFieldWorkState;
  scheduledFor: string;
  dueAt: string;
  assignmentReason: string;
  policyVersion: string;
  acceptedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  terminalReason: string | null;
  replacedByWorkItemId: string | null;
  submission: OperationsFieldSubmissionView | null;
  advisoryOnly: true;
  privateNotesIncluded: false;
  privateCoordinatesIncluded: false;
  evidenceIdentifiersIncluded: false;
  synthetic: true;
}

export interface OperationsFieldQueue {
  scope: 'mine' | 'all';
  generatedAt: string;
  summary: {
    total: number;
    scheduled: number;
    inProgress: number;
    overdue: number;
    terminal: number;
  };
  items: OperationsFieldWorkItem[];
  synthetic: true;
}
