import { NextRequest } from "next/server";
import { authRouteError, noStoreJson } from "@/lib/server/auth-route-response";
import { withAuthenticatedSession } from "@/lib/server/authenticated-session";
import { DirektProviderApi } from "@/lib/server/direkt-provider-api";
import { assertSecureMutation } from "@/lib/server/request-security";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CATEGORY = /^[a-z][a-z0-9_-]{1,63}$/;
const COMMERCIAL_KEY = /^[a-z][a-z0-9_]{2,79}$/;
const IDEMPOTENCY = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,199}$/;
const CLIENT_INTENT = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const DOCUMENT_TYPE = /^[a-z][a-z0-9_]{2,63}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const POLYGON = /^POLYGON\(\(.+\)\)$/i;
const operatingModels = new Set(["fixed_premises", "mobile", "hybrid"]);
const availabilityStates = new Set(["available", "limited", "unavailable", "unknown"]);
const evidenceClasses = new Set(["contact", "identity", "business", "qualification", "licence", "experience", "location", "premises", "field"]);
const contentTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const retentionClasses = new Set(["short", "standard", "regulated", "legal_hold"]);
const enquiryTransitions = new Set(["acknowledged", "needs_information", "accepted", "declined", "closed"]);

export async function POST(request: NextRequest) {
  try {
    assertSecureMutation(request);
    const body = (await request.json()) as Record<string, unknown>;
    const action = text(body.action, 2, 80);
    const interactionPolicy = process.env.DIREKT_WEB_INTERACTION_POLICY_VERSION?.trim() || null;
    const commercialPolicy = process.env.DIREKT_WEB_COMMERCIAL_POLICY_VERSION?.trim() || null;

    const result = await withAuthenticatedSession(async (session) => {
      const api = new DirektProviderApi();
      switch (action) {
        case "update-profile":
          return api.updateProfile(session.accessToken, profilePatch(body));
        case "update-location":
          return api.updateLocation(session.accessToken, {
            ...optionalCoordinatePair(body.privateBaseLatitude, body.privateBaseLongitude, "privateBase"),
            ...optionalCoordinatePair(body.publicPremisesLatitude, body.publicPremisesLongitude, "publicPremises"),
            publicPremisesConsent: booleanValue(body.publicPremisesConsent),
            publicLocality: text(body.publicLocality, 2, 160),
            serviceAreaWkt: pattern(body.serviceAreaWkt, POLYGON, 8000, "A POLYGON WKT service area is required."),
          });
        case "select-service":
          return api.selectService(session.accessToken, categoryKey(body.categoryKey));
        case "remove-service":
          return api.removeService(session.accessToken, categoryKey(body.categoryKey), text(body.reason, 12, 500));
        case "update-availability": {
          const state = enumValue(body.state, availabilityStates);
          const nextAvailableAt = optionalDate(body.nextAvailableAt);
          if (state === "limited" && !nextAvailableAt) throw new ProviderRequestError("Limited availability requires nextAvailableAt.", 400);
          return api.updateAvailability(session.accessToken, categoryKey(body.categoryKey), {
            state: state as "available" | "limited" | "unavailable" | "unknown",
            ...(nextAvailableAt ? { nextAvailableAt } : {}),
          });
        }
        case "create-upload-intent": {
          const evidenceClass = enumValue(body.evidenceClass, evidenceClasses);
          const contentType = enumValue(body.contentType, contentTypes);
          return api.createUploadIntent(session.accessToken, {
            caseId: uuid(body.caseId),
            clientIntentKey: pattern(body.clientIntentKey, CLIENT_INTENT, 128, "Invalid client intent key."),
            evidenceClass: evidenceClass as "contact" | "identity" | "business" | "qualification" | "licence" | "experience" | "location" | "premises" | "field",
            documentType: pattern(body.documentType, DOCUMENT_TYPE, 64, "Invalid document type."),
            contentType: contentType as "application/pdf" | "image/jpeg" | "image/png" | "image/webp",
            maxBytes: integer(body.maxBytes, 1024, 20_971_520),
            consentConfirmed: booleanValue(body.consentConfirmed),
            ...(body.replacementForEvidenceId ? { replacementForEvidenceId: uuid(body.replacementForEvidenceId) } : {}),
          });
        }
        case "retry-upload":
          return api.retryUploadIntent(session.accessToken, uuid(body.uploadIntentId));
        case "interrupt-upload":
          return api.markUploadInterrupted(session.accessToken, uuid(body.uploadIntentId), pattern(body.errorCode, /^[A-Z][A-Z0-9_]{2,63}$/, 64, "Invalid upload error code."));
        case "confirm-upload": {
          const retentionClass = enumValue(body.retentionClass, retentionClasses);
          return api.confirmUploadIntent(session.accessToken, uuid(body.uploadIntentId), {
            sha256: pattern(body.sha256, SHA256, 64, "Invalid SHA-256 digest."),
            sizeBytes: integer(body.sizeBytes, 1, 20_971_520),
            ...(optionalText(body.issuingAuthority, 2, 180) ? { issuingAuthority: optionalText(body.issuingAuthority, 2, 180) } : {}),
            ...(optionalDate(body.issuedAt) ? { issuedAt: optionalDate(body.issuedAt) } : {}),
            ...(optionalDate(body.validFrom) ? { validFrom: optionalDate(body.validFrom) } : {}),
            ...(optionalDate(body.expiresAt) ? { expiresAt: optionalDate(body.expiresAt) } : {}),
            retentionClass: retentionClass as "short" | "standard" | "regulated" | "legal_hold",
          });
        }
        case "cancel-upload":
          return api.cancelUploadIntent(session.accessToken, uuid(body.uploadIntentId), text(body.reason, 12, 500));
        case "transition-enquiry": {
          const targetStatus = enumValue(body.targetStatus, enquiryTransitions);
          return api.transitionEnquiry(session.accessToken, uuid(body.enquiryId), {
            targetStatus: targetStatus as "acknowledged" | "needs_information" | "accepted" | "declined" | "closed",
            expectedRevision: integer(body.expectedRevision, 1, 2_147_483_647),
            reason: text(body.reason, 8, 500),
            policyVersion: requirePolicy(interactionPolicy, "Provider interaction"),
          });
        }
        case "respond-review":
          return api.respondToReview(session.accessToken, uuid(body.reviewId), { body: text(body.body, 10, 1000), policyVersion: requirePolicy(interactionPolicy, "Provider interaction") });
        case "appeal-review":
          return api.appealReview(session.accessToken, uuid(body.reviewId), { reason: text(body.reason, 20, 1000), policyVersion: requirePolicy(interactionPolicy, "Provider interaction") });
        case "create-subscription":
          return api.createSubscription(
            session.accessToken,
            {
              productKey: pattern(body.productKey, COMMERCIAL_KEY, 64, "Invalid commercial product key."),
              priceKey: pattern(body.priceKey, COMMERCIAL_KEY, 80, "Invalid commercial price key."),
              policyVersion: requirePolicy(commercialPolicy, "Commercial"),
            },
            pattern(body.idempotencyKey, IDEMPOTENCY, 200, "Invalid commercial idempotency key."),
          );
        case "cancel-subscription":
          return api.cancelSubscription(session.accessToken, uuid(body.subscriptionId), {
            expectedRevision: integer(body.expectedRevision, 1, 2_147_483_647),
            reason: text(body.reason, 12, 500),
            policyVersion: requirePolicy(commercialPolicy, "Commercial"),
          });
        case "issue-invoice":
          return api.issueInvoice(session.accessToken, uuid(body.subscriptionId), requirePolicy(commercialPolicy, "Commercial"));
        case "create-payment-intent":
          return api.createPaymentIntent(
            session.accessToken,
            uuid(body.invoiceId),
            requirePolicy(commercialPolicy, "Commercial"),
            pattern(body.idempotencyKey, IDEMPOTENCY, 200, "Invalid commercial idempotency key."),
          );
        case "cancel-payment-intent":
          return api.cancelPaymentIntent(
            session.accessToken,
            uuid(body.paymentIntentId),
            integer(body.expectedRevision, 1, 2_147_483_647),
            requirePolicy(commercialPolicy, "Commercial"),
          );
        default:
          throw new ProviderRequestError("Unsupported provider action.", 400);
      }
    });

    if (!result) return noStoreJson({ authenticated: false }, 401);
    return noStoreJson(result);
  } catch (error) {
    if (error instanceof ProviderRequestError) return noStoreJson({ error: "invalid_request", message: error.message }, error.status);
    return authRouteError(error);
  }
}

class ProviderRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

function requirePolicy(policy: string | null, label: string): string {
  if (!policy) throw new ProviderRequestError(`${label} policy is not configured.`, 503);
  return policy;
}

function profilePatch(body: Record<string, unknown>) {
  const patch: Partial<{ displayName: string; operatingModel: "fixed_premises" | "mobile" | "hybrid"; localitySummary: string; serviceAreaSummary: string; registeredBusinessName: string; qualificationSummary: string; experienceSummary: string }> = {};
  const displayName = optionalText(body.displayName, 2, 160); if (displayName) patch.displayName = displayName;
  if (body.operatingModel !== undefined && body.operatingModel !== "") patch.operatingModel = enumValue(body.operatingModel, operatingModels) as "fixed_premises" | "mobile" | "hybrid";
  const localitySummary = optionalText(body.localitySummary, 2, 160); if (localitySummary) patch.localitySummary = localitySummary;
  const serviceAreaSummary = optionalText(body.serviceAreaSummary, 2, 240); if (serviceAreaSummary) patch.serviceAreaSummary = serviceAreaSummary;
  const registeredBusinessName = optionalText(body.registeredBusinessName, 2, 200); if (registeredBusinessName) patch.registeredBusinessName = registeredBusinessName;
  const qualificationSummary = optionalText(body.qualificationSummary, 8, 500); if (qualificationSummary) patch.qualificationSummary = qualificationSummary;
  const experienceSummary = optionalText(body.experienceSummary, 8, 500); if (experienceSummary) patch.experienceSummary = experienceSummary;
  if (Object.keys(patch).length === 0) throw new ProviderRequestError("At least one profile field is required.", 400);
  return patch;
}

function optionalCoordinatePair(latitude: unknown, longitude: unknown, prefix: "privateBase" | "publicPremises") {
  if ((latitude === undefined || latitude === "") && (longitude === undefined || longitude === "")) return {};
  if (typeof latitude !== "number" || typeof longitude !== "number") throw new ProviderRequestError("Latitude and longitude must be provided together as numbers.", 400);
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) throw new ProviderRequestError("Coordinates are outside the valid WGS84 range.", 400);
  return prefix === "privateBase" ? { privateBaseLatitude: latitude, privateBaseLongitude: longitude } : { publicPremisesLatitude: latitude, publicPremisesLongitude: longitude };
}

function uuid(value: unknown): string { if (typeof value !== "string" || !UUID.test(value)) throw new ProviderRequestError("A valid UUID is required.", 400); return value; }
function categoryKey(value: unknown): string { if (typeof value !== "string" || !CATEGORY.test(value)) throw new ProviderRequestError("A valid category key is required.", 400); return value; }
function text(value: unknown, min: number, max: number): string { if (typeof value !== "string") throw new ProviderRequestError("Text value is required.", 400); const normalized = value.trim(); if (normalized.length < min || normalized.length > max) throw new ProviderRequestError(`Text length must be between ${min} and ${max}.`, 400); return normalized; }
function optionalText(value: unknown, min: number, max: number): string | undefined { if (value === undefined || value === null || value === "") return undefined; return text(value, min, max); }
function pattern(value: unknown, regex: RegExp, max: number, message: string): string { if (typeof value !== "string") throw new ProviderRequestError(message, 400); const normalized = value.trim(); if (normalized.length > max || !regex.test(normalized)) throw new ProviderRequestError(message, 400); return normalized; }
function integer(value: unknown, min: number, max: number): number { if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) throw new ProviderRequestError("A valid integer is required.", 400); return value as number; }
function booleanValue(value: unknown): boolean { if (typeof value !== "boolean") throw new ProviderRequestError("A boolean value is required.", 400); return value; }
function enumValue(value: unknown, allowed: Set<string>): string { if (typeof value !== "string" || !allowed.has(value)) throw new ProviderRequestError("Unsupported enum value.", 400); return value; }
function optionalDate(value: unknown): string | undefined { if (value === undefined || value === null || value === "") return undefined; if (typeof value !== "string" || Number.isNaN(Date.parse(value))) throw new ProviderRequestError("A valid date/time is required.", 400); return new Date(value).toISOString(); }
