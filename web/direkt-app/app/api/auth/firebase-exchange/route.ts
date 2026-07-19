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
    const config = getDirektWebRuntimeConfig();
    if (config.authMode !== "firebase-exchange" || !config.pilotNoticeVersion) {
      return noStoreJson({ error: "firebase_exchange_disabled" }, 404);
    }

    const body = (await request.json()) as {
      idToken?: unknown;
      consentAccepted?: unknown;
      deviceLabel?: unknown;
    };
    if (
      typeof body.idToken !== "string" ||
      body.idToken.length < 100 ||
      body.idToken.length > 8192 ||
      body.consentAccepted !== true
    ) {
      return noStoreJson({ error: "invalid_request" }, 400);
    }
    const deviceLabel =
      typeof body.deviceLabel === "string" && body.deviceLabel.trim().length >= 3
        ? body.deviceLabel.trim().slice(0, 100)
        : "DIREKT Web Firebase session";

    const session = await new DirektAuthApi().exchangeFirebase({
      idToken: body.idToken,
      noticeVersion: config.pilotNoticeVersion,
      consentAccepted: true,
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
