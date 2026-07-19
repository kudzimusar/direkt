import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { clearBrowserSession, readBrowserSession, rotateCsrfToken } from "@/lib/server/browser-session";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { assertSecureMutation } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  try {
    assertSecureMutation(request);
    const current = await readBrowserSession();
    if (current) {
      try {
        await withAuthenticatedSession((session, api) =>
          api.revokeSession(
            session.accessToken,
            session.sessionId,
            "Signed out from DIREKT Web",
          ),
        );
      } catch {
        // Local credential removal is mandatory even when upstream revocation is unavailable.
      }
    }
    await clearBrowserSession();
    const csrfToken = await rotateCsrfToken();
    return noStoreJson({ signedOut: true, csrfToken });
  } catch (error) {
    return authRouteError(error);
  }
}
