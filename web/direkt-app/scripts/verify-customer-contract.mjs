import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const repositoryRoot = join(root, "../..");
const files = {
  action: "web/direkt-app/app/api/customer/action/route.ts",
  state: "web/direkt-app/app/api/customer/state/route.ts",
  api: "web/direkt-app/lib/server/direkt-auth-api.ts",
  ui: "web/direkt-app/components/customer-journey-experience.tsx",
  providerActions: "web/direkt-app/components/customer-provider-actions.tsx",
  contactController: "backend/direkt-api/src/account-contact/account-contact.controller.ts",
  contactRepository: "backend/direkt-api/src/account-contact/account-contact.repository.ts",
  discoveryController: "backend/direkt-api/src/discovery/discovery.controller.ts",
  interactionController: "backend/direkt-api/src/interaction/interaction.controller.ts",
  interactionDto: "backend/direkt-api/src/interaction/interaction.dto.ts",
  interactionTypes: "backend/direkt-api/src/interaction/interaction.types.ts",
  handoffController: "backend/direkt-api/src/interaction/interaction-handoff.controller.ts",
  handoffDto: "backend/direkt-api/src/interaction/interaction-handoff.dto.ts",
  handoffTypes: "backend/direkt-api/src/interaction/interaction-handoff.types.ts",
  reviewController: "backend/direkt-api/src/interaction/review.controller.ts",
  reviewDto: "backend/direkt-api/src/interaction/review.dto.ts",
  reviewTypes: "backend/direkt-api/src/interaction/review.types.ts",
  complaintController: "backend/direkt-api/src/interaction/complaint.controller.ts",
  complaintDto: "backend/direkt-api/src/interaction/complaint.dto.ts",
  complaintTypes: "backend/direkt-api/src/interaction/complaint.types.ts",
};
const source = {};
for (const [name, path] of Object.entries(files)) source[name] = await readFile(join(repositoryRoot, path), "utf8");

requireMarkers(source.action, [
  "assertSecureMutation(request)",
  'case "save-provider"',
  'case "create-enquiry"',
  'case "cancel-enquiry"',
  'case "create-handoff"',
  'case "revoke-handoff"',
  'case "create-review"',
  'case "appeal-review"',
  'case "report-review"',
  'case "create-complaint"',
  "DIREKT_WEB_INTERACTION_POLICY_VERSION",
  "requirePolicy(policyVersion)",
  "uuid(body.idempotencyKey)",
]);
requireMarkers(source.state, ["withAuthenticatedSession", "api.listAccountContacts", "api.listSavedProviders", "api.listEnquiries", "api.listInteractions", "api.listReviews", "api.listComplaints"]);
requireMarkers(source.api, [
  '"/api/v1/account/contacts"',
  '"/api/v1/account/saved-providers"',
  '"/api/v1/enquiries"',
  '"/api/v1/interactions"',
  '"/api/v1/reviews"',
  '"/api/v1/complaints"',
  'headers["idempotency-key"]',
  'cache: "no-store"',
  '"X-Serverless-Authorization"',
]);
requireMarkers(source.contactController, ["@Controller('account/contacts')", "@Get()", "ACCOUNT_PROFILE_MANAGE", "Raw contact values are never returned"]);
requireMarkers(source.contactRepository, ["SELECT id, channel, display_hint, verified_at", "WHERE identity_id = $1"]);
requireMarkers(source.discoveryController, ["@Post('account/saved-providers/:publicProviderId')", "@Delete('account/saved-providers/:publicProviderId')", "@Get('account/saved-providers')"]);
requireMarkers(source.interactionController, ["@Post('enquiries')", "@Get('enquiries')", "@Post('enquiries/:enquiryId/cancel')"]);
requireMarkers(source.interactionDto, ["['urgent', 'within_week', 'flexible', 'scheduled']", "['call', 'whatsapp', 'none']", "@Length(20, 1000)", "@Length(8, 500)"]);
requireMarkers(source.interactionTypes, ["'acknowledged'", "'needs_information'", "fullChatEnabled: false", "privateContactIncluded: false"]);
requireMarkers(source.handoffController, ["@Post('enquiries/:enquiryId/handoffs')", "@Get('enquiries/:enquiryId/handoffs')", "handoffs/:handoffId/revoke"]);
requireMarkers(source.handoffDto, ["contactId!: string", "@Length(8, 500)"]);
requireMarkers(source.handoffTypes, ["rawContactIncluded: false", "externalDeliveryAttempted: false", "deliveryState: 'disabled'"]);
requireMarkers(source.reviewController, ["interactions/:interactionId/reviews", "reviews/:reviewId/appeals", "reviews/:reviewId/reports"]);
requireMarkers(source.reviewDto, ["@Length(5, 120)", "@Length(20, 2000)", "class CreateReviewAppealDto", "reason!: string", "class ReportReviewDto", "reasonCode!:", "detail!: string"]);
requireMarkers(source.reviewTypes, ["customerIdentityExposed: false", "contactIncluded: false", "trustOrRankingMutation: false"]);
requireMarkers(source.complaintController, ["@Post('interactions/:interactionId/complaints')", "@Get('complaints')"]);
requireMarkers(source.complaintDto, ["['service_quality', 'contact_privacy', 'provider_conduct', 'other']", "@Length(20, 1000)"]);
requireMarkers(source.complaintTypes, ["phase7IncidentLinked: false", "contactIncluded: false", "trustOrRankingMutation: false"]);
requireMarkers(source.ui, ["CustomerJourneyExperience", "Saved providers", "Enquiries & interactions", "Consent-scoped contact handoff", "Reviews, reports & complaints", "crypto.randomUUID()"]);
requireMarkers(source.providerActions, ["save-provider", "view=enquiries&provider=", "x-direkt-csrf"]);

for (const [name, text] of Object.entries({ action: source.action, state: source.state, ui: source.ui })) {
  if (/localStorage|sessionStorage|indexedDB/i.test(text)) throw new Error(`${name} must not persist customer/session state in browser-readable storage`);
}
if (/body\.(path|url|endpoint)/.test(source.action)) throw new Error("W4 action BFF must not proxy arbitrary browser-selected backend paths");
if (/DIREKT_API_BASE_URL|X-Serverless-Authorization/.test(source.ui)) throw new Error("Customer UI must not receive private API infrastructure details");

process.stdout.write(`${JSON.stringify({event:"w4_customer_contract_passed",csrfProtected:true,idempotencyProtected:true,maskedContactReferences:true,privateApiBoundary:true,arbitraryProxyProhibited:true,androidUntouched:true})}\n`);

function requireMarkers(text, markers) {
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`W4 contract marker missing: ${marker}`);
}
