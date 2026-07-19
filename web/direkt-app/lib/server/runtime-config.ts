export type DirektWebApiMode = "disabled" | "public" | "authenticated-bff";
export type DirektWebAuthMode = "disabled" | "synthetic" | "firebase-exchange";

export interface DirektWebRuntimeConfig {
  apiMode: DirektWebApiMode;
  apiBaseUrl: URL | null;
  authMode: DirektWebAuthMode;
  pilotNoticeVersion: string | null;
  configuredOrigin: URL | null;
}

const allowedApiModes = new Set<DirektWebApiMode>(["disabled", "public", "authenticated-bff"]);
const allowedAuthModes = new Set<DirektWebAuthMode>(["disabled", "synthetic", "firebase-exchange"]);

export function getDirektWebRuntimeConfig(): DirektWebRuntimeConfig {
  const rawMode = process.env.DIREKT_WEB_API_MODE?.trim() || "disabled";
  if (!allowedApiModes.has(rawMode as DirektWebApiMode)) {
    throw new Error(
      "DIREKT_WEB_API_MODE must be one of disabled, public, or authenticated-bff",
    );
  }

  const apiMode = rawMode as DirektWebApiMode;
  const rawBaseUrl = process.env.DIREKT_API_BASE_URL?.trim() || "";
  const rawAuthMode = process.env.DIREKT_WEB_AUTH_MODE?.trim() || "disabled";
  if (!allowedAuthModes.has(rawAuthMode as DirektWebAuthMode)) {
    throw new Error(
      "DIREKT_WEB_AUTH_MODE must be one of disabled, synthetic, or firebase-exchange",
    );
  }
  const authMode = rawAuthMode as DirektWebAuthMode;

  let apiBaseUrl: URL | null = null;
  if (apiMode !== "disabled") {
    if (apiMode === "public" && process.env.NODE_ENV === "production") {
      throw new Error(
        "DIREKT_WEB_API_MODE=public is prohibited in production; use authenticated-bff for the IAM-private API",
      );
    }
    if (!rawBaseUrl) {
      throw new Error("DIREKT_API_BASE_URL is required when the functional web API mode is enabled");
    }
    apiBaseUrl = validateServerUrl(rawBaseUrl, "DIREKT_API_BASE_URL");
  }

  if (authMode !== "disabled" && apiMode !== "authenticated-bff") {
    throw new Error(
      "Participant authentication requires DIREKT_WEB_API_MODE=authenticated-bff so the API remains IAM-private",
    );
  }

  if (
    authMode === "synthetic" &&
    process.env.DIREKT_WEB_ALLOW_SYNTHETIC_AUTH?.trim().toLowerCase() !== "true"
  ) {
    throw new Error(
      "Synthetic browser authentication is fail-closed unless DIREKT_WEB_ALLOW_SYNTHETIC_AUTH=true is explicitly set",
    );
  }

  const pilotNoticeVersion = process.env.DIREKT_WEB_PILOT_NOTICE_VERSION?.trim() || null;
  if (authMode === "firebase-exchange" && !pilotNoticeVersion) {
    throw new Error(
      "DIREKT_WEB_PILOT_NOTICE_VERSION is required for Firebase-to-DIREKT session exchange",
    );
  }

  const rawOrigin = process.env.DIREKT_WEB_ORIGIN?.trim() || "";
  const configuredOrigin = rawOrigin ? validateOrigin(rawOrigin) : null;

  return {
    apiMode,
    apiBaseUrl,
    authMode,
    pilotNoticeVersion,
    configuredOrigin,
  };
}

export function getPublicRuntimeCapabilities() {
  const { apiMode, authMode } = getDirektWebRuntimeConfig();
  return {
    apiMode,
    authMode,
    publicDiscoveryEnabled: apiMode === "public" || apiMode === "authenticated-bff",
    privateApiInvocationEnabled: apiMode === "authenticated-bff",
    participantAuthenticationEnabled: authMode !== "disabled",
    syntheticAuthenticationEnabled: authMode === "synthetic",
    firebaseExchangeEnabled: authMode === "firebase-exchange",
  } as const;
}

function validateServerUrl(raw: string, name: string): URL {
  const url = new URL(raw);
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && isLocalhost)) {
    throw new Error(`${name} must use HTTPS outside local development/test`);
  }
  if (url.username || url.password) {
    throw new Error(`${name} must not contain embedded credentials`);
  }
  return url;
}

function validateOrigin(raw: string): URL {
  const origin = validateServerUrl(raw, "DIREKT_WEB_ORIGIN");
  if (origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("DIREKT_WEB_ORIGIN must contain only scheme, host and optional port");
  }
  return origin;
}
