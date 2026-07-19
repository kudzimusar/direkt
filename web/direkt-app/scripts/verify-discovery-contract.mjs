import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const repoRoot = resolve(root, "../..");

const backendDiscoveryTypes = await readFile(
  resolve(repoRoot, "backend/direkt-api/src/discovery/discovery.types.ts"),
  "utf8",
);
const backendReviewTypes = await readFile(
  resolve(repoRoot, "backend/direkt-api/src/interaction/review.types.ts"),
  "utf8",
);
const backendDiscoveryDto = await readFile(
  resolve(repoRoot, "backend/direkt-api/src/discovery/discovery.dto.ts"),
  "utf8",
);
const webContracts = await readFile(resolve(root, "lib/contracts/discovery.ts"), "utf8");
const webQuery = await readFile(resolve(root, "lib/server/discovery-query.ts"), "utf8");
const apiClient = await readFile(resolve(root, "lib/server/direkt-api-client.ts"), "utf8");
const cloudRunIdentity = await readFile(resolve(root, "lib/server/cloud-run-identity.ts"), "utf8");

const providerFields = [
  "publicProviderId",
  "categoryKey",
  "categoryName",
  "displayName",
  "operatingModel",
  "locality",
  "publicPremises",
  "serviceAreaGeoJson",
  "availability",
  "nextAvailableAt",
  "image",
  "claims",
  "reasons",
  "distanceKm",
  "sharePath",
  "synthetic",
];
const searchContextFields = [
  "manualArea",
  "usedOneTimeLocation",
  "backgroundLocationUsed",
  "resultCount",
  "noResultsSuggestions",
];
const publicReviewFields = [
  "reviewId",
  "publicProviderId",
  "providerDisplayName",
  "categoryKey",
  "rating",
  "title",
  "body",
  "publishedAt",
  "providerResponse",
  "contactIncluded",
  "interactionIdentifierIncluded",
  "moderationRationaleIncluded",
  "synthetic",
];

for (const field of providerFields) {
  requireMarker(backendDiscoveryTypes, field, `backend discovery provider field ${field}`);
  requireMarker(webContracts, field, `web discovery provider field ${field}`);
}
for (const field of searchContextFields) {
  requireMarker(backendDiscoveryTypes, field, `backend discovery search-context field ${field}`);
  requireMarker(webContracts, field, `web discovery search-context field ${field}`);
}
for (const field of publicReviewFields) {
  requireMarker(backendReviewTypes, field, `backend public review field ${field}`);
  requireMarker(webContracts, field, `web public review field ${field}`);
}

for (const obsolete of ["localitySummary", "categoryNames"]) {
  if (webContracts.includes(obsolete) || apiClient.includes(obsolete)) {
    throw new Error(`Obsolete discovery field remains in functional web contract: ${obsolete}`);
  }
}

const queryFields = [
  "q",
  "category",
  "area",
  "latitude",
  "longitude",
  "radiusKm",
  "operatingModel",
  "availability",
  "claim",
  "limit",
  "cursor",
];
for (const field of queryFields) {
  requireMarker(backendDiscoveryDto, field, `backend discovery query field ${field}`);
  requireMarker(webQuery, `\"${field}\"`, `web discovery allowlisted query field ${field}`);
}

for (const path of [
  "app/api/discovery/categories/route.ts",
  "app/api/discovery/search/route.ts",
  "app/api/discovery/providers/[publicProviderId]/route.ts",
  "app/providers/[publicProviderId]/page.tsx",
]) {
  await access(resolve(root, path));
}

for (const prohibitedPath of [
  "app/api/[...path]/route.ts",
  "app/api/proxy/[...path]/route.ts",
  "app/api/direkt/[...path]/route.ts",
]) {
  try {
    await access(resolve(root, prohibitedPath));
    throw new Error(`Generic API proxy is prohibited: ${prohibitedPath}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Generic API proxy")) throw error;
  }
}

for (const marker of [
  "X-Serverless-Authorization",
  "getCloudRunIdentityToken",
  "cache: \"no-store\"",
  "redirect: \"error\"",
]) {
  requireMarker(apiClient, marker, `private API invocation boundary ${marker}`);
}
for (const marker of [
  "metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity",
  "Metadata-Flavor",
  "audience.origin",
]) {
  requireMarker(cloudRunIdentity, marker, `Cloud Run identity boundary ${marker}`);
}

const clientSource = await readFile(resolve(root, "components/discovery-experience.tsx"), "utf8");
if (clientSource.includes("DIREKT_API_BASE_URL") || clientSource.includes("X-Serverless-Authorization")) {
  throw new Error("Browser discovery component must not know the private API URL or infrastructure token");
}
for (const marker of ["/api/discovery/search", "/providers/${provider.publicProviderId}", "claim.limitation"]) {
  requireMarker(clientSource, marker, `customer discovery UI marker ${marker}`);
}

process.stdout.write(
  `${JSON.stringify({
    event: "functional_pwa_discovery_contract_passed",
    canonicalProviderFields: providerFields.length,
    canonicalReviewFields: publicReviewFields.length,
    queryAllowlistFields: queryFields.length,
    genericProxy: false,
    privateApiUrlExposedToClient: false,
  })}\n`,
);

function requireMarker(source, marker, label) {
  if (!source.includes(marker)) throw new Error(`Missing ${label}`);
}
