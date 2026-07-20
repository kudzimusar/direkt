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
  "w8-managed-cutover-exercise.sh",
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
requireMarkers(checkpoint, [
  "**Status:** IMPLEMENTING",
  "dedicated least-privilege runtime identity",
  "does **not** by itself close W8",
  "Canonical-domain closure still required",
]);
requireMarkers(lock, [
  "W8 — controlled route/deployment cutover",
  "dedicated least-privilege customer/provider web runtime identity",
  "synthetic `/app/` review surface",
]);

const permanentRuntimeFiles = [prepare, managedWorkflow, checkpoint, lock].join("\n");
const executableRuntimeFiles = [prepare, exercise, cleanup, managedWorkflow, mainTrigger].join("\n");
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
  "api-invoker) bind_api_invoker ;;",
  "image) build_image ;;",
  "deploy) deploy_web ;;",
  "origin) pin_origin ;;",
  "verify) verify_iam ;;",
  "select(. == \"allUsers\" or . == \"allAuthenticatedUsers\")",
  "| length == 0",
]);
requireOrderedMarkers(prepare, [
  'gcloud iam service-accounts describe "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}"',
  'gcloud run services add-iam-policy-binding "${GCP_API_SERVICE}"',
  '--member "serviceAccount:${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}"',
  "--role roles/run.invoker",
]);
requireOrderedMarkers(cleanup, [
  'gcloud run services remove-iam-policy-binding "${GCP_WEB_SERVICE}"',
  "--member allUsers --role roles/run.invoker",
  'gcloud run services remove-iam-policy-binding "${GCP_API_SERVICE}"',
  '--member "serviceAccount:${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}"',
  "--role roles/run.invoker",
]);

process.stdout.write(`${JSON.stringify({
  event: "w8_cutover_contract_passed",
  syntheticPreviewPreserved: true,
  dedicatedRuntimeIdentityRequired: true,
  runtimeServiceAccountIdValid: true,
  runtimeIdentityProvisioningExternalized: true,
  deploymentDoesNotAdministerServiceAccountIam: true,
  prepareFailurePhasesAreAuditable: true,
  canonicalApiRemainsPrivate: true,
  publicBrowserBffOnly: true,
  failClosedRollback: true,
  exactMainSourceDispatch: true,
  publicUiEvidenceArtifactRequired: true,
  canonicalDomainStillEvidenceGated: true,
  realParticipantAndProductionGatesRetained: true,
})}\n`);

function requireMarkers(text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) throw new Error(`W8 marker missing: ${marker}`);
  }
}

function requireOrderedMarkers(text, markers) {
  let cursor = 0;
  for (const marker of markers) {
    const index = text.indexOf(marker, cursor);
    if (index === -1) throw new Error(`W8 ordered marker missing: ${marker}`);
    cursor = index + marker.length;
  }
}
