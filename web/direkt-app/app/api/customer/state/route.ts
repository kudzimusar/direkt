import { noStoreJson, authRouteError } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { DirektAuthApiError } from "@/lib/server/direkt-auth-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await withAuthenticatedSession(async (session, api) => {
      const contactsPromise = api.listAccountContacts(session.accessToken).catch((error) => {
        if (error instanceof DirektAuthApiError && error.status === 404) return [];
        throw error;
      });
      const [contacts, savedProviders, enquiries, interactions, reviews, complaints] = await Promise.all([
        contactsPromise,
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
