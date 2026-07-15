# DIREKT Project Status

**Updated:** 2026-07-15  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 2 technical foundation is complete. Phase 3 identity, provider and category core is in exact-head CI verification under Issue #16 and PR #17.

## Current phase

| Item | State |
|---|---|
| Repository and planning baseline | Complete |
| GitHub Pages documentation site | Operational |
| Phase 1A secondary-research baseline | Complete with accepted limitations |
| Phase 1B synthetic prototype | Complete; Issue #6 closed |
| Phase 2A native Android foundation | Complete; PR #11 merged and Issue #10 closed |
| Phase 2B backend/PostGIS foundation | Complete; PR #13 merged and Issue #12 closed |
| Phase 2C identity/auth/admin foundation | Complete; PR #15 merged and Issue #14 closed |
| Phase 3 identity/provider/category core | Exact-head CI verification; Issue #16 and PR #17 |
| Deferred Zambia pilot validation | Open as non-blocking Issue #5 |
| Firebase tester distribution | Installed but intentionally deferred |
| Public pilot | Not authorized |

Open issues represent either the active workstream or a deliberate future gate. Issue #5 is not a current implementation blocker.

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
artifact sha256: 4c78aa58547502abbac97bb8b6606f6739a160b1548dd44a1cf6b99fc0906d5b
```

Phase 2B established NestJS, PostgreSQL/PostGIS, health/readiness, request IDs, problem details, OpenAPI, transactional checksummed migrations, append-only audit, outbox and hashed idempotency foundations.

### Phase 2C — identity, sessions, authorization and operations portal

```text
PR #15
verified head: 2e31df2233a63c39e4ef5df43a40a9683eef106e
merge commit: bd8e937bf234cd894e04cc05935c7994e62c42be
Issue #14: closed as completed
```

Exact-head evidence:

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/database | #112 | Passed | `eb2ef088dcc5655dcc6ef864c29b7bfca78c48ecf971b5b1e1e4357ece842114` |
| Operations portal | #38 | Passed | `3111922097ec7fda582c7f649687bd738a8f0eec5df37262ab584c6d888ff1b7` |
| Documentation quality | #272 | Passed | `f9989fda65d229dbf1d4907d63d0c871d515ac7b0daeb53ef6dff4732a19343b` |

Phase 2C delivered:

- identity, contact-hash, policy-version and consent contracts;
- synthetic passwordless challenge interfaces;
- short-lived access tokens containing identity/session references only;
- hashed rotating refresh sessions, revocation and family reuse detection;
- global and provider-scoped roles and permissions;
- deny-by-default controller authorization;
- provider-scope and separation-of-duties controls;
- append-only contact/session/role/privileged-action audit events;
- Next.js operations portal with locked dependencies;
- accessible sign-in, access-denied, session-expired and mission-control states;
- no-index/security headers and API-only isolation enforcement.

Two automated review findings were corrected and regression-tested before merge:

1. expired bounded role assignments can be granted again without permitting overlapping grants;
2. first-time verified-contact insertion creates an immutable audit event.

## Active Phase 3 workstream

Issue #16 and `WORKSTREAM_LOCK.md` authorize the first bounded business-domain vertical slice.

Required scope:

1. customer/provider account application services using the Phase 2C identity foundation;
2. non-public provider profiles and authorized representatives;
3. registered-business, qualified-individual and experienced-informal-provider pathways;
4. fixed-premises, mobile and hybrid operating models;
5. versioned service categories and category requirements;
6. profile drafts and validated state transitions;
7. server-enforced provider/object scope;
8. immutable audit coverage;
9. synthetic Android and operations-portal states;
10. backend, Android, portal and documentation CI evidence.

### Phase 3 trust boundary

No provider may become publicly discoverable through self-assertion, profile completion, commercial status, an administrator action or a client request. Public discoverability remains blocked until Phase 4 creates approved evidence-derived claims and an explicit publication policy.

### Phase 3 exclusions

- no real identity, customer or provider data;
- no evidence upload, viewer or verification decision;
- no public trust claims or provider discoverability;
- no production OTP/Auth credentials;
- no payment, map, regulator or field-agent integration;
- no production deployment.

## Deferred validation — not a current blocker

Issue #5 retains representative Zambia interviews, real-device/connectivity testing, private inspection of real evidence, field-verification economics, qualified legal/privacy review, authority access, approved map/OTP/payment contracts and willingness-to-pay evidence.

## GitHub lifecycle

Routine checkpoint PR creation, CI inspection, repair, merge, branch synchronization and eligible issue closure are handled by the active repository agent. The owner is not required to perform routine GitHub administration.