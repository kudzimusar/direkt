import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
  "app/discovery.css",
  "app/account.css",
  "app/providers/[publicProviderId]/page.tsx",
  "app/api/auth/bootstrap/route.ts",
  "app/api/auth/challenge/route.ts",
  "app/api/auth/verify/route.ts",
  "app/api/auth/firebase-exchange/route.ts",
  "app/api/auth/logout/route.ts",
  "app/api/auth/sessions/route.ts",
  "app/api/auth/sessions/revoke-others/route.ts",
  "app/api/auth/sessions/[sessionId]/revoke/route.ts",
  "app/api/account/summary/route.ts",
  "components/direkt-app-shell.tsx",
  "components/discovery-experience.tsx",
  "components/account-experience.tsx",
  "lib/navigation.ts",
  "lib/contracts/discovery.ts",
  "lib/contracts/auth.ts",
  "lib/server/runtime-config.ts",
  "lib/server/direkt-api-client.ts",
  "lib/server/direkt-auth-api.ts",
  "lib/server/browser-session.ts",
  "lib/server/authenticated-session.ts",
  "lib/server/request-security.ts",
  "lib/server/cloud-run-identity.ts",
  "next.config.ts",
  "Dockerfile",
  "public/manifest.webmanifest",
  "public/sw.js",
  "public/icon.svg",
  "app/offline/page.tsx",
  "AGENTS.md",
];

for (const path of requiredFiles) await readFile(join(root, path), "utf8");

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
for (const [name, version] of Object.entries({
  next: "16.2.10",
  react: "19.2.0",
  "react-dom": "19.2.0",
})) {
  if (packageJson.dependencies?.[name] !== version) throw new Error(`Expected exact ${name} dependency ${version}`);
}
for (const dependency of ["@supabase/supabase-js", "firebase-admin", "pg", "@google-cloud/storage"]) {
  if (packageJson.dependencies?.[dependency] || packageJson.devDependencies?.[dependency]) {
    throw new Error(`Privileged/direct infrastructure dependency is prohibited in browser app: ${dependency}`);
  }
}

const manifest = JSON.parse(await readFile(join(root, "public/manifest.webmanifest"), "utf8"));
if (manifest.display !== "standalone" || manifest.start_url !== "/" || manifest.scope !== "/") {
  throw new Error("PWA manifest must remain standalone with root start_url and scope");
}
if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  throw new Error("PWA manifest requires separate standard and maskable icon declarations");
}
const iconPurposes = new Set(
  manifest.icons.flatMap((icon) => String(icon?.purpose ?? "").split(/\s+/).filter(Boolean)),
);
if (!iconPurposes.has("any") || !iconPurposes.has("maskable")) {
  throw new Error("PWA manifest must retain both standard and maskable icon purposes");
}

const css = await readFile(join(root, "app/globals.css"), "utf8");
const shell = await readFile(join(root, "components/direkt-app-shell.tsx"), "utf8");
for (const requirement of [
  ".mobile-bottom-nav",
  ".desktop-side-nav",
  ".tablet-rail",
  "@media (min-width: 768px)",
  "@media (min-width: 1024px)",
]) {
  if (!css.includes(requirement)) throw new Error(`Missing responsive contract marker: ${requirement}`);
}
for (const marker of ["mobile-bottom-nav", "desktop-side-nav", "tablet-rail"]) {
  if (!shell.includes(marker)) throw new Error(`Responsive shell is missing ${marker}`);
}
if (!shell.includes("providerModeAvailable") || !shell.includes("AccountExperience")) {
  throw new Error("W3 shell must gate provider mode from backend-derived account state");
}

const serviceWorker = await readFile(join(root, "public/sw.js"), "utf8");
for (const safetyMarker of [
  'url.pathname.startsWith("/api/")',
  "STATIC_ALLOWLIST.includes(url.pathname)",
  'request.mode === "navigate"',
  'caches.match("/offline")',
]) {
  if (!serviceWorker.includes(safetyMarker)) throw new Error(`Service worker safety contract missing: ${safetyMarker}`);
}
if (/cache\.put\s*\(\s*request/i.test(serviceWorker)) throw new Error("Service worker must not blanket-cache arbitrary request responses");

const envExample = await readFile(join(root, ".env.example"), "utf8");
if (envExample.includes("NEXT_PUBLIC_DIREKT_API_BASE_URL")) throw new Error("Canonical API base URL must remain server-only");
for (const marker of [
  "DIREKT_WEB_AUTH_MODE=disabled",
  "DIREKT_WEB_ALLOW_SYNTHETIC_AUTH=false",
  "DIREKT_WEB_PILOT_NOTICE_VERSION=",
]) {
  if (!envExample.includes(marker)) throw new Error(`W3 fail-closed env marker missing: ${marker}`);
}

const nextConfig = await readFile(join(root, "next.config.ts"), "utf8");
for (const marker of [
  'output: "standalone"',
  '"default-src \'self\'"',
  '"frame-ancestors \'none\'"',
  '"connect-src \'self\'"',
  '"object-src \'none\'"',
  'key: "Permissions-Policy"',
  'key: "X-Content-Type-Options"',
  'key: "X-Robots-Tag"',
]) {
  if (!nextConfig.includes(marker)) throw new Error(`Security/deployment baseline marker missing: ${marker}`);
}

const dockerfile = await readFile(join(root, "Dockerfile"), "utf8");
for (const marker of [
  "npm ci --ignore-scripts",
  "npm run typecheck",
  "npm run verify:static",
  "/.next/standalone",
  "USER node",
  'CMD ["node", "server.js"]',
]) {
  if (!dockerfile.includes(marker)) throw new Error(`Functional web container marker missing: ${marker}`);
}
if (/DIREKT_API_BASE_URL\s*=/.test(dockerfile)) throw new Error("Private API URL must be runtime-injected, not baked into the web image");

const sourceFiles = await collectSourceFiles(root);
const prohibitedSourcePatterns = [
  /NEXT_PUBLIC_DIREKT_API_BASE_URL/,
  /SUPABASE_SERVICE_ROLE(?:_KEY)?/,
  /service_role\s*[:=]/i,
  /postgres(?:ql)?:\/\/.+@/i,
  /AIza[0-9A-Za-z_-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
for (const file of sourceFiles) {
  const text = await readFile(file, "utf8");
  for (const pattern of prohibitedSourcePatterns) {
    if (pattern.test(text)) throw new Error(`Privileged/credential-like material detected in ${relative(root, file)}: ${pattern}`);
  }
}

const runtimeConfig = await readFile(join(root, "lib/server/runtime-config.ts"), "utf8");
for (const marker of [
  '"disabled" | "public" | "authenticated-bff"',
  '"disabled" | "synthetic" | "firebase-exchange"',
  "DIREKT_API_BASE_URL",
  "DIREKT_WEB_ALLOW_SYNTHETIC_AUTH",
  "must use HTTPS",
  "must not contain embedded credentials",
]) {
  if (!runtimeConfig.includes(marker)) throw new Error(`Fail-closed runtime configuration marker missing: ${marker}`);
}

process.stdout.write(`${JSON.stringify({
  event: "functional_pwa_static_contract_passed",
  responsive: true,
  serviceWorkerBounded: true,
  manifestStandardAndMaskableIcons: true,
  securityHeadersPresent: true,
  standaloneContainer: true,
  privilegedBrowserDependencies: false,
  apiBaseUrlPublic: false,
  w3AccountSurface: true,
})}\n`);

async function collectSourceFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "scripts"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await collectSourceFiles(path)));
    else if (/\.(?:ts|tsx|js|mjs|json|css|svg)$/.test(entry.name)) result.push(path);
  }
  return result;
}
