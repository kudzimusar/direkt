import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

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
    description: 'Explicit consent is required before a premises point can be copied into public discovery.',
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
    example:
      'POLYGON((28.25 -15.50, 28.45 -15.50, 28.45 -15.30, 28.25 -15.30, 28.25 -15.50))',
    description: 'Synthetic WGS84 service-area polygon. It is distinct from the private base and public premises.',
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
