import {
  WhatsAppProviderUnavailableError,
  type WhatsAppProviderPort,
  type WhatsAppProviderSendResult,
} from './whatsapp-provider.port';

export class DisabledWhatsAppProviderAdapter implements WhatsAppProviderPort {
  readonly provider = 'disabled' as const;

  send(): Promise<WhatsAppProviderSendResult> {
    return Promise.reject(new WhatsAppProviderUnavailableError('WhatsApp provider is disabled.'));
  }
}
