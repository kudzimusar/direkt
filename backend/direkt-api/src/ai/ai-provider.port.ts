export const AI_PRIMARY_PROVIDER = Symbol('AI_PRIMARY_PROVIDER');
export const AI_FALLBACK_PROVIDER = Symbol('AI_FALLBACK_PROVIDER');

export type AiPurpose =
  | 'search_assist'
  | 'summarize'
  | 'draft'
  | 'translate'
  | 'extraction_suggestion'
  | 'operations_triage'
  | 'support_assist';

export interface AiAssistInput {
  purpose: AiPurpose;
  prompt: string;
  dataClassification: 'synthetic';
}

export interface AiProviderRequest {
  purpose: AiPurpose;
  prompt: string;
}

export interface AiProviderResult {
  provider: 'gemini' | 'groq';
  model: string;
  text: string;
}

export interface AiAssistResult extends AiProviderResult {
  fallbackUsed: boolean;
}

export interface AiProviderPort {
  readonly provider: 'disabled' | 'gemini' | 'groq';
  generate(input: AiProviderRequest): Promise<AiProviderResult>;
}

export class AiProviderUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AiProviderUnavailableError';
  }
}

export class AiInputRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiInputRejectedError';
  }
}
