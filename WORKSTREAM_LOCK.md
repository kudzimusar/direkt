# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 6 provider-workspace agent |
| Phase | Phase 6 — Android provider workspace |
| Task | Implement provider-scoped workspace contracts, profile/services/service areas, evidence capture, verification timeline, availability, recoverable uploads and bounded future-feature surfaces |
| Modules/paths | `database`, `backend/direkt-api`, `android/direkt-app`, `admin/direkt-operations-portal`, `docs/backend`, `docs/api`, `docs/android`, `docs/architecture`, `docs/security`, `docs/testing`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-15 after Phase 5 checkpoint merge and branch synchronization |
| Expected handoff | Reviewed synthetic provider workspace with server-resolved scope, private case/check evidence capture, safe verification timeline, independent availability, idempotent upload recovery, bounded Phase 8/9 placeholders and green permanent CI |
| Last clean checkpoint | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` |
| Governing issue | Issue #25 |

## Stable predecessor

Phase 5 completed through PR #24 and Issue #23.

```text
Phase 5 reviewed source head: 4107aff54b098d299fd41dd60f63256150aab573
Phase 5 verified final head:  28f03c196f0c6dc47c77c61cbe70d6448d179755
Phase 5 merge commit:         11541db4d5ea856404f8fee03c0ca55cf6bab36c
Issue #23:                    closed as completed
```

Final exact-head workflows passed: Backend/PostGIS #360, Android #223, Operations Portal #224 and Documentation #674. `main` and `build/android-v1` were synchronized before this Phase 6 claim.

## Phase 6 objective

Create a bounded, synthetic Android provider workspace that lets an authenticated provider representative manage only their own organization, services, lawful location models, evidence submissions, verification progress, availability and interrupted uploads without weakening identity, authorization, evidence, claim, publication or location-privacy boundaries.

## Delivery stages

### Stage 6A — workspace contracts and authorization

- resolve provider organization from the authenticated actor/session;
- expose provider workspace summary and readiness contracts;
- enforce provider representative scope on every path;
- provide empty, partial, blocked and ready synthetic states;
- define OpenAPI and database/application authorization regressions.

### Stage 6B — registration, profile, services and service areas

- complete provider registration/profile editing on existing Phase 3 models;
- manage category selections through immutable requirement versions;
- edit operating model, locality summary and lawful service areas;
- preserve distinct private base, consented public premises and service-area models;
- prove profile completion and service selection cannot publish or create claims.

### Stage 6C — evidence capture and recoverable uploads

- submit provider-owned evidence metadata only against a specific case/check;
- keep storage references and original evidence private;
- model queued, uploading, interrupted, retryable, submitted and terminal states;
- persist idempotency and resumable intent locally;
- support retry/cancel without duplicate evidence versions.

### Stage 6D — verification timeline and availability

- derive a provider-safe timeline from evidence versions and immutable decisions;
- exclude reviewer notes, internal risk data and other providers' records;
- show correction, renewal, validity and safe reason-code messages;
- update availability independently of trust, claims, ranking and publication.

### Stage 6E — bounded later-phase surfaces

- enquiry inbox: synthetic/empty workspace boundary only; Phase 8 owns real enquiries and responses;
- review response: synthetic/empty boundary only; Phase 8 owns review eligibility, moderation and appeals;
- subscription status: read-only synthetic boundary only; Phase 9 owns products, entitlements and payments;
- tests must prove Phase 6 exposes no Phase 8/9 business mutation.

### Stage 6F — Android and operations surfaces

- provider dashboard and prioritized work queue;
- profile/services/service-area editing;
- evidence capture and upload recovery;
- verification timeline and availability;
- TalkBack, focus, data-saver and preview-free operation;
- operations readiness/upload visibility without unauthorized evidence disclosure.

### Stage 6G — checkpoint promotion

- update architecture, authorization, evidence, privacy, API, Android, testing, decisions and risks;
- obtain green backend/PostGIS, Android, portal and documentation workflows on one reviewed exact head;
- repair valid review findings with regressions;
- merge automatically, close Issue #25 and synchronize the build branch.

## Acceptance criteria

The active owner must:

1. preserve all Phase 3–5 identity, authorization, evidence, claim, publication and location boundaries;
2. resolve provider scope server-side and reject cross-provider access;
3. keep human identities, provider organizations, categories, cases, checks and evidence versions distinct;
4. support provider profile, service/category and lawful service-area editing;
5. keep private base, public premises and service area as separate typed models;
6. prevent profile completion, service selection, availability, uploads, subscription placeholders or admin edits from creating claims or publication;
7. create evidence only for an authorized provider case/check and retain immutable versions;
8. prevent Android/public DTOs, logs and fixtures from exposing original evidence, storage keys or reviewer notes;
9. make upload retry/cancel persistent and idempotent without duplicate evidence versions;
10. present a provider-safe verification timeline with scoped claims, limitations, validity and correction/renewal states;
11. allow availability updates independently of trust and discovery eligibility;
12. provide bounded enquiry/review/subscription placeholders with no Phase 8/9 business mutations;
13. implement accessible low-bandwidth Android provider states;
14. provide operations visibility without bypassing evidence authorization;
15. add database, HTTP, service, Android and portal regression evidence;
16. update OpenAPI, architecture, privacy, testing, decisions, risks and project status;
17. obtain green permanent workflows on one reviewed exact head;
18. repair valid review findings, merge, close Issue #25 and synchronize the branch.

## Non-negotiable stop gates

- No real provider, customer, evidence, enquiry, review, subscription or payment records.
- No production storage/upload endpoint, maps/geocoding service, messaging/payment integration, credential, deployment or public pilot.
- Provider ownership and permissions are never accepted from client input.
- A representative cannot read or mutate another provider's profile, locations, evidence, timeline, availability or uploads.
- Evidence remains private, case/check-specific, versioned and authorization-tested.
- Original evidence, storage keys, identity numbers, signatures, private addresses, precise private bases and reviewer notes remain outside public/provider-safe output.
- Public premises require explicit consent; private base coordinates never enter public DTOs, analytics or Android presentation.
- Interrupted upload recovery cannot create duplicate evidence versions.
- Availability and commercial placeholders cannot influence claims, publication or trust ranking.
- Phase 8 retains real enquiry/review/contact workflows.
- Phase 9 retains products, entitlements, invoices, payments and webhooks.

## Required regression evidence

At minimum, prove:

- authenticated actor scope resolves the correct provider and denies cross-provider access;
- profile/category/location changes do not create claims or publication;
- private base, public premises and service-area data remain separated;
- evidence submissions require the provider's own open case/check;
- evidence retry with the same idempotency key does not duplicate a version;
- provider timeline excludes reviewer notes and internal-only fields;
- availability updates do not change claim or publication state;
- deferred enquiry/review/subscription endpoints are read-only bounded placeholders;
- Android upload recovery survives process recreation in synthetic tests;
- empty, partial, correction-required, expired, offline and access-denied states are usable;
- fixtures contain no real people, providers, evidence, credentials or production endpoints.

## Conflict rule

A second agent must not modify the listed Phase 6 paths while this lock is claimed. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
