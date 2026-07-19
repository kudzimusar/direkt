import { noStoreJson, authRouteError } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await withAuthenticatedSession(async (session, api) => {
      const [contacts, savedProviders, enquiries, interactions, reviews, complaints] = await Promise.all([
        api.listAccountContacts(session.accessToken),
        api.listSavedProviders(session.accessToken),
        api.listEnquiries(session.accessToken),
        api.listInteractions(session.accessToken),
        api.listReviews(session.accessToken),
        api.listComplaints(session.accessToken),
      ]);
      return {
        authenticated: true as const,
        contacts,
        savedProviders,
        enquiries,
        interactions,
        reviews,
        complaints,
      };
    });
    if (!state) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson(state);
  } catch (error) {
    return authRouteError(error);
  }
}
