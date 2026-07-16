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
