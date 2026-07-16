import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RevokeEvidenceAccessGrantDto {
  @ApiProperty({
    example: 'Assigned reviewer ended this synthetic evidence access authorization.',
  })
  @IsString()
  @Length(8, 500)
  reason!: string;
}
