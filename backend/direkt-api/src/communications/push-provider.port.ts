export const PUSH_PROVIDER = Symbol('PUSH_PROVIDER');

export interface PushProviderSendRequest {
  token: string;
  deliveryId: string;
  sourceSha: string;
  phase: 'foreground' | 'background';
}

export interface PushProviderSendResult {
  provider: 'fcm';
  messageId: string;
}

export interface PushProviderPort {
  readonly provider: 'disabled' | 'fcm';
  send(request: PushProviderSendRequest): Promise<PushProviderSendResult>;
}

export class PushProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PushProviderUnavailableError';
  }
}

export class PushProviderRejectedError extends Error {
  constructor(
    readonly status: number,
    readonly invalidToken: boolean,
    message: string,
  ) {
    super(message);
    this.name = 'PushProviderRejectedError';
  }
}
