import { createHmac } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import { WhatsAppWebhookService } from '../../../src/communications/whatsapp-webhook.service';

const APP_SECRET = 'meta_app_secret_123456789012345678901234567890';
const VERIFY_TOKEN = 'direkt_webhook_verify_token_1234567890';
const PHONE_NUMBER_ID = '123456789012345';

function buildService() {
  const query = vi.fn(async (sql: string) => {
    if (sql.includes('SELECT EXISTS')) return { rows: [{ known: true }] };
    return { rows: [] };
  });
  const database = {
    transaction: vi.fn(async (callback: (client: { query: typeof query }) => Promise<unknown>) =>
      callback({ query }),
    ),
  };
  const config = new ConfigService({
    WHATSAPP_APP_SECRET: APP_SECRET,
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: VERIFY_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: PHONE_NUMBER_ID,
  });
  return {
    service: new WhatsAppWebhookService(database as never, config),
    query,
  };
}

describe('WhatsAppWebhookService', () => {
  it('returns the Meta verification challenge only for the configured verify token', () => {
    const { service } = buildService();

    expect(service.verifyChallenge('subscribe', VERIFY_TOKEN, '123456')).toBe('123456');
    expect(() => service.verifyChallenge('subscribe', 'wrong-token', '123456')).toThrow(
      'WhatsApp webhook verification was rejected.',
    );
  });

  it('verifies x-hub-signature-256 before applying durable delivery receipts', async () => {
    const { service, query } = buildService();
    const body = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                metadata: { phone_number_id: PHONE_NUMBER_ID },
                statuses: [
                  {
                    id: 'wamid.synthetic-123',
                    status: 'delivered',
                    timestamp: '1784760000',
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const rawBody = Buffer.from(JSON.stringify(body), 'utf8');
    const signature = `sha256=${createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')}`;

    const result = await service.processWebhook(rawBody, signature, body);

    expect(result).toEqual({ received: true, receiptsApplied: 1 });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('whatsapp_delivery_receipts'), [
      'wamid.synthetic-123',
      'delivered',
      2,
      expect.any(String),
      null,
    ]);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('whatsapp_message_deliveries'), [
      'wamid.synthetic-123',
      'delivered',
      2,
      expect.any(String),
      null,
    ]);
  });

  it('rejects an invalid webhook signature before any database mutation', async () => {
    const { service, query } = buildService();
    const rawBody = Buffer.from('{"object":"whatsapp_business_account"}', 'utf8');

    await expect(
      service.processWebhook(rawBody, `sha256=${'0'.repeat(64)}`, {
        object: 'whatsapp_business_account',
      }),
    ).rejects.toThrow('WhatsApp webhook signature was rejected.');
    expect(query).not.toHaveBeenCalled();
  });

  it('ignores receipts for a different configured phone-number id', async () => {
    const { service, query } = buildService();
    const body = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                metadata: { phone_number_id: '999999999999999' },
                statuses: [{ id: 'wamid.synthetic-123', status: 'read', timestamp: '1784760001' }],
              },
            },
          ],
        },
      ],
    };
    const rawBody = Buffer.from(JSON.stringify(body), 'utf8');
    const signature = `sha256=${createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')}`;

    await expect(service.processWebhook(rawBody, signature, body)).resolves.toEqual({
      received: true,
      receiptsApplied: 0,
    });
    expect(query).not.toHaveBeenCalled();
  });
});
