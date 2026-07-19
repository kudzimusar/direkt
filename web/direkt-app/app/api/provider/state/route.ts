import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { DirektProviderApi, DirektProviderApiError } from "@/lib/server/direkt-provider-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await withAuthenticatedSession(async (session) => {
      const api = new DirektProviderApi();
      const [workspace, timeline, uploads, enquiries, interactions, reviews, commercial] = await Promise.all([
        api.workspace(session.accessToken),
        api.verificationTimeline(session.accessToken),
        api.listUploadIntents(session.accessToken),
        api.listEnquiries(session.accessToken),
        api.interactions(session.accessToken),
        api.listReviews(session.accessToken),
        api.commercial(session.accessToken),
      ]);
      const handoffEntries = await Promise.all(
        enquiries.items.map(async (enquiry) => {
          try {
            const handoff = await api.currentHandoff(session.accessToken, enquiry.enquiryId);
            return [enquiry.enquiryId, handoff] as const;
          } catch (error) {
            if (error instanceof DirektProviderApiError && error.status === 404) {
              return [enquiry.enquiryId, null] as const;
            }
            throw error;
          }
        }),
      );
      return {
        workspace,
        timeline,
        uploads,
        enquiries,
        interactions,
        handoffs: Object.fromEntries(handoffEntries),
        reviews,
        commercial,
      };
    });
    if (!state) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson(state);
  } catch (error) {
    return authRouteError(error);
  }
}
