import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const repositoryRoot = join(root, "../..");
const read = (path) => readFile(join(repositoryRoot, path), "utf8");

const [globals, sw, layout, shell, manifest, matrix, actionRoute, browserSession, authRoute] = await Promise.all([
  read("web/direkt-app/app/globals.css"),
  read("web/direkt-app/public/sw.js"),
  read("web/direkt-app/app/layout.tsx"),
  read("web/direkt-app/components/direkt-app-shell.tsx"),
  read("web/direkt-app/public/manifest.webmanifest"),
  read("docs/web/FUNCTIONAL_PARITY_MATRIX.md"),
  read("web/direkt-app/app/api/provider/action/route.ts"),
  read("web/direkt-app/lib/server/browser-session.ts"),
  read("web/direkt-app/lib/server/request-security.ts"),
]);

requireMarkers(globals, [
  ".skip-link",
  "button:focus-visible",
  ".mobile-bottom-nav",
  ".tablet-rail",
  ".desktop-side-nav",
  "@media (prefers-reduced-motion: reduce)",
  "min-height: 48px",
]);
requireMarkers(layout, [
  'colorScheme: "light dark"',
  'width: "device-width"',
]);
if (!/<a\s+className=["']skip-link["']\s+href=["']#main-content["']\s*>\s*Skip to content\s*<\/a>/s.test(layout)) {
  throw new Error("W7 marker missing: accessible skip link to main content");
}
requireMarkers(shell, [
  'className="desktop-side-nav"',
  'className="tablet-rail"',
  'className="mobile-bottom-nav"',
  'aria-label="Primary"',
  'id="main-content"',
  "ProviderJourneyExperience",
  "CommercialExperience",
]);
requireMarkers(sw, [
  '"/api/auth/"',
  '"/api/customer/action"',
  '"/api/provider/action"',
  'return fetch(request, { cache: "no-store" });',
  "event.respondWith(networkOnly(event.request));",
  "OFFLINE_URL",
]);
requireMarkers(manifest, [
  '"display": "standalone"',
  '"start_url": "/"',
  '"name": "DIREKT"',
]);
requireMarkers(matrix, [
  "W7 cross-client parity/regression closure",
  "W2–W6 managed exact-source evidence chain reconciled",
  "Live Android-runtime ↔ web-runtime state mutation synchronization",
  "GATED — W7 proves contract compatibility and zero Android regression",
  "Real MTN/Airtel credentials and money movement",
  "Formal Phase 12 production release",
]);
requireMarkers(actionRoute, [
  "assertSecureMutation(request)",
  "DIREKT_WEB_INTERACTION_POLICY_VERSION",
  "DIREKT_WEB_COMMERCIAL_POLICY_VERSION",
]);
requireMarkers(browserSession, [
  "httpOnly: true",
  'sameSite: "strict"',
  "timingSafeEqual",
]);
requireMarkers(authRoute, [
  "assertSameOrigin",
  'request.headers.get("origin")',
  'request.headers.get("x-direkt-csrf")',
  "verifyCsrfToken",
]);

if (/localStorage|sessionStorage|indexedDB/i.test(browserSession + actionRoute)) {
  throw new Error("W7 session/private mutation boundary must not persist sensitive state in browser-readable storage");
}

const protectedMarkerPatterns = [
  ["SUPABASE", "SERVICE", "ROLE"].join("_"),
  ["service", "role", "key"].join("_"),
  ["sb", "secret"].join("_") + "_",
  ["DATABASE", "URL"].join("_") + String.raw`\s*=`,
  ["private", "Object", "Key"].join("") + String.raw`\s*[:=]`,
];
const protectedMarkerRegex = new RegExp(protectedMarkerPatterns.join("|"), "i");
const webSensitiveScanTargets = [shell, actionRoute, browserSession].join("\n");
if (protectedMarkerRegex.test(webSensitiveScanTargets)) {
  throw new Error("W7 browser-facing source contains a privileged or private-storage marker");
}

if (!/\.mobile-bottom-nav\s*\{[\s\S]*position:\s*fixed/.test(globals)) {
  throw new Error("Mobile bottom navigation must remain fixed on compact viewports");
}
if (!/@media \(min-width: (?:64rem|1024px)\)[\s\S]*\.desktop-side-nav[\s\S]*display:\s*flex/.test(globals)) {
  throw new Error("Desktop side navigation must activate at the desktop breakpoint");
}
if (!/@media \(min-width: (?:48rem|768px)\)[\s\S]*\.mobile-bottom-nav[\s\S]*display:\s*none/.test(globals)) {
  throw new Error("Bottom navigation must not remain visible on tablet/desktop layouts");
}
if (!/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation-duration:\s*0\.00(?:1|10)ms/.test(globals)) {
  throw new Error("Reduced-motion override is required");
}

const mutationPrefixes = ["/api/auth/", "/api/customer/action", "/api/provider/action"];
for (const prefix of mutationPrefixes) {
  if (!sw.includes(`"${prefix}"`)) throw new Error(`Service worker must keep ${prefix} network-only`);
}

const forbiddenMatrixStates = ["IMPLEMENTING", "API_READY", "PREVIEW_ONLY"];
for (const state of forbiddenMatrixStates) {
  if (new RegExp(`\\|[^\\n]*\\|[^\\n]*\\|[^\\n]*${state}`, "i").test(matrix)) {
    throw new Error(`W7 parity matrix still contains unresolved ${state} capability rows`);
  }
}

process.stdout.write(`${JSON.stringify({
  event: "w7_regression_contract_passed",
  responsiveNavigation: true,
  keyboardFocusAndSkipLink: true,
  reducedMotion: true,
  offlineMutationNetworkOnly: true,
  privilegedBrowserMarkersAbsent: true,
  csrfOriginBoundary: true,
  matrixReconciled: true,
  gatedItemsExplicit: true,
})}\n`);

function requireMarkers(text, markers) {
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`W7 marker missing: ${marker}`);
}
