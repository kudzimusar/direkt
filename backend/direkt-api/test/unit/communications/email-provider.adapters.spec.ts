import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  EmailProviderRejectedError,
  EmailProviderUnavailableError,
} from '../../../src/communications/email-provider.port';
import { ResendEmailProviderAdapter } from '../../../src/communications/resend-email-provider.adapter';

const REQUEST = {
  from: 'DIREKT <canary@notify.direkt.forum>',
  to: 'delivered@resend.dev',
  subject: 'Synthetic canary',
  text: 'Synthetic only',
  idempotencyKey: 'direkt-email-00000000-0000-0000-0000-000000000001',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ResendEmailProviderAdapter', () => {
  it('sends through the Resend API with the stable idempotency key', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'email_123' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const adapter = new ResendEmailProviderAdapter('re_test_key_12345678901234567890', 5000);

    const result = await adapter.send(REQUEST);

    expect(result).toEqual({ provider: 'resend', messageId: 'email_123' });
    const call = fetchMock.mock.calls[0];
    expect(call?.[0]).toBe('https://api.resend.com/emails');
    const init = call?.[1];
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.['idempotency-key']).toBe(REQUEST.idempotencyKey);
    expect(headers?.authorization).toBe('Bearer re_test_key_12345678901234567890');
  });

  it('normalizes rate limits and server failures as retryable unavailability', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 429 }));
    const adapter = new ResendEmailProviderAdapter('re_test_key_12345678901234567890', 5000);

    await expect(adapter.send(REQUEST)).rejects.toBeInstanceOf(EmailProviderUnavailableError);
  });

  it('treats non-retryable provider responses as rejected delivery', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 422 }));
    const adapter = new ResendEmailProviderAdapter('re_test_key_12345678901234567890', 5000);

    await expect(adapter.send(REQUEST)).rejects.toMatchObject({
      name: 'EmailProviderRejectedError',
      status: 422,
    } satisfies Partial<EmailProviderRejectedError>);
  });
});
