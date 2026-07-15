# DIREKT Project Status

**Updated:** 2026-07-15  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 5 Android customer discovery is complete and stable. Phase 6 provider onboarding/workspace is not claimed.

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
| Phase 3 identity/provider/category core | Complete; PR #17 merged and Issue #16 closed |
| API/integration planning checkpoint | Complete; PR #19 merged |
| Phase 4 verification and private evidence engine | Complete; PR #21 merged and Issue #20 closed |
| Phase 5 Android customer discovery | Complete; PR #24 merged and Issue #23 closed |
| Phase 6 provider onboarding/workspace | Not claimed |
| Deferred Zambia pilot validation | Open as non-blocking Issue #5 |
| Firebase tester distribution | Installed but intentionally deferred |
| Public pilot | Not authorized |

No implementation issue is currently active. Issue #5 remains a deliberate later validation obligation and is not a current implementation blocker.

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

Phase 2C delivered identity/contact/consent contracts, synthetic passwordless authentication, rotating refresh sessions, server-resolved roles and permissions, provider scope, append-only privileged audit, and the isolated Next.js operations portal.

### Phase 3 — identity, provider and category core

```text
PR #17
verified head: dab29ac118c3b695ab84f4fcd2ac96091e16052c
merge commit: 149f3b3aa24163ebb6a0b023283cf4a39badb5d6
Issue #16: closed as completed
```

Exact-head evidence:

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/PostGIS | #235 | Passed | `cc730fb7a2c0fd590baeb810b8adc9de7c2413a3cf5dbdef0e6fb9a6aab2e554` |
| Android reports | #122 | Passed | `129ed6bfc0eba8f277580abbb8f499c4ff36445d2b1dd480ee8d297dd6ea71d6` |
| Operations portal | #132 | Passed | `45ea34f050952da493bd2df09d6acafc98e045819cd83b55e7b55d1c452fd6e7` |
| Documentation quality | #450 | Passed | `360dd3e56d2e97d988f056db0f039b0dbc6c7a6e3bf217be07f03fc5945a27ee` |

Retained Android artifacts:

| Artifact | SHA-256 |
|---|---|
| Debug APK | `f999086fb6fbc19b0af5c03d53907f49dc82e9db4606eff8c00a26ba2cff78f1` |
| Compose test APK | `fb0c4d7742e248ea1f748b82c4b89228007466a0e222ca3f144a8864ed9859d5` |

Phase 3 delivered separate human identities/provider organizations, provider pathways and operating models, non-public drafts, provider-scoped representatives, immutable category requirement versions, actor-attributed audit and a structurally empty public-directory boundary.

### API/integration planning checkpoint

```text
PR #19
merge commit: 7736c0909130a3bfbbe993f26ecf28056a699315
```

The repository contains authoritative infrastructure/secrets and backend/frontend API plans. No production integration was activated.

### Phase 4 — verification and private evidence engine

```text
PR #21
verified head: 10c21f076ba27a7e0e38ac1819a4489e063eb6ec
merge commit: d9078a78d3677a94a720de2d16483487594b261e
Issue #20: closed as completed
```

Exact-head evidence:

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/PostGIS | #296 | Passed | `af68f4556085b0ec92f8b774697a1c76980f647aa731ce29ad788ba0ced2f7b5` |
| Android reports | #173 | Passed | `9802c03b45a7599840f4b14a469dd12f4751cd50f95c802a712908b34f22ab79` |
| Operations portal | #175 | Passed | `6724c536c93bb8eea793f28977e556594843e809ac595fe5e9ab33c32a6fb6a3` |
| Documentation quality | #556 | Passed | `1e0937dc76f18f77fcb9ccd1c1ff3fafc4283da468ce86c0b1e3c320aaa93db6` |

Retained Android artifacts:

| Artifact | SHA-256 |
|---|---|
| Debug APK | `4940d82fecb05ab1f407cdb86e0776fdfb026b56c4200f04a360b279103f32ba` |
| Compose test APK | `680b5f05fd9c01bb293a963492ec8c6dd835599b3c72aae4b45eae5bdb0ed561` |

Phase 4 delivered provider/category/check-specific cases, private evidence metadata and immutable versions, assignment-bound review, immutable decisions, scoped claim cards, automatic expiry degradation, synthetic Android/admin states and regression-tested trust controls.

### Phase 5 — Android customer discovery

```text
PR #24
reviewed implementation head: 4107aff54b098d299fd41dd60f63256150aab573
final validation head: 28f03c196f0c6dc47c77c61cbe70d6448d179755
merge commit: 11541db4d5ea856404f8fee03c0ca55cf6bab36c
Issue #23: closed as completed
```

Final exact-head evidence:

| Gate | Run | Result | Artifact SHA-256 |
|---|---:|---|---|
| Backend/PostGIS | #360 | Passed | `5346cbc1d9f791da03e0145daa315b1f4bede574b071bc567593f51edd828b79` |
| Android reports | #223 | Passed | `f2f7e80e65db779a19dce8bf9f9bf1db66158a08dbebe2a920b4b8d0f1da31f8` |
| Operations portal | #224 | Passed | `229d586e38f0f1e0a4189193987d00a10e484920cf397acda9bc8d82555a7807` |
| Documentation quality | #674 | Passed | `421ef455e38c0daabdbe72fa1c833b9fe66930be37da4c4c9013f01249b09ec8` |

Retained Android artifacts:

| Artifact | SHA-256 |
|---|---|
| Debug APK | `03c05a83b402da9e9edb020a7fe10da7792304d9f152b72ac05715b527517658` |
| Compose test APK | `673675dad7b431d5953340c636d804dd231b200a48282d890be1f45a9697c6ec` |

Phase 5 delivered policy-controlled provider/category publication, distinct private/public/service-area location models, live provider/category/claim eligibility, public-safe PostGIS search and profiles, deterministic filters and opaque pagination, saves and sharing, Android list/map/profile and low-bandwidth states, operations eligibility visibility, and regression-tested exclusion of removed categories, suspended providers and stale claims.

## Phase 5 delivered scope

Phase 5 implements:

- customer onboarding and location-permission education;
- manual area selection plus an explicit one-time current-location path;
- public-safe provider publication and location/service-area projections;
- category, text, distance, operating-model, availability and claim filters;
- deterministic PostGIS eligibility, ranking explanations and cursor pagination;
- Android list/map, provider profile, trust details, saves and sharing;
- low-bandwidth/image-free, empty, sparse and no-location states;
- operations visibility into publication eligibility without private evidence or coordinates;
- OpenAPI, privacy, testing, architecture, decision and risk updates.

## Phase 5 stop gates retained

No real provider/customer data, production map/location service, precise private coordinate, production credential, public indexing, public traffic, enquiry/contact handoff, review system, production deployment or public pilot is authorized.

Discovery may use only current safe claim cards, approved public-safe provider identity/media, consented public premises data and non-private service areas. Mobile-provider distance may never be inferred from a private base. Manual area selection must always work, and no-results recovery must never fabricate providers.

## Deferred validation — not a current blocker

Issue #5 retains representative Zambia interviews, real-device/connectivity testing, private inspection of real evidence, field-verification economics, qualified legal/privacy review, authority access, approved map/OTP/payment contracts and willingness-to-pay evidence.

## Next planned checkpoint

Phase 6 provider onboarding/workspace is the next planned phase. It remains unclaimed until a new governing issue and workstream lock are created. Production integrations remain gated by the integration and secrets plan.
