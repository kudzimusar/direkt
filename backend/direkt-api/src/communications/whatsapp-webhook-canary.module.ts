import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { environmentSchema } from '../config/environment';
import { DatabaseModule } from '../platform/database/database.module';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';
import { WhatsAppWebhookService } from './whatsapp-webhook.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: environmentSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    DatabaseModule,
  ],
  controllers: [WhatsAppWebhookController],
  providers: [WhatsAppWebhookService],
})
export class WhatsAppWebhookCanaryModule {}
