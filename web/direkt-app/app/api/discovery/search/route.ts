import type { NextRequest } from "next/server";
import { discoveryErrorResponse, noStoreJson } from "@/lib/server/api-response";
import { DirektApiClient } from "@/lib/server/direkt-api-client";
import { sanitizeDiscoverySearchParams } from "@/lib/server/discovery-query";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const capabilities = getPublicRuntimeCapabilities();
  if (!capabilities.publicDiscoveryEnabled) {
    return noStoreJson(
      {
        type: "about:blank",
        title: "Discovery is not configured",
        status: 503,
        detail: "The functional DIREKT discovery runtime is disabled in this environment.",
      },
      503,
    );
  }

  try {
    const query = sanitizeDiscoverySearchParams(request.nextUrl.searchParams);
    return noStoreJson(await new DirektApiClient().searchPublicProviders(query));
  } catch (error) {
    return discoveryErrorResponse(error);
  }
}
