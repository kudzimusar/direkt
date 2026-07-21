import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EmailOutboxService } from './email-outbox.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const outbox = app.get(EmailOutboxService);
    const receipt = await outbox.runSyntheticCanary();
    process.stdout.write(
      `${JSON.stringify({
        event: 'resend_synthetic_canary_passed',
        eventId: receipt.eventId,
        provider: receipt.provider,
        messageId: receipt.messageId,
        status: receipt.status,
        attempts: receipt.attempts,
      })}\n`,
    );
  } finally {
    await app.close();
  }
}

void main().catch((error: unknown) => {
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  process.stderr.write(
    `${JSON.stringify({ event: 'resend_synthetic_canary_failed', errorName })}\n`,
  );
  process.exitCode = 1;
});
