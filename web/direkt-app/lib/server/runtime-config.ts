export type DirektWebApiMode = "disabled" | "public" | "authenticated-bff";

export interface DirektWebRuntimeConfig {
  apiMode: DirektWebApiMode;
  apiBaseUrl: URL | null;
}

const allowedModes = new Set<DirektWebApiMode>(["disabled", "public", "authenticated-bff"]);

export function getDirektWebRuntimeConfig(): DirektWebRuntimeConfig {
  const rawMode = process.env.DIREKT_WEB_API_MODE?.trim() || "disabled";
  if (!allowedModes.has(rawMode as DirektWebApiMode)) {
    throw new Error(
      "DIREKT_WEB_API_MODE must be one of disabled, public, or authenticated-bff",
    );
  }

  const apiMode = rawMode as DirektWebApiMode;
  const rawBaseUrl = process.env.DIREKT_API_BASE_URL?.trim() || "";

  if (apiMode === "disabled") {
    return { apiMode, apiBaseUrl: null };
  }

  if (!rawBaseUrl) {
    throw new Error("DIREKT_API_BASE_URL is required when the functional web API mode is enabled");
  }

  const apiBaseUrl = new URL(rawBaseUrl);
  const isLocalhost = apiBaseUrl.hostname === "localhost" || apiBaseUrl.hostname === "127.0.0.1";
  if (apiBaseUrl.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && isLocalhost)) {
    throw new Error("DIREKT_API_BASE_URL must use HTTPS outside local development/test");
  }

  if (apiBaseUrl.username || apiBaseUrl.password) {
    throw new Error("DIREKT_API_BASE_URL must not contain embedded credentials");
  }

  return { apiMode, apiBaseUrl };
}

export function getPublicRuntimeCapabilities() {
  const { apiMode } = getDirektWebRuntimeConfig();
  return {
    apiMode,
    publicDiscoveryEnabled: apiMode === "public" || apiMode === "authenticated-bff",
    authenticatedBrowserEnabled: apiMode === "authenticated-bff",
  } as const;
}
