export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');

export interface WhatsAppProviderSendRequest {
  to: string;
  templateName: string;
  languageCode: string;
  deliveryId: string;
}

export interface WhatsAppProviderSendResult {
  provider: 'meta_cloud';
  messageId: string;
}

export interface WhatsAppProviderPort {
  readonly provider: 'disabled' | 'meta_cloud';
  send(request: WhatsAppProviderSendRequest): Promise<WhatsAppProviderSendResult>;
}

export class WhatsAppProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WhatsAppProviderUnavailableError';
  }
}

export class WhatsAppProviderRejectedError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'WhatsAppProviderRejectedError';
  }
}
