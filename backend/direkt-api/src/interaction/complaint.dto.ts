import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";
import type {
  InteractionComplaintStatus,
  InteractionComplaintType,
} from "./complaint.types";

export class CreateInteractionComplaintDto {
  @ApiProperty({
    enum: ["service_quality", "contact_privacy", "provider_conduct", "other"],
  })
  @IsIn(["service_quality", "contact_privacy", "provider_conduct", "other"])
  complaintType!: InteractionComplaintType;

  @ApiProperty()
  @IsString()
  @Length(20, 1000)
  summary!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class TransitionInteractionComplaintDto {
  @ApiProperty({ enum: ["triaged", "resolved", "closed"] })
  @IsIn(["triaged", "resolved", "closed"])
  targetStatus!: Extract<
    InteractionComplaintStatus,
    "triaged" | "resolved" | "closed"
  >;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  expectedRevision!: number;

  @ApiProperty()
  @IsString()
  @Length(12, 1000)
  reason!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class OperationsComplaintQueryDto {
  @ApiPropertyOptional({ enum: ["submitted", "triaged", "resolved", "closed"] })
  @IsOptional()
  @IsIn(["submitted", "triaged", "resolved", "closed"])
  status?: InteractionComplaintStatus;
}
