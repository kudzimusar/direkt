import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { DirektProviderApi } from "@/lib/server/direkt-provider-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await withAuthenticatedSession(async (session) => {
      const api = new DirektProviderApi();
      const [workspace, timeline, uploads, enquiries, reviews] = await Promise.all([
        api.workspace(session.accessToken),
        api.verificationTimeline(session.accessToken),
        api.listUploadIntents(session.accessToken),
        api.listEnquiries(session.accessToken),
        api.listReviews(session.accessToken),
      ]);
      return { workspace, timeline, uploads, enquiries, reviews };
    });
    if (!state) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson(state);
  } catch (error) {
    return authRouteError(error);
  }
}