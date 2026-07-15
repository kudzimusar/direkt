import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, Length, MaxLength, MinLength } from 'class-validator';
import type {
  OperatingModel,
  ProviderPathway,
  ProviderRepresentativeRole,
  ProviderStatus,
} from './provider.types';

export class UpsertCustomerProfileDto {
  @ApiProperty({ example: 'Synthetic customer' })
  @IsString()
  @Length(2, 120)
  displayName!: string;
}

export class CreateProviderDto {
  @ApiProperty({
    enum: ['registered_business', 'qualified_individual', 'experienced_informal'],
  })
  @IsIn(['registered_business', 'qualified_individual', 'experienced_informal'])
  pathway!: ProviderPathway;

  @ApiProperty({ example: 'Synthetic Copperbelt Repairs' })
  @IsString()
  @Length(2, 160)
  displayName!: string;

  @ApiProperty({ enum: ['fixed_premises', 'mobile', 'hybrid'] })
  @IsIn(['fixed_premises', 'mobile', 'hybrid'])
  operatingModel!: OperatingModel;

  @ApiPropertyOptional({ example: 'Woodlands, Lusaka' })
  @IsOptional()
  @IsString()
  @Length(2, 160)
  localitySummary?: string;

  @ApiProperty({ example: 'Woodlands and nearby Lusaka neighbourhoods' })
  @IsString()
  @Length(2, 240)
  serviceAreaSummary!: string;

  @ApiPropertyOptional({ example: 'Synthetic Copperbelt Repairs Limited' })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  registeredBusinessName?: string;

  @ApiPropertyOptional({ example: 'Synthetic trade qualification summary only' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(500)
  qualificationSummary?: string;

  @ApiPropertyOptional({ example: 'Synthetic structured experience summary only' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(500)
  experienceSummary?: string;
}

export class UpdateProviderProfileDto {
  @ApiPropertyOptional({ example: 'Synthetic Copperbelt Repair Collective' })
  @IsOptional()
  @IsString()
  @Length(2, 160)
  displayName?: string;

  @ApiPropertyOptional({ enum: ['fixed_premises', 'mobile', 'hybrid'] })
  @IsOptional()
  @IsIn(['fixed_premises', 'mobile', 'hybrid'])
  operatingModel?: OperatingModel;

  @ApiPropertyOptional({ example: 'Woodlands, Lusaka' })
  @IsOptional()
  @IsString()
  @Length(2, 160)
  localitySummary?: string;

  @ApiPropertyOptional({ example: 'Woodlands and nearby Lusaka neighbourhoods' })
  @IsOptional()
  @IsString()
  @Length(2, 240)
  serviceAreaSummary?: string;

  @ApiPropertyOptional({ example: 'Synthetic Copperbelt Repairs Limited' })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  registeredBusinessName?: string;

  @ApiPropertyOptional({ example: 'Synthetic trade qualification summary only' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(500)
  qualificationSummary?: string;

  @ApiPropertyOptional({ example: 'Synthetic structured experience summary only' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(500)
  experienceSummary?: string;
}

export class ProviderTransitionDto {
  @ApiProperty({ enum: ['draft', 'ready_for_verification', 'suspended', 'archived'] })
  @IsIn(['draft', 'ready_for_verification', 'suspended', 'archived'])
  targetStatus!: ProviderStatus;

  @ApiProperty({ example: 'Synthetic profile completed for Phase 3 contract testing' })
  @IsString()
  @Length(12, 240)
  reason!: string;
}

export class AddRepresentativeDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  identityId!: string;

  @ApiProperty({ enum: ['provider_member', 'provider_responder'] })
  @IsIn(['provider_member', 'provider_responder'])
  role!: ProviderRepresentativeRole;

  @ApiProperty({ example: 'Synthetic representative assigned for profile preparation' })
  @IsString()
  @Length(12, 240)
  reason!: string;
}