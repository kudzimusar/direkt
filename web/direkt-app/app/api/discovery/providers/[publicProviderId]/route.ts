import { discoveryErrorResponse, noStoreJson } from "@/lib/server/api-response";
import { DirektApiClient } from "@/lib/server/direkt-api-client";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicProviderId: string }> },
) {
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

  const { publicProviderId } = await context.params;
  if (!UUID.test(publicProviderId)) {
    return noStoreJson(
      {
        type: "about:blank",
        title: "Invalid provider identifier",
        status: 400,
        detail: "The requested public provider identifier is not valid.",
      },
      400,
    );
  }

  try {
    return noStoreJson(await new DirektApiClient().getPublicProviderBundle(publicProviderId));
  } catch (error) {
    return discoveryErrorResponse(error);
  }
}
