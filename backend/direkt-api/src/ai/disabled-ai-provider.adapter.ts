import {
  AiProviderUnavailableError,
  type AiProviderPort,
  type AiProviderRequest,
  type AiProviderResult,
} from './ai-provider.port';

export class DisabledAiProviderAdapter implements AiProviderPort {
  readonly provider = 'disabled' as const;

  generate(input: AiProviderRequest): Promise<AiProviderResult> {
    void input;
    return Promise.reject(new AiProviderUnavailableError('AI provider is disabled.'));
  }
}
