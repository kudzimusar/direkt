# DIREKT Project Status

**Updated:** 2026-07-15  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 2A native Android foundation is complete; Phase 2B backend/PostGIS foundation is green and ready for automatic checkpoint merge.

## Current phase

| Item | State |
|---|---|
| Repository and planning baseline | Complete |
| GitHub Pages documentation site | Operational |
| Phase 1A secondary-research baseline | Complete with accepted limitations |
| Phase 1B synthetic prototype | Complete; Issue #6 closed |
| Phase 2A native Android foundation | Complete; Issue #10 closed |
| Android CI | Green; APK and reports retained from run #28 |
| Phase 2B backend/data foundation | Merge-ready; PR #13 and Issue #12 |
| Backend CI | Green on immutable-lockfile run #32 |
| Deferred Zambia pilot validation | Open as non-blocking Issue #5 |
| Firebase tester distribution | Installed but intentionally deferred |
| Public pilot | Not authorized |

## Issue lifecycle

Open issues represent either the current workstream or a deliberate future gate; they are not automatically blockers.

- **Issue #5 — Phase 10/11 Zambia validation:** remains open and labelled non-blocking. It protects later legal, field, device and pilot obligations but does not stop Phase 2 implementation.
- **Issue #6 — Phase 1B prototype:** closed as completed.
- **Issue #10 — Phase 2A Android foundation:** closed as completed after PR #11 merged and APK/report artifacts were verified.
- **Issue #12 — Phase 2B backend/data foundation:** closes automatically after PR #13 is merged and the branch is synchronized.

The active agent closes completed issues automatically. Long-range gate issues remain open until their own acceptance evidence exists.

## Phase 2A completion evidence

Merged checkpoint:

```text
PR #11
merge commit: c97ea31e79f387f9c3ced3b4f6ac07d75296c1eb
```

Android CI run #28 proved:

```text
./gradlew --no-daemon --stacktrace \
  testDebugUnitTest \
  lintDebug \
  assembleDebug \
  assembleDebugAndroidTest
```

Retained artifacts:

| Artifact | Evidence |
|---|---|
| Debug APK | SHA-256 `b1f4f2e1466f2c24233d5507dd6beadb6f4d5b012a1cfbbbd84fd53cda0a6c15` |
| Compose test APK | SHA-256 `e31da8950cac0f97287b2a6c99ac9022d35eca7f7db28183b285cf77930fe40b` |
| Unit/lint reports | SHA-256 `3ff6c14e878bdd01799c4955c3b98f0865e7bd86cff1fdcab9459b13c211c794` |

Android identity:

```text
production: com.kudzimusar.direkt
debug:      com.kudzimusar.direkt.debug
```

## Phase 2B implementation

Implemented under `backend/direkt-api` and `database/`:

- Node.js 24/npm 11 foundation with committed npm lockfile;
- NestJS 11.1.x modular-monolith shell;
- TypeScript 5.9 strict mode;
- `/api/v1/health/live` and PostGIS-backed `/api/v1/health/ready`;
- validated environment configuration and explicit CORS allowlist;
- UUID request IDs and structured request-completion logs;
- global validation and RFC 7807-compatible problem details;
- deterministic OpenAPI generation and validation;
- PostgreSQL 18/PostGIS 3.6 local and CI service;
- checksummed, forward-only, advisory-locked migrations;
- `postgis` and `pgcrypto` extensions;
- append-only platform audit events;
- transactional outbox foundation;
- hashed idempotency-key foundation;
- synthetic seed command;
- unit, HTTP and real PostGIS integration tests.

No account, provider, evidence, verification, payment or production-integration endpoint exists.

## Phase 2B completion evidence

Final verified source head before phase-close documentation:

```text
c91efa6a8879b383fa9437f17f000ecfcce54876
```

Backend CI run #32 completed successfully using the committed dependency lock:

```text
npm ci --ignore-scripts
npm run format:check
npm run lint
npm run typecheck
npm run migration:check
npm run test
npm run build
npm run openapi:check
```

The run proved:

- clean locked dependency installation;
- formatting and strict type-aware lint;
- TypeScript compilation;
- clean PostGIS migration application and idempotent second run;
- PostGIS 3.6 availability;
- SRID 4326/longitude-latitude coordinate correctness;
- append-only audit enforcement;
- unit, HTTP and database tests with coverage;
- production JavaScript build;
- valid OpenAPI containing only approved health operations.

Retained artifact:

| Artifact | Evidence |
|---|---|
| Coverage, OpenAPI and lockfile | SHA-256 `d624ad7e7537d4d9d9cb06315a7df6f8aeb65b95fb81b87a7b4a190bda8d318b` |

A final exact-head run is required after this phase-close documentation and before merge.

## Approved product baseline

| Area | Decision |
|---|---|
| Default market context | Lusaka District |
| Later pilot boundary | Selected Lusaka neighbourhoods, confirmed before pilot |
| Initial categories | Plumbing, electrical repair, motor-vehicle mechanics, appliance/electronics repair |
| Provider models | Fixed premises, mobile and hybrid |
| Provider pathways | Registered business, qualified individual and experienced informal provider |
| Trust presentation | Separate evidence-backed claims; no blanket safety/verification badge |
| Location | Area, neighbourhood, landmark, pin and optional Plus Code; private precision minimized |
| Customer contact | Tracked enquiry, then consent-aware call or WhatsApp handoff |
| Customer payment/escrow | Deferred from first MVP |
| Provider subscriptions | Later payment-adapter phase |
| Android | Native Kotlin/Compose with low-bandwidth, offline-draft and retry requirements |

## Exact next workstream after Phase 2B

**Phase 2C — identity, authentication-policy and operations-admin foundation**

The bounded next phase must:

1. create identity/account/session/role database contracts without selecting a real OTP vendor;
2. establish customer, provider representative, reviewer, field agent and administrator role boundaries;
3. implement passwordless/phone-email verification interfaces with synthetic development adapters only;
4. add short-lived access-token and revocable session/refresh-token policy;
5. add object/provider-scope authorization tests and privileged-action audits;
6. create the Next.js operations-portal workspace and unauthenticated shell;
7. preserve a strict prohibition on real evidence upload and verification decisions;
8. extend OpenAPI and CI without connecting production credentials or vendors.

## Stop gates

- No production Supabase or database connection.
- No real OTP/SMS/email vendor.
- No real identity, qualification, location or payment evidence.
- No regulator, map, Firebase or payment integration.
- No public provider creation or publication.
- No trust claim creation.
- No production deployment.

## Deferred validation — not current blockers

Issue #5 retains:

- representative Zambia interviews;
- real Android device/connectivity matrix;
- real provider evidence in approved private storage;
- field-verification cost and capacity;
- qualified Zambia legal and privacy review;
- authority data-access agreements;
- map, SMS/OTP and payment contracts;
- subscription pricing and willingness-to-pay evidence.

## GitHub lifecycle

Routine checkpoint PR creation, CI inspection, repairs, safe merging, branch synchronization and eligible issue closure are handled by the active repository agent. The owner is not required to perform routine GitHub administration.
