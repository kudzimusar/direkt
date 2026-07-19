import { DirektAppShell } from "@/components/direkt-app-shell";
import type { DiscoveryBootstrap } from "@/components/discovery-experience";
import { DirektApiClient } from "@/lib/server/direkt-api-client";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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

  return <DirektAppShell discoveryBootstrap={discovery} />;
}
