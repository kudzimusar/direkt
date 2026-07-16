import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';
import type {
  OperationsIncidentSeverity,
  OperationsIncidentStatus,
} from './operations-reporting.types';

export class CreateOperationsIncidentDto {
  @ApiProperty({ enum: ['operations_complaint', 'operations_incident'] })
  @IsIn(['operations_complaint', 'operations_incident'])
  recordType!: 'operations_complaint' | 'operations_incident';

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  providerId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  evidenceId?: string;

  @ApiProperty({ example: 'SERVICE_SAFETY_CONCERN' })
  @Matches(/^[A-Z][A-Z0-9_]{2,63}$/)
  categoryCode!: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'] })
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity!: OperationsIncidentSeverity;

  @ApiProperty({ example: 'Synthetic internal incident requires scoped operations follow-up.' })
  @IsString()
  @Length(20, 1000)
  summary!: string;

  @ApiPropertyOptional({
    example: 'Synthetic internal-only details with no real customer or private coordinate data.',
  })
  @IsOptional()
  @IsString()
  @Length(8, 4000)
  privateDetails?: string;

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

export class StartOperationsIncidentDto {
  @ApiProperty({ example: 'Assigned operator began the synthetic incident investigation.' })
  @IsString()
  @Length(12, 500)
  reason!: string;
}

export class ResolveOperationsIncidentDto {
  @ApiProperty({ enum: ['resolved', 'dismissed'] })
  @IsIn(['resolved', 'dismissed'])
  targetStatus!: Extract<OperationsIncidentStatus, 'resolved' | 'dismissed'>;

  @ApiProperty({ example: 'INTERNAL_CONTROL_CONFIRMED' })
  @Matches(/^[A-Z][A-Z0-9_]{2,63}$/)
  resolutionCode!: string;

  @ApiProperty({
    example: 'Synthetic internal incident resolved without creating a customer review workflow.',
  })
  @IsString()
  @Length(20, 1000)
  resolutionSummary!: string;
}
