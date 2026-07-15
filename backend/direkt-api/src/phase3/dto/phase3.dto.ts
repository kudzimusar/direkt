import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { OPERATING_MODELS, PROFILE_STATES, PROVIDER_PATHWAYS } from '../provider-policy';

export class UpsertCustomerProfileDto {
  @IsString()
  @Length(2, 80)
  preferredName!: string;

  @IsString()
  @IsIn(['en-ZM', 'bem-ZM', 'nya-ZM'])
  locale!: string;
}

export class CreateProviderDraftDto {
  @IsString()
  @IsIn(PROVIDER_PATHWAYS)
  pathway!: (typeof PROVIDER_PATHWAYS)[number];

  @IsString()
  @Length(2, 120)
  displayName!: string;

  @IsString()
  @IsIn(OPERATING_MODELS)
  operatingModel!: (typeof OPERATING_MODELS)[number];

  @IsOptional()
  @IsString()
  @Length(2, 160)
  serviceAreaLabel?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  premisesLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  description?: string;
}

export class UpdateProviderProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @IsIn(OPERATING_MODELS)
  operatingModel?: (typeof OPERATING_MODELS)[number];

  @IsOptional()
  @IsString()
  @Length(2, 160)
  serviceAreaLabel?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  premisesLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  description?: string;
}

export class TransitionProviderProfileDto {
  @IsString()
  @IsIn(PROFILE_STATES)
  targetState!: (typeof PROFILE_STATES)[number];
}

export class AssignRepresentativeDto {
  @IsUUID()
  identityId!: string;

  @IsString()
  @IsIn(['provider_member', 'provider_responder'])
  role!: 'provider_member' | 'provider_responder';

  @IsString()
  @Length(8, 240)
  reason!: string;
}

export class SelectCategoryDto {
  @IsUUID()
  requirementVersionId!: string;
}

export class CategoryRequirementInputDto {
  @IsString()
  @Length(2, 64)
  key!: string;

  @IsString()
  @Length(2, 120)
  label!: string;

  @IsString()
  @Length(2, 80)
  kind!: string;
}

export class CreateCategoryRequirementVersionDto {
  @IsUUID()
  categoryId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryRequirementInputDto)
  requirements!: CategoryRequirementInputDto[];
}
