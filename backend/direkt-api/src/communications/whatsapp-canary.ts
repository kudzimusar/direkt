import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WhatsAppOutboxService } from './whatsapp-outbox.service';

async function main(): Promise<void> {
  const sourceSha = process.env.DIREKT_SOURCE_SHA?.trim() ?? '';
  if (!/^[0-9a-f]{40}$/.test(sourceSha)) {
    throw new Error('DIREKT_SOURCE_SHA must be an exact 40-character source SHA.');
  }
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const outbox = app.get(WhatsAppOutboxService);
    const receipt = await outbox.runSyntheticCanary(sourceSha);
    process.stdout.write(
      `${JSON.stringify({
        event: 'whatsapp_synthetic_canary_accepted',
        eventId: receipt.eventId,
        provider: receipt.provider,
        messageId: receipt.messageId,
        status: receipt.status,
        attempts: receipt.attempts,
        sourceSha,
        productionAuthorization: false,
      })}\n`,
    );
  } finally {
    await app.close();
  }
}

void main().catch((error: unknown) => {
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  process.stderr.write(
    `${JSON.stringify({ event: 'whatsapp_synthetic_canary_failed', errorName })}\n`,
  );
  process.exitCode = 1;
});
