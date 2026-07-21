import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AiProviderUnavailableError } from '../../../src/ai/ai-provider.port';
import { GeminiAiProviderAdapter } from '../../../src/ai/gemini-ai-provider.adapter';
import { GroqAiProviderAdapter } from '../../../src/ai/groq-ai-provider.adapter';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AI provider adapters', () => {
  it('parses a successful Gemini response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'DIREKT_AI_OK' }] } }],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const adapter = new GeminiAiProviderAdapter(
      'gemini-key-12345678901234567890',
      'gemini-test',
      5000,
    );

    const result = await adapter.generate({
      purpose: 'support_assist',
      prompt: 'synthetic test',
    });

    expect(result).toEqual({
      provider: 'gemini',
      model: 'gemini-test',
      text: 'DIREKT_AI_OK',
    });
  });

  it('parses a successful Groq response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'DIREKT_GROQ_OK' } }],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const adapter = new GroqAiProviderAdapter('groq-key-12345678901234567890', 'groq-test', 5000);

    const result = await adapter.generate({
      purpose: 'support_assist',
      prompt: 'synthetic test',
    });

    expect(result).toEqual({
      provider: 'groq',
      model: 'groq-test',
      text: 'DIREKT_GROQ_OK',
    });
  });

  it('normalizes provider HTTP failures without exposing response bodies', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'sensitive provider detail' } }), {
        status: 429,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const adapter = new GeminiAiProviderAdapter(
      'gemini-key-12345678901234567890',
      'gemini-test',
      5000,
    );

    await expect(
      adapter.generate({ purpose: 'summarize', prompt: 'synthetic test' }),
    ).rejects.toMatchObject({
      name: 'AiProviderUnavailableError',
      message: 'Gemini request failed with status 429.',
    } satisfies Partial<AiProviderUnavailableError>);
  });
});
