import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseService } from '../platform/database/database.service';
import { WhatsAppOutboxService } from './whatsapp-outbox.service';

interface DeliveryReceiptRow {
  status: string;
  provider_status_at: Date | string | null;
  receipt_count: string | number;
}

async function waitForSignedReceipt(
  database: DatabaseService,
  eventId: string,
): Promise<'sent' | 'delivered' | 'read'> {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const result = await database.query<DeliveryReceiptRow>(
      `SELECT delivery.status,
              delivery.provider_status_at,
              COUNT(receipt.id)::text AS receipt_count
         FROM platform.whatsapp_message_deliveries AS delivery
         LEFT JOIN platform.whatsapp_delivery_receipts AS receipt
           ON receipt.provider_message_id = delivery.provider_message_id
        WHERE delivery.outbox_event_id = $1::uuid
        GROUP BY delivery.id`,
      [eventId],
    );
    const row = result.rows[0];
    const receiptCount = Number(row?.receipt_count ?? 0);
    if (
      row?.provider_status_at &&
      receiptCount > 0 &&
      (row.status === 'sent' || row.status === 'delivered' || row.status === 'read')
    ) {
      return row.status;
    }
    if (row?.status === 'failed') {
      throw new Error('WhatsApp managed canary received a signed provider failure receipt.');
    }
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }
  throw new Error('WhatsApp managed canary timed out waiting for a signed provider receipt.');
}

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
    const database = app.get(DatabaseService);
    const receipt = await outbox.runSyntheticCanary(sourceSha);
    const providerStatus = await waitForSignedReceipt(database, receipt.eventId);
    process.stdout.write(
      `${JSON.stringify({
        event: 'whatsapp_synthetic_canary_verified',
        eventId: receipt.eventId,
        provider: receipt.provider,
        status: providerStatus,
        attempts: receipt.attempts,
        sourceSha,
        signedWebhookReceipt: true,
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
