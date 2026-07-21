import { describe, expect, it } from 'vitest';
import { environmentSchema, type DirektEnvironment } from '../../../src/config/environment';

const GEMINI_KEY = 'gemini-development-key-1234567890';
const GROQ_KEY = 'groq-development-key-123456789012';

describe('AI environment contract', () => {
  it('permits Gemini with Groq fallback only in synthetic data mode', () => {
    const result = environmentSchema.validate({
      DIREKT_DATA_MODE: 'synthetic-only',
      AI_PROVIDER_MODE: 'gemini',
      AI_FALLBACK_PROVIDER: 'groq',
      AI_GEMINI_API_KEY: GEMINI_KEY,
      AI_GROQ_API_KEY: GROQ_KEY,
    });
    const value = result.value as DirektEnvironment;

    expect(result.error).toBeUndefined();
    expect(value.AI_GEMINI_MODEL).toBe('gemini-3.5-flash');
    expect(value.AI_GROQ_MODEL).toBe('openai/gpt-oss-20b');
  });

  it('fails closed when AI is enabled outside synthetic-only data mode', () => {
    const result = environmentSchema.validate({
      DIREKT_DATA_MODE: 'production',
      DIREKT_TRAFFIC_MODE: 'disabled',
      AI_PROVIDER_MODE: 'gemini',
      AI_GEMINI_API_KEY: GEMINI_KEY,
    });

    expect(result.error?.message).toContain(
      'AI provider activation currently permits synthetic-only data mode',
    );
  });

  it('rejects a fallback provider without an enabled primary provider', () => {
    const result = environmentSchema.validate({
      AI_PROVIDER_MODE: 'disabled',
      AI_FALLBACK_PROVIDER: 'groq',
      AI_GROQ_API_KEY: GROQ_KEY,
    });

    expect(result.error?.message).toContain(
      'AI fallback provider cannot be enabled while the primary AI provider is disabled',
    );
  });
});
