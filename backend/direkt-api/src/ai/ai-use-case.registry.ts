export type AiUseCaseKey =
  | 'customer.discovery.intent'
  | 'customer.support.public'
  | 'provider.onboarding.guide'
  | 'provider.profile.draft'
  | 'operations.case.summary';

export type AiDataClass =
  'public-safe' | 'account-private' | 'restricted-trust-evidence' | 'secrets';

export interface AiUseCaseDefinition {
  key: AiUseCaseKey;
  purpose: string;
  userRoles: readonly string[];
  allowedInputClasses: readonly AiDataClass[];
  prohibitedInputClasses: readonly AiDataClass[];
  retrievalSources: readonly string[];
  modelCapability: 'text' | 'structured-json';
  outputSchema: string;
  disclosure: string;
  humanConfirmationRequired: boolean;
  fallback: string;
  maxInputChars: number;
  maxLatencyMs: number;
  auditLevel: 'metadata' | 'restricted';
  evaluationSuite: string;
  promptVersion: string;
  killSwitchEnv: string;
  activation: 'implemented' | 'planned' | 'restricted-gated';
}

const USE_CASES: Record<AiUseCaseKey, AiUseCaseDefinition> = {
  'customer.discovery.intent': {
    key: 'customer.discovery.intent',
    purpose: 'Map a short synthetic service-need description to active DIREKT categories.',
    userRoles: ['public-customer'],
    allowedInputClasses: ['public-safe'],
    prohibitedInputClasses: ['account-private', 'restricted-trust-evidence', 'secrets'],
    retrievalSources: ['catalog.service_categories active public-safe projection'],
    modelCapability: 'structured-json',
    outputSchema: 'DiscoveryAiAssistResponse suggestions subset',
    disclosure: 'AI-assisted suggestions are labelled and require explicit customer confirmation.',
    humanConfirmationRequired: true,
    fallback: 'Deterministic token/category matching and ordinary manual category search.',
    maxInputChars: 240,
    maxLatencyMs: 8000,
    auditLevel: 'metadata',
    evaluationSuite: 'test/ai/customer-discovery-intent.evaluation.json',
    promptVersion: 'customer-discovery-intent-v1',
    killSwitchEnv: 'DIREKT_AI_DISCOVERY_ASSIST_MODE',
    activation: 'implemented',
  },
  'customer.support.public': {
    key: 'customer.support.public',
    purpose: 'Answer product-help questions from approved public DIREKT documentation only.',
    userRoles: ['public-customer', 'provider'],
    allowedInputClasses: ['public-safe'],
    prohibitedInputClasses: ['account-private', 'restricted-trust-evidence', 'secrets'],
    retrievalSources: ['approved public product/help documentation'],
    modelCapability: 'text',
    outputSchema: 'Grounded support answer with source identifiers and fallback state',
    disclosure:
      'Generated help must be labelled as assistance and preserve source links/identifiers.',
    humanConfirmationRequired: false,
    fallback: 'Direct help topics and support navigation.',
    maxInputChars: 500,
    maxLatencyMs: 8000,
    auditLevel: 'metadata',
    evaluationSuite: 'test/ai/public-support.evaluation.json',
    promptVersion: 'customer-support-public-v1',
    killSwitchEnv: 'DIREKT_AI_PUBLIC_SUPPORT_MODE',
    activation: 'planned',
  },
  'provider.onboarding.guide': {
    key: 'provider.onboarding.guide',
    purpose: 'Explain provider onboarding steps and category requirements without changing state.',
    userRoles: ['provider'],
    allowedInputClasses: ['public-safe', 'account-private'],
    prohibitedInputClasses: ['restricted-trust-evidence', 'secrets'],
    retrievalSources: ['provider-safe onboarding state', 'category requirement projections'],
    modelCapability: 'text',
    outputSchema: 'Provider guidance sections plus explicit next-action suggestions',
    disclosure: 'Guidance is advisory; provider and backend workflows remain authoritative.',
    humanConfirmationRequired: true,
    fallback: 'Deterministic readiness checklist and requirement text.',
    maxInputChars: 2000,
    maxLatencyMs: 8000,
    auditLevel: 'metadata',
    evaluationSuite: 'test/ai/provider-onboarding.evaluation.json',
    promptVersion: 'provider-onboarding-guide-v1',
    killSwitchEnv: 'DIREKT_AI_PROVIDER_GUIDE_MODE',
    activation: 'planned',
  },
  'provider.profile.draft': {
    key: 'provider.profile.draft',
    purpose: 'Draft public profile/service copy from provider-confirmed facts.',
    userRoles: ['provider'],
    allowedInputClasses: ['public-safe', 'account-private'],
    prohibitedInputClasses: ['restricted-trust-evidence', 'secrets'],
    retrievalSources: ['provider-confirmed profile facts'],
    modelCapability: 'text',
    outputSchema: 'Editable profile-copy draft',
    disclosure: 'Generated copy is a draft and cannot be published without provider confirmation.',
    humanConfirmationRequired: true,
    fallback: 'Manual profile editor.',
    maxInputChars: 3000,
    maxLatencyMs: 8000,
    auditLevel: 'metadata',
    evaluationSuite: 'test/ai/provider-profile-draft.evaluation.json',
    promptVersion: 'provider-profile-draft-v1',
    killSwitchEnv: 'DIREKT_AI_PROVIDER_DRAFT_MODE',
    activation: 'planned',
  },
  'operations.case.summary': {
    key: 'operations.case.summary',
    purpose: 'Summarize verification case facts for a human operator without making a decision.',
    userRoles: ['operations-reviewer'],
    allowedInputClasses: ['restricted-trust-evidence'],
    prohibitedInputClasses: ['secrets'],
    retrievalSources: ['authorized case projection only'],
    modelCapability: 'structured-json',
    outputSchema:
      'Facts, conflicts, missing information and generated synthesis separated by section',
    disclosure: 'Summary is advisory and never marks a check satisfied or decides a case.',
    humanConfirmationRequired: true,
    fallback: 'Canonical case/evidence/checklist views without AI synthesis.',
    maxInputChars: 8000,
    maxLatencyMs: 10000,
    auditLevel: 'restricted',
    evaluationSuite: 'test/ai/operations-case-summary.evaluation.json',
    promptVersion: 'operations-case-summary-v1',
    killSwitchEnv: 'DIREKT_AI_OPERATIONS_SUMMARY_MODE',
    activation: 'restricted-gated',
  },
};

export function getAiUseCaseDefinition(key: AiUseCaseKey): AiUseCaseDefinition {
  return USE_CASES[key];
}

export function listAiUseCaseDefinitions(): AiUseCaseDefinition[] {
  return Object.values(USE_CASES);
}
