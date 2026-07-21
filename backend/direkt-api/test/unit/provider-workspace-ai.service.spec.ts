import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { AiService } from '../../src/ai/ai.service';
import { ProviderWorkspaceAiService } from '../../src/provider-workspace/provider-workspace-ai.service';
import type { ProviderWorkspaceSummary } from '../../src/provider-workspace/provider-workspace.types';

describe('ProviderWorkspaceAiService', () => {
  const originalDataMode = process.env.DIREKT_DATA_MODE;
  const originalGuideMode = process.env.DIREKT_AI_PROVIDER_GUIDE_MODE;
  const originalDraftMode = process.env.DIREKT_AI_PROVIDER_DRAFT_MODE;

  afterEach(() => {
    restoreEnv('DIREKT_DATA_MODE', originalDataMode);
    restoreEnv('DIREKT_AI_PROVIDER_GUIDE_MODE', originalGuideMode);
    restoreEnv('DIREKT_AI_PROVIDER_DRAFT_MODE', originalDraftMode);
    vi.restoreAllMocks();
  });

  it('uses deterministic onboarding guidance when AI is disabled', async () => {
    process.env.DIREKT_DATA_MODE = 'synthetic-only';
    process.env.DIREKT_AI_PROVIDER_GUIDE_MODE = 'disabled';
    const assist = vi.fn();
    const service = createService(assist);

    const result = await service.onboardingGuide(workspaceFixture());

    expect(assist).not.toHaveBeenCalled();
    expect(result.source).toBe('deterministic');
    expect(result.nextSteps[0]).toContain('Complete provider profile');
    expect(result.limitations.join(' ')).toContain('cannot satisfy a requirement');
  });

  it('uses only provider-safe synthetic context for onboarding AI', async () => {
    process.env.DIREKT_DATA_MODE = 'synthetic-only';
    process.env.DIREKT_AI_PROVIDER_GUIDE_MODE = 'synthetic';
    const assist = vi.fn().mockResolvedValue({
      provider: 'gemini',
      model: 'synthetic-test-model',
      fallbackUsed: false,
      text: JSON.stringify({
        headline: 'Complete the remaining profile and check tasks.',
        nextSteps: ['Complete your profile', 'Review the plumbing requirement'],
      }),
    });
    const service = createService(assist);

    const result = await service.onboardingGuide(workspaceFixture());

    expect(result.source).toBe('ai');
    const call = assist.mock.calls[0]?.[0] as { prompt?: string };
    expect(call.prompt).toContain('PROVIDER_SAFE_CONTEXT=');
    expect(call.prompt).not.toContain('private-object-key');
    expect(call.prompt).not.toContain('reviewer-private-note');
  });

  it('keeps profile drafts deterministic outside synthetic-only data mode', async () => {
    process.env.DIREKT_DATA_MODE = 'controlled-pilot';
    process.env.DIREKT_AI_PROVIDER_DRAFT_MODE = 'synthetic';
    const assist = vi.fn();
    const service = createService(assist);

    const result = await service.profileDraft(workspaceFixture());

    expect(assist).not.toHaveBeenCalled();
    expect(result.source).toBe('deterministic');
    expect(result.requiresProviderConfirmation).toBe(true);
  });

  it('marks generated profile wording as a draft requiring provider confirmation', async () => {
    process.env.DIREKT_DATA_MODE = 'synthetic-only';
    process.env.DIREKT_AI_PROVIDER_DRAFT_MODE = 'synthetic';
    const assist = vi.fn().mockResolvedValue({
      provider: 'gemini',
      model: 'synthetic-test-model',
      fallbackUsed: false,
      text: 'Synthetic Copperbelt Repairs provides plumbing services across Woodlands and nearby areas.',
    });
    const service = createService(assist);

    const result = await service.profileDraft(workspaceFixture());

    expect(result.source).toBe('ai');
    expect(result.requiresProviderConfirmation).toBe(true);
    expect(result.limitations.join(' ')).toContain('cannot invent qualifications');
  });
});

function createService(assist: Mock) {
  return new ProviderWorkspaceAiService({ assist } as unknown as AiService);
}

function workspaceFixture(): ProviderWorkspaceSummary {
  return {
    providerId: '00000000-0000-4000-8000-000000000001',
    representativeRole: 'provider_owner',
    provider: {
      pathway: 'experienced_informal',
      status: 'draft',
      discoverable: false,
      displayName: 'Synthetic Copperbelt Repairs',
      operatingModel: 'mobile',
      localitySummary: 'Woodlands, Lusaka',
      serviceAreaSummary: 'Lusaka central and nearby neighbourhoods',
      registeredBusinessName: null,
      qualificationSummary: null,
      experienceSummary: null,
      revision: 1,
    },
    categories: [
      {
        categoryKey: 'plumbing',
        categoryName: 'Plumbing',
        requirementVersion: 1,
        status: 'selected',
        requiredRequirements: 2,
        evidenceSubmitted: 1,
        openCases: 1,
        correctionRequired: 0,
        currentClaims: 0,
        publicationEligible: false,
      },
    ],
    location: {
      configured: true,
      privateBaseStored: true,
      publicPremisesConfigured: false,
      publicPremisesConsent: false,
      publicLocality: 'Woodlands, Lusaka',
      serviceAreaConfigured: true,
      privacyBoundary: 'Private base is not exposed.',
    },
    availability: [],
    readiness: {
      profileComplete: false,
      selectedCategories: 1,
      mandatoryRequirements: 2,
      evidenceSubmitted: 1,
      openCases: 1,
      correctionRequired: 0,
      currentClaims: 0,
      publicationEligibleCategories: 0,
      completionPercent: 40,
    },
    tasks: [
      {
        key: 'complete_profile',
        title: 'Complete provider profile',
        detail: 'Add the remaining public profile information.',
        state: 'action_required',
        priority: 10,
        action: 'profile',
      },
    ],
    deferredSurfaces: {
      enquiries: {
        state: 'read_only',
        phaseOwner: 'phase8',
        mutationAllowed: false,
        message: 'Read-only.',
      },
      reviewResponses: {
        state: 'read_only',
        phaseOwner: 'phase8',
        mutationAllowed: false,
        message: 'Read-only.',
      },
      subscription: {
        state: 'read_only',
        phaseOwner: 'phase9',
        mutationAllowed: false,
        message: 'Read-only.',
      },
    },
    trustBoundary: 'AI cannot create trust authority.',
    synthetic: true,
  };
}

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
