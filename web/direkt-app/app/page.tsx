import { DirektAppShell } from "@/components/direkt-app-shell";
import type { DiscoveryBootstrap } from "@/components/discovery-experience";
import type { DirektDestination } from "@/lib/navigation";
import { DirektApiClient } from "@/lib/server/direkt-api-client";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";

const allowedDestinations = new Set<DirektDestination>(["discover", "saved", "enquiries", "account"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[]; provider?: string | string[] }>;
}) {
  const capabilities = getPublicRuntimeCapabilities();
  const discovery: DiscoveryBootstrap = { enabled: capabilities.publicDiscoveryEnabled, categories: [], error: null };

  if (capabilities.publicDiscoveryEnabled) {
    try {
      discovery.categories = await new DirektApiClient().getPublicCategories();
    } catch {
      discovery.error = "DIREKT categories are temporarily unavailable. Search may also be unavailable.";
    }
  }

  const params = await searchParams;
  const requestedView = Array.isArray(params.view) ? params.view[0] : params.view;
  const requestedProvider = Array.isArray(params.provider) ? params.provider[0] : params.provider;
  const initialDestination = requestedView && allowedDestinations.has(requestedView as DirektDestination)
    ? (requestedView as DirektDestination)
    : "discover";
  const initialProviderId = requestedProvider && UUID.test(requestedProvider) ? requestedProvider : null;

  return <DirektAppShell discoveryBootstrap={discovery} initialDestination={initialDestination} initialProviderId={initialProviderId} />;
}
