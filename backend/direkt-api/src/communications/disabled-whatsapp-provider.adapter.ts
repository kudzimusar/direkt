import {
  WhatsAppProviderUnavailableError,
  type WhatsAppProviderPort,
  type WhatsAppProviderSendRequest,
  type WhatsAppProviderSendResult,
} from './whatsapp-provider.port';

export class DisabledWhatsAppProviderAdapter implements WhatsAppProviderPort {
  readonly provider = 'disabled' as const;

  send(_request: WhatsAppProviderSendRequest): Promise<WhatsAppProviderSendResult> {
    return Promise.reject(new WhatsAppProviderUnavailableError('WhatsApp provider is disabled.'));
  }
}
