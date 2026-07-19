import { NextRequest } from "next/server";
import { csrfCookieName, verifyCsrfToken } from "./browser-session";
import { getDirektWebRuntimeConfig } from "./runtime-config";

export class BrowserRequestSecurityError extends Error {
  constructor(
    message: string,
    readonly status = 403,
  ) {
    super(message);
    this.name = "BrowserRequestSecurityError";
  }
}

export function assertSecureMutation(request: NextRequest): void {
  assertSameOrigin(request);
  const csrfCookie = request.cookies.get(csrfCookieName())?.value;
  const csrfHeader = request.headers.get("x-direkt-csrf");
  if (!verifyCsrfToken(csrfCookie, csrfHeader)) {
    throw new BrowserRequestSecurityError("The browser request failed CSRF validation.");
  }
}

export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  if (!origin) {
    throw new BrowserRequestSecurityError("A same-origin browser request is required.");
  }

  const allowed = new Set<string>();
  const configured = getDirektWebRuntimeConfig().configuredOrigin;
  if (configured) allowed.add(configured.origin);

  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    // Invalid request URL is denied below.
  }

  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    if (forwardedProto === "https" || forwardedProto === "http") {
      allowed.add(`${forwardedProto}://${forwardedHost}`);
    }
  }

  if (!allowed.has(origin)) {
    throw new BrowserRequestSecurityError("Cross-origin browser mutation denied.");
  }
}
