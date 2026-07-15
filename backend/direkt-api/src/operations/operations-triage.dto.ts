import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import type {
  VerificationCaseStatus,
  VerificationCheckFamily,
} from '../verification-evidence/verification-evidence.types';
import type {
  OperationsTriageOwnership,
  OperationsTriageSlaState,
} from './operations-triage.types';

const TRIAGE_STATUSES: VerificationCaseStatus[] = [
  'ready_for_review',
  'assigned',
  'in_review',
  'correction_required',
  'appealed',
];

const TRIAGE_CHECK_FAMILIES: VerificationCheckFamily[] = [
  'contact',
  'representative_identity',
  'business',
  'qualification',
  'licence',
  'location',
  'premises',
  'field_visit',
  'category_eligibility',
  'good_standing',
];

export class OperationsTriageQueryDto {
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @IsOptional()
  @IsIn(TRIAGE_STATUSES)
  status?: VerificationCaseStatus;

  @IsOptional()
  @IsIn(['on_track', 'due_soon', 'overdue', 'breached'])
  slaState?: OperationsTriageSlaState;

  @IsOptional()
  @IsIn(['mine', 'unassigned', 'other'])
  ownership?: OperationsTriageOwnership;

  @IsOptional()
  @IsIn(TRIAGE_CHECK_FAMILIES)
  checkFamily?: VerificationCheckFamily;

  @IsOptional()
  @IsIn(['true', 'false'])
  highRisk?: 'true' | 'false';

  @IsOptional()
  @IsIn(['true', 'false'])
  escalationRequired?: 'true' | 'false';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 100;
}
