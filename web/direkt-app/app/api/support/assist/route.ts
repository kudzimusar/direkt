import { NextRequest } from "next/server";
import { noStoreJson } from "@/lib/server/auth-route-response";
import { assertSameOrigin } from "@/lib/server/request-security";
import { requestPublicSupport } from "@/lib/server/direkt-public-support-api";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const body = (await request.json()) as { question?: unknown };
    const question = typeof body.question === "string" ? body.question.replace(/\s+/g, " ").trim() : "";
    if (question.length < 3 || question.length > 500) {
      return noStoreJson(
        { error: "invalid_request", message: "Enter a support question between 3 and 500 characters." },
        400,
      );
    }
    return noStoreJson(await requestPublicSupport(question));
  } catch {
    return noStoreJson(
      {
        error: "support_unavailable",
        message: "Support assistance is temporarily unavailable. Normal DIREKT product flows remain available.",
      },
      503,
    );
  }
}
