import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { assertSecureMutation } from "@/lib/server/request-security";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    assertSecureMutation(request);
    const { sessionId } = await context.params;
    if (!/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      return noStoreJson({ error: "invalid_session_id" }, 400);
    }

    const body = (await request.json().catch(() => ({}))) as { reason?: unknown };
    const reason =
      typeof body.reason === "string" && body.reason.trim().length >= 8
        ? body.reason.trim().slice(0, 160)
        : undefined;
    const result = await withAuthenticatedSession((session, api) =>
      api.revokeSession(session.accessToken, sessionId, reason),
    );
    if (!result) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson(result);
  } catch (error) {
    return authRouteError(error);
  }
}
