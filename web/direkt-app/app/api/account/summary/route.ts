import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { DirektAuthApiError } from "@/lib/server/direkt-auth-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await withAuthenticatedSession(async (session, api) => {
      const sessions = await api.listSessions(session.accessToken);
      let profile: Record<string, unknown> | null = null;
      try {
        profile = await api.getAccountProfile(session.accessToken);
      } catch (error) {
        if (!(error instanceof DirektAuthApiError) || error.status !== 404) throw error;
      }
      const provider = await api.hasProviderWorkspace(session.accessToken);
      return {
        authenticated: true as const,
        identityId: session.identityId,
        sessionId: session.sessionId,
        contact: session.contact,
        profile,
        sessions,
        modes: { customer: true as const, provider },
      };
    });

    if (!summary) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson(summary);
  } catch (error) {
    return authRouteError(error);
  }
}
