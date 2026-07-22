import { IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class RegisterPushDeviceDto {
  @IsUUID()
  installationId!: string;

  @IsString()
  @Length(20, 4096)
  token!: string;

  @IsIn(['android'])
  platform!: 'android';

  @IsOptional()
  @IsString()
  @Length(1, 80)
  appVersion?: string;
}
