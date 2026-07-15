export const PROVIDER_PATHWAYS = [
  'registered_business',
  'qualified_individual',
  'experienced_informal',
] as const;

export const OPERATING_MODELS = ['fixed', 'mobile', 'hybrid'] as const;
export const PROFILE_STATES = ['draft', 'complete', 'archived'] as const;

export type ProviderPathway = (typeof PROVIDER_PATHWAYS)[number];
export type OperatingModel = (typeof OPERATING_MODELS)[number];
export type ProfileState = (typeof PROFILE_STATES)[number];

const transitions: Readonly<Record<ProfileState, readonly ProfileState[]>> = {
  draft: ['complete', 'archived'],
  complete: ['draft', 'archived'],
  archived: [],
};

export function canTransitionProfile(from: ProfileState, to: ProfileState): boolean {
  return from === to || transitions[from].includes(to);
}

export function validateOperatingModel(input: {
  operatingModel: OperatingModel;
  serviceAreaLabel?: string;
  premisesLabel?: string;
}): string[] {
  const issues: string[] = [];
  if (input.operatingModel !== 'fixed' && (input.serviceAreaLabel?.trim().length ?? 0) < 2) {
    issues.push('Mobile and hybrid providers require a service area.');
  }
  if (input.operatingModel !== 'mobile' && (input.premisesLabel?.trim().length ?? 0) < 2) {
    issues.push('Fixed and hybrid providers require a private premises label.');
  }
  return issues;
}
