import type {
  PushProviderPort,
  PushProviderSendRequest,
  PushProviderSendResult,
} from './push-provider.port';

export class DisabledPushProviderAdapter implements PushProviderPort {
  readonly provider = 'disabled' as const;

  send(_request: PushProviderSendRequest): Promise<PushProviderSendResult> {
    throw new Error('Push provider is disabled.');
  }
}
