import { getDirektWebRuntimeConfig } from "./runtime-config";

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

  constructor() {
    const config = getDirektWebRuntimeConfig();
    if (!config.apiBaseUrl) {
      throw new Error("DIREKT web API client is disabled by runtime configuration");
    }
    this.baseUrl = config.apiBaseUrl;
  }

  async getPublicCategories(): Promise<PublicCategory[]> {
    return this.request<PublicCategory[]>("/api/v1/public/categories");
  }

  async searchPublicProviders(query: URLSearchParams): Promise<PublicProviderSearchResponse> {
    return this.request<PublicProviderSearchResponse>(
      `/api/v1/public/providers/search?${query.toString()}`,
    );
  }

  async getPublicProvider(publicProviderId: string): Promise<PublicProviderProfile> {
    return this.request<PublicProviderProfile>(
      `/api/v1/public/providers/${encodeURIComponent(publicProviderId)}`,
    );
  }

  async getPublicProviderClaims(publicProviderId: string): Promise<unknown> {
    return this.request(
      `/api/v1/public/providers/${encodeURIComponent(publicProviderId)}/claims`,
    );
  }

  async getPublicProviderAvailability(publicProviderId: string): Promise<unknown> {
    return this.request(
      `/api/v1/public/providers/${encodeURIComponent(publicProviderId)}/availability`,
    );
  }

  async getPublicProviderReviews(publicProviderId: string): Promise<unknown> {
    return this.request(
      `/api/v1/public/providers/${encodeURIComponent(publicProviderId)}/reviews`,
    );
  }

  private async request<T>(path: string): Promise<T> {
    const url = new URL(path, this.baseUrl);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "user-agent": "direkt-functional-web/0.1",
      },
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
