import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WhatsAppWebhookCanaryModule } from './whatsapp-webhook-canary.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WhatsAppWebhookCanaryModule, {
    bufferLogs: true,
    rawBody: true,
  });
  app.setGlobalPrefix('api/v1');
  const config = app.get(ConfigService);
  await app.listen(config.getOrThrow<number>('PORT'), '0.0.0.0');
}

void bootstrap();
