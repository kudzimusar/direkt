import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DisabledEmailProviderAdapter } from './disabled-email-provider.adapter';
import { EMAIL_PROVIDER } from './email-provider.port';
import { EmailOutboxService } from './email-outbox.service';
import { ResendEmailProviderAdapter } from './resend-email-provider.adapter';

@Module({
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
    EmailOutboxService,
  ],
  exports: [EmailOutboxService],
})
export class CommunicationsModule {}
