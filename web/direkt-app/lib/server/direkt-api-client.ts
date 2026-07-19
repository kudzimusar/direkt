import { getCloudRunIdentityToken } from "./cloud-run-identity";
import { getDirektWebRuntimeConfig, type DirektWebApiMode } from "./runtime-config";

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

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

/**
 * Mirrors backend/direkt-api/src/discovery/discovery.types.ts.
 * Keep this shape synchronized with the canonical OpenAPI/backend contract until
 * the reviewed generated TypeScript client replaces the temporary hand-maintained boundary.
 */
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

export class DirektApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly problem?: ProblemDetails,
  ) {
    super(message);
    this.name = "DirektApiError";
  }
}

export class DirektApiClient {
  private readonly baseUrl: URL;
  private readonly apiMode: DirektWebApiMode;

  constructor() {
    const config = getDirektWebRuntimeConfig();
    if (!config.apiBaseUrl) {
      throw new Error("DIREKT web API client is disabled by runtime configuration");
    }
    this.baseUrl = config.apiBaseUrl;
    this.apiMode = config.apiMode;
  }

  async getPublicCategories(): Promise<PublicCategory[]> {
    return this.request<PublicCategory[]>("/api/v1/public/categories");
  }

  async searchPublicProviders(query: URLSearchParams): Promise<PublicProviderSearchResponse> {
    const suffix = query.size > 0 ? `?${query.toString()}` : "";
    return this.request<PublicProviderSearchResponse>(`/api/v1/public/providers/search${suffix}`);
  }

  async getPublicProvider(publicProviderId: string): Promise<PublicProviderProfile> {
    return this.request<PublicProviderProfile>(
      `/api/v1/public/providers/${encodeURIComponent(publicProviderId)}`,
    );
  }

  async getPublicProviderClaims(publicProviderId: string): Promise<PublicClaimCard[]> {
    return this.request<PublicClaimCard[]>(
      `/api/v1/public/providers/${encodeURIComponent(publicProviderId)}/claims`,
    );
  }

  async getPublicProviderAvailability(publicProviderId: string): Promise<PublicAvailabilityView> {
    return this.request<PublicAvailabilityView>(
      `/api/v1/public/providers/${encodeURIComponent(publicProviderId)}/availability`,
    );
  }

  async getPublicProviderReviews(publicProviderId: string): Promise<PublicReviewView[]> {
    return this.request<PublicReviewView[]>(
      `/api/v1/public/providers/${encodeURIComponent(publicProviderId)}/reviews`,
    );
  }

  async getPublicProviderShare(publicProviderId: string): Promise<PublicShareView> {
    return this.request<PublicShareView>(
      `/api/v1/public/providers/${encodeURIComponent(publicProviderId)}/share`,
    );
  }

  async getPublicProviderBundle(publicProviderId: string): Promise<PublicProviderBundle> {
    const [profile, claims, availability, reviews, share] = await Promise.all([
      this.getPublicProvider(publicProviderId),
      this.getPublicProviderClaims(publicProviderId),
      this.getPublicProviderAvailability(publicProviderId),
      this.getPublicProviderReviews(publicProviderId),
      this.getPublicProviderShare(publicProviderId),
    ]);
    return { profile, claims, availability, reviews, share };
  }

  private async request<T>(path: string): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (url.origin !== this.baseUrl.origin) {
      throw new Error("DIREKT API request path escaped the configured API origin");
    }

    const headers: Record<string, string> = {
      accept: "application/json",
      "user-agent": "direkt-functional-web/0.2",
    };

    if (this.apiMode === "authenticated-bff") {
      const infrastructureToken = await getCloudRunIdentityToken(this.baseUrl);
      headers["X-Serverless-Authorization"] = `Bearer ${infrastructureToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      let problem: ProblemDetails | undefined;
      try {
        problem = (await response.json()) as ProblemDetails;
      } catch {
        problem = undefined;
      }
      throw new DirektApiError(
        problem?.title || `DIREKT API request failed with status ${response.status}`,
        response.status,
        problem,
      );
    }

    return (await response.json()) as T;
  }
}
