export type OperationsIncidentStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';
export type OperationsIncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface OperationsIncidentView {
  incidentId: string;
  recordType: 'operations_complaint' | 'operations_incident';
  providerId: string;
  providerDisplayName: string;
  caseId: string | null;
  evidenceLinked: boolean;
  categoryCode: string;
  severity: OperationsIncidentSeverity;
  summary: string;
  status: OperationsIncidentStatus;
  ownerIdentityId: string;
  dueAt: string;
  policyVersion: string;
  resolutionCode: string | null;
  resolutionSummary: string | null;
  resolvedAt: string | null;
  createdAt: string;
  source: 'operations_internal';
  privateDetailsIncluded: false;
  customerInteractionIncluded: false;
  privateEvidenceIncluded: false;
  privateCoordinatesIncluded: false;
  synthetic: true;
}

export interface OperationsExpiryItem {
  recordType: 'evidence' | 'claim';
  providerId: string;
  providerDisplayName: string;
  recordId: string;
  recordKey: string;
  recordLabel: string;
  status: string;
  expiresAt: string;
  daysRemaining: number;
  actionState: 'current' | 'due_soon' | 'renew_now';
  documentContentIncluded: false;
  objectKeyIncluded: false;
  privateCoordinatesIncluded: false;
  synthetic: true;
}

export interface OperationsMetricsSnapshot {
  generatedAt: string;
  triageTotal: number;
  triageOverdue: number;
  triageBreached: number;
  decisionsLast30Days: number;
  correctionsLast30Days: number;
  fieldWorkActive: number;
  fieldWorkCompletedLast30Days: number;
  escalationsActive: number;
  incidentsActive: number;
  evidenceDue: number;
  claimsDue: number;
  aggregateOnly: true;
  privateIdentifiersIncluded: false;
  synthetic: true;
}

export interface OperationsMetricsExport {
  schemaVersion: 'phase7-v1';
  generatedAt: string;
  format: 'json';
  fields: Array<{ key: string; value: number }>;
  allowlistedFieldsOnly: true;
  providerIdentifiersIncluded: false;
  evidenceIdentifiersIncluded: false;
  privateCoordinatesIncluded: false;
  synthetic: true;
}
