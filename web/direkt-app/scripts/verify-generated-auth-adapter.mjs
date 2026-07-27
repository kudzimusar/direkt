import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { normalizeWireDateTime } from "../lib/server/wire-date-time.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const adapter = readFileSync(new URL("../lib/server/generated-auth-contracts.ts", import.meta.url), "utf8");
const authClient = readFileSync(new URL("../lib/server/direkt-auth-api.ts", import.meta.url), "utf8");

assert.equal(
  normalizeWireDateTime("2026-07-27T12:30:45+02:00"),
  "2026-07-27T10:30:45.000Z",
  "normalizes raw JSON date-time strings",
);
assert.equal(
  normalizeWireDateTime(new Date("2026-07-27T10:30:45.000Z")),
  "2026-07-27T10:30:45.000Z",
  "normalizes generated Date values",
);
assert.throws(
  () => normalizeWireDateTime("not-a-date"),
  /invalid date-time/,
  "rejects invalid date-time values",
);
assert.match(adapter, /import type \{ AuthenticatedSessionResponseDto \}/);
assert.match(adapter, /import type \{ FirebaseSessionExchangeDto \}/);
assert.match(adapter, /normalizeWireDateTime\(value\.accessTokenExpiresAt\)/);
assert.match(adapter, /normalizeWireDateTime\(value\.refreshTokenExpiresAt\)/);
assert.doesNotMatch(adapter, /runtime\.ts|apis\//, "adapter must not import generated transport runtime");
assert.match(authClient, /getCloudRunIdentityToken/);
assert.match(authClient, /cache: "no-store"/);
assert.match(authClient, /redirect: "error"/);
assert.match(authClient, /toDirektAuthenticatedSession\(response\)/);
assert.ok(root.endsWith("web/direkt-app/"));

console.log(JSON.stringify({
  event: "rc9_generated_auth_adapter_passed",
  rawJsonDateTime: true,
  generatedDate: true,
  invalidDateRejected: true,
  serverBffBoundary: true,
  generatedTransportRuntime: false,
}));
