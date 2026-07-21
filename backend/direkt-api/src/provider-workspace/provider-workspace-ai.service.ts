import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { getAiUseCaseDefinition } from '../ai/ai-use-case.registry';
import type { ProviderWorkspaceSummary } from './provider-workspace.types';

export interface ProviderOnboardingAssistResponse {
  source: 'ai' | 'deterministic';
  headline: string;
  nextSteps: string[];
  limitations: string[];
}

export interface ProviderProfileDraftResponse {
  source: 'ai' | 'deterministic';
  draft: string;
  requiresProviderConfirmation: true;
  limitations: string[];
}

interface GuidePayload {
  headline?: unknown;
  nextSteps?: unknown;
}

@Injectable()
export class ProviderWorkspaceAiService {
  constructor(private readonly aiService: AiService) {}

  async onboardingGuide(
    workspace: ProviderWorkspaceSummary,
  ): Promise<ProviderOnboardingAssistResponse> {
    const definition = getAiUseCaseDefinition('provider.onboarding.guide');
    const deterministic = deterministicGuide(workspace);

    if (!canUseSyntheticProviderAi(workspace, definition.killSwitchEnv)) {
      return { source: 'deterministic', ...deterministic, limitations: providerLimitations() };
    }

    try {
      const result = await this.aiService.assist({
        purpose: 'support_assist',
        dataClassification: 'synthetic',
        prompt: buildGuidePrompt(workspace, definition.promptVersion),
      });
      const parsed = parseJson(result.text) as GuidePayload;
      const headline = normalize(parsed.headline, 180) || deterministic.headline;
      const nextSteps = Array.isArray(parsed.nextSteps)
        ? parsed.nextSteps
            .filter((item): item is string => typeof item === 'string')
            .map((item) => normalize(item, 220))
            .filter(Boolean)
            .slice(0, 5)
        : [];
      return {
        source: 'ai',
        headline,
        nextSteps: nextSteps.length > 0 ? nextSteps : deterministic.nextSteps,
        limitations: providerLimitations(),
      };
    } catch {
      return { source: 'deterministic', ...deterministic, limitations: providerLimitations() };
    }
  }

  async profileDraft(workspace: ProviderWorkspaceSummary): Promise<ProviderProfileDraftResponse> {
    const definition = getAiUseCaseDefinition('provider.profile.draft');
    const deterministic = deterministicProfileDraft(workspace);

    if (!canUseSyntheticProviderAi(workspace, definition.killSwitchEnv)) {
      return {
        source: 'deterministic',
        draft: deterministic,
        requiresProviderConfirmation: true,
        limitations: profileDraftLimitations(),
      };
    }

    try {
      const result = await this.aiService.assist({
        purpose: 'draft',
        dataClassification: 'synthetic',
        prompt: buildProfilePrompt(workspace, definition.promptVersion),
      });
      const draft = normalize(result.text, 700) || deterministic;
      return {
        source: 'ai',
        draft,
        requiresProviderConfirmation: true,
        limitations: profileDraftLimitations(),
      };
    } catch {
      return {
        source: 'deterministic',
        draft: deterministic,
        requiresProviderConfirmation: true,
        limitations: profileDraftLimitations(),
      };
    }
  }
}

function canUseSyntheticProviderAi(
  workspace: ProviderWorkspaceSummary,
  killSwitchEnv: string,
): boolean {
  return (
    workspace.synthetic === true &&
    process.env.DIREKT_DATA_MODE === 'synthetic-only' &&
    process.env[killSwitchEnv] === 'synthetic'
  );
}

function deterministicGuide(workspace: ProviderWorkspaceSummary): {
  headline: string;
  nextSteps: string[];
} {
  const tasks = [...workspace.tasks]
    .filter((task) => task.state !== 'complete')
    .sort((left, right) => left.priority - right.priority)
    .slice(0, 5)
    .map((task) => `${task.title}: ${task.detail}`);

  return {
    headline:
      workspace.readiness.publicationEligibleCategories > 0
        ? 'Keep your published-ready services current while you complete remaining actions.'
        : 'Complete the next readiness actions before expecting a service to become publication-eligible.',
    nextSteps:
      tasks.length > 0
        ? tasks
        : [
            'Review your profile, services, availability and current check requirements for any changes.',
          ],
  };
}

function deterministicProfileDraft(workspace: ProviderWorkspaceSummary): string {
  const services = workspace.categories.map((category) => category.categoryName).join(', ');
  const locality = workspace.provider.localitySummary || 'your service area';
  const operatingModel = humanize(workspace.provider.operatingModel);
  const serviceText = services || 'local services';
  return `${workspace.provider.displayName} provides ${serviceText} in ${locality}. Services are offered using a ${operatingModel} model. Customers should review current service availability and each check-specific trust detail before making contact.`;
}

function buildGuidePrompt(workspace: ProviderWorkspaceSummary, promptVersion: string): string {
  const safeContext = {
    providerStatus: workspace.provider.status,
    pathway: workspace.provider.pathway,
    operatingModel: workspace.provider.operatingModel,
    selectedServices: workspace.categories.map((category) => ({
      key: category.categoryKey,
      name: category.categoryName,
      publicationEligible: category.publicationEligible,
    })),
    readiness: workspace.readiness,
    tasks: workspace.tasks.map((task) => ({
      key: task.key,
      title: task.title,
      detail: task.detail,
      state: task.state,
      priority: task.priority,
    })),
  };

  return [
    `PROMPT_VERSION=${promptVersion}`,
    'Provide concise onboarding guidance for this synthetic DIREKT provider workspace.',
    'Use only the supplied provider-safe readiness facts.',
    'Do not claim verification, approve checks, change publication, infer evidence quality, or promise business outcomes.',
    'Return JSON only with headline and nextSteps (maximum 5 strings).',
    `PROVIDER_SAFE_CONTEXT=${JSON.stringify(safeContext)}`,
  ].join('\n');
}

function buildProfilePrompt(workspace: ProviderWorkspaceSummary, promptVersion: string): string {
  const safeContext = {
    displayName: workspace.provider.displayName,
    operatingModel: workspace.provider.operatingModel,
    localitySummary: workspace.provider.localitySummary,
    serviceAreaSummary: workspace.provider.serviceAreaSummary,
    services: workspace.categories.map((category) => category.categoryName),
  };

  return [
    `PROMPT_VERSION=${promptVersion}`,
    'Draft one concise public profile paragraph for this synthetic DIREKT provider.',
    'Use only the supplied provider-confirmed facts. Do not invent qualifications, years of experience, prices, availability, guarantees, trust status, reviews, licences, or contact details.',
    'The draft will require provider confirmation before any publication workflow.',
    `PROVIDER_CONFIRMED_FACTS=${JSON.stringify(safeContext)}`,
  ].join('\n');
}

function parseJson(value: string): Record<string, unknown> {
  const cleaned = value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  const parsed: unknown = JSON.parse(cleaned);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Provider AI guidance must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

function providerLimitations(): string[] {
  return [
    'Guidance cannot satisfy a requirement, approve evidence, create a trust check, or publish a service.',
    'The canonical readiness checklist and backend rules remain authoritative.',
    'Restricted evidence and reviewer-private information are not included in this assistance context.',
  ];
}

function profileDraftLimitations(): string[] {
  return [
    'Generated profile wording is an editable draft and requires provider confirmation.',
    'The draft cannot invent qualifications, verification, availability, pricing, reviews, guarantees, or trust claims.',
    'Saving profile copy remains a separate authenticated provider action.',
  ];
}

function normalize(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function humanize(value: string): string {
  return value.replace(/_/g, ' ');
}
