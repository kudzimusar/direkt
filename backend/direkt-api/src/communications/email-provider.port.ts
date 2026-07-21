export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

export interface EmailDeliveryRequest {
  from: string;
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
}

export interface EmailDeliveryResult {
  provider: 'resend';
  messageId: string;
}

export interface EmailProviderPort {
  readonly provider: 'disabled' | 'resend';
  send(input: EmailDeliveryRequest): Promise<EmailDeliveryResult>;
}

export class EmailProviderUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'EmailProviderUnavailableError';
  }
}

export class EmailProviderRejectedError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'EmailProviderRejectedError';
  }
}
