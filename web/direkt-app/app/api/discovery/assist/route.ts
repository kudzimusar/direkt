import { NextResponse, type NextRequest } from "next/server";
import {
  DiscoveryAiClientError,
  requestDiscoveryAssist,
} from "@/lib/server/direkt-discovery-ai-client";
import { assertSameOrigin } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const body = (await request.json()) as { need?: unknown; area?: unknown };
    const need = typeof body.need === "string" ? body.need.replace(/\s+/g, " ").trim() : "";
    const area = typeof body.area === "string" ? body.area.replace(/\s+/g, " ").trim() : "";

    if (need.length < 3 || need.length > 240 || area.length > 160) {
      return noStoreJson(
        { message: "Describe the service need in 3–240 characters." },
        400,
      );
    }

    const result = await requestDiscoveryAssist({
      need,
      ...(area ? { area } : {}),
    });
    return noStoreJson(result, 200);
  } catch (cause) {
    if (cause instanceof DiscoveryAiClientError) {
      return noStoreJson({ message: cause.message }, cause.status);
    }
    return noStoreJson(
      { message: "AI discovery assistance is unavailable. Continue with normal search." },
      503,
    );
  }
}

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "no-store, max-age=0",
    },
  });
}
