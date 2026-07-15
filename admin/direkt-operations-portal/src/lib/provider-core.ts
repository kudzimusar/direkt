export type ProviderCoreFixture = {
  providerId: string;
  displayName: string;
  pathway: 'registered_business' | 'qualified_individual' | 'experienced_informal';
  operatingModel: 'fixed' | 'mobile' | 'hybrid';
  profileState: 'draft' | 'complete';
  discoverabilityState: 'blocked';
  categories: string[];
};

export const syntheticProviderCoreFixtures: ProviderCoreFixture[] = [
  {
    providerId: 'synthetic-provider-lsk-001',
    displayName: 'Synthetic Lusaka Plumbing Draft',
    pathway: 'qualified_individual',
    operatingModel: 'mobile',
    profileState: 'complete',
    discoverabilityState: 'blocked',
    categories: ['Plumbing'],
  },
  {
    providerId: 'synthetic-provider-lsk-002',
    displayName: 'Synthetic Workshop Draft',
    pathway: 'registered_business',
    operatingModel: 'hybrid',
    profileState: 'draft',
    discoverabilityState: 'blocked',
    categories: ['Motor-vehicle mechanics'],
  },
];

export function summarizeProviderCore(fixtures: ProviderCoreFixture[]) {
  return {
    total: fixtures.length,
    drafts: fixtures.filter((fixture) => fixture.profileState === 'draft').length,
    complete: fixtures.filter((fixture) => fixture.profileState === 'complete').length,
    discoverable: fixtures.filter((fixture) => fixture.discoverabilityState !== 'blocked').length,
  };
}

export function pathwayLabel(pathway: ProviderCoreFixture['pathway']): string {
  return {
    registered_business: 'Registered business',
    qualified_individual: 'Qualified individual',
    experienced_informal: 'Experienced informal provider',
  }[pathway];
}
