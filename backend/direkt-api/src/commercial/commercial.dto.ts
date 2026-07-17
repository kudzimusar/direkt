import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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
  CommercialAdjustmentStatus,
  CommercialPaymentStatus,
  CommercialProductStatus,
  CommercialReconciliationStatus,
  CommercialSubscriptionStatus,
} from './commercial.types';

export class CreateCommercialSubscriptionDto {
  @ApiProperty()
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{2,63}$/)
  productKey!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{2,79}$/)
  priceKey!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class CommercialPolicyDto {
  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class CancelCommercialSubscriptionDto extends CommercialPolicyDto {
  @ApiProperty({ minimum: 1, maximum: 2147483647 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  expectedRevision!: number;

  @ApiProperty()
  @IsString()
  @Length(12, 500)
  reason!: string;
}

export class TransitionCommercialSubscriptionDto extends CancelCommercialSubscriptionDto {
  @ApiProperty({ enum: ['active', 'grace', 'past_due', 'cancelled', 'expired'] })
  @IsIn(['active', 'grace', 'past_due', 'cancelled', 'expired'])
  targetStatus!: Exclude<CommercialSubscriptionStatus, 'pending'>;
}

export class CreateCommercialPaymentIntentDto extends CommercialPolicyDto {}

export class CancelCommercialPaymentIntentDto extends CommercialPolicyDto {
  @ApiProperty({ minimum: 1, maximum: 2147483647 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  expectedRevision!: number;
}

export class SyntheticPaymentWebhookDto {
  @ApiProperty()
  @IsString()
  @Length(8, 160)
  externalEventId!: string;

  @ApiProperty({ example: 'payment.succeeded' })
  @IsString()
  @Matches(/^[a-z][a-z0-9_.]{2,79}$/)
  eventType!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  paymentIntentId!: string;

  @ApiProperty({ enum: ['processing', 'succeeded', 'failed', 'cancelled', 'expired', 'reversed'] })
  @IsIn(['processing', 'succeeded', 'failed', 'cancelled', 'expired', 'reversed'])
  targetStatus!: Extract<
    CommercialPaymentStatus,
    'processing' | 'succeeded' | 'failed' | 'cancelled' | 'expired' | 'reversed'
  >;

  @ApiProperty()
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]{2,79}$/)
  reasonCode!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  occurredAt!: string;

  @ApiProperty({ minimum: 1, maximum: 2147483647 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  amountMinor!: number;

  @ApiProperty({ example: 'ZMW' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class TransitionReconciliationCaseDto extends CommercialPolicyDto {
  @ApiProperty({ enum: ['investigating', 'resolved', 'closed'] })
  @IsIn(['investigating', 'resolved', 'closed'])
  targetStatus!: Exclude<CommercialReconciliationStatus, 'open'>;

  @ApiProperty({ minimum: 1, maximum: 2147483647 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  expectedRevision!: number;

  @ApiProperty()
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]{2,79}$/)
  reasonCode!: string;

  @ApiProperty()
  @IsString()
  @Length(12, 1000)
  reason!: string;
}

export class RequestCommercialAdjustmentDto extends CommercialPolicyDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  providerId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  paymentIntentId?: string;

  @ApiProperty({ enum: ['credit', 'debit', 'synthetic_refund'] })
  @IsIn(['credit', 'debit', 'synthetic_refund'])
  adjustmentType!: 'credit' | 'debit' | 'synthetic_refund';

  @ApiProperty({ example: 'ZMW' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @ApiProperty({ minimum: 1, maximum: 2147483647 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  amountMinor!: number;

  @ApiProperty()
  @IsString()
  @Length(20, 1000)
  reason!: string;
}

export class DecideCommercialAdjustmentDto extends CommercialPolicyDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsIn(['approved', 'rejected'])
  decision!: Extract<CommercialAdjustmentStatus, 'approved' | 'rejected'>;

  @ApiProperty()
  @IsString()
  @Length(12, 1000)
  reason!: string;
}

export class TransitionCommercialProductDto extends CommercialPolicyDto {
  @ApiProperty({ enum: ['active', 'retired'] })
  @IsIn(['active', 'retired'])
  targetStatus!: CommercialProductStatus;

  @ApiProperty()
  @IsString()
  @Length(12, 1000)
  reason!: string;
}
