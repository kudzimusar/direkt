# DIREKT Project Status

**Updated:** 2026-07-14  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 2A completed with the first tested Android APK; Phase 2B backend and PostgreSQL/PostGIS foundation is active.

## Current phase

| Item | State |
|---|---|
| Repository and planning baseline | Complete |
| GitHub Pages documentation site | Operational |
| Phase 1A secondary-research baseline | Complete with accepted limitations |
| Phase 1B synthetic prototype | Complete; Issue #6 closed |
| Phase 2A native Android foundation | Complete; Issue #10 closed |
| Android CI | Green; APK and reports retained from run #28 |
| Deferred Zambia pilot validation | Open as non-blocking Issue #5 |
| Phase 2B backend/data foundation | Active; Issue #12 |
| Firebase tester distribution | Installed but intentionally deferred |
| Public pilot | Not authorized |

## Issue lifecycle

Open issues represent either the current workstream or a deliberate future gate; they are not automatically blockers.

- **Issue #5 — Phase 10/11 Zambia validation:** remains open and labelled non-blocking. It protects later legal, field, device and pilot obligations but does not stop Phase 2 implementation.
- **Issue #6 — Phase 1B prototype:** closed as completed.
- **Issue #10 — Phase 2A Android foundation:** closed as completed after PR #11 merged and APK/report artifacts were verified.
- **Issue #12 — Phase 2B backend/data foundation:** the only active implementation issue.

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

The Android manifest requests no Internet, location, camera or notification permission. The build contains synthetic content only and does not implement verification, authentication, payments or production API access.

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

## Phase 2B approved foundation

The backend foundation will use:

| Component | Baseline |
|---|---|
| Runtime | Node.js 24 Active LTS |
| Framework | NestJS 11.1.x modular monolith |
| Language | TypeScript 5.9.x strict mode |
| Database | PostgreSQL 18 with PostGIS 3.6 |
| API root | `/api/v1` |
| Contract | REST/OpenAPI and RFC 7807-style problem details |
| Migrations | forward-only SQL, checksummed and advisory-locked |

Node.js 24 is the current Active LTS line. NestJS 11 remains the approved framework and its current official repository supports Node 20 or newer. The PostGIS project recommends `postgis/postgis:18-3.6` for new users.

## Exact Phase 2B workstream

Issue #12 controls the following bounded implementation:

1. create `backend/direkt-api` as a NestJS modular-monolith workspace;
2. pin runtime and dependency versions;
3. add strict configuration validation;
4. implement liveness and PostGIS-backed readiness endpoints;
5. add request IDs and structured JSON logging;
6. add global validation and RFC 7807 problem details;
7. generate and validate OpenAPI;
8. add local PostgreSQL 18/PostGIS 3.6 Docker Compose infrastructure;
9. implement checksummed, forward-only, advisory-locked migrations;
10. create only platform audit, outbox and idempotency foundations;
11. add synthetic seeds, unit tests and database integration tests;
12. add CI for format, lint, typecheck, tests, build, migrations and OpenAPI;
13. retain test/coverage/OpenAPI artifacts;
14. merge and close Issue #12 only after exact CI evidence exists.

## Phase 2B stop gates

- No production Supabase or database connection.
- No real authentication or token issuance.
- No real identity, qualification, location or payment evidence.
- No regulator, map, SMS, Firebase or payment integration.
- No public provider creation.
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
