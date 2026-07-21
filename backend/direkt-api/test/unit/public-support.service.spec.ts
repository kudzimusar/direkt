import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { AiService } from '../../src/ai/ai.service';
import { PublicSupportService } from '../../src/ai/public-support.service';

describe('PublicSupportService', () => {
  const originalMode = process.env.DIREKT_AI_PUBLIC_SUPPORT_MODE;

  afterEach(() => {
    if (originalMode === undefined) {
      delete process.env.DIREKT_AI_PUBLIC_SUPPORT_MODE;
    } else {
      process.env.DIREKT_AI_PUBLIC_SUPPORT_MODE = originalMode;
    }
    vi.restoreAllMocks();
  });

  it('returns grounded deterministic help when AI is disabled', async () => {
    process.env.DIREKT_AI_PUBLIC_SUPPORT_MODE = 'disabled';
    const assist = vi.fn();
    const service = createService(assist);

    const result = await service.assist('How do provider trust checks work?');

    expect(assist).not.toHaveBeenCalled();
    expect(result.source).toBe('deterministic');
    expect(result.answer).toContain('check-specific');
    expect(result.sources).toContainEqual({
      id: 'trust.checks',
      title: 'How DIREKT trust information works',
    });
  });

  it('grounds AI help only in selected approved facts', async () => {
    process.env.DIREKT_AI_PUBLIC_SUPPORT_MODE = 'synthetic';
    const assist = vi.fn().mockResolvedValue({
      provider: 'gemini',
      model: 'synthetic-test-model',
      fallbackUsed: false,
      text: 'DIREKT can use a consented public premises point while keeping private provider base coordinates out of customer map pins.',
    });
    const service = createService(assist);

    const result = await service.assist(
      'Does DIREKT expose a provider private location on the map?',
    );

    expect(result.source).toBe('ai');
    expect(result.sources.map((source) => source.id)).toContain('location.privacy');
    expect(assist).toHaveBeenCalledOnce();
    const call = assist.mock.calls[0]?.[0] as { prompt?: string };
    expect(call.prompt).toContain('APPROVED_PUBLIC_FACTS=');
    expect(call.prompt).not.toContain('identity document');
  });

  it('falls back deterministically when the model is unavailable', async () => {
    process.env.DIREKT_AI_PUBLIC_SUPPORT_MODE = 'synthetic';
    const assist = vi.fn().mockRejectedValue(new Error('provider outage'));
    const service = createService(assist);

    const result = await service.assist('Can a subscription improve a provider trust check?');

    expect(result.source).toBe('deterministic');
    expect(result.answer).toContain('subscription or payment cannot create or improve');
  });

  it('does not answer unmatched questions with invented policy', async () => {
    process.env.DIREKT_AI_PUBLIC_SUPPORT_MODE = 'synthetic';
    const assist = vi.fn();
    const service = createService(assist);

    const result = await service.assist('What is the exchange rate next Tuesday?');

    expect(result.source).toBe('unavailable');
    expect(result.sources).toEqual([]);
    expect(assist).not.toHaveBeenCalled();
  });
});

function createService(assist: Mock) {
  return new PublicSupportService({ assist } as unknown as AiService);
}
