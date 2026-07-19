import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import {
  establishBrowserSession,
  rotateCsrfToken,
} from "@/lib/server/browser-session";
import { DirektAuthApi } from "@/lib/server/direkt-auth-api";
import { assertSecureMutation } from "@/lib/server/request-security";
import { getDirektWebRuntimeConfig } from "@/lib/server/runtime-config";

export async function POST(request: NextRequest) {
  try {
    assertSecureMutation(request);
    if (getDirektWebRuntimeConfig().authMode !== "synthetic") {
      return noStoreJson({ error: "synthetic_auth_disabled" }, 404);
    }

    const body = (await request.json()) as {
      challengeId?: unknown;
      code?: unknown;
      deviceLabel?: unknown;
    };
    if (
      typeof body.challengeId !== "string" ||
      !/^[0-9a-fA-F-]{36}$/.test(body.challengeId) ||
      typeof body.code !== "string" ||
      !/^\d{6}$/.test(body.code)
    ) {
      return noStoreJson({ error: "invalid_request" }, 400);
    }
    const deviceLabel =
      typeof body.deviceLabel === "string" && body.deviceLabel.trim().length >= 3
        ? body.deviceLabel.trim().slice(0, 100)
        : "DIREKT Web synthetic canary";

    const session = await new DirektAuthApi().verifyChallenge({
      challengeId: body.challengeId,
      code: body.code,
      deviceLabel,
    });
    await establishBrowserSession(session);
    const csrfToken = await rotateCsrfToken();

    return noStoreJson({
      authenticated: true,
      identityId: session.identityId,
      sessionId: session.sessionId,
      contact: session.contact,
      csrfToken,
    });
  } catch (error) {
    return authRouteError(error);
  }
}
