import {
  EmailProviderRejectedError,
  EmailProviderUnavailableError,
  type EmailDeliveryRequest,
  type EmailDeliveryResult,
  type EmailProviderPort,
} from './email-provider.port';

interface ResendSendResponse {
  id?: string;
}

export class ResendEmailProviderAdapter implements EmailProviderPort {
  readonly provider = 'resend' as const;

  constructor(
    private readonly apiKey: string,
    private readonly timeoutMs: number,
  ) {}

  async send(input: EmailDeliveryRequest): Promise<EmailDeliveryResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
          'idempotency-key': input.idempotencyKey,
        },
        body: JSON.stringify({
          from: input.from,
          to: [input.to],
          subject: input.subject,
          text: input.text,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        if (response.status === 408 || response.status === 429 || response.status >= 500) {
          throw new EmailProviderUnavailableError(
            `Resend request was unavailable with status ${response.status}.`,
          );
        }
        throw new EmailProviderRejectedError(
          response.status,
          `Resend rejected the request with status ${response.status}.`,
        );
      }

      const payload = (await response.json()) as ResendSendResponse;
      if (!payload.id?.trim()) {
        throw new EmailProviderUnavailableError('Resend returned no delivery identifier.');
      }

      return {
        provider: 'resend',
        messageId: payload.id.trim(),
      };
    } catch (error) {
      if (
        error instanceof EmailProviderUnavailableError ||
        error instanceof EmailProviderRejectedError
      ) {
        throw error;
      }
      throw new EmailProviderUnavailableError('Resend request was unavailable.', {
        cause: error,
      });
    }
  }
}
