import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RevokeEvidenceReviewGrantDto {
  @ApiProperty({ example: 'Reviewer ended the synthetic evidence access session.' })
  @IsString()
  @MinLength(12)
  @MaxLength(500)
  reason!: string;
}

export class RevokeVerificationAssignmentDto {
  @ApiProperty({ example: 'Reviewer access removed after synthetic reassignment.' })
  @IsString()
  @MinLength(12)
  @MaxLength(500)
  reason!: string;
}
