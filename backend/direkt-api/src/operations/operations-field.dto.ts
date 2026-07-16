import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type {
  OperationsFieldObservationResult,
  OperationsFieldOutcome,
} from './operations-field.types';

export class OperationsFieldObservationDto {
  @ApiProperty({ example: 'provider_presence' })
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  key!: string;

  @ApiProperty({
    enum: ['confirmed', 'not_confirmed', 'not_observed', 'not_applicable'],
  })
  @IsIn(['confirmed', 'not_confirmed', 'not_observed', 'not_applicable'])
  result!: OperationsFieldObservationResult;

  @ApiPropertyOptional({ example: 'Synthetic structured observation without private location data.' })
  @IsOptional()
  @IsString()
  @Length(4, 500)
  note?: string;
}

export class CreateOperationsFieldWorkDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  caseId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fieldAgentIdentityId!: string;

  @ApiProperty({ example: 'standard_field_inspection' })
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  templateKey!: string;

  @ApiProperty({ minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  templateVersion!: number;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  scheduledFor!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  dueAt!: string;

  @ApiProperty({ example: 'Synthetic field inspection required for the scoped verification check.' })
  @IsString()
  @Length(12, 500)
  reason!: string;

  @ApiProperty({ example: 'phase7-v1' })
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class TransitionOperationsFieldWorkDto {
  @ApiProperty({ enum: ['accepted', 'in_progress'] })
  @IsIn(['accepted', 'in_progress'])
  targetState!: 'accepted' | 'in_progress';

  @ApiProperty({ example: 'Field agent accepted the synthetic assigned inspection.' })
  @IsString()
  @Length(8, 500)
  reason!: string;
}

export class ReassignOperationsFieldWorkDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fieldAgentIdentityId!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  scheduledFor!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  dueAt!: string;

  @ApiProperty({ example: 'Synthetic reassignment after the original field agent became unavailable.' })
  @IsString()
  @Length(12, 500)
  reason!: string;

  @ApiProperty({ example: 'phase7-v1' })
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class CancelOperationsFieldWorkDto {
  @ApiProperty({ example: 'Synthetic inspection cancelled because the scoped case no longer requires a visit.' })
  @IsString()
  @Length(12, 500)
  reason!: string;
}

export class SubmitOperationsFieldInspectionDto {
  @ApiProperty({ example: 'offline-field-submission-0001' })
  @Matches(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/)
  clientSubmissionKey!: string;

  @ApiProperty({
    enum: [
      'completed',
      'inconclusive',
      'unable_to_access',
      'safety_abort',
      'missed',
      'unable_to_verify',
    ],
  })
  @IsIn([
    'completed',
    'inconclusive',
    'unable_to_access',
    'safety_abort',
    'missed',
    'unable_to_verify',
  ])
  outcome!: OperationsFieldOutcome;

  @ApiProperty({ example: 'standard-field-checklist-v1' })
  @IsString()
  @Length(3, 80)
  checklistVersion!: string;

  @ApiProperty({ example: 'Synthetic field inspection completed without recording private coordinates.' })
  @IsString()
  @Length(12, 500)
  publicSafeSummary!: string;

  @ApiPropertyOptional({ example: 'Synthetic internal field note without real personal information.' })
  @IsOptional()
  @IsString()
  @Length(8, 1000)
  privateNotes?: string;

  @ApiProperty({ type: [OperationsFieldObservationDto] })
  @IsArray()
  @ArrayMaxSize(80)
  @ValidateNested({ each: true })
  @Type(() => OperationsFieldObservationDto)
  observations!: OperationsFieldObservationDto[];

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  evidenceReferences?: string[];

  @ApiProperty({ example: 'phase7-v1' })
  @IsString()
  @Length(3, 80)
  policyVersion!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  occurredAt!: string;
}
