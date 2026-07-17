import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import type { ReviewModerationStatus } from './review.types';

export class CreateReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty()
  @IsString()
  @Length(5, 120)
  title!: string;

  @ApiProperty()
  @IsString()
  @Length(20, 2000)
  body!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class CreateProviderReviewResponseDto {
  @ApiProperty()
  @IsString()
  @Length(10, 1000)
  body!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class CreateReviewAppealDto {
  @ApiProperty()
  @IsString()
  @Length(20, 1000)
  reason!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class ModerateReviewDto {
  @ApiProperty({ enum: ['published', 'withheld', 'removed'] })
  @IsIn(['published', 'withheld', 'removed'])
  targetStatus!: Extract<ReviewModerationStatus, 'published' | 'withheld' | 'removed'>;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  expectedRevision!: number;

  @ApiProperty()
  @IsString()
  @Length(3, 64)
  reasonCode!: string;

  @ApiProperty()
  @IsString()
  @Length(12, 1000)
  reason!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class DecideReviewAppealDto {
  @ApiProperty({ enum: ['upheld', 'denied'] })
  @IsIn(['upheld', 'denied'])
  decisionStatus!: 'upheld' | 'denied';

  @ApiProperty()
  @IsString()
  @Length(3, 64)
  reasonCode!: string;

  @ApiProperty()
  @IsString()
  @Length(12, 1000)
  reason!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class ReportReviewDto {
  @ApiProperty({ enum: ['SPAM', 'PRIVACY', 'ABUSE', 'FRAUD', 'OTHER'] })
  @IsIn(['SPAM', 'PRIVACY', 'ABUSE', 'FRAUD', 'OTHER'])
  reasonCode!: 'SPAM' | 'PRIVACY' | 'ABUSE' | 'FRAUD' | 'OTHER';

  @ApiProperty()
  @IsString()
  @Length(12, 1000)
  detail!: string;
}

export class OperationsReviewQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'published', 'withheld', 'removed', 'appealed'] })
  @IsOptional()
  @IsIn(['pending', 'published', 'withheld', 'removed', 'appealed'])
  status?: ReviewModerationStatus;
}
