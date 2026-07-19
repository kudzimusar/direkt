import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { DirektAuthApi } from "@/lib/server/direkt-auth-api";
import { assertSecureMutation } from "@/lib/server/request-security";
import { getDirektWebRuntimeConfig } from "@/lib/server/runtime-config";

export async function POST(request: NextRequest) {
  try {
    assertSecureMutation(request);
    const config = getDirektWebRuntimeConfig();
    if (config.authMode !== "synthetic") {
      return noStoreJson({ error: "synthetic_auth_disabled" }, 404);
    }

    const body = (await request.json()) as { channel?: unknown; contact?: unknown };
    if ((body.channel !== "phone" && body.channel !== "email") || typeof body.contact !== "string") {
      return noStoreJson({ error: "invalid_request" }, 400);
    }
    const contact = body.contact.trim();
    if (contact.length < 3 || contact.length > 254) {
      return noStoreJson({ error: "invalid_request" }, 400);
    }

    const challenge = await new DirektAuthApi().requestChallenge({
      channel: body.channel,
      contact,
    });
    return noStoreJson(challenge, 202);
  } catch (error) {
    return authRouteError(error);
  }
}
