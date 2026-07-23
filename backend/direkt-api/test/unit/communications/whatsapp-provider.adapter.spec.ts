import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type WhatsAppProviderRejectedError,
  WhatsAppProviderUnavailableError,
} from '../../../src/communications/whatsapp-provider.port';
import { MetaWhatsAppProviderAdapter } from '../../../src/communications/meta-whatsapp-provider.adapter';

const REQUEST = {
  to: '+260971000000',
  templateName: 'direkt_rc6_synthetic_canary',
  languageCode: 'en_US',
  deliveryId: '00000000-0000-0000-0000-000000000001',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MetaWhatsAppProviderAdapter', () => {
  it('sends only a bounded template request through the configured Graph API version', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ messages: [{ id: 'wamid.synthetic-123' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const adapter = new MetaWhatsAppProviderAdapter(
      'EAAGsynthetic_token_12345678901234567890',
      '123456789012345',
      'v99.0',
      5000,
    );

    const result = await adapter.send(REQUEST);

    expect(result).toEqual({ provider: 'meta_cloud', messageId: 'wamid.synthetic-123' });
    const call = fetchMock.mock.calls[0];
    expect(call?.[0]).toBe('https://graph.facebook.com/v99.0/123456789012345/messages');
    const init = call?.[1];
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.Authorization).toBe('Bearer EAAGsynthetic_token_12345678901234567890');
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body).toMatchObject({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: REQUEST.to,
      type: 'template',
      template: {
        name: REQUEST.templateName,
        language: { code: REQUEST.languageCode },
      },
    });
    expect(JSON.stringify(body)).not.toContain('identity');
    expect(JSON.stringify(body)).not.toContain('evidence');
  });

  it('normalizes rate limits and server failures as retryable unavailability', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 429 }));
    const adapter = new MetaWhatsAppProviderAdapter(
      'EAAGsynthetic_token_12345678901234567890',
      '123456789012345',
      'v99.0',
      5000,
    );

    await expect(adapter.send(REQUEST)).rejects.toBeInstanceOf(WhatsAppProviderUnavailableError);
  });

  it('treats non-retryable provider responses as rejected delivery', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 400 }));
    const adapter = new MetaWhatsAppProviderAdapter(
      'EAAGsynthetic_token_12345678901234567890',
      '123456789012345',
      'v99.0',
      5000,
    );

    await expect(adapter.send(REQUEST)).rejects.toMatchObject({
      name: 'WhatsAppProviderRejectedError',
      status: 400,
    } satisfies Partial<WhatsAppProviderRejectedError>);
  });
});
