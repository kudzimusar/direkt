import { createHmac, timingSafeEqual } from 'node:crypto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../platform/database/database.service';

const STATUS_RANK: Record<string, number> = {
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 5,
};

type SupportedStatus = 'sent' | 'delivered' | 'read' | 'failed';

interface WebhookStatus {
  id?: unknown;
  status?: unknown;
  timestamp?: unknown;
  errors?: unknown;
}

@Injectable()
export class WhatsAppWebhookService {
  constructor(
    private readonly database: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  verifyChallenge(mode: unknown, token: unknown, challenge: unknown): string {
    if (mode !== 'subscribe' || typeof token !== 'string' || typeof challenge !== 'string') {
      throw new ForbiddenException('WhatsApp webhook verification was rejected.');
    }
    const expected = this.configService.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN');
    if (!expected || !this.safeEqual(token, expected)) {
      throw new ForbiddenException('WhatsApp webhook verification was rejected.');
    }
    if (!/^\d{1,200}$/.test(challenge)) {
      throw new ForbiddenException('WhatsApp webhook challenge was invalid.');
    }
    return challenge;
  }

  async processWebhook(
    rawBody: Buffer | undefined,
    signature: string | undefined,
    body: unknown,
  ): Promise<{ received: true; receiptsApplied: number }> {
    this.verifySignature(rawBody, signature);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { received: true, receiptsApplied: 0 };
    }
    const root = body as Record<string, unknown>;
    if (root.object !== 'whatsapp_business_account' || !Array.isArray(root.entry)) {
      return { received: true, receiptsApplied: 0 };
    }

    let receiptsApplied = 0;
    const expectedPhoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    for (const entry of root.entry) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
      const changes = (entry as Record<string, unknown>).changes;
      if (!Array.isArray(changes)) continue;
      for (const change of changes) {
        if (!change || typeof change !== 'object' || Array.isArray(change)) continue;
        const changeRecord = change as Record<string, unknown>;
        if (changeRecord.field !== 'messages') continue;
        const value = changeRecord.value;
        if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
        const valueRecord = value as Record<string, unknown>;
        const metadata = valueRecord.metadata;
        const phoneNumberId =
          metadata && typeof metadata === 'object' && !Array.isArray(metadata)
            ? (metadata as Record<string, unknown>).phone_number_id
            : undefined;
        if (
          expectedPhoneNumberId &&
          (typeof phoneNumberId !== 'string' || phoneNumberId !== expectedPhoneNumberId)
        ) {
          continue;
        }
        if (!Array.isArray(valueRecord.statuses)) continue;
        for (const status of valueRecord.statuses) {
          if (await this.applyStatus(status)) receiptsApplied += 1;
        }
      }
    }
    return { received: true, receiptsApplied };
  }

  private verifySignature(rawBody: Buffer | undefined, signature: string | undefined): void {
    const appSecret = this.configService.get<string>('WHATSAPP_APP_SECRET');
    if (!appSecret || !rawBody || !signature || !/^sha256=[0-9a-f]{64}$/i.test(signature)) {
      throw new ForbiddenException('WhatsApp webhook signature was rejected.');
    }
    const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
    if (!this.safeEqual(signature.toLowerCase(), expected)) {
      throw new ForbiddenException('WhatsApp webhook signature was rejected.');
    }
  }

  private async applyStatus(value: unknown): Promise<boolean> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const status = value as WebhookStatus;
    if (
      typeof status.id !== 'string' ||
      status.id.length < 8 ||
      status.id.length > 512 ||
      typeof status.status !== 'string' ||
      !(status.status in STATUS_RANK) ||
      (typeof status.timestamp !== 'string' && typeof status.timestamp !== 'number')
    ) {
      return false;
    }
    const timestampSeconds = Number(status.timestamp);
    if (!Number.isSafeInteger(timestampSeconds) || timestampSeconds < 1_500_000_000) return false;
    const providerTimestamp = new Date(timestampSeconds * 1000);
    if (!Number.isFinite(providerTimestamp.getTime())) return false;

    const supportedStatus = status.status as SupportedStatus;
    const rank = STATUS_RANK[supportedStatus];
    const failureCode = supportedStatus === 'failed' ? this.failureCode(status.errors) : null;
    const result = await this.database.transaction(async (client) => {
      const known = await client.query<{ known: boolean }>(
        `SELECT EXISTS (
           SELECT 1 FROM platform.whatsapp_message_deliveries
            WHERE provider_message_id = $1
         ) AS known`,
        [status.id],
      );
      if (!known.rows[0]?.known) return false;

      await client.query(
        `INSERT INTO platform.whatsapp_delivery_receipts (
           provider_message_id, status, status_rank, provider_timestamp, failure_code
         ) VALUES ($1, $2, $3, $4::timestamptz, $5)
         ON CONFLICT (provider_message_id, status, provider_timestamp) DO NOTHING`,
        [status.id, supportedStatus, rank, providerTimestamp.toISOString(), failureCode],
      );
      await client.query(
        `UPDATE platform.whatsapp_message_deliveries
            SET status = $2,
                status_rank = $3,
                provider_status_at = $4::timestamptz,
                failure_code = $5,
                updated_at = now()
          WHERE provider_message_id = $1
            AND (
              provider_status_at IS NULL
              OR $4::timestamptz > provider_status_at
              OR ($4::timestamptz = provider_status_at AND $3 >= status_rank)
            )`,
        [status.id, supportedStatus, rank, providerTimestamp.toISOString(), failureCode],
      );
      return true;
    });
    return result;
  }

  private failureCode(errors: unknown): string {
    if (Array.isArray(errors)) {
      const first: unknown = errors[0];
      if (first && typeof first === 'object' && !Array.isArray(first)) {
        const code = (first as Record<string, unknown>).code;
        if (typeof code === 'number' && Number.isInteger(code)) return `meta_${code}`;
        if (typeof code === 'string' && /^\d{1,12}$/.test(code)) return `meta_${code}`;
      }
    }
    return 'meta_failed';
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBytes = Buffer.from(left, 'utf8');
    const rightBytes = Buffer.from(right, 'utf8');
    return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
  }
}
