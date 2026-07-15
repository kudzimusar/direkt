import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class DiscoverySearchDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  q?: string;

  @IsOptional()
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  category?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  area?: string;

  @ValidateIf((value: DiscoverySearchDto) => value.longitude !== undefined)
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @ValidateIf((value: DiscoverySearchDto) => value.latitude !== undefined)
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(100)
  radiusKm?: number;

  @IsOptional()
  @IsIn(['fixed_premises', 'mobile', 'hybrid'])
  operatingModel?: 'fixed_premises' | 'mobile' | 'hybrid';

  @IsOptional()
  @IsIn(['available', 'limited', 'unavailable', 'unknown'])
  availability?: 'available' | 'limited' | 'unavailable' | 'unknown';

  @IsOptional()
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  claim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;

  @IsOptional()
  @IsString()
  @Length(4, 500)
  cursor?: string;
}

export class RefreshPublicationDto {
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  categoryKey!: string;

  @Matches(/^[a-z0-9][a-z0-9_.-]{2,79}$/)
  policyVersion!: string;
}

export class HidePublicationDto {
  @IsString()
  @Length(12, 500)
  reason!: string;
}

export class SaveProviderDto {
  @IsUUID()
  publicProviderId!: string;
}
