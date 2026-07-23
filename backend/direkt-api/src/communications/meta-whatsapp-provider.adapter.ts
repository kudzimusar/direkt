import {
  WhatsAppProviderRejectedError,
  WhatsAppProviderUnavailableError,
  type WhatsAppProviderPort,
  type WhatsAppProviderSendRequest,
  type WhatsAppProviderSendResult,
} from './whatsapp-provider.port';

interface MetaSendResponse {
  messages?: Array<{ id?: unknown }>;
}

export class MetaWhatsAppProviderAdapter implements WhatsAppProviderPort {
  readonly provider = 'meta_cloud' as const;

  constructor(
    private readonly accessToken: string,
    private readonly phoneNumberId: string,
    private readonly graphApiVersion: string,
    private readonly timeoutMs: number,
  ) {}

  async send(request: WhatsAppProviderSendRequest): Promise<WhatsAppProviderSendResult> {
    const response = await fetch(
      `https://graph.facebook.com/${encodeURIComponent(this.graphApiVersion)}/${encodeURIComponent(this.phoneNumberId)}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-DIREKT-Delivery-Id': request.deliveryId,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: request.to,
          type: 'template',
          template: {
            name: request.templateName,
            language: { code: request.languageCode },
          },
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      },
    ).catch((error: unknown) => {
      throw new WhatsAppProviderUnavailableError(
        error instanceof Error
          ? `WhatsApp Cloud API request failed: ${error.name}`
          : 'WhatsApp Cloud API request failed.',
      );
    });

    const responseText = await response.text();
    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) {
        throw new WhatsAppProviderUnavailableError(
          `WhatsApp Cloud API unavailable with HTTP ${response.status}.`,
        );
      }
      throw new WhatsAppProviderRejectedError(
        response.status,
        `WhatsApp Cloud API rejected the bounded template request with HTTP ${response.status}.`,
      );
    }

    let parsed: MetaSendResponse;
    try {
      parsed = JSON.parse(responseText) as MetaSendResponse;
    } catch {
      throw new WhatsAppProviderUnavailableError(
        'WhatsApp Cloud API returned a malformed success response.',
      );
    }
    const messageId = parsed.messages?.[0]?.id;
    if (typeof messageId !== 'string' || messageId.length < 8 || messageId.length > 512) {
      throw new WhatsAppProviderUnavailableError(
        'WhatsApp Cloud API success response did not contain a valid message id.',
      );
    }
    return { provider: 'meta_cloud', messageId };
  }
}
