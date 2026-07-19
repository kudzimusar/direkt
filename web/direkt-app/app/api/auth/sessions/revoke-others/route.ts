import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { assertSecureMutation } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  try {
    assertSecureMutation(request);
    const result = await withAuthenticatedSession((session, api) =>
      api.revokeOtherSessions(session.accessToken),
    );
    if (!result) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson(result);
  } catch (error) {
    return authRouteError(error);
  }
}
