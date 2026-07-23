import { createHmac } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import type { WhatsAppProviderPort } from '../../../src/communications/whatsapp-provider.port';
import { WhatsAppOutboxService } from '../../../src/communications/whatsapp-outbox.service';

const EVENT_ID = '00000000-0000-0000-0000-000000000001';
const SOURCE_SHA = 'a'.repeat(40);
const CONTACT_HASH_PEPPER = 'p'.repeat(64);
const RECIPIENT = '+260971000000';

function buildHarness(optedOut = false) {
  let queuedPayload = '';
  const recipientHash = createHmac('sha256', CONTACT_HASH_PEPPER)
    .update(RECIPIENT, 'utf8')
    .digest('hex');
  const clientQuery = vi.fn(async (sql: string, params?: unknown[]) => {
    if (sql.includes('INSERT INTO platform.outbox_events')) {
      const rawPayload = params?.[1];
      if (typeof rawPayload !== 'string') {
        throw new Error('Expected WhatsApp outbox payload to be serialized JSON.');
      }
      queuedPayload = rawPayload;
      return { rows: [{ id: EVENT_ID }] };
    }
    return { rows: [] };
  });
  const query = vi.fn(async (sql: string) => {
    if (sql.includes('WITH candidate AS')) {
      return {
        rows: [
          {
            id: EVENT_ID,
            attempts: 1,
            payload: {
              recipientHash,
              templateKey: 'synthetic_canary_v1',
              dataClassification: 'synthetic',
              sourceSha: SOURCE_SHA,
            },
          },
        ],
      };
    }
    if (sql.includes('SELECT provider_message_id')) {
      return { rows: [{ provider_message_id: null }] };
    }
    if (sql.includes('communication_channel_opt_outs')) {
      return { rows: [{ opted_out: optedOut }] };
    }
    return { rows: [] };
  });
  const database = {
    query,
    transaction: vi.fn(
      async (callback: (client: { query: typeof clientQuery }) => Promise<unknown>) =>
        callback({ query: clientQuery }),
    ),
  };
  const provider: WhatsAppProviderPort = {
    provider: 'meta_cloud',
    send: vi.fn(async () => ({
      provider: 'meta_cloud' as const,
      messageId: 'wamid.synthetic-123',
    })),
  };
  const config = new ConfigService({
    DIREKT_DATA_MODE: 'synthetic-only',
    CONTACT_HASH_PEPPER,
    WHATSAPP_SYNTHETIC_SEND_APPROVED: true,
    WHATSAPP_SYNTHETIC_RECIPIENT: RECIPIENT,
    WHATSAPP_SYNTHETIC_TEMPLATE_NAME: 'direkt_rc6_synthetic_canary',
    WHATSAPP_SYNTHETIC_TEMPLATE_LANGUAGE: 'en_US',
    WHATSAPP_OUTBOX_LOCK_TIMEOUT_MS: 300000,
    WHATSAPP_MAX_ATTEMPTS: 4,
  });
  const service = new WhatsAppOutboxService(database as never, config, provider);
  return { service, provider, recipientHash, getQueuedPayload: () => queuedPayload };
}

describe('WhatsAppOutboxService', () => {
  it('stores only a recipient hash in the outbox and sends after a fresh opt-out check', async () => {
    const harness = buildHarness(false);

    const receipt = await harness.service.runSyntheticCanary(SOURCE_SHA);

    expect(receipt).toMatchObject({ provider: 'meta_cloud', status: 'accepted' });
    expect(harness.getQueuedPayload()).not.toContain(RECIPIENT);
    expect(harness.getQueuedPayload()).toContain(harness.recipientHash);
    expect(harness.provider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: RECIPIENT,
        templateName: 'direkt_rc6_synthetic_canary',
      }),
    );
  });

  it('blocks a queued delivery when the recipient is opted out before send', async () => {
    const harness = buildHarness(true);

    await expect(harness.service.runSyntheticCanary(SOURCE_SHA)).rejects.toThrow(
      'WhatsApp recipient is opted out at send time.',
    );
    expect(harness.provider.send).not.toHaveBeenCalled();
  });
});
