import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const repositoryRoot = join(root, "../..");

const files = {
  backendController: "backend/direkt-api/src/auth/auth.controller.ts",
  backendDto: "backend/direkt-api/src/auth/auth.dto.ts",
  backendTypes: "backend/direkt-api/src/auth/auth.types.ts",
  runtime: "web/direkt-app/lib/server/runtime-config.ts",
  cookies: "web/direkt-app/lib/server/browser-session.ts",
  security: "web/direkt-app/lib/server/request-security.ts",
  api: "web/direkt-app/lib/server/direkt-auth-api.ts",
  verifyRoute: "web/direkt-app/app/api/auth/verify/route.ts",
  firebaseRoute: "web/direkt-app/app/api/auth/firebase-exchange/route.ts",
  refreshRoute: "web/direkt-app/app/api/auth/refresh/route.ts",
  summaryRoute: "web/direkt-app/app/api/account/summary/route.ts",
  accountUi: "web/direkt-app/components/account-experience.tsx",
};

const source = {};
for (const [name, path] of Object.entries(files)) {
  source[name] = await readFile(join(repositoryRoot, path), "utf8");
}

requireMarkers(source.backendController, [
  "@Post('challenges')",
  "@Post('challenges/verify')",
  "@Post('firebase/exchange')",
  "@Post('sessions/rotate')",
  "@Get('sessions')",
  "@Post('sessions/revoke-others')",
  "@Post('sessions/:sessionId/revoke')",
]);
requireMarkers(source.backendDto, [
  "class FirebaseSessionExchangeDto",
  "noticeVersion",
  "consentAccepted",
  "class RotateSessionDto",
  "refreshToken",
]);
requireMarkers(source.backendTypes, [
  "interface AuthenticatedSession",
  "accessToken",
  "refreshToken",
  "interface SessionView",
  "reuseDetected",
]);

requireMarkers(source.runtime, [
  '"disabled" | "synthetic" | "firebase-exchange"',
  "DIREKT_WEB_ALLOW_SYNTHETIC_AUTH",
  "DIREKT_WEB_PILOT_NOTICE_VERSION",
  "Participant authentication requires DIREKT_WEB_API_MODE=authenticated-bff",
]);
requireMarkers(source.cookies, [
  "httpOnly: true",
  'sameSite: "strict"',
  "timingSafeEqual",
  "Arbitrary concurrent BFF reads must never race the one-time",
]);
requireMarkers(source.security, [
  "assertSameOrigin",
  'request.headers.get("origin")',
  'request.headers.get("x-direkt-csrf")',
  "verifyCsrfToken",
]);
requireMarkers(source.api, [
  '"/api/v1/auth/firebase/exchange"',
  '"/api/v1/auth/sessions/rotate"',
  '"/api/v1/auth/sessions"',
  '"/api/v1/account/profile"',
  '"/api/v1/provider-workspace/me"',
  'headers.authorization = `Bearer ${options.accessToken}`',
  '"X-Serverless-Authorization"',
]);
requireMarkers(source.firebaseRoute, [
  'config.authMode !== "firebase-exchange"',
  "noticeVersion: config.pilotNoticeVersion",
  "consentAccepted: true",
  "establishBrowserSession(session)",
]);
requireMarkers(source.refreshRoute, [
  "assertSecureMutation(request)",
  "accessTokenNeedsRefresh(current)",
  "rotateSession(current.refreshToken)",
  "rotateBrowserSession(rotated)",
  "error.status === 401",
  "clearBrowserSession()",
]);
requireMarkers(source.summaryRoute, [
  "withAuthenticatedSession",
  "api.listSessions",
  "api.getAccountProfile",
  "api.hasProviderWorkspace",
]);
requireMarkers(source.accountUi, [
  "onProviderAvailabilityChange",
  "Backend-authorized",
  "HttpOnly",
  "x-direkt-csrf",
]);

for (const [name, text] of Object.entries({
  accountUi: source.accountUi,
  verifyRoute: source.verifyRoute,
  firebaseRoute: source.firebaseRoute,
  refreshRoute: source.refreshRoute,
})) {
  if (/localStorage|sessionStorage|indexedDB/i.test(text)) {
    throw new Error(`${name} must not persist DIREKT session material in browser-readable storage`);
  }
}

for (const text of [source.verifyRoute, source.firebaseRoute, source.refreshRoute]) {
  const returnedBody = text.slice(text.indexOf("return noStoreJson"));
  if (/accessToken\s*:|refreshToken\s*:/.test(returnedBody)) {
    throw new Error("Auth exchange routes must not return DIREKT access/refresh tokens to browser JSON");
  }
}

if (!source.api.includes("encodeURIComponent(sessionId)")) {
  throw new Error("Session revoke path must encode the session identifier");
}

process.stdout.write(
  `${JSON.stringify({
    event: "w3_auth_contract_passed",
    httpOnlySession: true,
    csrfOriginProtected: true,
    privateApiBoundary: true,
    providerScopeServerDerived: true,
    firebaseExchangeGated: true,
    refreshRotationMutationOnly: true,
  })}\n`,
);

function requireMarkers(text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) throw new Error(`W3 contract marker missing: ${marker}`);
  }
}
