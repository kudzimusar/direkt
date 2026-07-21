import { GoogleAuth } from "google-auth-library";
import type { DiscoveryAiAssistResponse } from "@/lib/contracts/discovery-ai";

export class DiscoveryAiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function requestDiscoveryAssist(input: {
  need: string;
  area?: string;
}): Promise<DiscoveryAiAssistResponse> {
  if ((process.env.DIREKT_WEB_API_MODE ?? "disabled") !== "live") {
    throw new DiscoveryAiClientError(
      "AI discovery assistance is not available in this environment.",
      503,
    );
  }

  const baseUrl = (
    process.env.DIREKT_WEB_API_BASE_URL ?? process.env.DIREKT_API_BASE_URL ?? ""
  ).replace(/\/$/, "");
  if (!baseUrl) {
    throw new DiscoveryAiClientError("DIREKT API base URL is not configured.", 503);
  }

  const audience =
    process.env.DIREKT_WEB_API_AUDIENCE ?? process.env.DIREKT_API_AUDIENCE ?? baseUrl;
  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(audience);

  try {
    const response = await client.request<DiscoveryAiAssistResponse>({
      url: `${baseUrl}/api/v1/public/discovery/assist`,
      method: "POST",
      data: input,
      headers: {
        "content-type": "application/json",
        "x-direkt-client": "customer-provider-web-bff",
      },
      timeout: 6_000,
    });
    return response.data;
  } catch (cause) {
    const status = extractStatus(cause);
    throw new DiscoveryAiClientError(
      status >= 500
        ? "AI discovery assistance is temporarily unavailable."
        : "The service description could not be processed.",
      status,
    );
  }
}

function extractStatus(cause: unknown): number {
  if (
    typeof cause === "object" &&
    cause !== null &&
    "response" in cause &&
    typeof cause.response === "object" &&
    cause.response !== null &&
    "status" in cause.response &&
    typeof cause.response.status === "number"
  ) {
    return cause.response.status;
  }
  return 503;
}
