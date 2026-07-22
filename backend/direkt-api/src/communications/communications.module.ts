import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DisabledEmailProviderAdapter } from './disabled-email-provider.adapter';
import { DisabledPushProviderAdapter } from './disabled-push-provider.adapter';
import { EMAIL_PROVIDER } from './email-provider.port';
import { EmailOutboxService } from './email-outbox.service';
import { FcmPushProviderAdapter } from './fcm-push-provider.adapter';
import { PUSH_PROVIDER } from './push-provider.port';
import { PushDeviceController } from './push-device.controller';
import { PushDeviceTokenService } from './push-device-token.service';
import { PushOutboxService } from './push-outbox.service';
import { ResendEmailProviderAdapter } from './resend-email-provider.adapter';

@Module({
  controllers: [PushDeviceController],
  providers: [
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mode = configService.getOrThrow<string>('EMAIL_PROVIDER_MODE');
        if (mode === 'disabled') {
          return new DisabledEmailProviderAdapter();
        }
        return new ResendEmailProviderAdapter(
          configService.getOrThrow<string>('EMAIL_RESEND_API_KEY'),
          configService.getOrThrow<number>('EMAIL_REQUEST_TIMEOUT_MS'),
        );
      },
    },
    {
      provide: PUSH_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mode = configService.getOrThrow<string>('PUSH_PROVIDER_MODE');
        if (mode === 'disabled') {
          return new DisabledPushProviderAdapter();
        }
        return new FcmPushProviderAdapter(
          configService.getOrThrow<string>('FIREBASE_PROJECT_ID'),
          configService.getOrThrow<number>('PUSH_REQUEST_TIMEOUT_MS'),
        );
      },
    },
    EmailOutboxService,
    PushDeviceTokenService,
    PushOutboxService,
  ],
  exports: [EmailOutboxService, PushDeviceTokenService, PushOutboxService],
})
export class CommunicationsModule {}
