import { getCloudRunIdentityToken } from "./cloud-run-identity";
import { getDirektWebRuntimeConfig } from "./runtime-config";

export class DirektProviderApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly problem?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DirektProviderApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  accessToken: string;
};

export class DirektProviderApi {
  private readonly baseUrl: URL;

  constructor() {
    const config = getDirektWebRuntimeConfig();
    if (!config.apiBaseUrl || config.apiMode !== "authenticated-bff") {
      throw new Error("DIREKT provider API requires the authenticated-bff private API boundary");
    }
    this.baseUrl = config.apiBaseUrl;
  }

  workspace(accessToken: string) {
    return this.request<Record<string, unknown>>("/api/v1/provider-workspace/me", { accessToken });
  }

  verificationTimeline(accessToken: string) {
    return this.request<Record<string, unknown>[]>("/api/v1/provider-workspace/me/verification-timeline", { accessToken });
  }

  updateProfile(accessToken: string, body: Record<string, unknown>) {
    return this.request<Record<string, unknown>>("/api/v1/provider-workspace/me/profile", {
      method: "PATCH",
      accessToken,
      body,
    });
  }

  selectService(accessToken: string, categoryKey: string) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/services/${encodeURIComponent(categoryKey)}`,
      { method: "PUT", accessToken },
    );
  }

  removeService(accessToken: string, categoryKey: string, reason: string) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/services/${encodeURIComponent(categoryKey)}`,
      { method: "DELETE", accessToken, body: { reason } },
    );
  }

  updateAvailability(
    accessToken: string,
    categoryKey: string,
    body: { state: "available" | "limited" | "unavailable" | "unknown"; nextAvailableAt?: string },
  ) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/availability/${encodeURIComponent(categoryKey)}`,
      { method: "PUT", accessToken, body },
    );
  }

  listUploadIntents(accessToken: string) {
    return this.request<Record<string, unknown>[]>("/api/v1/provider-workspace/me/upload-intents", { accessToken });
  }

  createUploadIntent(accessToken: string, body: Record<string, unknown>) {
    return this.request<Record<string, unknown>>("/api/v1/provider-workspace/me/upload-intents", {
      method: "POST",
      accessToken,
      body,
    });
  }

  retryUploadIntent(accessToken: string, uploadIntentId: string) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/upload-intents/${encodeURIComponent(uploadIntentId)}/retry`,
      { method: "POST", accessToken },
    );
  }

  markUploadInterrupted(accessToken: string, uploadIntentId: string, errorCode: string) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/upload-intents/${encodeURIComponent(uploadIntentId)}/interrupted`,
      { method: "PUT", accessToken, body: { errorCode } },
    );
  }

  confirmUploadIntent(accessToken: string, uploadIntentId: string, body: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/upload-intents/${encodeURIComponent(uploadIntentId)}/confirm`,
      { method: "POST", accessToken, body },
    );
  }

  cancelUploadIntent(accessToken: string, uploadIntentId: string, reason: string) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/upload-intents/${encodeURIComponent(uploadIntentId)}`,
      { method: "DELETE", accessToken, body: { reason } },
    );
  }

  listEnquiries(accessToken: string) {
    return this.request<Record<string, unknown>[]>("/api/v1/provider-workspace/me/enquiries", { accessToken });
  }

  transitionEnquiry(accessToken: string, enquiryId: string, body: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/enquiries/${encodeURIComponent(enquiryId)}/transitions`,
      { method: "POST", accessToken, body },
    );
  }

  listReviews(accessToken: string) {
    return this.request<Record<string, unknown>[]>("/api/v1/provider-workspace/me/reviews", { accessToken });
  }

  respondToReview(accessToken: string, reviewId: string, body: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/reviews/${encodeURIComponent(reviewId)}/response`,
      { method: "POST", accessToken, body },
    );
  }

  appealReview(accessToken: string, reviewId: string, body: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(
      `/api/v1/provider-workspace/me/reviews/${encodeURIComponent(reviewId)}/appeals`,
      { method: "POST", accessToken, body },
    );
  }

  commercial(accessToken: string) {
    return this.request<Record<string, unknown>>("/api/v1/provider-workspace/me/commercial", { accessToken });
  }

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (url.origin !== this.baseUrl.origin) {
      throw new Error("DIREKT provider request path escaped the configured API origin");
    }

    const infrastructureToken = await getCloudRunIdentityToken(this.baseUrl);
    const headers: Record<string, string> = {
      accept: "application/json",
      authorization: `Bearer ${options.accessToken}`,
      "user-agent": "direkt-functional-web/0.5",
      "X-Serverless-Authorization": `Bearer ${infrastructureToken}`,
    };
    if (options.body !== undefined) headers["content-type"] = "application/json";

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      let problem: Record<string, unknown> | undefined;
      try {
        problem = (await response.json()) as Record<string, unknown>;
      } catch {
        problem = undefined;
      }
      const title = typeof problem?.title === "string" ? problem.title : undefined;
      throw new DirektProviderApiError(
        title || `DIREKT provider API request failed with status ${response.status}`,
        response.status,
        response.status >= 500 ? undefined : problem,
      );
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
}