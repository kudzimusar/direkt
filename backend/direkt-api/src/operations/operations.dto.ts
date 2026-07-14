import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class EmergencyActionDto {
  @ApiProperty({ example: 'synthetic-access-review' })
  @IsString()
  @Matches(/^[a-z][a-z0-9-]{2,63}$/)
  action!: string;

  @ApiProperty({ example: 'Synthetic Phase 2C audit-path verification only' })
  @IsString()
  @Length(12, 240)
  reason!: string;
}
