# RC9 OpenAPI-Generated Kotlin and TypeScript Clients

**Governing issue:** #261
**Claim base:** `main@030cd577e179863b70f24d99ab237e74660b4325`
**Branch:** `feat/rc9a-deterministic-generated-clients`
**State:** RC9A IMPLEMENTED / EXACT-HEAD REGRESSION PENDING / RUNTIME UNWIRED

## Purpose

RC9 makes the canonical NestJS OpenAPI contract consumable by Android and TypeScript without weakening DIREKT-owned transport, authorization, privacy, retry, idempotency, offline or BFF policies.

Generated code is a contract implementation aid. It does not become a new authority boundary and does not authorize production, participant data, privileged direct access, payment-provider activation or real money.

## Current-source audit

### Canonical backend contract

- `backend/direkt-api/scripts/generate-openapi.ts` creates `backend/direkt-api/artifacts/openapi.json` from the configured NestJS application.
- `backend/direkt-api/scripts/check-openapi.ts` validates OpenAPI 3, required operations, bearer security, public/private route separation, deferred domains and prohibited sensitive/payment-provider fields.
- Backend CI generates and uploads the checked OpenAPI artifact. RC9A now derives committed Kotlin and TypeScript source trees from that exact document and fails on byte-for-byte regeneration drift.

### Android

- Android remains a native Jetpack Compose application under `android/direkt-app`.
- The current Firebase-to-DIREKT exchange uses `HttpsURLConnection` and manual `JSONObject` request/response handling in `PilotAuthenticationCoordinator`.
- Session material remains encrypted through the existing Android Keystore-backed store; Firebase phone auth proves possession only; DIREKT backend authorization remains authoritative.
- No Retrofit/OkHttp/Kotlin serialization client stack is currently declared in the app dependency graph.

### TypeScript web/PWA

- `web/direkt-app` has manually maintained contract types and server-only API wrappers.
- Authenticated traffic flows through Next.js route handlers/server code using a Cloud Run infrastructure identity token plus the DIREKT session token.
- The private API origin and infrastructure token must remain server-only. RC9 must not generate or adopt browser-direct authenticated transport.

## Generator decision

RC9 pins OpenAPI Generator `7.22.0`.

Generation rules:

- no online generator service;
- exact version and configuration committed;
- `hideGenerationTimestamp=true`;
- canonical checked OpenAPI input only;
- deterministic output paths and package names;
- byte-for-byte regeneration drift gate;
- no generated secrets, environment URLs or privileged credentials;
- generated output reviewed like source code and kept mechanically reproducible.

### Kotlin target

- generator: `kotlin`;
- library: `jvm-retrofit2`;
- serialization: `kotlinx_serialization`;
- package root: `com.kudzimusar.direkt.generated.api`;
- first migration slice: Firebase-to-DIREKT session exchange only;
- current UI, consent, timeout, fail-closed configuration, secure session storage and generic user-facing errors remain unchanged.

DIREKT-owned wrapper/interceptor code remains responsible for API base URL validation, request identifiers, idempotency, authorization headers, timeout policy and error normalization.

### TypeScript target

TypeScript generation initially supplies canonical models and operation typing for server-only BFF wrappers. The existing BFF transport remains DIREKT-owned because it performs Cloud Run IAM authentication, session propagation, origin confinement, timeout, redirect rejection and safe problem-detail handling.

A generated browser transport is not approved. TypeScript adoption must remain server-only for authenticated routes and must not expose `DIREKT_API_BASE_URL`, infrastructure tokens or refresh/session material to browser bundles.

## Incremental sequence

### RC9A — deterministic foundation

1. generate and validate canonical OpenAPI;
2. pin OpenAPI Generator 7.22.0 and configuration;
3. generate Kotlin and TypeScript outputs into controlled directories;
4. add byte-for-byte drift verification;
5. compile/typecheck generated outputs without wiring runtime behavior;
6. preserve RC0–RC8 and all current application regressions.

### RC9A deterministic foundation receipt

RC9A is source/build foundation only and remains runtime-unwired.

- OpenAPI Generator CLI: `7.22.0`;
- official Maven JAR SHA-256: `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`;
- canonical OpenAPI SHA-256: `1ea6b983c49c95db88db1a1432d9e6e0078fe124a3196f00c485b86dbe2db519`;
- canonical surface: OpenAPI 3.0.0, 135 paths, 148 operations and 74 schemas;
- Firebase exchange operation: `AuthController_exchangeFirebaseSession`, tag `authentication`;
- Kotlin source: `109` files, tree SHA-256 `ab6cd201e8a74df0c31319e882e3b419617a1539518f7151fa71ffe695c440c1`;
- TypeScript source: `96` files, tree SHA-256 `19aa7625ac7e338d01e9947dfaad8d5660cbe17ab9bdc912fb36e04fb659276f`;
- committed output: generated source only; generator-owned wrappers, publishing tasks, docs and tests are excluded;
- Kotlin compile harness: Kotlin 2.2.20, serialization 1.9.0, OkHttp logging 5.1.0 and Retrofit 3.0.0;
- TypeScript compile harness: strict/no-emit through the web workspace's pinned TypeScript compiler;
- drift gate: regenerate the checked canonical spec and compare source plus immutable receipt byte-for-byte;
- Android runtime import: false;
- browser/BFF runtime import: false;
- participant data, privileged client credentials and production authorization: false.

RC9A does not replace the current Android `HttpsURLConnection` session path or the server-side BFF transport. Those migrations remain separate reviewed RC9B/RC9C slices.

### RC9B — Kotlin auth/session slice

1. generate the auth exchange request/response contract;
2. introduce the reviewed Retrofit/OkHttp/Kotlin serialization dependency set;
3. wrap generated APIs behind a DIREKT-owned auth transport boundary;
4. replace only manual exchange serialization/parsing;
5. preserve Firebase sign-out, secure storage, push registration and existing UI result semantics;
6. prove unit, lint, build and instrumentation behavior.

### RC9C — TypeScript contract adoption

1. consume generated types in the server-only public/auth BFF wrappers where they remove duplicated manual contracts;
2. retain the current DIREKT-owned fetch wrappers and Cloud Run IAM/session behavior;
3. prevent generated runtime modules from entering client components;
4. typecheck/build and run public/auth/customer/provider/commercial BFF regressions.

### RC9D — cross-client closure

- canonical spec hash and generator receipt;
- zero generated drift;
- backend OpenAPI/authorization checks;
- Android unit/lint/build/instrumentation;
- web type/security/BFF/build checks;
- operations and integration regressions;
- documentation/status/ledger reconciliation;
- lane release or explicit transition to RC10.

## Stop conditions

Stop rather than merge if RC9 would:

- expose the private API origin or infrastructure identity token to browser code;
- put database, Supabase service-role, payment, OTP, WhatsApp, Maps backend or other provider secrets in generated output or clients;
- replace backend authorization/provider scope with client-selected values;
- treat generated DTO validation as payment, verification, trust, publication or dispute authority;
- break Android API 23 support, signing, Firebase, Maps, FCM, Crashlytics or secure session storage;
- weaken offline/failure semantics or claim a mutation succeeded without backend confirmation;
- accept generated drift or unpinned generator/tool dependencies;
- perform a broad client rewrite before the first incremental slice is proven.

## Production authorization

False. RC9 is source/build tooling and bounded client migration only. It does not clear Phase 11 real evidence, 11J, legal/privacy gates, production credentials, participant traffic, real communications, real money or formal Phase 12 release.
