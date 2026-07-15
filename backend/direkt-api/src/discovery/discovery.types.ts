export type PublicOperatingModel = 'fixed_premises' | 'mobile' | 'hybrid';
export type PublicAvailability = 'available' | 'limited' | 'unavailable' | 'unknown';

export interface PublicPoint {
  latitude: number;
  longitude: number;
}

export interface PublicImageVariants {
  lowBandwidthUrl: string | null;
  standardUrl: string | null;
  altText: string | null;
}

export interface PublicClaimCard {
  claimKey: string;
  statement: string;
  limitation: string;
  evidenceClass: string;
  checkedAt: string;
  validUntil: string;
  policyVersion: string;
}

export interface PublicProviderCard {
  publicProviderId: string;
  categoryKey: string;
  categoryName: string;
  displayName: string;
  operatingModel: PublicOperatingModel;
  locality: string;
  publicPremises: PublicPoint | null;
  serviceAreaGeoJson: Record<string, unknown>;
  availability: PublicAvailability;
  nextAvailableAt: string | null;
  image: PublicImageVariants;
  claims: PublicClaimCard[];
  reasons: string[];
  distanceKm: number | null;
  sharePath: string;
  synthetic: true;
}

export interface PublicProviderProfile extends PublicProviderCard {
  trustSummary: string;
  locationExplanation: string;
  imagePolicy: string;
}

export interface PublicCategory {
  key: string;
  name: string;
  description: string;
}

export interface DiscoverySearchResponse {
  items: PublicProviderCard[];
  nextCursor: string | null;
  searchContext: {
    manualArea: string | null;
    usedOneTimeLocation: boolean;
    backgroundLocationUsed: false;
    resultCount: number;
    noResultsSuggestions: string[];
  };
}

export interface SavedProviderView {
  publicProviderId: string;
  displayName: string;
  categoryName: string;
  locality: string;
  savedAt: string;
  sharePath: string;
  synthetic: true;
}

export interface PublicationEligibilityView {
  providerId: string;
  categoryKey: string;
  displayName: string;
  operatingModel: PublicOperatingModel;
  providerStatus: string;
  categoryStatus: string;
  locality: string | null;
  hasPublicPremises: boolean;
  hasServiceArea: boolean;
  mandatoryClaimsCurrent: boolean;
  publicProviderId: string | null;
  publicationStatus: string | null;
  refreshedAt: string | null;
  eligible: boolean;
}
