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
  "GCP_WEB_RUNTIME_SERVICE_ACCOUNT_ID",
  "GCP_WEB_RUNTIME_SERVICE_ACCOUNT",
  "roles/iam.serviceAccountUser",
  "GCP_DEPLOYER_SERVICE_ACCOUNT",
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
]);
requireMarkers(managedWorkflow, [
  "RUN-DIREKT-W8-PUBLIC-WEB",
  "source_sha",
  "git merge-base --is-ancestor",
  "direkt-customer-provider-web-runtime",
  "w8-managed-cutover-prepare.sh",
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
  "dedicated least-privilege web runtime identity",
  "synthetic `/app/` review surface",
]);

const permanentRuntimeFiles = [prepare, managedWorkflow, checkpoint, lock].join("\n");
if (permanentRuntimeFiles.includes("direkt-portal-runtime@")) {
  throw new Error("W8 permanent public web cutover must not reuse the operations-portal runtime identity");
}

if (!/jq -e '[^\n]*allUsers[^\n]*allAuthenticatedUsers[^\n]*length == 0'/.test(prepare)) {
  throw new Error("W8 prepare must assert the canonical API has no public IAM principals");
}
if (!/add-iam-policy-binding[\s\S]*serviceAccount:\$\{GCP_DEPLOYER_SERVICE_ACCOUNT\}[\s\S]*roles\/iam\.serviceAccountUser/.test(prepare)) {
  throw new Error("W8 deployer act-as permission must be scoped to the dedicated runtime service account");
}
if (!/remove-iam-policy-binding[\s\S]*--member allUsers[\s\S]*roles\/run\.invoker/.test(cleanup)) {
  throw new Error("W8 failed cutover must remove public web invocation");
}
if (!/remove-iam-policy-binding[\s\S]*serviceAccount:\$\{GCP_WEB_RUNTIME_SERVICE_ACCOUNT\}[\s\S]*roles\/run\.invoker/.test(cleanup)) {
  throw new Error("W8 failed cutover must remove the new runtime-to-API invocation binding");
}

process.stdout.write(`${JSON.stringify({
  event: "w8_cutover_contract_passed",
  syntheticPreviewPreserved: true,
  dedicatedRuntimeIdentityRequired: true,
  deployerActAsScopedToDedicatedRuntime: true,
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
