# RC9 OpenAPI-Generated Kotlin and TypeScript Clients

**Governing issue:** #261  
**Claim base:** `main@030cd577e179863b70f24d99ab237e74660b4325`  
**RC9A merge:** `main@e43efc5050a792a902a1ca94113854541380b56e`  
**Runtime-adoption PR:** #497  
**State:** RC9B/RC9C IMPLEMENTED / EXACT-HEAD REGRESSION PENDING / BOUNDED RUNTIME ADOPTION

## Purpose

RC9 makes the canonical NestJS OpenAPI contract consumable by Android and TypeScript without weakening DIREKT-owned transport, authorization, privacy, retry, idempotency, offline or BFF policies.

Generated code is a contract implementation aid. It does not become a new authority boundary and does not authorize production, participant data, privileged direct access, payment-provider activation or real money.

## Canonical generated foundation

OpenAPI Generator `7.22.0` is locally and CI pinned to the official JAR SHA-256:

`3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`

Generation rules:

- no online generator service;
- exact version and configuration committed;
- `hideGenerationTimestamp=true`;
- canonical checked OpenAPI input only;
- deterministic output paths and package names;
- byte-for-byte drift verification;
- no generated secrets, environment URLs or privileged credentials;
- generated output reviewed like source code and kept mechanically reproducible.

The current generated receipt records:

- canonical OpenAPI SHA-256: `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`;
- Kotlin: `111` source files, tree SHA-256 `ba3e4b7ab4f2eeaf3fafd96bdf2bbbddfd2feb8ebbbe71f4f309c825eb7991cc`;
- TypeScript: `98` source files, tree SHA-256 `04cecfb32400eac04d5818ee1bb22e8394d822e2d350c8cfcc4f3a64eee982fe`;
- participant data: false;
- privileged client credentials: false;
- production authorization: false.

The immutable RC9A receipt deliberately retains `runtimeWired=false` for both output trees because it describes deterministic generation, not later application imports. The permanent RC9 verifiers separately enforce the two bounded runtime adoption points described below.

## RC9B — Android Kotlin auth/session slice

### Generator and dependency decision

- generator: `kotlin`;
- library: `jvm-retrofit2`;
- serialization: `kotlinx_serialization`;
- package root: `com.kudzimusar.direkt.generated.api`;
- migration slice: Firebase-to-DIREKT session exchange only.

Android now compiles the generated Kotlin tree and replaces only the former manual `HttpsURLConnection`/`JSONObject` exchange implementation with `GeneratedPilotSessionExchangeClient`, a DIREKT-owned wrapper around the generated `AuthenticationApi`.

The wrapper preserves:

- HTTPS-only origin validation;
- 10-second connect, read and write timeouts;
- redirects and SSL redirects disabled;
- automatic retries disabled;
- consent and notice-version propagation;
- generic user-facing rejection/failure semantics;
- Firebase sign-out after exchange;
- the existing Android Keystore-backed encrypted session store;
- existing push-token registration after successful DIREKT session creation;
- Android API 23 support through core-library desugaring.

Generated transport defaults do not decide authorization, trust, payment, retry, idempotency or offline success. DIREKT-owned code remains authoritative for those policies.

### Android Play/Data Safety reconciliation

The reviewed RC9 release runtime additions are inventoried in the permanent Phase 12B gate:

- Retrofit;
- Kotlin serialization converter;
- scalar converter;
- Kotlin serialization JSON;
- the generated client compile-time OkHttp logging dependency.

The generated default BODY logger is not activated: the Android wrapper supplies its own safe `OkHttpClient.Builder` and does not call the generated logger hook. The Phase 12B validator positively checks that HTTP body logging is inactive, HTTPS-only confinement remains present, redirects/retries remain disabled, and the transport targets only the private DIREKT API rather than a third-party, browser-direct, database or provider endpoint.

### Focused Android regression

`GeneratedPilotSessionExchangeClientTest` covers:

- rejection of non-HTTPS, user-info and query-bearing origins;
- normalization of an approved HTTPS origin;
- request mapping for the Firebase ID token, approved notice version, affirmative consent and bounded device label;
- preservation of the reviewed generic rejection message.

## RC9C — TypeScript server-only BFF contract adoption

Generated TypeScript request/response types are consumed only through `web/direkt-app/lib/server/generated-auth-contracts.ts`.

The existing DIREKT-owned BFF fetch wrapper remains responsible for:

- private Cloud Run origin confinement;
- Cloud Run infrastructure identity authentication;
- DIREKT session-token propagation;
- idempotency headers;
- timeout handling;
- `cache: "no-store"`;
- redirect rejection;
- safe problem-detail/error normalization.

A generated browser transport is not approved. Generated transport runtime modules do not enter client components, and the private API origin, infrastructure token, refresh token and privileged credentials remain server-only.

The BFF adapter now normalizes both generated `Date` values and raw JSON `date-time` strings before returning the existing DIREKT session contract. Focused verification rejects invalid date-time values and asserts that the adapter imports generated types only, not generated browser transport code.

## Permanent bounded-import contract

Generated imports remain prohibited throughout Android and web runtime source except for exactly these reviewed points:

1. Android `GeneratedPilotSessionExchangeClient.kt`;
2. server-only BFF `generated-auth-contracts.ts`.

The permanent verifier ignores compiler/build artifacts such as `.tsbuildinfo`, `.next`, `build`, `dist`, coverage and dependency directories, but scans authored source fail-closed.

## RC9D closure sequence

RC9 closes only after:

1. canonical OpenAPI and generator drift checks pass;
2. generated Kotlin produces real `.class` output and generated TypeScript passes strict typechecking;
3. Android unit, lint, desugaring and APK/release-readiness gates pass;
4. web type, auth, generated-adapter, PWA and cross-client gates pass;
5. backend, operations, runtime-audit, supply-chain, Phase 10–12 and RC5–RC9 regressions pass on the exact PR head;
6. PR #497 merges;
7. the merged exact-main source is verified;
8. status, ledger, lock and Issue #261 evidence are reconciled and the lane is released or explicitly transitioned to RC10.

## Stop conditions

Stop rather than merge if RC9 would:

- expose the private API origin or infrastructure identity token to browser code;
- put database, Supabase service-role, payment, OTP, WhatsApp, Maps backend or other provider secrets in generated output or clients;
- replace backend authorization/provider scope with client-selected values;
- treat generated DTO validation as payment, verification, trust, publication or dispute authority;
- break Android API 23 support, signing, Firebase, Maps, FCM, Crashlytics or secure session storage;
- weaken offline/failure semantics or claim a mutation succeeded without backend confirmation;
- accept generated drift or unpinned generator/tool dependencies;
- perform a broad client rewrite beyond the approved first slice.

## Production authorization

False. RC9 is deterministic contract tooling and bounded client migration only. It does not clear Phase 11 real evidence, 11J, legal/privacy gates, production credentials, participant traffic, real communications, real money or formal Phase 12 release.
