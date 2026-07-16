export type InteractionComplaintType =
  'service_quality' | 'contact_privacy' | 'provider_conduct' | 'other';
export type InteractionComplaintStatus = 'submitted' | 'triaged' | 'resolved' | 'closed';

export interface InteractionComplaintEventView {
  eventId: string;
  sequence: number;
  fromStatus: InteractionComplaintStatus | null;
  toStatus: InteractionComplaintStatus;
  actorKind: 'customer' | 'operations';
  reason: string;
  policyVersion: string;
  occurredAt: string;
  actorIdentityExposed: false;
}

export interface InteractionComplaintView {
  complaintId: string;
  interactionId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  complaintType: InteractionComplaintType;
  summary: string;
  status: InteractionComplaintStatus;
  revision: number;
  createdAt: string;
  updatedAt: string;
  terminalAt: string | null;
  events: InteractionComplaintEventView[];
  phase7IncidentLinked: false;
  contactIncluded: false;
  privateInteractionDetailIncluded: false;
  actorIdentityExposed: false;
  trustOrRankingMutation: false;
  synthetic: true;
}

export interface OperationsComplaintListView {
  items: InteractionComplaintView[];
  phase7IncidentDataIncluded: false;
}
