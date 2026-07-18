import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Equals,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { ContactChannel } from './contact-normalizer';

export class RequestChallengeDto {
  @ApiProperty({ enum: ['email', 'phone'] })
  @IsIn(['email', 'phone'])
  channel!: ContactChannel;

  @ApiProperty({ example: 'operator@example.invalid' })
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  contact!: string;
}

export class VerifyChallengeDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  challengeId!: string;

  @ApiProperty({ example: '246810' })
  @Matches(/^\d{6}$/)
  code!: string;

  @ApiPropertyOptional({ example: 'Synthetic Android device' })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  deviceLabel?: string;
}

export class FirebaseSessionExchangeDto {
  @ApiProperty({
    description: 'Firebase Authentication ID token obtained after phone verification.',
  })
  @IsString()
  @MinLength(100)
  @MaxLength(8192)
  idToken!: string;

  @ApiProperty({ example: 'pilot-notice-v1' })
  @IsString()
  @Length(3, 120)
  noticeVersion!: string;

  @ApiProperty({ example: true, description: 'Must be true after explicit notice acceptance.' })
  @Equals(true)
  consentAccepted!: boolean;

  @ApiPropertyOptional({ example: 'Android pilot device' })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  deviceLabel?: string;
}

export class RotateSessionDto {
  @ApiProperty({ description: 'Opaque rotating refresh token.' })
  @IsString()
  @Matches(/^drt1_[A-Za-z0-9_-]{40,}$/)
  refreshToken!: string;
}

export class RevokeSessionDto {
  @ApiPropertyOptional({ example: 'Device no longer in use' })
  @IsOptional()
  @IsString()
  @Length(8, 160)
  reason?: string;
}
