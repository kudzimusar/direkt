import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const repositoryRoot = join(root, "../..");
const read = (path) => readFile(join(repositoryRoot, path), "utf8");

const [
  pagesBuilder,
  pwaCi,
  pagesWorkflow,
  prepare,
  exercise,
  cleanup,
  managedWorkflow,
  mainTrigger,
  canonicalVerify,
  canonicalWorkflow,
  checkpoint,
  lock,
] = await Promise.all([
  read("scripts/build_pages_source.py"),
  read(".github/workflows/pwa-ci.yml"),
  read(".github/workflows/pages.yml"),
  read("scripts/w8-managed-cutover-prepare.sh"),
  read("scripts/w8-managed-cutover-exercise.sh"),
  read("scripts/w8-managed-cutover-cleanup.sh"),
  read(".github/workflows/functional-pwa-w8-managed-cutover.yml"),
  read(".github/workflows/functional-pwa-w8-main-trigger.yml"),
  read("scripts/w8-canonical-domain-verify.sh"),
  read(".github/workflows/functional-pwa-w8-canonical-domain.yml"),
  read("docs/web/W8_CONTROLLED_CUTOVER_CHECKPOINT.md"),
  read("WORKSTREAM_LOCK.md"),
]);

requireMarkers(pagesBuilder, [
  'OUT / "app"',
  'OUT / "preview"',
  "synthetic customer/provider PWA as an explicit preview",
  "Next.js/BFF application is deployed separately",
]);
requireMarkers(pwaCi, [
  "for route in app preview",
  "Launch the DIREKT customer/provider synthetic preview",
  "site/preview/**",
]);
requireMarkers(pagesWorkflow, ["for route in app preview", "Verify W8 synthetic preview preservation"]);
requireMarkers(prepare, [
  'phase="${1:-}"',
  "preflight()",
  "bind_api_invoker()",
  "build_image()",
  "deploy_web()",
  "pin_origin()",
  "verify_iam()",
  "GCP_WEB_RUNTIME_SERVICE_ACCOUNT",
  "W8 preflight could not verify the dedicated runtime identity",
  "Identity provisioning is intentionally outside the deployment identity boundary",
  "roles/run.invoker",
  "--allow-unauthenticated",
  "DIREKT_WEB_API_MODE=authenticated-bff",
  "DIREKT_WEB_AUTH_MODE=synthetic",
  "DIREKT_WEB_ALLOW_SYNTHETIC_AUTH=true",
  "allUsers",
  "allAuthenticatedUsers",
]);
requireMarkers(exercise, [
  'phase="${1:-}"',
  "api_denial()",
  "public_shell()",
  "pwa_assets()",
  "discovery()",
  "session_boundary()",
  "privacy_evidence()",
  'test "${api_status}" = "403"',
  "/api/discovery/categories",
  'cache: "no-store"',
  "/api/auth/bootstrap",
  "publicFunctionalWebReachable:true",
  "canonicalApiRemainsIamPrivate:true",
  "canonicalCustomDomainVerified:false",
  "realParticipantActivation:false",
  "formalProductionRelease:false",
]);
requireMarkers(cleanup, [
  'if [[ "${success}" != "true" ]]',
  "remove-iam-policy-binding",
  "--member allUsers",
  "GCP_WEB_RUNTIME_SERVICE_ACCOUNT",
  "allAuthenticatedUsers",
  "Identity provisioning/act-as policy is not mutated by W8",
]);
requireMarkers(managedWorkflow, [
  "RUN-DIREKT-W8-PUBLIC-WEB",
  "source_sha",
  "git merge-base --is-ancestor",
  "GCP_WEB_RUNTIME_SERVICE_ACCOUNT_ID: direkt-cp-web-runtime",
  "GCP_WEB_RUNTIME_SERVICE_ACCOUNT: direkt-cp-web-runtime@direkt-dev-502701.iam.gserviceaccount.com",
  "Preflight W8 private API and dedicated runtime identity",
  "w8-managed-cutover-prepare.sh preflight",
  "Bind W8 runtime invoker on private API",
  "w8-managed-cutover-prepare.sh api-invoker",
  "Build and push W8 functional web image",
  "w8-managed-cutover-prepare.sh image",
  "Deploy and attach dedicated W8 browser/BFF runtime",
  "w8-managed-cutover-prepare.sh deploy",
  "Pin W8 browser mutation origin",
  "w8-managed-cutover-prepare.sh origin",
  "Verify W8 runtime attachment and IAM boundaries",
  "w8-managed-cutover-prepare.sh verify",
  "Prove canonical API denies unauthenticated direct traffic",
  "w8-managed-cutover-exercise.sh api-denial",
  "Prove public W8 responsive shell is reachable",
  "w8-managed-cutover-exercise.sh public-shell",
  "Prove W8 manifest service worker and offline shell",
  "w8-managed-cutover-exercise.sh pwa-assets",
  "Prove W8 BFF discovery traverses private API",
  "w8-managed-cutover-exercise.sh discovery",
  "Prove W8 synthetic session and private state boundaries",
  "w8-managed-cutover-exercise.sh session",
  "Prove W8 browser privacy scan and emit evidence",
  "id: evidence_file",
  "w8-managed-cutover-exercise.sh privacy-evidence",
  "if: always() && steps.evidence_file.conclusion == 'success'",
  "if-no-files-found: error",
  "w8-managed-cutover-cleanup.sh",
  "W8_CUTOVER_SUCCEEDED=true",
  "direkt-w8-functional-cutover-",
]);
requireMarkers(mainTrigger, [
  "W8_MANAGED_PUBLIC_WEB_MAIN_TRIGGER.md",
  "functional-pwa-w8-managed-cutover.yml",
  ".head_sha == $source_sha",
  "direkt-w8-functional-cutover-${SOURCE_SHA}",
  "publicWebUrl",
  "direkt-w8-main-public-web-result",
]);
requireMarkers(canonicalVerify, [
  "https://app.direkt.forum",
  "https://direkt.forum/preview/",
  "getent ahosts",
  "manifest.webmanifest",
  "/sw.js",
  "/offline",
  "/api/discovery/categories",
  "/api/auth/bootstrap",
  'test "${provider_status}" = "401"',
  'test "${customer_status}" = "401"',
  "canonicalCustomDomainVerified:true",
  "realParticipantActivation:false",
  "externalPaymentActivation:false",
  "formalProductionRelease:false",
]);
requireMarkers(canonicalWorkflow, [
  "DIREKT functional web W8 canonical domain verification",
  "Verify canonical W8 app host and preserved preview",
  "Verify immutable reviewed source",
  "Verify canonical domain DNS TLS runtime PWA BFF session privacy and preview",
  "scripts/w8-canonical-domain-verify.sh",
  "direkt-w8-canonical-domain-",
  "if-no-files-found: error",
]);
requireMarkers(checkpoint, [
  "**Status:** CLOSED",
  "https://app.direkt.forum",
  "## Canonical-domain closure — PASS",
  "canonicalCustomDomainVerified:true",
  "**Decision: W8 CLOSED.**",
]);
requireMarkers(lock, [
  "Status | RELEASED",
  "W8 — controlled route/deployment cutover",
  "dedicated least-privilege runtime identity",
  "https://app.direkt.forum",
  "The lane is currently **RELEASED**",
]);

const permanentRuntimeFiles = [prepare, managedWorkflow, canonicalVerify, canonicalWorkflow, checkpoint, lock].join("\n");
const executableRuntimeFiles = [prepare, exercise, cleanup, managedWorkflow, mainTrigger, canonicalVerify, canonicalWorkflow].join("\n");
if (permanentRuntimeFiles.includes("direkt-portal-runtime@")) {
  throw new Error("W8 permanent public web cutover must not reuse the operations-portal runtime identity");
}
if (executableRuntimeFiles.includes("direkt-customer-provider-web-runtime")) {
  throw new Error("W8 executable/runtime configuration must not reintroduce the invalid overlength service-account identifier");
}
if (prepare.includes("service-accounts create") || prepare.includes("service-accounts add-iam-policy-binding")) {
  throw new Error("W8 deployment workflow must not create runtime identities or rewrite service-account IAM policy");
}
if (cleanup.includes("service-accounts remove-iam-policy-binding")) {
  throw new Error("W8 rollback must not mutate pre-provisioned service-account IAM policy");
}
if (/hashFiles\([^\n]*runner\.temp/.test(managedWorkflow)) {
  throw new Error("W8 evidence upload must not use hashFiles against runner.temp; bind upload to the evidence step result instead");
}

const runtimeIdMatch = managedWorkflow.match(/GCP_WEB_RUNTIME_SERVICE_ACCOUNT_ID:\s*([a-z0-9-]+)/);
if (!runtimeIdMatch) {
  throw new Error("W8 managed workflow must declare a dedicated runtime service-account ID");
}
const runtimeId = runtimeIdMatch[1];
if (runtimeId.length < 6 || runtimeId.length > 30) {
  throw new Error(`W8 runtime service-account ID must be 6-30 characters; received ${runtimeId.length}`);
}
if (!/^[a-z]([-a-z0-9]*[a-z0-9])$/.test(runtimeId)) {
  throw new Error("W8 runtime service-account ID must satisfy the Google Cloud account-ID syntax");
}

requireMarkers(prepare, [
  'case "${phase}" in',
  "preflight) preflight ;;",