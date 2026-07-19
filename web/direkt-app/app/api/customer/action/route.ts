import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { assertSecureMutation } from "@/lib/server/request-security";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const timings = new Set(["urgent", "within_week", "flexible", "scheduled"]);
const enquiryChannels = new Set(["call", "whatsapp", "none"]);
const handoffChannels = new Set(["call", "whatsapp"]);
const complaintTypes = new Set(["service_quality", "contact_privacy", "provider_conduct", "other"]);
const reportReasons = new Set(["SPAM", "PRIVACY", "ABUSE", "FRAUD", "OTHER"]);

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
          const timing = enumValue(body.timing, timings);
          const preferredChannel = enumValue(body.preferredChannel, enquiryChannels);
          const requestedFor = optionalDate(body.requestedFor);
          return api.createEnquiry(
            session.accessToken,
            {
              publicProviderId: uuid(body.publicProviderId),
              serviceSummary: text(body.serviceSummary, 20, 1000),
              timing: timing as "urgent" | "within_week" | "flexible" | "scheduled",
              ...(requestedFor ? { requestedFor } : {}),
              localitySummary: text(body.localitySummary, 3, 160),
              preferredChannel: preferredChannel as "call" | "whatsapp" | "none",
              policyVersion: requirePolicy(policyVersion),
            },
            uuid(body.idempotencyKey),
          );
        }
        case "cancel-enquiry":
          return api.cancelEnquiry(session.accessToken, uuid(body.enquiryId), {
            expectedRevision: integer(body.expectedRevision, 1, 2147483647),
            reason: text(body.reason, 8, 500),
            policyVersion: requirePolicy(policyVersion),
          });
        case "create-handoff": {
          const channel = enumValue(body.channel, handoffChannels);
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
              reason: text(body.reason, 8, 500),
              policyVersion: requirePolicy(policyVersion),
            },
          );
        case "create-review":
          return api.createReview(session.accessToken, uuid(body.interactionId), {
            rating: integer(body.rating, 1, 5),
            title: text(body.title, 5, 120),
            body: text(body.body, 20, 2000),
            policyVersion: requirePolicy(policyVersion),
          });
        case "appeal-review":
          return api.appealReview(session.accessToken, uuid(body.reviewId), {
            reason: text(body.reason, 20, 1000),
            policyVersion: requirePolicy(policyVersion),
          });
        case "report-review": {
          const reasonCode = enumValue(body.reasonCode, reportReasons);
          return api.reportReview(session.accessToken, uuid(body.reviewId), {
            reasonCode: reasonCode as "SPAM" | "PRIVACY" | "ABUSE" | "FRAUD" | "OTHER",
            detail: text(body.detail, 12, 1000),
          });
        }
        case "create-complaint": {
          const complaintType = enumValue(body.complaintType, complaintTypes);
          return api.createComplaint(
            session.accessToken,
            uuid(body.interactionId),
            {
              complaintType: complaintType as "service_quality" | "contact_privacy" | "provider_conduct" | "other",
              summary: text(body.summary, 20, 1000),
              policyVersion: requirePolicy(policyVersion),
            },
            uuid(body.idempotencyKey),
          );
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

function optionalDate(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new CustomerRequestError("Requested date/time must be a valid date-time.", 400);
  }
  return new Date(value).toISOString();
}
