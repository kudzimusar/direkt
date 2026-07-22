import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PushOutboxService } from './push-outbox.service';

async function main(): Promise<void> {
  const deviceToken = process.env.FCM_SYNTHETIC_DEVICE_TOKEN?.trim() ?? '';
  const sourceSha = process.env.DIREKT_SOURCE_SHA?.trim() ?? '';
  const phase = process.env.FCM_CANARY_PHASE?.trim();
  if (deviceToken.length < 20 || !/^[0-9a-f]{40}$/.test(sourceSha)) {
    throw new Error('RC4 canary inputs are invalid.');
  }
  if (phase !== 'foreground' && phase !== 'background') {
    throw new Error('RC4 canary phase is invalid.');
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const outbox = app.get(PushOutboxService);
    const receipt = await outbox.runSyntheticCanary(deviceToken, sourceSha, phase);
    process.stdout.write(
      `${JSON.stringify({
        event: 'fcm_synthetic_canary_passed',
        eventId: receipt.eventId,
        provider: receipt.provider,
        messageId: receipt.messageId,
        status: receipt.status,
        attempts: receipt.attempts,
        phase: receipt.phase,
        sourceSha,
      })}\n`,
    );
  } finally {
    await app.close();
  }
}

void main().catch((error: unknown) => {
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  process.stderr.write(`${JSON.stringify({ event: 'fcm_synthetic_canary_failed', errorName })}\n`);
  process.exitCode = 1;
});
