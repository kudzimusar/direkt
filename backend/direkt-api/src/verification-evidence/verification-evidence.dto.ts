import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
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
} from 'class-validator';
import type {
  DecisionResult,
  EvidenceClass,
  RecommendationResult,
  VerificationAssignmentKind,
  VerificationCheckFamily,
} from './verification-evidence.types';

export class CreateUploadSessionDto {
  @ApiPropertyOptional({ example: 'plumbing' })
  @IsOptional()
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  categoryKey?: string;

  @ApiProperty({ example: 'identity' })
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  requirementKey!: string;

  @ApiProperty({
    enum: [
      'contact',
      'identity',
      'business',
      'qualification',
      'licence',
      'experience',
      'location',
      'premises',
      'field',
    ],
  })
  @IsIn([
    'contact',
    'identity',
    'business',
    'qualification',
    'licence',
    'experience',
    'location',
    'premises',
    'field',
  ])
  evidenceClass!: EvidenceClass;

  @ApiProperty({ example: 'national_identity_document' })
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  documentType!: string;

  @ApiProperty({
    enum: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  })
  @IsIn(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
  contentType!: string;

  @ApiProperty({ minimum: 1024, maximum: 20971520 })
  @IsInt()
  @Min(1024)
  @Max(20_971_520)
  maxBytes!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  consentConfirmed!: boolean;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  replacementForEvidenceId?: string;
}

export class ConfirmEvidenceDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  uploadSessionId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiProperty({ example: 'a'.repeat(64) })
  @Matches(/^[0-9a-f]{64}$/)
  sha256!: string;

  @ApiProperty({ minimum: 1, maximum: 20971520 })
  @IsInt()
  @Min(1)
  @Max(20_971_520)
  sizeBytes!: number;

  @ApiPropertyOptional({ example: 'Synthetic issuing authority' })
  @IsOptional()
  @IsString()
  @Length(2, 180)
  issuingAuthority?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ enum: ['short', 'standard', 'regulated', 'legal_hold'] })
  @IsIn(['short', 'standard', 'regulated', 'legal_hold'])
  retentionClass!: 'short' | 'standard' | 'regulated' | 'legal_hold';
}

export class CreateVerificationCaseDto {
  @ApiProperty({ example: 'plumbing' })
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  categoryKey!: string;

  @ApiProperty({ example: 'identity' })
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  requirementKey!: string;

  @ApiProperty({ example: 'representative_identity_check' })
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  checkKey!: string;

  @ApiProperty({
    enum: [
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
    ],
  })
  @IsIn([
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
  ])
  checkFamily!: VerificationCheckFamily;

  @ApiProperty({ example: false })
  @IsBoolean()
  highRisk!: boolean;

  @ApiProperty({ example: 'phase4-v1' })
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class AssignVerificationCaseDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  assigneeIdentityId!: string;

  @ApiProperty({ enum: ['reviewer', 'field_agent', 'supervisor'] })
  @IsIn(['reviewer', 'field_agent', 'supervisor'])
  assignmentKind!: VerificationAssignmentKind;

  @ApiProperty({ example: 'Synthetic assignment for Phase 4 review' })
  @IsString()
  @Length(12, 240)
  reason!: string;
}

export class CreateRecommendationDto {
  @ApiProperty({ enum: ['approve', 'reject', 'correction_required', 'revoke'] })
  @IsIn(['approve', 'reject', 'correction_required', 'revoke'])
  result!: RecommendationResult;

  @ApiProperty({ example: 'CHECK_PASSED' })
  @Matches(/^[A-Z][A-Z0-9_]{2,63}$/)
  reasonCode!: string;

  @ApiProperty({
    example: 'The synthetic evidence matches the scoped requirement and review checklist.',
  })
  @IsString()
  @Length(20, 1000)
  rationale!: string;

  @ApiPropertyOptional({ example: 'This check does not guarantee future workmanship.' })
  @IsOptional()
  @IsString()
  @Length(8, 500)
  limitation?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  recommendedValidUntil?: string;
}

export class CreateDecisionDto {
  @ApiProperty({ enum: ['approved', 'rejected', 'correction_required', 'revoked'] })
  @IsIn(['approved', 'rejected', 'correction_required', 'revoked'])
  result!: DecisionResult;

  @ApiProperty({ example: 'CHECK_PASSED' })
  @Matches(/^[A-Z][A-Z0-9_]{2,63}$/)
  reasonCode!: string;

  @ApiProperty({
    example: 'The scoped check passed after review of the synthetic private evidence record.',
  })
  @IsString()
  @Length(20, 1000)
  rationale!: string;

  @ApiPropertyOptional({ example: 'representative_identity_checked' })
  @IsOptional()
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  claimKey?: string;

  @ApiPropertyOptional({ example: 'Representative identity checked' })
  @IsOptional()
  @IsString()
  @Length(8, 240)
  claimStatement?: string;

  @ApiPropertyOptional({
    example: 'This does not verify qualifications, safety or future workmanship.',
  })
  @IsOptional()
  @IsString()
  @Length(8, 500)
  limitation?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiProperty({ example: 'phase4-v1' })
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class CreateFieldVisitDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  assignmentId!: string;

  @ApiProperty({
    enum: ['completed', 'inconclusive', 'unable_to_access', 'safety_abort'],
  })
  @IsIn(['completed', 'inconclusive', 'unable_to_access', 'safety_abort'])
  outcome!: 'completed' | 'inconclusive' | 'unable_to_access' | 'safety_abort';

  @ApiProperty({ example: 'field-checklist-v1' })
  @IsString()
  @Length(3, 80)
  checklistVersion!: string;

  @ApiProperty({
    example: 'Synthetic visit recorded without private coordinates or identifying imagery.',
  })
  @IsString()
  @Length(12, 500)
  publicSafeSummary!: string;

  @ApiPropertyOptional({ example: 'Synthetic private note. No real address or evidence.' })
  @IsOptional()
  @IsString()
  @Length(8, 1000)
  privateNotes?: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  occurredAt!: string;
}

export class RevokeEvidenceDto {
  @ApiProperty({ example: 'Provider withdrew this synthetic evidence record.' })
  @IsString()
  @Length(8, 500)
  reason!: string;
}

export class ExpireClaimsDto {
  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  asOf?: string;
}
