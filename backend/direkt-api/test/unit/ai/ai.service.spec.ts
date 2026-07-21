import { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import {
  AiInputRejectedError,
  AiProviderUnavailableError,
  type AiAssistInput,
  type AiProviderPort,
} from '../../../src/ai/ai-provider.port';
import { AiService } from '../../../src/ai/ai.service';

function configWithMaxInput(maxInputChars = 1000): ConfigService {
  return {
    getOrThrow: vi.fn((key: string) => {
      if (key === 'AI_MAX_INPUT_CHARS') return maxInputChars;
      throw new Error(`Unexpected config key: ${key}`);
    }),
  } as unknown as ConfigService;
}

describe('AiService', () => {
  it('uses Gemini primary and injects the non-authoritative safety boundary', async () => {
    const primary: AiProviderPort = {
      provider: 'gemini',
      generate: vi.fn().mockResolvedValue({
        provider: 'gemini',
        model: 'gemini-test',
        text: 'assistance',
      }),
    };
    const fallback: AiProviderPort = {
      provider: 'disabled',
      generate: vi.fn(),
    };
    const service = new AiService(primary, fallback, configWithMaxInput());

    const result = await service.assist({
      purpose: 'search_assist',
      prompt: 'Find a synthetic plumber category.',
      dataClassification: 'synthetic',
    });

    expect(result).toEqual({
      provider: 'gemini',
      model: 'gemini-test',
      text: 'assistance',
      fallbackUsed: false,
    });
    expect(primary.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: 'search_assist',
        prompt: expect.stringContaining('Never claim to verify a provider'),
      }),
    );
  });

  it('fails over to Groq only when the primary provider is unavailable', async () => {
    const primary: AiProviderPort = {
      provider: 'gemini',
      generate: vi
        .fn()
        .mockRejectedValue(new AiProviderUnavailableError('temporary failure')),
    };
    const fallback: AiProviderPort = {
      provider: 'groq',
      generate: vi.fn().mockResolvedValue({
        provider: 'groq',
        model: 'groq-test',
        text: 'fallback assistance',
      }),
    };
    const service = new AiService(primary, fallback, configWithMaxInput());

    const result = await service.assist({
      purpose: 'summarize',
      prompt: 'Summarize synthetic case notes.',
      dataClassification: 'synthetic',
    });

    expect(result.provider).toBe('groq');
    expect(result.fallbackUsed).toBe(true);
    expect(fallback.generate).toHaveBeenCalledOnce();
  });

  it('rejects non-synthetic data before any provider call', async () => {
    const primary: AiProviderPort = {
      provider: 'gemini',
      generate: vi.fn(),
    };
    const fallback: AiProviderPort = {
      provider: 'groq',
      generate: vi.fn(),
    };
    const service = new AiService(primary, fallback, configWithMaxInput());
    const unsafeInput = {
      purpose: 'operations_triage',
      prompt: 'real participant data',
      dataClassification: 'controlled-pilot',
    } as unknown as AiAssistInput;

    await expect(service.assist(unsafeInput)).rejects.toBeInstanceOf(
      AiInputRejectedError,
    );
    expect(primary.generate).not.toHaveBeenCalled();
    expect(fallback.generate).not.toHaveBeenCalled();
  });

  it('rejects prompts above the configured bounded input size', async () => {
    const primary: AiProviderPort = {
      provider: 'gemini',
      generate: vi.fn(),
    };
    const fallback: AiProviderPort = {
      provider: 'disabled',
      generate: vi.fn(),
    };
    const service = new AiService(primary, fallback, configWithMaxInput(10));

    await expect(
      service.assist({
        purpose: 'draft',
        prompt: 'this synthetic prompt is too long',
        dataClassification: 'synthetic',
      }),
    ).rejects.toBeInstanceOf(AiInputRejectedError);
    expect(primary.generate).not.toHaveBeenCalled();
  });
});
