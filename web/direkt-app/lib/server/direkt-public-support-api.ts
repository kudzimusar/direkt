import type { PublicSupportAssistResponse } from "@/lib/contracts/public-support";
import { getCloudRunIdentityToken } from "./cloud-run-identity";
import { getDirektWebRuntimeConfig } from "./runtime-config";

export async function requestPublicSupport(question: string): Promise<PublicSupportAssistResponse> {
  const config = getDirektWebRuntimeConfig();
  if (!config.apiBaseUrl || config.apiMode === "disabled") {
    throw new Error("DIREKT support assistance is unavailable in this environment.");
  }

  const url = new URL("/api/v1/public/support/assist", config.apiBaseUrl);
  if (url.origin !== config.apiBaseUrl.origin) {
    throw new Error("DIREKT support request escaped the configured API origin.");
  }

  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/json",
    "user-agent": "direkt-functional-web/0.7",
  };
  if (config.apiMode === "authenticated-bff") {
    const infrastructureToken = await getCloudRunIdentityToken(config.apiBaseUrl);
    headers["X-Serverless-Authorization"] = `Bearer ${infrastructureToken}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ question }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    throw new Error("DIREKT support assistance is temporarily unavailable.");
  }
  return (await response.json()) as PublicSupportAssistResponse;
}
