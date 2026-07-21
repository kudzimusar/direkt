import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AI_FALLBACK_PROVIDER,
  AI_PRIMARY_PROVIDER,
  AiInputRejectedError,
  AiProviderUnavailableError,
  type AiAssistInput,
  type AiAssistResult,
  type AiProviderPort,
  type AiProviderRequest,
} from './ai-provider.port';

const AUTHORITY_BOUNDARY = [
  'You are an assistive DIREKT AI component.',
  'Never claim to verify a provider, change trust/ranking/publication status, approve or release payments or escrow, decide disputes, override consent, or grant authorization.',
  'Return assistance only; authoritative DIREKT state is decided by deterministic backend rules and human review where required.',
].join(' ');

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PRIMARY_PROVIDER)
    private readonly primaryProvider: AiProviderPort,
    @Inject(AI_FALLBACK_PROVIDER)
    private readonly fallbackProvider: AiProviderPort,
    private readonly configService: ConfigService,
  ) {}

  async assist(input: AiAssistInput): Promise<AiAssistResult> {
    if (input.dataClassification !== 'synthetic') {
      throw new AiInputRejectedError(
        'AI requests currently permit synthetic data only.',
      );
    }

    const prompt = input.prompt.trim();
    if (!prompt) {
      throw new AiInputRejectedError('AI prompt must not be empty.');
    }

    const maxInputChars =
      this.configService.getOrThrow<number>('AI_MAX_INPUT_CHARS');
    if (prompt.length > maxInputChars) {
      throw new AiInputRejectedError(
        `AI prompt exceeds the ${maxInputChars}-character limit.`,
      );
    }

    const request: AiProviderRequest = {
      purpose: input.purpose,
      prompt: `${AUTHORITY_BOUNDARY}\nPurpose: ${input.purpose}\nSynthetic input:\n${prompt}`,
    };

    try {
      const result = await this.primaryProvider.generate(request);
      return { ...result, fallbackUsed: false };
    } catch (error) {
      if (!(error instanceof AiProviderUnavailableError)) {
        throw error;
      }
      if (this.fallbackProvider.provider === 'disabled') {
        throw error;
      }
      const fallbackResult = await this.fallbackProvider.generate(request);
      return { ...fallbackResult, fallbackUsed: true };
    }
  }
}
