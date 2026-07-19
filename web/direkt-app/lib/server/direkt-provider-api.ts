import type {
  ProviderCommercialWorkspace,
  ProviderContactHandoff,
  ProviderEnquiry,
  ProviderEnquiryListView,
  ProviderInteractionListView,
  ProviderReviewListView,
  ProviderTimelineEvent,
  ProviderUploadGrant,
  ProviderUploadIntent,
  ProviderWorkspaceSummary,
} from "@/lib/contracts/provider";
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
  idempotencyKey?: string;
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

  workspace(accessToken: string): Promise<ProviderWorkspaceSummary> {
    return this.request("/api/v1/provider-workspace/me", { accessToken });
  }

  verificationTimeline(accessToken: string): Promise<ProviderTimelineEvent[]> {
    return this.request("/api/v1/provider-workspace/me/verification-timeline", { accessToken });
  }

  updateProfile(
    accessToken: string,
    body: Partial<{
      displayName: string;
      operatingModel: "fixed_premises" | "mobile" | "hybrid";
      localitySummary: string;
      serviceAreaSummary: string;
      registeredBusinessName: string;
      qualificationSummary: string;
      experienceSummary: string;
    }>,
  ): Promise<ProviderWorkspaceSummary> {
    return this.request("/api/v1/provider-workspace/me/profile", { method: "PATCH", accessToken, body });
  }

  updateLocation(
    accessToken: string,
    body: {
      privateBaseLatitude?: number;
      privateBaseLongitude?: number;
      publicPremisesLatitude?: number;
      publicPremisesLongitude?: number;
      publicPremisesConsent: boolean;
      publicLocality: string;
      serviceAreaWkt: string;
    },
  ): Promise<ProviderWorkspaceSummary> {
    return this.request("/api/v1/provider-workspace/me/location", { method: "PUT", accessToken, body });
  }

  selectService(accessToken: string, categoryKey: string): Promise<ProviderWorkspaceSummary> {
    return this.request(`/api/v1/provider-workspace/me/services/${encodeURIComponent(categoryKey)}`, { method: "PUT", accessToken });
  }

  removeService(accessToken: string, categoryKey: string, reason: string): Promise<ProviderWorkspaceSummary> {
    return this.request(`/api/v1/provider-workspace/me/services/${encodeURIComponent(categoryKey)}`, { method: "DELETE", accessToken, body: { reason } });
  }

  updateAvailability(
    accessToken: string,
    categoryKey: string,
    body: { state: "available" | "limited" | "unavailable" | "unknown"; nextAvailableAt?: string },
  ): Promise<ProviderWorkspaceSummary> {
    return this.request(`/api/v1/provider-workspace/me/availability/${encodeURIComponent(categoryKey)}`, { method: "PUT", accessToken, body });
  }

  listUploadIntents(accessToken: string): Promise<ProviderUploadIntent[]> {
    return this.request("/api/v1/provider-workspace/me/upload-intents", { accessToken });
  }

  createUploadIntent(
    accessToken: string,
    body: {
      caseId: string;
      clientIntentKey: string;
      evidenceClass: "contact" | "identity" | "business" | "qualification" | "licence" | "experience" | "location" | "premises" | "field";
      documentType: string;
      contentType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
      maxBytes: number;
      consentConfirmed: boolean;
      replacementForEvidenceId?: string;
    },
  ): Promise<ProviderUploadGrant | ProviderUploadIntent> {
    return this.request("/api/v1/provider-workspace/me/upload-intents", { method: "POST", accessToken, body });
  }

  uploadIntent(accessToken: string, uploadIntentId: string): Promise<ProviderUploadIntent> {
    return this.request(`/api/v1/provider-workspace/me/upload-intents/${encodeURIComponent(uploadIntentId)}`, { accessToken });
  }

  retryUploadIntent(accessToken: string, uploadIntentId: string): Promise<ProviderUploadGrant> {
    return this.request(`/api/v1/provider-workspace/me/upload-intents/${encodeURIComponent(uploadIntentId)}/retry`, { method: "POST", accessToken });
  }

  markUploadInterrupted(accessToken: string, uploadIntentId: string, errorCode: string): Promise<ProviderUploadIntent> {
    return this.request(`/api/v1/provider-workspace/me/upload-intents/${encodeURIComponent(uploadIntentId)}/interrupted`, { method: "PUT", accessToken, body: { errorCode } });
  }

  confirmUploadIntent(
    accessToken: string,
    uploadIntentId: string,
    body: {
      sha256: string;
      sizeBytes: number;
      issuingAuthority?: string;
      issuedAt?: string;
      validFrom?: string;
      expiresAt?: string;
      retentionClass: "short" | "standard" | "regulated" | "legal_hold";
    },
  ): Promise<ProviderUploadIntent> {
    return this.request(`/api/v1/provider-workspace/me/upload-intents/${encodeURIComponent(uploadIntentId)}/confirm`, { method: "POST", accessToken, body });
  }

  cancelUploadIntent(accessToken: string, uploadIntentId: string, reason: string): Promise<ProviderUploadIntent> {
    return this.request(`/api/v1/provider-workspace/me/upload-intents/${encodeURIComponent(uploadIntentId)}`, { method: "DELETE", accessToken, body: { reason } });
  }

  listEnquiries(accessToken: string): Promise<ProviderEnquiryListView> {
    return this.request("/api/v1/provider-workspace/me/enquiries", { accessToken });
  }

  enquiry(accessToken: string, enquiryId: string): Promise<ProviderEnquiry> {
    return this.request(`/api/v1/provider-workspace/me/enquiries/${encodeURIComponent(enquiryId)}`, { accessToken });
  }

  transitionEnquiry(
    accessToken: string,
    enquiryId: string,
    body: {
      targetStatus: "acknowledged" | "needs_information" | "accepted" | "declined" | "closed";
      expectedRevision: number;
      reason: string;
      policyVersion: string;
    },
  ): Promise<ProviderEnquiry> {
    return this.request(`/api/v1/provider-workspace/me/enquiries/${encodeURIComponent(enquiryId)}/transitions`, { method: "POST", accessToken, body });
  }

  interactions(accessToken: string): Promise<ProviderInteractionListView> {
    return this.request("/api/v1/provider-workspace/me/interactions", { accessToken });
  }

  currentHandoff(accessToken: string, enquiryId: string): Promise<ProviderContactHandoff> {
    return this.request(`/api/v1/provider-workspace/me/enquiries/${encodeURIComponent(enquiryId)}/handoff`, { accessToken });
  }

  listReviews(accessToken: string): Promise<ProviderReviewListView> {
    return this.request("/api/v1/provider-workspace/me/reviews", { accessToken });
  }

  respondToReview(accessToken: string, reviewId: string, body: { body: string; policyVersion: string }): Promise<Record<string, unknown>> {
    return this.request(`/api/v1/provider-workspace/me/reviews/${encodeURIComponent(reviewId)}/response`, { method: "POST", accessToken, body });
  }

  appealReview(accessToken: string, reviewId: string, body: { reason: string; policyVersion: string }): Promise<Record<string, unknown>> {
    return this.request(`/api/v1/provider-workspace/me/reviews/${encodeURIComponent(reviewId)}/appeals`, { method: "POST", accessToken, body });
  }

  commercial(accessToken: string): Promise<ProviderCommercialWorkspace> {
    return this.request("/api/v1/provider-workspace/me/commercial", { accessToken });
  }

  createSubscription(
    accessToken: string,
    body: { productKey: string; priceKey: string; policyVersion: string },
    idempotencyKey: string,
  ): Promise<Record<string, unknown>> {
    return this.request("/api/v1/provider-workspace/me/subscriptions", { method: "POST", accessToken, body, idempotencyKey });
  }

  cancelSubscription(
    accessToken: string,
    subscriptionId: string,
    body: { expectedRevision: number; reason: string; policyVersion: string },
  ): Promise<Record<string, unknown>> {
    return this.request(`/api/v1/provider-workspace/me/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, { method: "POST", accessToken, body });
  }

  issueInvoice(accessToken: string, subscriptionId: string, policyVersion: string): Promise<Record<string, unknown>> {
    return this.request(`/api/v1/provider-workspace/me/subscriptions/${encodeURIComponent(subscriptionId)}/invoices`, { method: "POST", accessToken, body: { policyVersion } });
  }

  createPaymentIntent(
    accessToken: string,
    invoiceId: string,
    policyVersion: string,
    idempotencyKey: string,
  ): Promise<Record<string, unknown>> {
    return this.request(`/api/v1/provider-workspace/me/invoices/${encodeURIComponent(invoiceId)}/payment-intents`, { method: "POST", accessToken, body: { policyVersion }, idempotencyKey });
  }

  cancelPaymentIntent(
    accessToken: string,
    paymentIntentId: string,
    expectedRevision: number,
    policyVersion: string,
  ): Promise<Record<string, unknown>> {
    return this.request(`/api/v1/provider-workspace/me/payment-intents/${encodeURIComponent(paymentIntentId)}/cancel`, { method: "POST", accessToken, body: { expectedRevision, policyVersion } });
  }

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (url.origin !== this.baseUrl.origin) throw new Error("DIREKT provider request path escaped the configured API origin");

    const infrastructureToken = await getCloudRunIdentityToken(this.baseUrl);
    const headers: Record<string, string> = {
      accept: "application/json",
      authorization: `Bearer ${options.accessToken}`,
      "user-agent": "direkt-functional-web/0.6",
      "X-Serverless-Authorization": `Bearer ${infrastructureToken}`,
    };
    if (options.body !== undefined) headers["content-type"] = "application/json";
    if (options.idempotencyKey) headers["idempotency-key"] = options.idempotencyKey;

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
      try { problem = (await response.json()) as Record<string, unknown>; } catch { problem = undefined; }
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
