# DIREKT Project Status

**Updated:** 2026-07-15  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 2A Android and Phase 2B backend/PostGIS foundations are complete; Phase 2C identity, session-policy, authorization and operations-portal foundation is active.

## Current phase

| Item | State |
|---|---|
| Repository and planning baseline | Complete |
| GitHub Pages documentation site | Operational |
| Phase 1A secondary-research baseline | Complete with accepted limitations |
| Phase 1B synthetic prototype | Complete; Issue #6 closed |
| Phase 2A native Android foundation | Complete; Issue #10 closed |
| Android CI | Green; APK and reports retained from run #28 |
| Phase 2B backend/data foundation | Complete; PR #13 merged and Issue #12 closed |
| Backend CI | Green on immutable-lockfile run #37 |
| Phase 2C identity/auth/admin foundation | Active; Issue #14 |
| Deferred Zambia pilot validation | Open as non-blocking Issue #5 |
| Firebase tester distribution | Installed but intentionally deferred |
| Public pilot | Not authorized |

## Issue lifecycle

Open issues represent either the current workstream or a deliberate future gate; they are not automatically blockers.

- **Issue #5 — Phase 10/11 Zambia validation:** remains open and labelled non-blocking. It protects later legal, field, device and pilot obligations but does not stop Phase 2 implementation.
- **Issue #6 — Phase 1B prototype:** closed as completed.
- **Issue #10 — Phase 2A Android foundation:** closed as completed.
- **Issue #12 — Phase 2B backend/data foundation:** closed as completed.
- **Issue #14 — Phase 2C identity/session/authorization/admin foundation:** the active implementation issue.

The active agent closes completed issues automatically. Long-range gate issues remain open until their own acceptance evidence exists.

## Stable checkpoints

### Phase 2A Android

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

### Phase 2B backend and data

```text
PR #13
merge commit: 3873b378787390ea757e44b6bd5af3a2daac080f
verified PR head: f80af09fdff9f3f3993bd63d67756a59f4593aa3
```

Backend CI run #37 proved:

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

Retained artifact:

| Artifact | Evidence |
|---|---|
| Coverage, validated OpenAPI and exact npm lockfile | SHA-256 `4c78aa58547502abbac97bb8b6606f6739a160b1548dd44a1cf6b99fc0906d5b` |

Phase 2B implemented:

- Node.js 24/npm 11 with committed lockfile;
- NestJS 11.1.x and TypeScript 5.9 strict mode;
- liveness and PostGIS-backed readiness;
- validated configuration and explicit CORS allowlist;
- request IDs and structured completion logs;
- RFC 7807-compatible problem details;
- deterministic OpenAPI;
- PostgreSQL 18/PostGIS 3.6;
- checksummed, advisory-locked forward migrations;
- append-only audit, outbox and hashed idempotency foundations;
- unit, HTTP and real PostGIS integration tests.

No account, provider, evidence, verification, payment or production-integration endpoint exists yet.

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

## Active Phase 2C workstream

Issue #14 controls the bounded implementation of:

1. identity, contact, consent, session, role, permission and scoped-assignment database contracts;
2. hashed challenge/session/refresh secret storage;
3. session expiry, rotation, revocation and reuse detection;
4. passwordless phone/email interfaces with synthetic local adapters only;
5. enumeration-safe challenge responses and abuse-control boundaries;
6. deny-by-default permission and provider/object-scope authorization;
7. customer, provider, field-agent, reviewer, support, supervisor, finance, auditor and admin roles;
8. privileged-action audit requirements;
9. Next.js/TypeScript operations-portal workspace and accessible safe shell;
10. backend/database/admin CI and retained artifacts.

## Phase 2C stop gates

- No real SMS/email/OTP vendor.
- No production JWT/private signing key.
- No real user, provider, phone number or email address.
- No Firebase/Supabase Auth production connection.
- No evidence upload/viewer or verification decision.
- No public provider/trust-claim creation.
- No direct portal database or object-storage connection.
- No production admin deployment.
- No map, regulator or payment integration.

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
