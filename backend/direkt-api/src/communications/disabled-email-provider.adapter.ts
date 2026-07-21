import {
  EmailProviderUnavailableError,
  type EmailDeliveryRequest,
  type EmailDeliveryResult,
  type EmailProviderPort,
} from './email-provider.port';

export class DisabledEmailProviderAdapter implements EmailProviderPort {
  readonly provider = 'disabled' as const;

  send(input: EmailDeliveryRequest): Promise<EmailDeliveryResult> {
    void input;
    return Promise.reject(new EmailProviderUnavailableError('Email provider is disabled.'));
  }
}
