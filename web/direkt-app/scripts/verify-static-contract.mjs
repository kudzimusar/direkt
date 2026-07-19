import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
  "app/discovery.css",
  "app/providers/[publicProviderId]/page.tsx",
  "components/direkt-app-shell.tsx",
  "components/discovery-experience.tsx",
  "lib/navigation.ts",
  "lib/contracts/discovery.ts",
  "lib/server/runtime-config.ts",
  "lib/server/direkt-api-client.ts",
  "lib/server/cloud-run-identity.ts",
  "next.config.ts",
  "Dockerfile",
  "public/manifest.webmanifest",
  "public/sw.js",
  "public/icon.svg",
  "app/offline/page.tsx",
  "AGENTS.md",
];

for (const path of requiredFiles) {
  await readFile(join(root, path), "utf8");
}

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
for (const [name, version] of Object.entries({
  next: "16.2.10",
  react: "19.2.0",
  "react-dom": "19.2.0",
})) {
  if (packageJson.dependencies?.[name] !== version) {
    throw new Error(`Expected exact ${name} dependency ${version}`);
  }
}

const prohibitedDependencies = [
  "@supabase/supabase-js",
  "firebase-admin",
  "pg",
  "@google-cloud/storage",
];
for (const dependency of prohibitedDependencies) {
  if (packageJson.dependencies?.[dependency] || packageJson.devDependencies?.[dependency]) {
    throw new Error(`Privileged/direct infrastructure dependency is prohibited in browser app: ${dependency}`);
  }
}

const manifest = JSON.parse(
  await readFile(join(root, "public/manifest.webmanifest"), "utf8"),
);
if (manifest.display !== "standalone" || manifest.start_url !== "/" || manifest.scope !== "/") {
  throw new Error("PWA manifest must remain standalone with root start_url and scope");
}
if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
  throw new Error("PWA manifest requires at least one application icon");
}

const css = await readFile(join(root, "app/globals.css"), "utf8");
const shell = await readFile(join(root, "components/direkt-app-shell.tsx"), "utf8");
const responsiveRequirements = [
  ".mobile-bottom-nav",
  ".desktop-side-nav",
  ".tablet-rail",
  "@media (min-width: 768px)",
  "@media (min-width: 1024px)",
];
for (const requirement of responsiveRequirements) {
  if (!css.includes(requirement)) {
    throw new Error(`Missing responsive contract marker: ${requirement}`);
  }
}
for (const marker of ["mobile-bottom-nav", "desktop-side-nav", "tablet-rail"]) {
  if (!shell.includes(marker)) {
    throw new Error(`Responsive shell is missing ${marker}`);
  }
}

const serviceWorker = await readFile(join(root, "public/sw.js"), "utf8");
for (const safetyMarker of [
  'url.pathname.startsWith("/api/")',
  "STATIC_ALLOWLIST.includes(url.pathname)",
  'request.mode === "navigate"',
  'caches.match("/offline")',
]) {
  if (!serviceWorker.includes(safetyMarker)) {
    throw new Error(`Service worker safety contract missing: ${safetyMarker}`);
  }
}
if (/cache\.put\s*\(\s*request/i.test(serviceWorker)) {
  throw new Error("Service worker must not blanket-cache arbitrary request responses");
}

const envExample = await readFile(join(root, ".env.example"), "utf8");
if (envExample.includes("NEXT_PUBLIC_DIREKT_API_BASE_URL")) {
  throw new Error("Canonical API base URL must remain server-only");
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
  if (!nextConfig.includes(marker)) {
    throw new Error(`Security/deployment baseline marker missing: ${marker}`);
  }
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
  if (!dockerfile.includes(marker)) {
    throw new Error(`W2 canary container marker missing: ${marker}`);
  }
}
if (/DIREKT_API_BASE_URL\s*=/.test(dockerfile)) {
  throw new Error("Private API URL must be runtime-injected, not baked into the web image");
}

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
    if (pattern.test(text)) {
      throw new Error(
        `Privileged/credential-like material detected in ${relative(root, file)}: ${pattern}`,
      );
    }
  }
}

const runtimeConfig = await readFile(join(root, "lib/server/runtime-config.ts"), "utf8");
for (const marker of [
  '"disabled" | "public" | "authenticated-bff"',
  "DIREKT_API_BASE_URL",
  "must use HTTPS",
  "must not contain embedded credentials",
]) {
  if (!runtimeConfig.includes(marker)) {
    throw new Error(`Fail-closed runtime configuration marker missing: ${marker}`);
  }
}

process.stdout.write(
  `${JSON.stringify({
    event: "functional_pwa_static_contract_passed",
    responsive: true,
    serviceWorkerBounded: true,
    securityHeadersPresent: true,
    standaloneContainer: true,
    privilegedBrowserDependencies: false,
    apiBaseUrlPublic: false,
  })}\n`,
);

async function collectSourceFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "scripts"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await collectSourceFiles(path)));
    } else if (/\.(?:ts|tsx|js|mjs|json|css|svg)$/.test(entry.name)) {
      result.push(path);
    }
  }
  return result;
}
