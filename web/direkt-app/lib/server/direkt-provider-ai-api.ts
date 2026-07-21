import type {
  ProviderOnboardingAssistResponse,
  ProviderProfileDraftResponse,
} from "@/lib/contracts/provider-ai";
import { getCloudRunIdentityToken } from "./cloud-run-identity";
import { getDirektWebRuntimeConfig } from "./runtime-config";

export class DirektProviderAiApi {
  private readonly baseUrl: URL;

  constructor() {
    const config = getDirektWebRuntimeConfig();
    if (!config.apiBaseUrl || config.apiMode !== "authenticated-bff") {
      throw new Error(
        "DIREKT provider AI requires the authenticated-bff private API boundary",
      );
    }
    this.baseUrl = config.apiBaseUrl;
  }

  onboardingGuide(
    accessToken: string,
  ): Promise<ProviderOnboardingAssistResponse> {
    return this.request(
      "/api/v1/provider-workspace/me/ai-onboarding-guide",
      accessToken,
    );
  }

  profileDraft(accessToken: string): Promise<ProviderProfileDraftResponse> {
    return this.request(
      "/api/v1/provider-workspace/me/ai-profile-draft",
      accessToken,
    );
  }

  private async request<T>(path: string, accessToken: string): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (url.origin !== this.baseUrl.origin) {
      throw new Error(
        "DIREKT provider AI request escaped the configured API origin",
      );
    }

    const infrastructureToken = await getCloudRunIdentityToken(this.baseUrl);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
        "user-agent": "direkt-functional-web/0.6",
        "X-Serverless-Authorization": `Bearer ${infrastructureToken}`,
      },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(
        `DIREKT provider assistance failed with status ${response.status}`,
      );
    }
    return (await response.json()) as T;
  }
}
