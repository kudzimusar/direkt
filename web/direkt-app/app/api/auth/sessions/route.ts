import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessions = await withAuthenticatedSession((session, api) =>
      api.listSessions(session.accessToken),
    );
    if (!sessions) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson({ sessions });
  } catch (error) {
    return authRouteError(error);
  }
}
