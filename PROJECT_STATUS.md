# DIREKT Project Status

**Updated:** 2026-07-15  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 2A Android and Phase 2B backend/PostGIS are stable. Phase 2C identity, session, authorization and operations-portal implementation is complete and awaiting automatic checkpoint promotion. Phase 3 is not yet active.

## Current phase

| Item | State |
|---|---|
| Repository and planning baseline | Complete |
| GitHub Pages documentation site | Operational |
| Phase 1A secondary-research baseline | Complete with accepted limitations |
| Phase 1B synthetic prototype | Complete; Issue #6 closed |
| Phase 2A native Android foundation | Complete; PR #11 merged and Issue #10 closed |
| Phase 2B backend/data foundation | Complete; PR #13 merged and Issue #12 closed |
| Phase 2C identity/auth/admin foundation | Implementation complete; PR #15 and Issue #14 pending checkpoint promotion |
| Deferred Zambia pilot validation | Open as non-blocking Issue #5 |
| Firebase tester distribution | Installed but intentionally deferred |
| Public pilot | Not authorized |

Open issues are either the active implementation checkpoint or a deliberate future gate; they are not automatically blockers.

## Stable checkpoint record

### Phase 2A — Android foundation

```text
PR #11
merge commit: c97ea31e79f387f9c3ced3b4f6ac07d75296c1eb
Android CI: #28
```

Retained evidence:

| Artifact | SHA-256 |
|---|---|
| Debug APK | `b1f4f2e1466f2c24233d5507dd6beadb6f4d5b012a1cfbbbd84fd53cda0a6c15` |
| Compose test APK | `e31da8950cac0f97287b2a6c99ac9022d35eca7f7db28183b285cf77930fe40b` |
| Unit/lint reports | `3ff6c14e878bdd01799c4955c3b98f0865e7bd86cff1fdcab9459b13c211c794` |

Android identities:

```text
production: com.kudzimusar.direkt
debug:      com.kudzimusar.direkt.debug
```

### Phase 2B — backend and PostGIS foundation

```text
PR #13
merge commit: 3873b378787390ea757e44b6bd5af3a2daac080f
Backend CI: #37
```

Retained backend evidence:

```text
sha256:4c78aa58547502abbac97bb8b6606f6739a160b1548dd44a1cf6b99fc0906d5b
```

Phase 2B established NestJS, PostgreSQL/PostGIS, health/readiness, request IDs, problem details, OpenAPI, transactional checksummed migrations, append-only audit, outbox and hashed idempotency foundations.

## Phase 2C implementation

Issue #14 and PR #15 implement:

- identities, hashed contact lookup, policy versions and consents;
- synthetic passwordless challenge interfaces;
- short-lived access tokens containing identity/session references only;
- hashed rotating refresh sessions, revocation and family reuse detection;
- global and provider-scoped roles and permissions;
- deny-by-default controller authorization;
- provider-scope, expired-role and separation-of-duties controls;
- first-time contact, session, role and privileged-action audit events;
- synthetic operations API contracts;
- Next.js/TypeScript operations portal with locked dependencies;
- accessible sign-in, access-denied, session-expired and mission-control states;
- no-index/security headers and CI enforcement of the API-only portal boundary.

Latest complete code-validation head before documentation closeout:

```text
95ba9e5dfc605e29d178d839cfc29325ec162e2e
```

Backend/database evidence:

```text
DIREKT Backend CI #103
format, lint, typecheck, clean migrations, tests/coverage, build and OpenAPI: passed
artifact sha256:cf9ea545514dea1c5065a55b68c6d7c245db0296b0d2cf381ca94f82c2cea64a
```

Operations portal evidence:

```text
DIREKT Operations Portal CI #29
format, lint, typecheck, tests/coverage, production build and isolation: passed
artifact sha256:c607fa41b1fc0050291a28f831aea49891d0fd8d863e86f0314a522b783f9b19
```

Two automated review findings were corrected and regression-tested:

1. expired bounded role assignments can be granted again without permitting overlapping grants;
2. first-time verified-contact insertion creates an immutable audit event.

## Phase 2C stop gates retained

- No real SMS, email or OTP provider.
- No production signing key or identity-provider credential.
- No real user, phone number, email address or provider data.
- No evidence upload, viewer or verification decision.
- No provider publication or public trust claim.
- No direct portal database or object-storage connection.
- No production admin deployment.
- No map, regulator or payment integration.

## Exact next lifecycle

1. pass documentation and final exact-head checks;
2. resolve all PR #15 review threads;
3. merge PR #15 automatically;
4. synchronize `build/android-v1` without force-pushing;
5. close Issue #14 as completed;
6. create and claim the bounded Phase 3 identity/provider/category vertical slice.

Phase 3 must not be claimed before steps 1–5 are complete.

## Deferred validation — not a current blocker

Issue #5 retains representative Zambia interviews, real-device/connectivity testing, private inspection of real evidence, field-verification economics, qualified legal/privacy review, authority access, approved map/OTP/payment contracts and willingness-to-pay evidence.

## GitHub lifecycle

Routine checkpoint PR creation, CI inspection, repair, merge, branch synchronization and eligible issue closure are handled by the active repository agent. The owner is not required to perform routine GitHub administration.
