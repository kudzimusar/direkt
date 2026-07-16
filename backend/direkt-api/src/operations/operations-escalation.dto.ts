import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsString, IsUUID, Length, Matches } from 'class-validator';
import type {
  OperationsEscalationSeverity,
  OperationsOverrideResult,
} from './operations-escalation.types';

export class CreateOperationsEscalationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  caseId!: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'] })
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity!: OperationsEscalationSeverity;

  @ApiProperty({ example: 'REVIEW_SLA_BREACH' })
  @Matches(/^[A-Z][A-Z0-9_]{2,63}$/)
  reasonCode!: string;

  @ApiProperty({ example: 'Synthetic high-priority verification review requires supervisor attention.' })
  @IsString()
  @Length(20, 1000)
  summary!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  ownerIdentityId!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  dueAt!: string;

  @ApiProperty({ example: 'phase7-v1' })
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class StartOperationsEscalationDto {
  @ApiProperty({ example: 'Supervisor accepted ownership of the synthetic escalation.' })
  @IsString()
  @Length(12, 500)
  reason!: string;
}

export class ResolveOperationsEscalationDto {
  @ApiProperty({ enum: ['resolved', 'dismissed'] })
  @IsIn(['resolved', 'dismissed'])
  targetStatus!: 'resolved' | 'dismissed';

  @ApiProperty({ example: 'SCOPE_CONFIRMED' })
  @Matches(/^[A-Z][A-Z0-9_]{2,63}$/)
  resolutionCode!: string;

  @ApiProperty({ example: 'Synthetic escalation resolved after scoped evidence and assignment review.' })
  @IsString()
  @Length(20, 1000)
  resolutionSummary!: string;
}

export class CreateOperationsOverrideDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  caseId!: string;

  @ApiProperty({ enum: ['approved', 'rejected', 'correction_required', 'revoked'] })
  @IsIn(['approved', 'rejected', 'correction_required', 'revoked'])
  requestedResult!: OperationsOverrideResult;

  @ApiProperty({ example: 'CHECK_PASSED' })
  @Matches(/^[A-Z][A-Z0-9_]{2,63}$/)
  reasonCode!: string;

  @ApiProperty({
    example:
      'Synthetic high-risk authorization request backed by the current mandatory evidence snapshot.',
  })
  @IsString()
  @Length(30, 1500)
  rationale!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  dueAt!: string;

  @ApiProperty({ example: 'phase7-v1' })
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class ApproveOperationsOverrideDto {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsIn(['approve', 'reject'])
  decision!: 'approve' | 'reject';

  @ApiProperty({ example: 'Independent synthetic review confirms the authorization request scope.' })
  @IsString()
  @Length(20, 1000)
  rationale!: string;

  @ApiProperty({ example: 'phase7-v1' })
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}
