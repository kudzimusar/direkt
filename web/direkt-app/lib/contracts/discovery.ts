export type PublicOperatingModel = "fixed_premises" | "mobile" | "hybrid";
export type PublicAvailability = "available" | "limited" | "unavailable" | "unknown";

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

/** Mirrors backend/direkt-api/src/discovery/discovery.types.ts. */
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

export interface PublicProviderSearchResponse {
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

export interface PublicAvailabilityView {
  publicProviderId: string;
  state: PublicAvailability;
  nextAvailableAt: string | null;
  synthetic: true;
}

export interface PublicShareView {
  publicProviderId: string;
  title: string;
  text: string;
  path: string;
  containsPrivateLocation: false;
}

export interface ProviderReviewResponseView {
  responseId: string;
  body: string;
  createdAt: string;
  providerIdentityExposed: false;
}

/** Mirrors backend/direkt-api/src/interaction/review.types.ts PublicReviewView. */
export interface PublicReviewView {
  reviewId: string;
  publicProviderId: string;
  providerDisplayName: string;
  categoryKey: string;
  rating: number;
  title: string;
  body: string;
  publishedAt: string;
  providerResponse: ProviderReviewResponseView | null;
  contactIncluded: false;
  interactionIdentifierIncluded: false;
  moderationRationaleIncluded: false;
  synthetic: true;
}

export interface PublicProviderBundle {
  profile: PublicProviderProfile;
  claims: PublicClaimCard[];
  availability: PublicAvailabilityView;
  reviews: PublicReviewView[];
  share: PublicShareView;
}
