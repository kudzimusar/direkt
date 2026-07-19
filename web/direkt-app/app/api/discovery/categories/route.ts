import { DirektApiClient } from "@/lib/server/direkt-api-client";
import { discoveryErrorResponse, noStoreJson } from "@/lib/server/api-response";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";

export async function GET() {
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
    return noStoreJson(await new DirektApiClient().getPublicCategories());
  } catch (error) {
    return discoveryErrorResponse(error);
  }
}
