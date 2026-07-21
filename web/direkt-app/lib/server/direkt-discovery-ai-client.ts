import type { DiscoveryAiAssistResponse } from "@/lib/contracts/discovery-ai";
import { getCloudRunIdentityToken } from "@/lib/server/cloud-run-identity";
import { getDirektWebRuntimeConfig } from "@/lib/server/runtime-config";

export class DiscoveryAiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "DiscoveryAiClientError";
  }
}

export async function requestDiscoveryAssist(input: {
  need: string;
  area?: string;
}): Promise<DiscoveryAiAssistResponse> {
  const config = getDirektWebRuntimeConfig();
  if (!config.apiBaseUrl || config.apiMode === "disabled") {
    throw new DiscoveryAiClientError(
      "AI discovery assistance is not available in this environment.",
      503,
    );
  }

  const url = new URL("/api/v1/public/discovery/assist", config.apiBaseUrl);
  if (url.origin !== config.apiBaseUrl.origin) {
    throw new DiscoveryAiClientError(
      "DIREKT API request escaped the configured origin.",
      500,
    );
  }

  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/json",
    "user-agent": "direkt-functional-web/0.2",
  };

  if (config.apiMode === "authenticated-bff") {
    const infrastructureToken = await getCloudRunIdentityToken(
      config.apiBaseUrl,
    );
    headers["X-Serverless-Authorization"] = `Bearer ${infrastructureToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(6_000),
    });
  } catch {
    throw new DiscoveryAiClientError(
      "AI discovery assistance is temporarily unavailable.",
      503,
    );
  }

  if (!response.ok) {
    throw new DiscoveryAiClientError(
      response.status >= 500
        ? "AI discovery assistance is temporarily unavailable."
        : "The service description could not be processed.",
      response.status,
    );
  }

  return (await response.json()) as DiscoveryAiAssistResponse;
}
