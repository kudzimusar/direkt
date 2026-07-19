import { DirektAppShell } from "@/components/direkt-app-shell";
import type { DiscoveryBootstrap } from "@/components/discovery-experience";
import type { DirektDestination } from "@/lib/navigation";
import { DirektApiClient } from "@/lib/server/direkt-api-client";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";

const allowedDestinations = new Set<DirektDestination>([
  "discover",
  "saved",
  "enquiries",
  "account",
]);

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const capabilities = getPublicRuntimeCapabilities();
  const discovery: DiscoveryBootstrap = {
    enabled: capabilities.publicDiscoveryEnabled,
    categories: [],
    error: null,
  };

  if (capabilities.publicDiscoveryEnabled) {
    try {
      discovery.categories = await new DirektApiClient().getPublicCategories();
    } catch {
      discovery.error = "DIREKT categories are temporarily unavailable. Search may also be unavailable.";
    }
  }

  const requestedView = (await searchParams).view;
  const view = Array.isArray(requestedView) ? requestedView[0] : requestedView;
  const initialDestination =
    view && allowedDestinations.has(view as DirektDestination)
      ? (view as DirektDestination)
      : "discover";

  return (
    <DirektAppShell
      discoveryBootstrap={discovery}
      initialDestination={initialDestination}
    />
  );
}
