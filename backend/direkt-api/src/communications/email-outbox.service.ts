import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EMAIL_PROVIDER,
  EmailProviderRejectedError,
  EmailProviderUnavailableError,
  type EmailProviderPort,
} from './email-provider.port';
import { DatabaseService } from '../platform/database/database.service';

const EMAIL_EVENT_TYPE = 'communications.email.send.v1';
const SYNTHETIC_CANARY_TEMPLATE = 'synthetic_canary_v1';
const SYNTHETIC_CANARY_RECIPIENT = 'delivered@resend.dev';
const WORKER_ID = 'direkt-email-outbox';

class EmailOutboxPayloadRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailOutboxPayloadRejectedError';
  }
}

interface EmailOutboxPayload {
  templateKey: typeof SYNTHETIC_CANARY_TEMPLATE;
  to: typeof SYNTHETIC_CANARY_RECIPIENT;
  dataClassification: 'synthetic';
}

interface ClaimedEmailEvent {
  id: string;
  payload: unknown;
  attempts: number;
}

interface ClaimedEmailEventRow {
  id: string;
  payload: unknown;
  attempts: number;
}

interface InsertedEventRow {
  id: string;
}

export interface EmailOutboxDeliveryReceipt {
  eventId: string;
  provider: 'resend';
  messageId: string;
  status: 'published';
  attempts: number;
}

@Injectable()
export class EmailOutboxService {
  constructor(
    private readonly database: DatabaseService,
    private readonly configService: ConfigService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProviderPort,
  ) {}

  async runSyntheticCanary(): Promise<EmailOutboxDeliveryReceipt> {
    this.assertSyntheticResendMode();
    const eventId = await this.enqueueSyntheticCanary();
    const receipt = await this.processEvent(eventId);
    if (!receipt) {
      throw new EmailProviderUnavailableError(
        'Synthetic email canary could not claim its outbox event.',
      );
    }
    return receipt;
  }

  async processNext(): Promise<EmailOutboxDeliveryReceipt | null> {
    if (this.emailProvider.provider === 'disabled') {
      return null;
    }
    await this.recoverStaleLocks();
    const claimed = await this.claimNext();
    if (!claimed) {
      return null;
    }
    return this.deliverClaimed(claimed);
  }

  async processEvent(eventId: string): Promise<EmailOutboxDeliveryReceipt | null> {
    if (this.emailProvider.provider === 'disabled') {
      return null;
    }
    await this.recoverStaleLocks();
    const claimed = await this.claimNext(eventId);
    if (!claimed) {
      return null;
    }
    return this.deliverClaimed(claimed);
  }

  private assertSyntheticResendMode(): void {
    const dataMode = this.configService.getOrThrow<string>('DIREKT_DATA_MODE');
    if (dataMode !== 'synthetic-only') {
      throw new Error('Resend canary is restricted to synthetic-only data mode.');
    }
    if (this.emailProvider.provider !== 'resend') {
      throw new Error('Resend canary requires EMAIL_PROVIDER_MODE=resend.');
    }
  }

  private async enqueueSyntheticCanary(): Promise<string> {
    const payload: EmailOutboxPayload = {
      templateKey: SYNTHETIC_CANARY_TEMPLATE,
      to: SYNTHETIC_CANARY_RECIPIENT,
      dataClassification: 'synthetic',
    };
    const result = await this.database.query<InsertedEventRow>(
      `INSERT INTO platform.outbox_events (
         event_type,
         aggregate_type,
         payload,
         headers
       )
       VALUES ($1, 'integration_canary', $2::jsonb, $3::jsonb)
       RETURNING id::text AS id`,
      [
        EMAIL_EVENT_TYPE,
        JSON.stringify(payload),
        JSON.stringify({ channel: 'email', provider: 'resend', classification: 'synthetic' }),
      ],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error('Synthetic email canary outbox insert returned no event id.');
    }
    return row.id;
  }

  private async recoverStaleLocks(): Promise<void> {
    const lockTimeoutMs = this.configService.getOrThrow<number>('EMAIL_OUTBOX_LOCK_TIMEOUT_MS');
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
      [EMAIL_EVENT_TYPE, lockTimeoutMs],
    );
  }

  private async claimNext(eventId?: string): Promise<ClaimedEmailEvent | null> {
    const maxAttempts = this.configService.getOrThrow<number>('EMAIL_MAX_ATTEMPTS');
    const result = await this.database.query<ClaimedEmailEventRow>(
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
      [eventId ?? null, EMAIL_EVENT_TYPE, maxAttempts, WORKER_ID],
    );
    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      payload: row.payload,
      attempts: row.attempts,
    };
  }

  private async deliverClaimed(claimed: ClaimedEmailEvent): Promise<EmailOutboxDeliveryReceipt> {
    try {
      const payload = this.parsePayload(claimed.payload);
      const from = this.configService.getOrThrow<string>('EMAIL_FROM_ADDRESS');
      const subject = 'DIREKT RC1 synthetic email canary';
      const text = [
        'DIREKT synthetic integration canary.',
        `Outbox event: ${claimed.id}`,
        'No participant or production data is included.',
      ].join('\n');

      const delivery = await this.emailProvider.send({
        from,
        to: payload.to,
        subject,
        text,
        idempotencyKey: `direkt-email-${claimed.id}`,
      });
      await this.markPublished(claimed.id, delivery.provider, delivery.messageId);
      return {
        eventId: claimed.id,
        provider: delivery.provider,
        messageId: delivery.messageId,
        status: 'published',
        attempts: claimed.attempts,
      };
    } catch (error) {
      const maxAttempts = this.configService.getOrThrow<number>('EMAIL_MAX_ATTEMPTS');
      const terminal =
        error instanceof EmailOutboxPayloadRejectedError ||
        error instanceof EmailProviderRejectedError ||
        claimed.attempts >= maxAttempts;
      const failureCode =
        error instanceof EmailOutboxPayloadRejectedError
          ? 'payload_rejected'
          : error instanceof EmailProviderRejectedError
            ? `provider_rejected_${error.status}`
            : error instanceof EmailProviderUnavailableError
              ? 'provider_unavailable'
              : 'delivery_internal_error';
      await this.markFailed(claimed.id, claimed.attempts, terminal, failureCode);
      throw error;
    }
  }

  private parsePayload(value: unknown): EmailOutboxPayload {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new EmailOutboxPayloadRejectedError('Email outbox payload must be an object.');
    }
    const payload = value as Record<string, unknown>;
    if (
      payload.templateKey !== SYNTHETIC_CANARY_TEMPLATE ||
      payload.to !== SYNTHETIC_CANARY_RECIPIENT ||
      payload.dataClassification !== 'synthetic'
    ) {
      throw new EmailOutboxPayloadRejectedError(
        'Email outbox payload is outside the approved RC1 synthetic template boundary.',
      );
    }
    return {
      templateKey: SYNTHETIC_CANARY_TEMPLATE,
      to: SYNTHETIC_CANARY_RECIPIENT,
      dataClassification: 'synthetic',
    };
  }

  private async markPublished(
    eventId: string,
    provider: 'resend',
    messageId: string,
  ): Promise<void> {
    await this.database.query(
      `UPDATE platform.outbox_events
          SET status = 'published',
              published_at = now(),
              locked_at = NULL,
              locked_by = NULL,
              last_error = NULL,
              headers = jsonb_set(
                headers,
                '{delivery}',
                jsonb_build_object('provider', $2::text, 'messageId', $3::text),
                true
              )
        WHERE id = $1::uuid
          AND event_type = $4
          AND status = 'processing'`,
      [eventId, provider, messageId, EMAIL_EVENT_TYPE],
    );
  }

  private async markFailed(
    eventId: string,
    attempts: number,
    terminal: boolean,
    failureCode: string,
  ): Promise<void> {
    const maxAttempts = this.configService.getOrThrow<number>('EMAIL_MAX_ATTEMPTS');
    const backoffSeconds = Math.min(300, 15 * 2 ** Math.max(0, attempts - 1));
    const availableAt = new Date(Date.now() + backoffSeconds * 1000).toISOString();
    await this.database.query(
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
      [eventId, failureCode, terminal, maxAttempts, availableAt, EMAIL_EVENT_TYPE],
    );
  }
}
