import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommercialOperationsController } from './commercial-operations.controller';
import { CommercialController, CommercialWebhookController } from './commercial.controller';
import { CommercialRepository } from './commercial.repository';
import { CommercialService } from './commercial.service';
import { DisabledPaymentProviderAdapter } from './disabled-payment-provider.adapter';
import { PAYMENT_PROVIDER } from './payment-provider.port';
import { SyntheticPaymentProviderAdapter } from './synthetic-payment-provider.adapter';

@Module({
  controllers: [CommercialController, CommercialWebhookController, CommercialOperationsController],
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow<'synthetic' | 'disabled'>('PAYMENT_PROVIDER_MODE') === 'synthetic'
          ? new SyntheticPaymentProviderAdapter(configService)
          : new DisabledPaymentProviderAdapter(),
    },
    CommercialRepository,
    CommercialService,
  ],
  exports: [CommercialService],
})
export class CommercialModule {}
