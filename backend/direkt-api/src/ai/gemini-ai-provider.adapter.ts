import {
  AiProviderUnavailableError,
  type AiProviderPort,
  type AiProviderRequest,
  type AiProviderResult,
} from './ai-provider.port';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export class GeminiAiProviderAdapter implements AiProviderPort {
  readonly provider = 'gemini' as const;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly timeoutMs: number,
  ) {}

  async generate(input: AiProviderRequest): Promise<AiProviderResult> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: input.prompt }],
            },
          ],
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        throw new AiProviderUnavailableError(
          `Gemini request failed with status ${response.status}.`,
        );
      }

      const payload = (await response.json()) as GeminiResponse;
      const text = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? '')
        .join('')
        .trim();

      if (!text) {
        throw new AiProviderUnavailableError('Gemini returned no usable text.');
      }

      return {
        provider: 'gemini',
        model: this.model,
        text,
      };
    } catch (error) {
      if (error instanceof AiProviderUnavailableError) {
        throw error;
      }
      throw new AiProviderUnavailableError('Gemini request was unavailable.', {
        cause: error,
      });
    }
  }
}
