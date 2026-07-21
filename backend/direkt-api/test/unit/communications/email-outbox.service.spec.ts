import type { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import {
  EmailProviderUnavailableError,
  type EmailProviderPort,
} from '../../../src/communications/email-provider.port';
import { EmailOutboxService } from '../../../src/communications/email-outbox.service';
import type { DatabaseService } from '../../../src/platform/database/database.service';

const EVENT_ID = '00000000-0000-0000-0000-000000000001';
const PAYLOAD = {
  templateKey: 'synthetic_canary_v1',
  to: 'delivered@resend.dev',
  dataClassification: 'synthetic',
};

function config(): ConfigService {
  const values: Record<string, unknown> = {
    DIREKT_DATA_MODE: 'synthetic-only',
    EMAIL_FROM_ADDRESS: 'DIREKT <canary@notify.direkt.forum>',
    EMAIL_OUTBOX_LOCK_TIMEOUT_MS: 300000,
    EMAIL_MAX_ATTEMPTS: 4,
  };
  return {
    getOrThrow: vi.fn((key: string) => {
      if (!(key in values)) {
        throw new Error(`Unexpected config key: ${key}`);
      }
      return values[key];
    }),
  } as unknown as ConfigService;
}

function databaseWithRows(rows: unknown[][]): DatabaseService {
  const query = vi.fn();
  for (const responseRows of rows) {
    query.mockResolvedValueOnce({ rows: responseRows, rowCount: responseRows.length });
  }
  return { query } as unknown as DatabaseService;
}

describe('EmailOutboxService', () => {
  it('enqueues and publishes the synthetic canary through Resend', async () => {
    const database = databaseWithRows([
      [{ id: EVENT_ID }],
      [],
      [{ id: EVENT_ID, payload: PAYLOAD, attempts: 1 }],
      [],
    ]);
    const provider: EmailProviderPort = {
      provider: 'resend',
      send: vi.fn().mockResolvedValue({ provider: 'resend', messageId: 'email_123' }),
    };
    const service = new EmailOutboxService(database, config(), provider);

    const receipt = await service.runSyntheticCanary();

    expect(receipt).toEqual({
      eventId: EVENT_ID,
      provider: 'resend',
      messageId: 'email_123',
      status: 'published',
      attempts: 1,
    });
    const send = vi.mocked(provider.send);
    expect(send).toHaveBeenCalledOnce();
    const request = send.mock.calls[0]?.[0];
    expect(request?.to).toBe('delivered@resend.dev');
    expect(request?.idempotencyKey).toBe(`direkt-email-${EVENT_ID}`);
    expect(request?.text).toContain('No participant or production data is included.');
  });

  it('persists a bounded retry state without provider response details', async () => {
    const database = databaseWithRows([[], [{ id: EVENT_ID, payload: PAYLOAD, attempts: 1 }], []]);
    const provider: EmailProviderPort = {
      provider: 'resend',
      send: vi.fn().mockRejectedValue(new EmailProviderUnavailableError('provider detail')),
    };
    const service = new EmailOutboxService(database, config(), provider);

    await expect(service.processEvent(EVENT_ID)).rejects.toBeInstanceOf(
      EmailProviderUnavailableError,
    );

    const query = vi.mocked(database.query);
    const failureCall = query.mock.calls[2];
    expect(failureCall?.[1]?.[1]).toBe('provider_unavailable');
    expect(failureCall?.[1]?.[2]).toBe(false);
    expect(JSON.stringify(failureCall?.[1])).not.toContain('provider detail');
  });

  it('does not claim or deliver events while the email kill switch is disabled', async () => {
    const database = databaseWithRows([]);
    const provider: EmailProviderPort = {
      provider: 'disabled',
      send: vi.fn(),
    };
    const service = new EmailOutboxService(database, config(), provider);

    await expect(service.processNext()).resolves.toBeNull();
    expect(database.query).not.toHaveBeenCalled();
    expect(provider.send).not.toHaveBeenCalled();
  });
});
