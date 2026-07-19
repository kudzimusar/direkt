import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import {
  accessTokenNeedsRefresh,
  clearBrowserSession,
  readBrowserSession,
  rotateBrowserSession,
} from "@/lib/server/browser-session";
import { DirektAuthApi, DirektAuthApiError } from "@/lib/server/direkt-auth-api";
import { assertSecureMutation } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  try {
    assertSecureMutation(request);
    const current = await readBrowserSession();
    if (!current) return noStoreJson({ authenticated: false }, 401);

    if (!accessTokenNeedsRefresh(current)) {
      return noStoreJson({ refreshed: false, sessionId: current.sessionId });
    }

    try {
      const rotated = await new DirektAuthApi().rotateSession(current.refreshToken);
      await rotateBrowserSession(rotated);
      return noStoreJson({ refreshed: true, sessionId: rotated.sessionId });
    } catch (error) {
      if (error instanceof DirektAuthApiError && error.status === 401) {
        await clearBrowserSession();
      }
      throw error;
    }
  } catch (error) {
    return authRouteError(error);
  }
}
