import { NextResponse } from "next/server";
import { DirektAuthApiError } from "./direkt-auth-api";
import { BrowserRequestSecurityError } from "./request-security";

export function noStoreJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private" },
  });
}

export function authRouteError(error: unknown): NextResponse {
  if (error instanceof BrowserRequestSecurityError) {
    return noStoreJson({ error: "request_security_failed" }, error.status);
  }
  if (error instanceof DirektAuthApiError) {
    if (error.status === 401) return noStoreJson({ error: "authentication_failed" }, 401);
    if (error.status === 403) return noStoreJson({ error: "not_permitted" }, 403);
    if (error.status === 404) return noStoreJson({ error: "not_found" }, 404);
    if (error.status >= 500) return noStoreJson({ error: "upstream_unavailable" }, 502);
    return noStoreJson({ error: "request_rejected" }, error.status);
  }
  return noStoreJson({ error: "request_failed" }, 500);
}
