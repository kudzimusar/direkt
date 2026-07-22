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

function readIntegerConfig(
  configService: ConfigService,
  key: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const raw = configService.get<string | number>(key) ?? fallback;
  const value = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${key} must be an integer from ${minimum} to ${maximum}.`);
  }
  return value;
}

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
        const mode = configService.get<string>('PUSH_PROVIDER_MODE') ?? 'disabled';
        if (mode === 'disabled') {
          return new DisabledPushProviderAdapter();
        }
        if (mode !== 'fcm') {
          throw new Error('Unsupported PUSH_PROVIDER_MODE.');
        }
        if (
          configService.get<string>('NODE_ENV') === 'production' ||
          configService.get<string>('DIREKT_DATA_MODE') !== 'synthetic-only'
        ) {
          throw new Error(
            'FCM provider activation currently permits synthetic-only non-production use.',
          );
        }
        const projectId = configService.get<string>('FIREBASE_PROJECT_ID')?.trim() ?? '';
        if (!/^[a-z][a-z0-9-]{4,29}$/.test(projectId)) {
          throw new Error('FCM provider requires a valid FIREBASE_PROJECT_ID.');
        }
        const timeoutMs = readIntegerConfig(
          configService,
          'PUSH_REQUEST_TIMEOUT_MS',
          8_000,
          1_000,
          30_000,
        );
        return new FcmPushProviderAdapter(projectId, timeoutMs);
      },
    },
    EmailOutboxService,
    PushDeviceTokenService,
    PushOutboxService,
  ],
  exports: [EmailOutboxService, PushDeviceTokenService, PushOutboxService],
})
export class CommunicationsModule {}
