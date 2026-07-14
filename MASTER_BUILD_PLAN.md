# DIREKT Master Build Plan

**Status:** Authoritative  
**Product:** DIREKT Zambia  
**Primary client:** Native Android  
**Implementation model:** Single sequential build lane with automated checkpoint PR lifecycle  
**Baseline date:** 2026-07-14

## 1. Objective

Build a trustworthy, usable and operationally sustainable marketplace that allows people in Zambia to discover nearby service providers and inspect evidence-backed trust information before making contact.

DIREKT must solve five connected problems:

1. customers cannot reliably determine who actually provides a service nearby;
2. public-directory information can be stale, incomplete or self-asserted;
3. informal and small providers struggle to establish credible digital visibility;
4. identity, qualification and operating-location evidence is difficult to inspect consistently;
5. accountability is often lost when contact moves off-platform.

The MVP is not a directory of unreviewed listings. It is a closed-loop trust and interaction system.

## 2. Delivery principles

- Native Android Version 1; iOS is deferred.
- One Android app supports customer and provider modes unless evidence later requires separation.
- A separate internal web portal supports verification, moderation and operations.
- Backend begins as a TypeScript/NestJS modular monolith.
- PostgreSQL/PostGIS is the system of record.
- Verification is a lifecycle of separate claims, not one generic badge.
- Payment can never create or improve verification status.
- Exact private provider locations and evidence are private by default.
- Low bandwidth, intermittent connectivity and recoverable uploads are first-class requirements.
- Public Pages content is synthetic and non-sensitive.
- Design and scaffolding may proceed on an explicit provisional baseline.
- Primary Zambia validation is mandatory before controlled pilot and production claims, not before prototype design.
- Every phase must remain testable, reversible and documented.

## 3. Target architecture

| Layer | Baseline |
|---|---|
| Android | Kotlin, Jetpack Compose, Material 3, MVVM/Clean Architecture, Hilt, Coroutines/Flow, Room, WorkManager |
| Backend | TypeScript, NestJS modular monolith, REST/OpenAPI |
| Data | PostgreSQL/PostGIS, forward migrations, private object storage |
| Managed infrastructure | Supabase is the initial candidate; domain rules remain API-owned |
| Operations portal | Next.js/TypeScript internal web application |
| Notifications | Firebase Cloud Messaging; provider adapters for approved SMS/email uses |
| Maps | Provider abstraction; area/landmark/manual pin/Plus Code support |
| Documentation/prototype | Markdown, MkDocs and GitHub Pages |
| CI | GitHub Actions |
| Early Android distribution | GitHub artifacts, then Firebase App Distribution |
| Observability | Structured logs, audit events, metrics, alerts and error reporting |

## 4. Governance

A phase is complete only when:

- mandatory deliverables exist;
- the documented exit decision is met;
- relevant checks pass;
- risks and decisions are updated;
- privacy/security impact is recorded;
- `PROJECT_STATUS.md` identifies the next authorized task;
- the stable checkpoint is promoted without force-pushing.

Routine checkpoint PR creation, verification, merge and eligible issue closure are handled by the active repository agent. External evidence, credentials, legal approval and material owner decisions are never fabricated.

## 5. Phase plan

### Phase 0 — Repository and planning baseline

**Goal:** Establish the source of truth, documentation, Pages and agent workflow.

Deliverables:

- complete planning pack;
- branch and lifecycle policy;
- GitHub Pages workflow;
- documentation validation;
- Android CI and tester-distribution workflows;
- risk, decision and definition-of-done controls;
- `build/android-v1` branch.

**Status:** Complete.

### Phase 1A — Zambia secondary research and provisional baseline

**Goal:** Establish a credible Zambia-specific design baseline without making unavailable primary fieldwork a permanent blocker.

Required evidence:

- current public census and market context;
- official Zambian authority sources for business, construction and technical-training claims;
- public mobile, mobile-money, location and fraud context;
- explicit separation of official evidence, secondary evidence and provisional inference;
- conservative privacy, connectivity and operational assumptions;
- retained plan for later real-user and pilot validation.

Outputs:

- `docs/research/SECONDARY_RESEARCH_BASELINE.md`;
- pilot geography and category defaults;
- provisional trust, location, communication and payment decisions;
- updated risk and decision logs;
- accepted-limitations exit review.

Exit criteria:

- every material baseline claim is sourced or marked provisional;
- no desk research is misrepresented as an interview or field observation;
- real-data and production restrictions remain explicit;
- Phase 1B has enough information to design coherent flows;
- later primary validation gates are recorded.

**Status:** Complete with accepted limitations.

### Phase 1B — Interaction design and synthetic prototype

**Goal:** Convert the product baseline into an interactive, reviewable experience before native implementation.

Deliverables:

- final information architecture;
- Android low- and high-fidelity flows;
- customer onboarding, area selection and discovery;
- list/map/no-location variants;
- provider profile and separate trust-detail states;
- tracked enquiry and call/WhatsApp handoff;
- provider onboarding and verification progress;
- evidence rejection and resubmission;
- internal operations review flow;
- mobile-responsive synthetic prototype on GitHub Pages;
- accessibility, offline, loading, empty and error states;
- structured remote-feedback mechanism;
- design findings and corrections.

Critical questions:

- Can users distinguish phone, identity, business, qualification, location and field-visit checks?
- Can users identify what is pending, expired, absent or not checked?
- Can users understand fixed, mobile and hybrid providers?
- Can providers understand evidence requirements and correction paths?
- Can staff review private evidence without exposing it publicly?

Exit criteria:

- required flows are interactive;
- Pages deployment is working;
- screen inventory and prototype agree;
- trust language exposes limitations;
- structured review findings are recorded;
- the permanent or migration-safe Android namespace decision is recorded;
- Phase 2 is explicitly authorized.

### Phase 2 — Technical foundation

**Goal:** Establish reproducible native, backend and operations builds with clear security boundaries.

Deliverables:

- native Android project with build variants;
- backend and operations workspaces;
- configuration and secret model;
- database migration framework;
- OpenAPI generation;
- baseline authentication and authorization;
- Android/backend/admin/docs CI;
- local bootstrap and synthetic seed data;
- audit, logging and error foundations.

Exit criteria:

- clean checkout builds and tests;
- authentication and role boundaries are automated;
- no credentials are committed;
- Android CI produces a debug APK;
- staging architecture is approved before external deployment.

### Phase 3 — Identity, provider and category core

Deliver:

- customer/provider accounts;
- phone/email verification abstractions;
- provider profile and authorized representatives;
- fixed/mobile/hybrid operating model;
- categories and category requirements;
- profile drafts;
- role enforcement and audit log.

No profile becomes discoverable without approved evidence-derived claims.

### Phase 4 — Verification and evidence engine

Deliver:

- separate verification cases;
- private evidence upload and access;
- document type, validity and expiry modelling;
- reviewer queues and reason codes;
- correction, rejection and resubmission;
- revocation and renewal;
- optional field-visit assignments;
- derived public claims;
- immutable decision history.

Exit criteria:

- payment or direct database edits cannot create a public claim;
- evidence access is authorization-tested;
- invalid state transitions are rejected;
- expired evidence degrades claims automatically.

### Phase 5 — Android customer discovery

Deliver:

- customer onboarding;
- permission education;
- current/manual area selection;
- category, text, distance, availability and claim filters;
- list and map presentation;
- provider profile and trust details;
- saved providers and sharing;
- low-bandwidth images;
- no-location fallback.

### Phase 6 — Android provider workspace

Deliver:

- provider registration and profile;
- services and service areas;
- evidence capture;
- verification timeline;
- availability;
- enquiry inbox;
- review response;
- subscription status;
- recoverable interrupted uploads.

### Phase 7 — Operations portal and field workflow

Deliver:

- triage queues;
- secure evidence review;
- field-agent assignment where approved;
- structured inspections;
- reasoned decisions and escalations;
- four-eyes approval for high-risk overrides;
- complaints, incidents and expiry dashboard;
- operational reporting.

### Phase 8 — Enquiries, interactions and reviews

Deliver:

- structured enquiry;
- response states;
- consent-aware call/WhatsApp handoff;
- interaction history;
- tracked-interaction review eligibility;
- review moderation and appeals;
- complaint linkage.

Full chat remains deferred unless prototype or pilot evidence proves it necessary.

### Phase 9 — Subscription and payment foundation

Deliver:

- provider products and entitlements;
- subscription lifecycle;
- invoices and receipts;
- approved mobile-money adapter;
- idempotent webhooks;
- grace periods, reconciliation and audit;
- explicit separation of commercial and trust status.

No payment provider is integrated before current commercial, technical, settlement and legal approval.

### Phase 10 — Security, privacy, legal and reliability hardening

Deliver:

- completed threat model;
- authorization review;
- private-storage and evidence-access testing;
- rate limits and abuse controls;
- location-privacy review;
- backup/restore exercise;
- incident-response exercise;
- performance/soak tests;
- dependency and secret scanning;
- qualified Zambia legal review;
- authority-access and data-use approval;
- approved map, OTP and payment-provider terms.

### Phase 11 — Controlled Zambia pilot and primary validation

This phase now contains the primary research previously treated as a Phase 1A prerequisite.

Required validation:

- consenting customers and providers in the selected Lusaka boundary;
- real Android device and connectivity matrix;
- private inspection of real evidence examples;
- trust-language comprehension;
- provider onboarding completion and rejection patterns;
- field-verification timing, safety and cost;
- customer enquiry and provider response behaviour;
- willingness to pay and subscription economics;
- complaint, support and incident operations.

Pilot constraints:

- one tightly defined area;
- limited categories;
- verified provider cohort before invitation;
- approved private data systems;
- staffed support and escalation;
- measurable entry, pause and stop criteria.

No production claim may rely on the provisional desk baseline after pilot evidence contradicts it.

### Phase 12 — Android production release

Deliver:

- signed Android App Bundle;
- Play internal and closed testing;
- store listing and data-safety declarations;
- production backend and operations readiness;
- support and verification staffing;
- monitoring, rollback and staged rollout;
- release tag and notes.

Current Play policy and target API requirements must be checked at release time.

### Phase 13 — Post-launch stabilization

Prioritize reliability, trust, safety, support themes and verified unit economics. Prevent uncontrolled feature expansion.

### Phase 14 — iOS decision gate

iOS begins only after Android product, API, verification-operations and funding evidence are reviewed and an iOS-native architecture decision is approved.

## 6. Dependency order

```text
Secondary research baseline
→ Synthetic interaction prototype
→ Technical foundation
→ Identity and category contracts
→ Authentication and audit
→ Verification engine
→ Provider onboarding
→ Customer discovery
→ Operations portal
→ Enquiries and reviews
→ Subscriptions/payments
→ Security/legal hardening
→ Controlled Zambia pilot and primary validation
→ Production
```

Agents must not bypass trust, privacy or later validation gates merely because Phase 1A no longer requires manual interviews.

## 7. MVP definition

The MVP supports this closed loop:

1. provider creates an account and profile;
2. provider submits required evidence;
3. authorized staff decide each separate check;
4. approved claims become visible with scope and validity;
5. customer searches an area/category;
6. customer inspects profile and trust details;
7. customer sends a tracked enquiry;
8. provider responds and contact may move to call/WhatsApp;
9. eligible customer submits a review or complaint;
10. operations staff inspect the audit trail and act.

## 8. Global release gates

No public production launch until:

- primary Zambia pilot validation is completed;
- qualified legal review is signed off;
- privacy notices and policy versioning are live;
- production backups have been restored in a test;
- evidence is private and access-tested;
- claims are derived, not manually typed;
- critical and high defects are resolved or formally accepted;
- accessibility and device matrix pass;
- support and verification staffing is operational;
- monitoring and incident escalation are tested;
- current Play requirements are confirmed.
