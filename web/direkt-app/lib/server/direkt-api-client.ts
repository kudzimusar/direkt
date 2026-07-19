import type {
  PublicAvailabilityView,
  PublicCategory,
  PublicClaimCard,
  PublicProviderBundle,
  PublicProviderProfile,
  PublicProviderSearchResponse,
  PublicReviewView,
  PublicShareView,
} from "../contracts/discovery";
import { getCloudRunIdentityToken } from "./cloud-run-identity";
import { getDirektWebRuntimeConfig, type DirektWebApiMode } from "./runtime-config";

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
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
