import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { DirektProviderAiApi } from "@/lib/server/direkt-provider-ai-api";
import { assertSecureMutation } from "@/lib/server/request-security";

const actions = new Set(["onboarding-guide", "profile-draft"]);

export async function POST(request: NextRequest) {
  try {
    assertSecureMutation(request);
    const body = (await request.json()) as { action?: unknown };
    const action = typeof body.action === "string" ? body.action : "";
    if (!actions.has(action)) {
      return noStoreJson(
        {
          error: "invalid_request",
          message: "Unsupported provider assistance action.",
        },
        400,
      );
    }

    const result = await withAuthenticatedSession(async (session) => {
      const api = new DirektProviderAiApi();
      return action === "onboarding-guide"
        ? api.onboardingGuide(session.accessToken)
        : api.profileDraft(session.accessToken);
    });

    if (!result) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson(result);
  } catch (error) {
    return authRouteError(error);
  }
}
