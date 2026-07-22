import { createHash, randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../platform/database/database.service';
import {
  PUSH_PROVIDER,
  PushProviderRejectedError,
  PushProviderUnavailableError,
  type PushProviderPort,
} from './push-provider.port';

const PUSH_EVENT_TYPE = 'communications.push.send.v1';
const SYNTHETIC_CANARY_TEMPLATE = 'synthetic_canary_v1';
const WORKER_ID = 'direkt-push-outbox';

interface PushOutboxPayload {
  deviceTokenId: string;
  templateKey: typeof SYNTHETIC_CANARY_TEMPLATE;
  dataClassification: 'synthetic';
  sourceSha: string;
  phase: 'foreground' | 'background';
}

interface ClaimedPushEvent {
  id: string;
  payload: unknown;
  attempts: number;
}

interface ClaimedPushEventRow {
  id: string;
  payload: unknown;
  attempts: number;
}

interface InsertedRow {
  id: string;
}

interface DeviceTokenRow {
  token: string;
}

export interface PushOutboxDeliveryReceipt {
  eventId: string;
  provider: 'fcm';
  messageId: string;
  status: 'published';
  attempts: number;
  phase: 'foreground' | 'background';
}

class PushOutboxPayloadRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PushOutboxPayloadRejectedError';
  }
}

@Injectable()
export class PushOutboxService {
  constructor(
    private readonly database: DatabaseService,
    private readonly configService: ConfigService,
    @Inject(PUSH_PROVIDER) private readonly pushProvider: PushProviderPort,
  ) {}

  async runSyntheticCanary(
    deviceToken: string,
    sourceSha: string,
    phase: 'foreground' | 'background',
  ): Promise<PushOutboxDeliveryReceipt> {
    this.assertSyntheticFcmMode(sourceSha, deviceToken);
    const deviceTokenId = await this.insertSyntheticToken(deviceToken);
    try {
      const eventId = await this.enqueueSyntheticCanary(deviceTokenId, sourceSha, phase);
      const receipt = await this.processEvent(eventId);
      if (!receipt) {
        throw new PushProviderUnavailableError(
          'Synthetic FCM canary could not claim its outbox event.',
        );
      }
      return receipt;
    } finally {
      await this.database.query(
        `DELETE FROM platform.push_device_tokens
          WHERE id = $1::uuid
            AND data_classification = 'synthetic'`,
        [deviceTokenId],
      );
    }
  }

  async processNext(): Promise<PushOutboxDeliveryReceipt | null> {
    if (this.pushProvider.provider === 'disabled') {
      return null;
    }
    await this.recoverStaleLocks();
    const claimed = await this.claimNext();
    return claimed ? this.deliverClaimed(claimed) : null;
  }

  async processEvent(eventId: string): Promise<PushOutboxDeliveryReceipt | null> {
    if (this.pushProvider.provider === 'disabled') {
      return null;
    }
    await this.recoverStaleLocks();
    const claimed = await this.claimNext(eventId);
    return claimed ? this.deliverClaimed(claimed) : null;
  }

  private assertSyntheticFcmMode(sourceSha: string, deviceToken: string): void {
    if (this.configService.getOrThrow<string>('DIREKT_DATA_MODE') !== 'synthetic-only') {
      throw new Error('FCM canary is restricted to synthetic-only data mode.');
    }
    if (this.pushProvider.provider !== 'fcm') {
      throw new Error('FCM canary requires PUSH_PROVIDER_MODE=fcm.');
    }
    if (!/^[0-9a-f]{40}$/.test(sourceSha)) {
      throw new Error('FCM canary requires an exact 40-character source SHA.');
    }
    if (deviceToken.length < 20 || deviceToken.length > 4096) {
      throw new Error('FCM canary device token is invalid.');
    }
  }

  private async insertSyntheticToken(deviceToken: string): Promise<string> {
    const tokenHash = createHash('sha256').update(deviceToken, 'utf8').digest('hex');
    const result = await this.database.query<InsertedRow>(
      `INSERT INTO platform.push_device_tokens (
         identity_id,
         installation_id,
         token,
         token_hash,
         platform,
         data_classification
       ) VALUES (NULL, $1::uuid, $2, $3, 'android', 'synthetic')
       ON CONFLICT (token_hash)
       DO UPDATE SET
         token = EXCLUDED.token,
         data_classification = 'synthetic',
         identity_id = NULL,
         invalidated_at = NULL,
         updated_at = now(),
         last_seen_at = now()
       RETURNING id::text AS id`,
      [randomUUID(), deviceToken, tokenHash],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error('Synthetic FCM token insert returned no id.');
    }
    return row.id;
  }

  private async enqueueSyntheticCanary(
    deviceTokenId: string,
    sourceSha: string,
    phase: 'foreground' | 'background',
  ): Promise<string> {
    const payload: PushOutboxPayload = {
      deviceTokenId,
      templateKey: SYNTHETIC_CANARY_TEMPLATE,
      dataClassification: 'synthetic',
      sourceSha,
      phase,
    };
    const result = await this.database.query<InsertedRow>(
      `INSERT INTO platform.outbox_events (
         event_type,
         aggregate_type,
         aggregate_id,
         payload,
         headers
       ) VALUES ($1, 'integration_canary', $2::uuid, $3::jsonb, $4::jsonb)
       RETURNING id::text AS id`,
      [
        PUSH_EVENT_TYPE,
        deviceTokenId,
        JSON.stringify(payload),
        JSON.stringify({
          channel: 'push',
          provider: 'fcm',
          classification: 'synthetic',
        }),
      ],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error('Synthetic FCM canary outbox insert returned no event id.');
    }
    return row.id;
  }

  private async recoverStaleLocks(): Promise<void> {
    const lockTimeoutMs = this.configService.getOrThrow<number>('PUSH_OUTBOX_LOCK_TIMEOUT_MS');
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
      [PUSH_EVENT_TYPE, lockTimeoutMs],
    );
  }

  private async claimNext(eventId?: string): Promise<ClaimedPushEvent | null> {
    const maxAttempts = this.configService.getOrThrow<number>('PUSH_MAX_ATTEMPTS');
    const result = await this.database.query<ClaimedPushEventRow>(
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
      [eventId ?? null, PUSH_EVENT_TYPE, maxAttempts, WORKER_ID],
    );
    const row = result.rows[0];
    return row ? { id: row.id, payload: row.payload, attempts: row.attempts } : null;
  }

  private async deliverClaimed(claimed: ClaimedPushEvent): Promise<PushOutboxDeliveryReceipt> {
    const payload = this.parsePayload(claimed.payload);
    try {
      const token = await this.loadActiveToken(payload.deviceTokenId);
      const delivery = await this.pushProvider.send({
        token,
        deliveryId: claimed.id,
        sourceSha: payload.sourceSha,
        phase: payload.phase,
      });
      await this.markPublished(claimed.id, delivery.messageId);
      return {
        eventId: claimed.id,
        provider: delivery.provider,
        messageId: delivery.messageId,
        status: 'published',
        attempts: claimed.attempts,
        phase: payload.phase,
      };
    } catch (error) {
      const maxAttempts = this.configService.getOrThrow<number>('PUSH_MAX_ATTEMPTS');
      const terminal =
        error instanceof PushOutboxPayloadRejectedError ||
        error instanceof PushProviderRejectedError ||
        claimed.attempts >= maxAttempts;
      const failureCode =
        error instanceof PushOutboxPayloadRejectedError
          ? 'payload_rejected'
          : error instanceof PushProviderRejectedError
            ? error.invalidToken
              ? 'provider_token_invalid'
              : `provider_rejected_${error.status}`
            : error instanceof PushProviderUnavailableError
              ? 'provider_unavailable'
              : 'delivery_internal_error';
      if (error instanceof PushProviderRejectedError && error.invalidToken) {
        await this.invalidateToken(payload.deviceTokenId);
      }
      await this.markFailed(claimed.id, claimed.attempts, terminal, failureCode);
      throw error;
    }
  }

  private parsePayload(value: unknown): PushOutboxPayload {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new PushOutboxPayloadRejectedError('Push outbox payload must be an object.');
    }
    const payload = value as Record<string, unknown>;
    if (
      typeof payload.deviceTokenId !== 'string' ||
      payload.templateKey !== SYNTHETIC_CANARY_TEMPLATE ||
      payload.dataClassification !== 'synthetic' ||
      typeof payload.sourceSha !== 'string' ||
      !/^[0-9a-f]{40}$/.test(payload.sourceSha) ||
      (payload.phase !== 'foreground' && payload.phase !== 'background')
    ) {
      throw new PushOutboxPayloadRejectedError(
        'Push outbox payload is outside the approved RC4 synthetic template boundary.',
      );
    }
    return payload as unknown as PushOutboxPayload;
  }

  private async loadActiveToken(deviceTokenId: string): Promise<string> {
    const result = await this.database.query<DeviceTokenRow>(
      `SELECT token
         FROM platform.push_device_tokens
        WHERE id = $1::uuid
          AND invalidated_at IS NULL`,
      [deviceTokenId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new PushOutboxPayloadRejectedError('Push target is unavailable.');
    }
    return row.token;
  }

  private invalidateToken(deviceTokenId: string): Promise<unknown> {
    return this.database.query(
      `UPDATE platform.push_device_tokens
          SET invalidated_at = now(), updated_at = now()
        WHERE id = $1::uuid`,
      [deviceTokenId],
    );
  }

  private markPublished(eventId: string, messageId: string): Promise<unknown> {
    return this.database.query(
      `UPDATE platform.outbox_events
          SET status = 'published',
              published_at = now(),
              locked_at = NULL,
              locked_by = NULL,
              last_error = NULL,
              headers = jsonb_set(
                headers,
                '{delivery}',
                jsonb_build_object('provider', 'fcm', 'messageId', $2::text),
                true
              )
        WHERE id = $1::uuid
          AND event_type = $3
          AND status = 'processing'`,
      [eventId, messageId, PUSH_EVENT_TYPE],
    );
  }

  private async markFailed(
    eventId: string,
    attempts: number,
    terminal: boolean,
    failureCode: string,
  ): Promise<void> {
    const maxAttempts = this.configService.getOrThrow<number>('PUSH_MAX_ATTEMPTS');
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
      [eventId, failureCode, terminal, maxAttempts, availableAt, PUSH_EVENT_TYPE],
    );
  }
}
