import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsISO8601, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CreatePilotInvitationDto {
  @ApiProperty({ example: '+260971234567' })
  @Matches(/^\+260\d{9}$/)
  phoneNumber!: string;

  @ApiProperty({ enum: ['customer', 'provider'] })
  @IsIn(['customer', 'provider'])
  participantType!: 'customer' | 'provider';

  @ApiProperty({ minimum: 1, maximum: 3 })
  @IsInt()
  @Min(1)
  @Max(3)
  cohortWave!: number;

  @ApiProperty({ format: 'date-time' })
  @IsISO8601()
  expiresAt!: string;
}

export class RevokePilotInvitationDto {
  @ApiProperty({ example: 'Participant withdrew before enrollment' })
  @IsString()
  @Length(8, 160)
  reason!: string;
}
