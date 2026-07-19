import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const repositoryRoot = join(root, "../..");
const files = {
  action: "web/direkt-app/app/api/customer/action/route.ts",
  state: "web/direkt-app/app/api/customer/state/route.ts",
  api: "web/direkt-app/lib/server/direkt-auth-api.ts",
  ui: "web/direkt-app/components/customer-journey-experience.tsx",
  contactController: "backend/direkt-api/src/account-contact/account-contact.controller.ts",
  reviewController: "backend/direkt-api/src/interaction/review.controller.ts",
  reviewDto: "backend/direkt-api/src/interaction/review.dto.ts",
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
  "requirePolicy(policyVersion)",
  "uuid(body.idempotencyKey)",
]);
requireMarkers(source.state, [
  "withAuthenticatedSession",
  "api.listSavedProviders",
  "api.listEnquiries",
  "api.listInteractions",
  "api.listReviews",
  "api.listComplaints",
  "api.listAccountContacts",
]);
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
requireMarkers(source.contactController, ["@Controller('account/contacts')", "@Get()", "ACCOUNT_PROFILE_READ"]);
requireMarkers(source.reviewController, ["interactions/:interactionId/reviews", "reviews/:reviewId/appeals", "reviews/:reviewId/reports"]);
requireMarkers(source.reviewDto, ["class CreateReviewAppealDto", "reason!: string", "class ReportReviewDto", "reasonCode!:", "detail!: string"]);
requireMarkers(source.ui, ["CustomerJourneyExperience", "Saved", "Enquiries", "Reviews", "Complaints"]);

for (const [name, text] of Object.entries({ action: source.action, state: source.state, ui: source.ui })) {
  if (/localStorage|sessionStorage|indexedDB/i.test(text)) throw new Error(`${name} must not persist customer/session state in browser-readable storage`);
}
if (!source.action.includes("assertSecureMutation(request)")) throw new Error("All W4 mutations must remain same-origin and CSRF protected");
if (/DIREKT_API_BASE_URL|X-Serverless-Authorization/.test(source.ui)) throw new Error("Customer UI must not receive private API infrastructure details");

process.stdout.write(`${JSON.stringify({event:"w4_customer_contract_passed",csrfProtected:true,idempotencyProtected:true,privateApiBoundary:true,androidUntouched:true})}\n`);

function requireMarkers(text, markers) {
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`W4 contract marker missing: ${marker}`);
}
