import {
  AiProviderUnavailableError,
  type AiProviderPort,
  type AiProviderRequest,
  type AiProviderResult,
} from './ai-provider.port';

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export class GroqAiProviderAdapter implements AiProviderPort {
  readonly provider = 'groq' as const;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly timeoutMs: number,
  ) {}

  async generate(input: AiProviderRequest): Promise<AiProviderResult> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: input.prompt }],
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        throw new AiProviderUnavailableError(`Groq request failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as GroqResponse;
      const text = payload.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw new AiProviderUnavailableError('Groq returned no usable text.');
      }

      return {
        provider: 'groq',
        model: this.model,
        text,
      };
    } catch (error) {
      if (error instanceof AiProviderUnavailableError) {
        throw error;
      }
      throw new AiProviderUnavailableError('Groq request was unavailable.', {
        cause: error,
      });
    }
  }
}
