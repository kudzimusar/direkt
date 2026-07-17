import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import type { EnquiryPreferredChannel, EnquiryStatus, EnquiryTiming } from './interaction.types';

export class CreateEnquiryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  publicProviderId!: string;

  @ApiProperty()
  @IsString()
  @Length(20, 1000)
  serviceSummary!: string;

  @ApiProperty({ enum: ['urgent', 'within_week', 'flexible', 'scheduled'] })
  @IsIn(['urgent', 'within_week', 'flexible', 'scheduled'])
  timing!: EnquiryTiming;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  requestedFor?: string;

  @ApiProperty()
  @IsString()
  @Length(3, 160)
  localitySummary!: string;

  @ApiProperty({ enum: ['call', 'whatsapp', 'none'] })
  @IsIn(['call', 'whatsapp', 'none'])
  preferredChannel!: EnquiryPreferredChannel;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class TransitionEnquiryDto {
  @ApiProperty({
    enum: ['acknowledged', 'needs_information', 'accepted', 'declined', 'closed'],
  })
  @IsIn(['acknowledged', 'needs_information', 'accepted', 'declined', 'closed'])
  targetStatus!: Extract<
    EnquiryStatus,
    'acknowledged' | 'needs_information' | 'accepted' | 'declined' | 'closed'
  >;

  @ApiProperty({ minimum: 1, maximum: 2147483647 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  expectedRevision!: number;

  @ApiProperty()
  @IsString()
  @Length(8, 500)
  reason!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class CancelEnquiryDto {
  @ApiProperty({ minimum: 1, maximum: 2147483647 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  expectedRevision!: number;

  @ApiProperty()
  @IsString()
  @Length(8, 500)
  reason!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}
