import { NextResponse } from "next/server";
import { DirektApiError } from "./direkt-api-client";
import { DiscoveryQueryError } from "./discovery-query";

export function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function discoveryErrorResponse(error: unknown) {
  if (error instanceof DiscoveryQueryError) {
    return noStoreJson(
      {
        type: "about:blank",
        title: "Invalid discovery request",
        status: 400,
        detail: error.message,
      },
      400,
    );
  }

  if (error instanceof DirektApiError) {
    const status = error.status >= 400 && error.status <= 599 ? error.status : 502;
    return noStoreJson(
      {
        type: error.problem?.type || "about:blank",
        title: error.problem?.title || "DIREKT API request failed",
        status,
        detail: error.problem?.detail || "The discovery service could not complete the request.",
      },
      status,
    );
  }

  return noStoreJson(
    {
      type: "about:blank",
      title: "Discovery temporarily unavailable",
      status: 503,
      detail: "The browser application cannot currently reach the DIREKT discovery service.",
    },
    503,
  );
}
