import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { assertSecureMutation } from "@/lib/server/request-security";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const timings = new Set(["urgent", "today", "within_week", "flexible"]);
const channels = new Set(["call", "whatsapp"]);
const complaintCategories = new Set(["safety", "conduct", "service_dispute", "privacy", "other"]);

export async function POST(request: NextRequest) {
  try {
    assertSecureMutation(request);
    const body = (await request.json()) as Record<string, unknown>;
    const action = text(body.action, 2, 80);
    const policyVersion = process.env.DIREKT_WEB_INTERACTION_POLICY_VERSION?.trim() || null;

    const result = await withAuthenticatedSession(async (session, api) => {
      switch (action) {
        case "save-provider":
          return api.saveProvider(session.accessToken, uuid(body.publicProviderId));
        case "unsave-provider":
          return api.unsaveProvider(session.accessToken, uuid(body.publicProviderId));
        case "create-enquiry": {
          const policy = requirePolicy(policyVersion);
          const timing = enumValue(body.timing, timings);
          const preferredChannel = enumValue(body.preferredChannel, channels);
          return api.createEnquiry(
            session.accessToken,
            {
              publicProviderId: uuid(body.publicProviderId),
              serviceSummary: text(body.serviceSummary, 10, 800),
              timing: timing as "urgent" | "today" | "within_week" | "flexible",
              localitySummary: text(body.localitySummary, 2, 160),
              preferredChannel: preferredChannel as "call" | "whatsapp",
              policyVersion: policy,
            },
            uuid(body.idempotencyKey),
          );
        }
        case "cancel-enquiry":
          return api.cancelEnquiry(session.accessToken, uuid(body.enquiryId), {
            expectedRevision: integer(body.expectedRevision, 1),
            reason: text(body.reason, 3, 300),
            policyVersion: requirePolicy(policyVersion),
          });
        case "create-handoff": {
          const channel = enumValue(body.channel, channels);
          return api.createHandoff(
            session.accessToken,
            uuid(body.enquiryId),
            {
              channel: channel as "call" | "whatsapp",
              contactId: uuid(body.contactId),
              policyVersion: requirePolicy(policyVersion),
            },
            uuid(body.idempotencyKey),
          );
        }
        case "revoke-handoff":
          return api.revokeHandoff(
            session.accessToken,
            uuid(body.enquiryId),
            uuid(body.handoffId),
            {
              reason: text(body.reason, 3, 300),
              policyVersion: requirePolicy(policyVersion),
            },
          );
        case "create-review":
          return api.createReview(session.accessToken, uuid(body.interactionId), {
            rating: integer(body.rating, 1, 5),
            title: text(body.title, 3, 120),
            body: text(body.body, 10, 1500),
            policyVersion: requirePolicy(policyVersion),
          });
        case "appeal-review":
          return api.appealReview(session.accessToken, uuid(body.reviewId), {
            reasonCode: text(body.reasonCode, 2, 80),
            statement: text(body.statement, 10, 1200),
            expectedRevision: integer(body.expectedRevision, 1),
            policyVersion: requirePolicy(policyVersion),
          });
        case "report-review":
          return api.reportReview(session.accessToken, uuid(body.reviewId), {
            reason: text(body.reason, 3, 800),
            policyVersion: requirePolicy(policyVersion),
          });
        case "create-complaint": {
          const category = enumValue(body.category, complaintCategories);
          return api.createComplaint(session.accessToken, uuid(body.interactionId), {
            category: category as "safety" | "conduct" | "service_dispute" | "privacy" | "other",
            summary: text(body.summary, 10, 1200),
            policyVersion: requirePolicy(policyVersion),
          });
        }
        default:
          throw new CustomerRequestError("Unsupported customer action.", 400);
      }
    });

    if (!result) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson(result);
  } catch (error) {
    if (error instanceof CustomerRequestError) {
      return noStoreJson({ error: "invalid_request", message: error.message }, error.status);
    }
    return authRouteError(error);
  }
}

class CustomerRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function requirePolicy(policy: string | null): string {
  if (!policy) throw new CustomerRequestError("Customer interaction policy is not configured.", 503);
  return policy;
}

function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID.test(value)) {
    throw new CustomerRequestError("A valid UUID is required.", 400);
  }
  return value;
}

function text(value: unknown, min: number, max: number): string {
  if (typeof value !== "string") throw new CustomerRequestError("Text value is required.", 400);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new CustomerRequestError(`Text length must be between ${min} and ${max}.`, 400);
  }
  return normalized;
}

function integer(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new CustomerRequestError("A valid integer is required.", 400);
  }
  return value as number;
}

function enumValue(value: unknown, allowed: Set<string>): string {
  if (typeof value !== "string" || !allowed.has(value)) {
    throw new CustomerRequestError("Unsupported enum value.", 400);
  }
  return value;
}
