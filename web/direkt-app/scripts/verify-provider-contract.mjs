import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const repositoryRoot = join(root, "../..");
const files = {
  workspaceController: "backend/direkt-api/src/provider-workspace/provider-workspace.controller.ts",
  workspaceDto: "backend/direkt-api/src/provider-workspace/provider-workspace.dto.ts",
  workspaceTypes: "backend/direkt-api/src/provider-workspace/provider-workspace.types.ts",
  interactionController: "backend/direkt-api/src/interaction/interaction.controller.ts",
  interactionDto: "backend/direkt-api/src/interaction/interaction.dto.ts",
  reviewController: "backend/direkt-api/src/interaction/review.controller.ts",
  reviewDto: "backend/direkt-api/src/interaction/review.dto.ts",
  commercialController: "backend/direkt-api/src/commercial/commercial.controller.ts",
  providerApi: "web/direkt-app/lib/server/direkt-provider-api.ts",
  stateRoute: "web/direkt-app/app/api/provider/state/route.ts",
  actionRoute: "web/direkt-app/app/api/provider/action/route.ts",
  providerUi: "web/direkt-app/components/provider-journey-experience.tsx",
  shell: "web/direkt-app/components/direkt-app-shell.tsx",
};

const source = {};
for (const [name, path] of Object.entries(files)) source[name] = await readFile(join(repositoryRoot, path), "utf8");

requireMarkers(source.workspaceController, [
  "@Get('me')",
  "providerFromActor: true",
  "@Patch('me/profile')",
  "@Put('me/services/:categoryKey')",
  "@Delete('me/services/:categoryKey')",
  "@Put('me/location')",
  "@Put('me/availability/:categoryKey')",
  "@Post('me/upload-intents')",
  "@Get('me/upload-intents')",
  "@Post('me/upload-intents/:uploadIntentId/retry')",
  "@Put('me/upload-intents/:uploadIntentId/interrupted')",
  "@Post('me/upload-intents/:uploadIntentId/confirm')",
]);
requireMarkers(source.workspaceDto, [
  "privateBaseLatitude",
  "publicPremisesConsent",
  "serviceAreaWkt",
  "clientIntentKey",
  "consentConfirmed",
  "sha256",
  "retentionClass",
]);
requireMarkers(source.workspaceTypes, [
  "privateObjectKeyExposed: false",
  "reviewerIdentityExposed: false",
  "privateRationaleExposed: false",
  "providerId: string",
  "representativeRole: ProviderWorkspaceRole",
]);
requireMarkers(source.interactionController, [
  "@Get('provider-workspace/me/enquiries')",
  "@Get('provider-workspace/me/enquiries/:enquiryId')",
  "@Post('provider-workspace/me/enquiries/:enquiryId/transitions')",
  "providerFromActor: true",
]);
requireMarkers(source.interactionDto, ["expectedRevision", "policyVersion", "needs_information"]);
requireMarkers(source.reviewController, [
  "@Get('provider-workspace/me/reviews')",
  "@Post('provider-workspace/me/reviews/:reviewId/response')",
  "@Post('provider-workspace/me/reviews/:reviewId/appeals')",
  "providerFromActor: true",
]);
requireMarkers(source.reviewDto, ["class CreateProviderReviewResponseDto", "class CreateReviewAppealDto", "policyVersion"]);
requireMarkers(source.commercialController, ["@Get('provider-workspace/me/commercial')", "providerFromActor: true"]);

requireMarkers(source.providerApi, [
  '"/api/v1/provider-workspace/me"',
  '"/api/v1/provider-workspace/me/profile"',
  '"/api/v1/provider-workspace/me/location"',
  '"/api/v1/provider-workspace/me/upload-intents"',
  '"/api/v1/provider-workspace/me/enquiries"',
  '"/api/v1/provider-workspace/me/reviews"',
  '"/api/v1/provider-workspace/me/commercial"',
  'authorization: `Bearer ${options.accessToken}`',
  '"X-Serverless-Authorization"',
  'cache: "no-store"',
]);
requireMarkers(source.stateRoute, ["withAuthenticatedSession", "api.workspace", "api.verificationTimeline", "api.listUploadIntents", "api.listEnquiries", "api.listReviews", "api.commercial", "noStoreJson"]);
requireMarkers(source.actionRoute, [
  "assertSecureMutation",
  'case "update-profile"',
  'case "update-location"',
  'case "select-service"',
  'case "remove-service"',
  'case "update-availability"',
  'case "create-upload-intent"',
  'case "retry-upload"',
  'case "interrupt-upload"',
  'case "confirm-upload"',
  'case "cancel-upload"',
  'case "transition-enquiry"',
  'case "respond-review"',
  'case "appeal-review"',
  "DIREKT_WEB_INTERACTION_POLICY_VERSION",
]);
requireMarkers(source.providerUi, [
  'fetch("/api/provider/state"',
  'fetch("/api/provider/action"',
  'crypto.subtle.digest("SHA-256"',
  "grant.upload.uploadUrl",
  'action: "interrupt-upload"',
  "private base coordinates",
  "Provider scope is granted only",
]);
requireMarkers(source.shell, ["ProviderJourneyExperience", "providerModeAvailable", "W5 provider lifecycle"]);

for (const [name, text] of Object.entries({ providerUi: source.providerUi, actionRoute: source.actionRoute })) {
  if (/localStorage|sessionStorage|indexedDB/i.test(text)) throw new Error(`${name} must not persist auth or private upload state in browser storage`);
}

if (/body\.providerId|body\.providerScope|body\.representativeRole/.test(source.actionRoute)) {
  throw new Error("W5 browser actions must not accept provider ownership/scope/role from client input");
}
if (/objectKey|privateObjectKey/.test(source.providerUi)) {
  throw new Error("W5 provider UI must not consume or render private storage object keys");
}
if (!source.providerUi.includes("uploadAndConfirm") || !source.providerUi.includes("await reload()")) {
  throw new Error("W5 upload flow must confirm durable state and reload authoritative backend state");
}
if (/fetch\([^\n]+provider-workspace|fetch\([^\n]+api\/v1/.test(source.providerUi)) {
  throw new Error("Provider UI must use reviewed same-origin BFF routes rather than direct canonical API calls");
}

process.stdout.write(`${JSON.stringify({
  event: "w5_provider_contract_passed",
  actorResolvedProviderScope: true,
  privateEvidenceBounded: true,
  recoverableUploads: true,
  enquiryRevisionControl: true,
  serverPolicyVersion: true,
  commercialReadOnlyInW5: true,
  directApiFromBrowser: false,
})}\n`);

function requireMarkers(text, markers) {
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`W5 contract marker missing: ${marker}`);
}
