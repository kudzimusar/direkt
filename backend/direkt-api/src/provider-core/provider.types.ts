export type ProviderPathway =
  | 'registered_business'
  | 'qualified_individual'
  | 'experienced_informal';

export type OperatingModel = 'fixed_premises' | 'mobile' | 'hybrid';
export type ProviderStatus = 'draft' | 'ready_for_verification' | 'suspended' | 'archived';
export type ProviderRepresentativeRole = 'provider_member' | 'provider_responder';

export interface CustomerProfileView {
  identityId: string;
  displayName: string;
  profileStatus: 'active' | 'suspended' | 'closed';
  synthetic: true;
}

export interface ProviderCategorySelectionView {
  categoryKey: string;
  categoryName: string;
  requirementVersion: number;
  status: 'selected' | 'removed';
}

export interface ProviderView {
  id: string;
  pathway: ProviderPathway;
  status: ProviderStatus;
  discoverable: false;
  displayName: string;
  operatingModel: OperatingModel;
  localitySummary: string | null;
  serviceAreaSummary: string;
  registeredBusinessName: string | null;
  qualificationSummary: string | null;
  experienceSummary: string | null;
  revision: number;
  categories: ProviderCategorySelectionView[];
  synthetic: true;
}

export interface CategoryRequirementView {
  key: string;
  label: string;
  kind: string;
  required: boolean;
  guidance: string;
}

export interface CategoryView {
  key: string;
  name: string;
  description: string;
  version: number;
  requirements: CategoryRequirementView[];
}

export interface ProviderOperationsSummary {
  providerId: string;
  displayName: string;
  pathway: ProviderPathway;
  operatingModel: OperatingModel;
  status: ProviderStatus;
  discoverable: false;
  synthetic: true;
}