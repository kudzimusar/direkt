import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const repositoryRoot = join(root, "../..");
const files = {
  controller: "backend/direkt-api/src/commercial/commercial.controller.ts",
  service: "backend/direkt-api/src/commercial/commercial.service.ts",
  dto: "backend/direkt-api/src/commercial/commercial.dto.ts",
  types: "backend/direkt-api/src/commercial/commercial.types.ts",
  api: "web/direkt-app/lib/server/direkt-provider-api.ts",
  action: "web/direkt-app/app/api/provider/action/route.ts",
  ui: "web/direkt-app/components/commercial-experience.tsx",
  shell: "web/direkt-app/components/direkt-app-shell.tsx",
};
const source = {};
for (const [name, path] of Object.entries(files)) source[name] = await readFile(join(repositoryRoot, path), "utf8");

requireMarkers(source.controller, [
  "@Get('commercial/products')",
  "@Get('provider-workspace/me/commercial')",
  "@Post('provider-workspace/me/subscriptions')",
  "@Post('provider-workspace/me/subscriptions/:subscriptionId/cancel')",
  "@Post('provider-workspace/me/subscriptions/:subscriptionId/invoices')",
  "@Post('provider-workspace/me/invoices/:invoiceId/payment-intents')",
  "@Post('provider-workspace/me/payment-intents/:paymentIntentId/cancel')",
  "providerFromActor: true",
]);
requireMarkers(source.service, [
  "requireIdempotencyKey",
  "Payment initiation is disabled until a reviewed provider integration is approved.",
  "this.paymentProvider.mode !== 'synthetic'",
]);
requireMarkers(source.dto, ["expectedRevision", "policyVersion", "productKey", "priceKey"]);
requireMarkers(source.types, [
  "verificationIncluded: false",
  "publicationIncluded: false",
  "rankingIncluded: false",
  "productionMoneyMovement: false",
  "credentialRequested: false",
  "paymentCredentialIncluded: false",
  "trustOrRankingMutation: false",
]);
requireMarkers(source.api, [
  "createSubscription(",
  "cancelSubscription(",
  "issueInvoice(",
  "createPaymentIntent(",
  "cancelPaymentIntent(",
  'headers["idempotency-key"] = options.idempotencyKey',
]);
requireMarkers(source.action, [
  'case "create-subscription"',
  'case "cancel-subscription"',
  'case "issue-invoice"',
  'case "create-payment-intent"',
  'case "cancel-payment-intent"',
  "DIREKT_WEB_COMMERCIAL_POLICY_VERSION",
  "idempotencyKey",
  "expectedRevision",
  "assertSecureMutation",
]);
requireMarkers(source.ui, [
  "CommercialExperience",
  'fetch("/api/provider/state"',
  'fetch("/api/provider/action"',
  'action: "create-subscription"',
  'action: "cancel-subscription"',
  'action: "issue-invoice"',
  'action: "create-payment-intent"',
  'action: "cancel-payment-intent"',
  "Start synthetic subscription",
  "Create synthetic payment intent",
  "Production money movement: no",
]);
requireMarkers(source.shell, ["CommercialExperience", "W6 active", "external providers gated"]);

if (/body\.providerId|body\.providerScope/.test(source.action)) {
  throw new Error("W6 commercial mutations must not accept provider scope from browser input");
}
if (/webhooks\/payments|x-direkt-signature|SyntheticPaymentWebhookDto/.test(source.ui + source.action)) {
  throw new Error("W6 browser surface must not expose or invoke payment webhook authority");
}
if (/localStorage|sessionStorage|indexedDB/i.test(source.ui + source.action)) {
  throw new Error("W6 commercial state/idempotency material must not be persisted in browser storage");
}
if (/fetch\([^\n]+provider-workspace|fetch\([^\n]+api\/v1/.test(source.ui)) {
  throw new Error("W6 browser UI must use the reviewed same-origin BFF only");
}
if (!/crypto\.randomUUID\(\)/.test(source.ui)) {
  throw new Error("W6 retry-safe creates require a browser-generated per-action idempotency key");
}

process.stdout.write(`${JSON.stringify({
  event: "w6_commercial_contract_passed",
  actorResolvedScope: true,
  idempotencyRequired: true,
  revisionControl: true,
  syntheticOnlyInitiation: true,
  paymentCredentialsExcluded: true,
  verificationPublicationRankingEffects: false,
  webhookAuthorityExposedToBrowser: false,
})}\n`);

function requireMarkers(text, markers) {
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`W6 contract marker missing: ${marker}`);
}
