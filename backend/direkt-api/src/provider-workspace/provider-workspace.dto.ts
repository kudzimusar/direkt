import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { EvidenceClass } from '../verification-evidence/verification-evidence.types';

export class UpdateWorkspaceLocationDto {
  @ApiPropertyOptional({ example: -15.421 })
  @IsOptional()
  @IsLatitude()
  privateBaseLatitude?: number;

  @ApiPropertyOptional({ example: 28.335 })
  @IsOptional()
  @IsLongitude()
  privateBaseLongitude?: number;

  @ApiPropertyOptional({ example: -15.42 })
  @IsOptional()
  @IsLatitude()
  publicPremisesLatitude?: number;

  @ApiPropertyOptional({ example: 28.34 })
  @IsOptional()
  @IsLongitude()
  publicPremisesLongitude?: number;

  @ApiProperty({
    description:
      'Explicit consent is required before a premises point can be copied into public discovery.',
    default: false,
  })
  @IsBoolean()
  publicPremisesConsent!: boolean;

  @ApiProperty({ example: 'Woodlands, Lusaka' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  publicLocality!: string;

  @ApiProperty({
    example: 'POLYGON((28.25 -15.50, 28.45 -15.50, 28.45 -15.30, 28.25 -15.30, 28.25 -15.50))',
    description:
      'Synthetic WGS84 service-area polygon. It is distinct from the private base and public premises.',
  })
  @IsString()
  @Matches(/^POLYGON\(\(.+\)\)$/i, { message: 'serviceAreaWkt must be a POLYGON WKT value.' })
  @MaxLength(8000)
  serviceAreaWkt!: string;
}

export class UpdateWorkspaceAvailabilityDto {
  @ApiProperty({ enum: ['available', 'limited', 'unavailable', 'unknown'] })
  @IsIn(['available', 'limited', 'unavailable', 'unknown'])
  state!: 'available' | 'limited' | 'unavailable' | 'unknown';

  @ApiPropertyOptional({ example: '2026-07-20T08:00:00.000Z' })
  @ValidateIf((value: UpdateWorkspaceAvailabilityDto) => value.state === 'limited')
  @IsDateString()
  nextAvailableAt?: string;
}

export class RemoveWorkspaceServiceDto {
  @ApiProperty({ example: 'Provider no longer offers this synthetic service.' })
  @IsString()
  @MinLength(12)
  @MaxLength(500)
  reason!: string;
}

export class CreateWorkspaceUploadIntentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  caseId!: string;

  @ApiProperty({ example: 'android-1712345678-identity-front' })
  @Matches(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/)
  clientIntentKey!: string;

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

  @ApiProperty({ enum: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] })
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

export class ConfirmWorkspaceUploadDto {
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
  @MinLength(2)
  @MaxLength(180)
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

export class MarkWorkspaceUploadInterruptedDto {
  @ApiProperty({ example: 'NETWORK_INTERRUPTED' })
  @Matches(/^[A-Z][A-Z0-9_]{2,63}$/)
  errorCode!: string;
}

export class CancelWorkspaceUploadDto {
  @ApiProperty({ example: 'Provider cancelled the synthetic upload before submission.' })
  @IsString()
  @MinLength(12)
  @MaxLength(500)
  reason!: string;
}
