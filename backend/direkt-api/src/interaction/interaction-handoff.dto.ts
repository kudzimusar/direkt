import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, IsUUID, Length } from 'class-validator';
import type { ContactHandoffChannel } from './interaction-handoff.types';

export class CreateContactHandoffDto {
  @ApiProperty({ enum: ['call', 'whatsapp'] })
  @IsIn(['call', 'whatsapp'])
  channel!: ContactHandoffChannel;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  contactId!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}

export class RevokeContactHandoffDto {
  @ApiProperty()
  @IsString()
  @Length(8, 500)
  reason!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 80)
  policyVersion!: string;
}
