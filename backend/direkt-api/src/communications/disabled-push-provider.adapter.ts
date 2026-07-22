import type {
  PushProviderPort,
  PushProviderSendResult,
} from './push-provider.port';

export class DisabledPushProviderAdapter implements PushProviderPort {
  readonly provider = 'disabled' as const;

  send(): Promise<PushProviderSendResult> {
    throw new Error('Push provider is disabled.');
  }
}
