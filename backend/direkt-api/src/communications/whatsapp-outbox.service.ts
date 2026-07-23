import { createHmac } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizeContact } from '../auth/contact-normalizer';
import { DatabaseService } from '../platform/database/database.service';
import {
  WHATSAPP_PROVIDER,
  WhatsAppProviderRejectedError,
  WhatsAppProviderUnavailableError,
  type WhatsAppProviderPort,
} from './whatsapp-provider.port';

const WHATSAPP_EVENT_TYPE = 'communications.whatsapp.send.v1';
const SYNTHETIC_CANARY_TEMPLATE_KEY = 'synthetic_canary_v1';
const WORKER_ID = 'direkt-whatsapp-outbox';

interface WhatsAppOutboxPayload {
  recipientHash: string;
  templateKey: typeof SYNTHETIC_CANARY_TEMPLATE_KEY;
  dataClassification: 'synthetic';
  sourceSha: string;
}

interface ClaimedWhatsAppEvent {
  id: string;
  payload: unknown;
  attempts: number;
}

interface ClaimedWhatsAppEventRow {
  id: string;
  payload: unknown;
  attempts: number;
}

interface InsertedRow {
  id: string;
}

interface ExistingDeliveryRow {
  provider_message_id: string | null;
}

export interface WhatsAppOutboxDeliveryReceipt {
  eventId: string;
  provider: 'meta_cloud';
  messageId: string;
  status: 'accepted';
  attempts: number;
}

class WhatsAppOutboxPayloadRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WhatsAppOutboxPayloadRejectedError';
  }
}

@Injectable()
export class WhatsAppOutboxService {
  constructor(
    private readonly database: DatabaseService,
    private readonly configService: ConfigService,
    @Inject(WHATSAPP_PROVIDER) private readonly whatsappProvider: WhatsAppProviderPort,
  ) {}

  async runSyntheticCanary(sourceSha: string): Promise<WhatsAppOutboxDeliveryReceipt> {
    const recipientHash = this.assertSyntheticMetaMode(sourceSha);
    const eventId = await this.enqueueSyntheticCanary(recipientHash, sourceSha);
    const receipt = await this.processEvent(eventId);
    if (!receipt) {
      throw new WhatsAppProviderUnavailableError(
        'Synthetic WhatsApp canary could not claim its outbox event.',
      );
    }
    return receipt;
  }

  async processNext(): Promise<WhatsAppOutboxDeliveryReceipt | null> {
    if (this.whatsappProvider.provider === 'disabled') {
      return null;
    }
    await this.recoverStaleLocks();
    const claimed = await this.claimNext();
    return claimed ? this.deliverClaimed(claimed) : null;
  }

  async processEvent(eventId: string): Promise<WhatsAppOutboxDeliveryReceipt | null> {
    if (this.whatsappProvider.provider === 'disabled') {
      return null;
    }
    await this.recoverStaleLocks();
    const claimed = await this.claimNext(eventId);
    return claimed ? this.deliverClaimed(claimed) : null;
  }

  private assertSyntheticMetaMode(sourceSha: string): string {
    if (this.configService.getOrThrow<string>('DIREKT_DATA_MODE') !== 'synthetic-only') {
      throw new Error('WhatsApp canary is restricted to synthetic-only data mode.');
    }
    if (this.whatsappProvider.provider !== 'meta_cloud') {
      throw new Error('WhatsApp canary requires WHATSAPP_PROVIDER_MODE=meta_cloud.');
    }
    if (this.configService.getOrThrow<boolean>('WHATSAPP_SYNTHETIC_SEND_APPROVED') !== true) {
      throw new Error('WhatsApp synthetic send approval is not enabled.');
    }
    if (!/^[0-9a-f]{40}$/.test(sourceSha)) {
      throw new Error('WhatsApp canary requires an exact 40-character source SHA.');
    }
    const recipient = normalizeContact(
      'phone',
      this.configService.getOrThrow<string>('WHATSAPP_SYNTHETIC_RECIPIENT'),
    ).value;
    return this.hashContact(recipient);
  }

  private async enqueueSyntheticCanary(recipientHash: string, sourceSha: string): Promise<string> {
    const payload: WhatsAppOutboxPayload = {
      recipientHash,
      templateKey: SYNTHETIC_CANARY_TEMPLATE_KEY,
      dataClassification: 'synthetic',
      sourceSha,
    };
    return this.database.transaction(async (client) => {
      const result = await client.query<InsertedRow>(
        `INSERT INTO platform.outbox_events (
           event_type,
           aggregate_type,
           payload,
           headers
         ) VALUES ($1, 'integration_canary', $2::jsonb, $3::jsonb)
         RETURNING id::text AS id`,
        [
          WHATSAPP_EVENT_TYPE,
          JSON.stringify(payload),
          JSON.stringify({
            channel: 'whatsapp',
            provider: 'meta_cloud',
            classification: 'synthetic',
            rawContactIncluded: false,
          }),
        ],
      );
      const eventId = result.rows[0]?.id;
      if (!eventId) {
        throw new Error('Synthetic WhatsApp canary outbox insert returned no event id.');
      }
      await client.query(
        `INSERT INTO platform.whatsapp_message_deliveries (
           outbox_event_id, recipient_hash, template_key, template_language
         ) VALUES ($1::uuid, $2, $3, $4)`,
        [
          eventId,
          recipientHash,
          SYNTHETIC_CANARY_TEMPLATE_KEY,
          this.configService.getOrThrow<string>('WHATSAPP_SYNTHETIC_TEMPLATE_LANGUAGE'),
        ],
      );
      return eventId;
    });
  }

  private async recoverStaleLocks(): Promise<void> {
    const lockTimeoutMs = this.configService.getOrThrow<number>('WHATSAPP_OUTBOX_LOCK_TIMEOUT_MS');
    await this.database.query(
      `UPDATE platform.outbox_events
          SET status = 'failed',
              available_at = now(),
              locked_at = NULL,
              locked_by = NULL,
              last_error = 'delivery_lock_expired'
        WHERE event_type = $1
          AND status = 'processing'
          AND locked_at < now() - ($2::integer * interval '1 millisecond')`,
      [WHATSAPP_EVENT_TYPE, lockTimeoutMs],
    );
  }

  private async claimNext(eventId?: string): Promise<ClaimedWhatsAppEvent | null> {
    const maxAttempts = this.configService.getOrThrow<number>('WHATSAPP_MAX_ATTEMPTS');
    const result = await this.database.query<ClaimedWhatsAppEventRow>(
      `WITH candidate AS (
         SELECT id
           FROM platform.outbox_events
          WHERE event_type = $2
            AND ($1::uuid IS NULL OR id = $1::uuid)
            AND status IN ('pending', 'failed')
            AND available_at <= now()
            AND attempts < $3
          ORDER BY available_at ASC, occurred_at ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
       )
       UPDATE platform.outbox_events AS event
          SET status = 'processing',
              attempts = event.attempts + 1,
              locked_at = now(),
              locked_by = $4,
              last_error = NULL
         FROM candidate
        WHERE event.id = candidate.id
       RETURNING event.id::text AS id, event.payload, event.attempts`,
      [eventId ?? null, WHATSAPP_EVENT_TYPE, maxAttempts, WORKER_ID],
    );
    const row = result.rows[0];
    return row ? { id: row.id, payload: row.payload, attempts: row.attempts } : null;
  }

  private async deliverClaimed(
    claimed: ClaimedWhatsAppEvent,
  ): Promise<WhatsAppOutboxDeliveryReceipt> {
    try {
      const payload = this.parsePayload(claimed.payload);
      const existing = await this.database.query<ExistingDeliveryRow>(
        `SELECT provider_message_id
           FROM platform.whatsapp_message_deliveries
          WHERE outbox_event_id = $1::uuid`,
        [claimed.id],
      );
      const existingMessageId = existing.rows[0]?.provider_message_id;
      if (existingMessageId) {
        await this.markOutboxPublished(claimed.id, existingMessageId);
        return {
          eventId: claimed.id,
          provider: 'meta_cloud',
          messageId: existingMessageId,
          status: 'accepted',
          attempts: claimed.attempts,
        };
      }

      const recipient = await this.assertSendConsent(payload);
      const delivery = await this.whatsappProvider.send({
        to: recipient,
        templateName: this.configService.getOrThrow<string>('WHATSAPP_SYNTHETIC_TEMPLATE_NAME'),
        languageCode: this.configService.getOrThrow<string>('WHATSAPP_SYNTHETIC_TEMPLATE_LANGUAGE'),
        deliveryId: claimed.id,
      });

      await this.recordProviderAcceptance(claimed.id, delivery.messageId);
      await this.markOutboxPublished(claimed.id, delivery.messageId);
      return {
        eventId: claimed.id,
        provider: delivery.provider,
        messageId: delivery.messageId,
        status: 'accepted',
        attempts: claimed.attempts,
      };
    } catch (error) {
      const maxAttempts = this.configService.getOrThrow<number>('WHATSAPP_MAX_ATTEMPTS');
      const terminal =
        error instanceof WhatsAppOutboxPayloadRejectedError ||
        error instanceof WhatsAppProviderRejectedError ||
        claimed.attempts >= maxAttempts;
      const failureCode =
        error instanceof WhatsAppOutboxPayloadRejectedError
          ? 'payload_or_consent_rejected'
          : error instanceof WhatsAppProviderRejectedError
            ? `provider_rejected_${error.status}`
            : error instanceof WhatsAppProviderUnavailableError
              ? 'provider_unavailable'
              : 'delivery_internal_error';
      await this.markFailed(claimed.id, claimed.attempts, terminal, failureCode);
      throw error;
    }
  }

  private parsePayload(value: unknown): WhatsAppOutboxPayload {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new WhatsAppOutboxPayloadRejectedError('WhatsApp outbox payload must be an object.');
    }
    const payload = value as Record<string, unknown>;
    if (
      typeof payload.recipientHash !== 'string' ||
      !/^[0-9a-f]{64}$/.test(payload.recipientHash) ||
      payload.templateKey !== SYNTHETIC_CANARY_TEMPLATE_KEY ||
      payload.dataClassification !== 'synthetic' ||
      typeof payload.sourceSha !== 'string' ||
      !/^[0-9a-f]{40}$/.test(payload.sourceSha)
    ) {
      throw new WhatsAppOutboxPayloadRejectedError(
        'WhatsApp outbox payload is outside the approved RC6 synthetic template boundary.',
      );
    }
    return payload as unknown as WhatsAppOutboxPayload;
  }

  private async assertSendConsent(payload: WhatsAppOutboxPayload): Promise<string> {
    if (this.configService.getOrThrow<string>('DIREKT_DATA_MODE') !== 'synthetic-only') {
      throw new WhatsAppOutboxPayloadRejectedError(
        'WhatsApp send-time data mode is not synthetic.',
      );
    }
    if (this.configService.getOrThrow<boolean>('WHATSAPP_SYNTHETIC_SEND_APPROVED') !== true) {
      throw new WhatsAppOutboxPayloadRejectedError(
        'WhatsApp synthetic consent was withdrawn before send.',
      );
    }
    const recipient = normalizeContact(
      'phone',
      this.configService.getOrThrow<string>('WHATSAPP_SYNTHETIC_RECIPIENT'),
    ).value;
    if (this.hashContact(recipient) !== payload.recipientHash) {
      throw new WhatsAppOutboxPayloadRejectedError(
        'WhatsApp recipient binding changed before send.',
      );
    }
    const optedOut = await this.database.query<{ opted_out: boolean }>(
      `SELECT EXISTS (
         SELECT 1
           FROM platform.communication_channel_opt_outs
          WHERE contact_hash = $1
            AND channel = 'whatsapp'
       ) AS opted_out`,
      [payload.recipientHash],
    );
    if (optedOut.rows[0]?.opted_out) {
      throw new WhatsAppOutboxPayloadRejectedError('WhatsApp recipient is opted out at send time.');
    }
    return recipient;
  }

  private async recordProviderAcceptance(eventId: string, messageId: string): Promise<void> {
    await this.database.query(
      `UPDATE platform.whatsapp_message_deliveries
          SET provider_message_id = $2,
              status = 'accepted',
              status_rank = 0,
              failure_code = NULL,
              updated_at = now()
        WHERE outbox_event_id = $1::uuid
          AND provider_message_id IS NULL`,
      [eventId, messageId],
    );
  }

  private markOutboxPublished(eventId: string, messageId: string): Promise<unknown> {
    return this.database.query(
      `UPDATE platform.outbox_events
          SET status = 'published',
              published_at = COALESCE(published_at, now()),
              locked_at = NULL,
              locked_by = NULL,
              last_error = NULL,
              headers = jsonb_set(
                headers,
                '{delivery}',
                jsonb_build_object('provider', 'meta_cloud', 'messageId', $2::text),
                true
              )
        WHERE id = $1::uuid
          AND event_type = $3
          AND status = 'processing'`,
      [eventId, messageId, WHATSAPP_EVENT_TYPE],
    );
  }

  private async markFailed(
    eventId: string,
    attempts: number,
    terminal: boolean,
    failureCode: string,
  ): Promise<void> {
    const maxAttempts = this.configService.getOrThrow<number>('WHATSAPP_MAX_ATTEMPTS');
    const backoffSeconds = Math.min(300, 15 * 2 ** Math.max(0, attempts - 1));
    const availableAt = new Date(Date.now() + backoffSeconds * 1000).toISOString();
    await this.database.transaction(async (client) => {
      await client.query(
        `UPDATE platform.outbox_events
            SET status = 'failed',
                attempts = CASE WHEN $3::boolean THEN GREATEST(attempts, $4::integer) ELSE attempts END,
                available_at = $5::timestamptz,
                locked_at = NULL,
                locked_by = NULL,
                last_error = $2
          WHERE id = $1::uuid
            AND event_type = $6
            AND status = 'processing'`,
        [eventId, failureCode, terminal, maxAttempts, availableAt, WHATSAPP_EVENT_TYPE],
      );
      await client.query(
        `UPDATE platform.whatsapp_message_deliveries
            SET status = CASE WHEN $3::boolean THEN 'failed' ELSE status END,
                status_rank = CASE WHEN $3::boolean THEN 5 ELSE status_rank END,
                failure_code = $2,
                updated_at = now()
          WHERE outbox_event_id = $1::uuid
            AND provider_message_id IS NULL`,
        [eventId, failureCode, terminal],
      );
    });
  }

  private hashContact(normalizedValue: string): string {
    return createHmac('sha256', this.configService.getOrThrow<string>('CONTACT_HASH_PEPPER'))
      .update(normalizedValue, 'utf8')
      .digest('hex');
  }
}
