import { getDirektWebRuntimeConfig } from "./runtime-config";

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

export interface PublicCategory {
  id: string;
  key?: string;
  name: string;
  description?: string | null;
}

export interface PublicProviderSummary {
  publicProviderId: string;
  displayName: string;
  localitySummary?: string | null;
  operatingModel?: string | null;
  categoryNames?: string[];
}

export interface PublicProviderSearchResponse {
  items: PublicProviderSummary[];
  nextCursor?: string | null;
}

export interface PublicProviderProfile extends PublicProviderSummary {
  description?: string | null;
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
