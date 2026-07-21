import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const repoRoot = resolve(root, "../..");

function read(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`VC8 quality contract missing ${label}: ${needle}`);
  }
}

function rejectText(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`VC8 quality contract rejects ${label}: ${needle}`);
  }
}

const discoveryPanel = read("web/direkt-app/components/discovery-ai-assist-panel.tsx");
const discoveryExperience = read("web/direkt-app/components/discovery-experience.tsx");
const providerPanel = read("web/direkt-app/components/provider-ai-assist-panel.tsx");
const supportPanel = read("web/direkt-app/components/support-assist-panel.tsx");
const accountExperience = read("web/direkt-app/components/account-experience.tsx");
const discoveryCss = read("web/direkt-app/app/discovery-ai.css");
const providerCss = read("web/direkt-app/app/provider-ai.css");
const supportCss = read("web/direkt-app/app/support-ai.css");
const operationsEvidence = read(
  "admin/direkt-operations-portal/src/app/operations/evidence-review/page.tsx",
);
const backendEnvironment = read("backend/direkt-api/src/config/environment.ts");
const registry = read("backend/direkt-api/src/ai/ai-use-case.registry.ts");
const webRuntimeCorpus = [
  discoveryPanel,
  discoveryExperience,
  providerPanel,
  supportPanel,
  read("web/direkt-app/app/api/discovery/assist/route.ts"),
  read("web/direkt-app/app/api/provider/ai-assist/route.ts"),
  read("web/direkt-app/app/api/support/assist/route.ts"),
  read("web/direkt-app/lib/server/direkt-discovery-ai-client.ts"),
  read("web/direkt-app/lib/server/direkt-provider-ai-api.ts"),
  read("web/direkt-app/lib/server/direkt-public-support-api.ts"),
].join("\n");

// Customer assistance must be optional, disclosed, confirm-before-apply and manually recoverable.
requireText(discoveryPanel, "AI-assisted suggestion", "AI disclosure");
requireText(discoveryPanel, "You always confirm the choice before searching", "customer confirmation");
requireText(discoveryPanel, "You can still choose a category or search normally", "customer manual fallback");
requireText(discoveryPanel, 'aria-live="polite"', "customer assist live-region semantics");
requireText(discoveryPanel, 'role="status"', "customer assist status semantics");
rejectText(discoveryExperience, '<DirektIcon name="sparkle"', "decorative AI sparkle iconography");

// Provider AI must never auto-write business state or masquerade as authoritative verification.
requireText(providerPanel, "This text is not saved or published automatically", "provider confirmation boundary");
requireText(providerPanel, "normal provider workspace remains fully usable", "provider outage fallback");
requireText(providerPanel, 'aria-live="polite"', "provider assist live-region semantics");
rejectText(providerPanel, 'fetch("/api/provider/action"', "direct AI-driven provider mutation");

// Public support must remain grounded and expose its approved sources.
requireText(supportPanel, "AI-assisted, source-grounded help", "grounded support disclosure");
requireText(supportPanel, "Based on", "support source presentation");
requireText(supportPanel, "cannot change provider trust", "support authority boundary");
requireText(supportPanel, 'aria-live="polite"', "support live-region semantics");

// Core interactive additions must preserve minimum target, visible focus and mobile reflow.
for (const [label, css] of [
  ["discovery", discoveryCss],
  ["provider", providerCss],
  ["support", supportCss],
]) {
  requireText(css, "min-height: 48px", `${label} 48px interaction target`);
  requireText(css, ":focus-visible", `${label} keyboard focus visibility`);
  requireText(css, "@media (max-width: 640px)", `${label} mobile reflow`);
}

// Product UI must not expose historical workstream labels as user-facing headings.
rejectText(accountExperience, '>W3 security boundary<', "visible W3 implementation jargon");

// Restricted trust/evidence AI remains hard-gated until dedicated approval.
requireText(operationsEvidence, "Not active in this synthetic environment", "restricted AI inactive disclosure");
requireText(operationsEvidence, "cannot decide this case", "human decision authority boundary");
requireText(
  backendEnvironment,
  "DIREKT_AI_OPERATIONS_SUMMARY_MODE: Joi.string().valid('disabled').default('disabled')",
  "hard-disabled restricted operations AI switch",
);
requireText(registry, "activation: 'restricted-gated'", "restricted AI registry gate");

// Browser code must never carry model-provider credentials or direct provider SDK authority.
for (const marker of [
  "AI_GEMINI_API_KEY",
  "AI_GROQ_API_KEY",
  "generativelanguage.googleapis.com",
  "api.groq.com/openai",
  "google-auth-library",
]) {
  rejectText(webRuntimeCorpus, marker, `browser AI credential/provider marker ${marker}`);
}

// No new blanket trust label is allowed in AI product surfaces.
for (const source of [discoveryPanel, providerPanel, supportPanel]) {
  if (/\bverified\b/i.test(source)) {
    throw new Error("VC8 AI surfaces must not render a blanket Verified claim.");
  }
}

console.log("VC8 quality contract verified: AI disclosure/fallback/privacy, restricted-data gate, focus/reflow and trust boundaries are intact.");
