# DIREKT Master Build Plan

**Status:** Authoritative  
**Product:** DIREKT Zambia  
**Primary client:** Native Android  
**Implementation model:** Single sequential build lane  
**Last baseline date:** 2026-07-14

## 1. Objective

Build a trustworthy, usable and operationally sustainable marketplace that allows people in Zambia to find nearby service providers and inspect evidence-backed trust information before making contact.

The platform must solve five connected problems:

1. customers cannot reliably determine who actually provides a service nearby;
2. public directory information may be stale, incomplete or self-asserted;
3. informal and small providers struggle to establish trustworthy digital visibility;
4. certification and physical-location evidence is difficult to inspect consistently;
5. marketplaces often lose accountability after contact moves off-platform.

DIREKT addresses these through verified profiles, service-area discovery, controlled evidence, tracked enquiries, reviews, complaints, verification operations and expiry management.

## 2. Delivery principles

- Prove the trust and operations model before adding broad marketplace complexity.
- Build one native Android app with role-sensitive customer and provider experiences.
- Build a separate internal web portal only for operational needs.
- Use a modular monolith until scale data proves a service split is necessary.
- Treat verification as a lifecycle, not an onboarding checkbox.
- Keep location categories separate and apply least-public precision.
- Support low-bandwidth and intermittent-connectivity conditions.
- Make every phase deployable, measurable and reversible.
- Keep public Pages content synthetic and non-sensitive.
- Defer iOS, escrow, lending and unrelated expansion until Version 1 evidence supports them.

## 3. Target architecture

| Layer | Baseline |
|---|---|
| Android | Kotlin, Jetpack Compose, Material 3, MVVM/Clean Architecture, Hilt, Coroutines/Flow, Room, WorkManager |
| Backend | TypeScript, NestJS modular monolith, REST/OpenAPI |
| Data | PostgreSQL with PostGIS, forward migrations, private object storage |
| Managed platform | Supabase is the initial candidate for managed PostgreSQL/storage; business rules remain API-owned |
| Admin | Next.js/TypeScript internal operations portal |
| Notifications | Firebase Cloud Messaging; SMS/email adapters added only for approved use cases |
| Maps | Provider adapter; approved SDK selected after Phase 1 field/cost review |
| Documentation | Markdown + MkDocs + GitHub Pages |
| CI | GitHub Actions |
| Observability | Structured logs, audit events, error reporting, service metrics and alerting |

## 4. Phase governance

A phase is complete only when:

- all mandatory deliverables exist;
- exit criteria are met;
- required tests pass;
- risk and decision documents are updated;
- security/privacy review is recorded;
- `PROJECT_STATUS.md` identifies the next authorized phase;
- a stable checkpoint is committed without rewriting history.

### Phase 0 — Repository and planning baseline

**Goal:** Establish the source of truth and agent workflow.

Deliverables:

- complete documentation pack;
- repository and branch policy;
- GitHub Pages documentation workflow;
- documentation quality checks;
- archive and manifest;
- risk, decision and definition-of-done controls;
- `build/android-v1` branch.

Exit criteria:

- all required files pass documentation validation;
- Pages build succeeds locally/CI;
- archive matches the repository baseline;
- no production secrets or real data are present;
- the owner completes the one-time Pages source selection.

### Phase 1A — Zambia discovery and assumptions validation

**Goal:** Validate the real operating environment before code scaffolding.

Required research:

- interviews with customers in at least two user segments;
- interviews with providers across at least four initial categories;
- interviews with verification/field-operation candidates;
- address, pin-sharing and service-area behaviour;
- smartphone and data-cost constraints;
- certification types and issuing bodies per pilot category;
- current provider registration and licence practices;
- preferred payment and communication channels;
- complaint and trust expectations;
- accessibility and language needs.

Outputs:

- research log with no unnecessary personal data;
- updated personas and journeys;
- pilot city/area decision;
- pilot category decision;
- evidence matrix by category;
- map/payment/notification provider decision inputs;
- assumptions accepted, rejected or deferred.

Exit criteria:

- no critical product assumption remains untested;
- the pilot boundary and verification operating model are approved;
- the initial screen flows are validated with representative participants.

### Phase 1B — Interaction design and synthetic prototype

**Goal:** Prove that customers understand DIREKT’s trust model.

Deliverables:

- final information architecture;
- Android low- and high-fidelity flows;
- customer search, provider profile and trust-details prototype;
- provider onboarding and verification-progress prototype;
- admin review flow prototype;
- synthetic public prototype on Pages;
- usability findings and design corrections.

Critical validation questions:

- Can a user distinguish a verified phone number from a verified qualification?
- Can a user understand whether a provider has a storefront or travels to customers?
- Can a user see what expired, what is pending and what DIREKT did not check?
- Can a provider understand why an item was rejected and how to correct it?
- Can an administrator make a decision without exposing evidence publicly?

### Phase 2 — Technical foundation

**Goal:** Establish reproducible builds and security boundaries.

Deliverables:

- Android project with build variants;
- backend and admin workspaces;
- environment/configuration model;
- database migration framework;
- OpenAPI generation;
- baseline authentication;
- CI for Android, backend, admin and docs;
- local development bootstrap;
- synthetic seed data;
- error, audit and observability foundations.

Exit criteria:

- clean checkout can build and test using documented commands;
- authentication and role boundaries have automated tests;
- no credentials are committed;
- staging environment plan is approved before external deployment.

### Phase 3 — Identity, provider and category core

Deliver:

- customer and provider account models;
- phone/email verification abstractions;
- provider organisation/profile;
- provider members and authorized representatives;
- service categories and category-specific requirements;
- public profile drafts;
- role and permission enforcement;
- audit log.

No profile becomes publicly discoverable in this phase without approved evidence.

### Phase 4 — Verification and evidence engine

Deliver:

- check-specific verification cases;
- evidence upload and private access;
- document type and validity modelling;
- reviewer queues and reason codes;
- action-required/rejection/resubmission;
- expiry and revocation;
- field-visit assignment and structured inspection;
- badge/claim derivation;
- immutable decision audit history.

Exit criteria:

- no public claim can be created by payment or direct database manipulation;
- evidence access is tested;
- state transitions reject invalid movement;
- expired evidence degrades public claims automatically.

### Phase 5 — Android customer discovery

Deliver:

- customer onboarding;
- permission education;
- current-area/manual-area selection;
- category, text, distance, availability and verification filters;
- map/list presentation;
- provider profile and trust-details screens;
- saved providers;
- share/deep-link support;
- low-bandwidth image behaviour;
- no-location fallback.

Search must rank relevance and distance without hiding unverified status.

### Phase 6 — Android provider workspace

Deliver:

- provider registration;
- business/professional profile;
- services and service areas;
- operating model: fixed premises, mobile or hybrid;
- document and premises evidence capture;
- verification status/timeline;
- availability;
- enquiry inbox;
- review response;
- subscription status.

Uploads must be resumable or clearly recoverable after interruption.

### Phase 7 — Operations portal and field workflow

Deliver:

- queue triage;
- evidence review;
- secure image/document viewing;
- field-agent assignment;
- mobile-compatible field inspection;
- decision controls and reason codes;
- escalations and four-eyes approval for high-risk overrides;
- complaint and incident management;
- certificate expiry dashboard;
- operational reporting.

### Phase 8 — Enquiries, interactions and reviews

Deliver:

- structured contact/enquiry request;
- provider response state;
- consent-aware call/message handoff;
- interaction history;
- verified-interaction review eligibility;
- review moderation and appeals;
- no-show/cancellation reporting where applicable;
- complaint linkage.

MVP may use direct call or messaging after a tracked enquiry. Full chat is deferred unless research proves essential.

### Phase 9 — Subscription and payment foundation

Deliver:

- product catalogue and entitlements;
- provider subscription lifecycle;
- invoices/receipts;
- mobile-money/payment adapter;
- webhook idempotency;
- failure/grace-period handling;
- reconciliation and audit;
- explicit separation between commercial status and trust status.

No payment provider is integrated before commercial, technical and legal approval.

### Phase 10 — Security, privacy and reliability hardening

Deliver:

- completed threat model;
- authorization review;
- evidence-storage penetration tests;
- rate limits and abuse controls;
- location-privacy review;
- backup/restore exercise;
- incident-response exercise;
- performance and soak tests;
- dependency and secret scanning;
- privacy/legal readiness review.

### Phase 11 — Controlled Zambia pilot

Pilot constraints:

- one city or tightly defined area;
- limited provider categories;
- provider cohort verified before public invitation;
- synthetic and consenting pilot data only;
- staffed support and incident escalation;
- daily operational review during initial rollout;
- measurable entry and stop criteria.

Measure:

- successful searches;
- provider contact rate;
- provider response time;
- verification turnaround;
- evidence rejection/resubmission;
- stale/incorrect location reports;
- complaint rate;
- verified-review completion;
- repeat use;
- provider willingness to pay;
- cost per verified provider.

### Phase 12 — Android production release

Deliver:

- signed Android App Bundle;
- Play Console internal and closed testing;
- store listing and data-safety declarations;
- production backend/admin readiness;
- support and verification staffing;
- monitoring and release dashboard;
- rollback and incident plan;
- staged rollout;
- release tag and release notes.

The build must re-check current Google Play target API and policy requirements at release time.

### Phase 13 — Post-launch stabilization

For the first release window:

- prioritize critical reliability, trust and safety issues;
- review metrics and support themes;
- prevent uncontrolled feature expansion;
- validate subscription economics;
- publish transparent status updates;
- document all production decisions.

### Phase 14 — iOS decision gate

iOS starts only after:

- Android product-market and operational evidence is reviewed;
- API contracts are stable;
- verification operations are repeatable;
- funding and staffing are approved;
- an iOS-native architecture decision is recorded.

## 5. Dependency order

```text
Research
→ Trust policy
→ Interaction design
→ Domain/data contracts
→ Authentication and audit
→ Verification engine
→ Provider onboarding
→ Customer discovery
→ Operations portal
→ Tracked enquiries and reviews
→ Subscriptions/payments
→ Hardening
→ Pilot
→ Production
```

Agents must not implement later layers by bypassing earlier controls.

## 6. Definition of the MVP

The MVP must support a real closed-loop journey:

1. provider creates an account and service profile;
2. provider submits required evidence;
3. authorized staff review and decide each check;
4. approved claims become visible with scope and validity;
5. customer searches a real area/category;
6. customer inspects a provider profile and trust details;
7. customer sends a tracked enquiry or contact request;
8. provider responds;
9. eligible customer submits a review or complaint;
10. operations staff can inspect the audit trail and take action.

A directory containing unreviewed profiles is not the DIREKT MVP.

## 7. Global release gates

No public launch until:

- legal review is signed off;
- privacy notices and policy versioning are live;
- production backups have been restored in a test;
- evidence objects are private and access-tested;
- verification claims are derived, not manually typed;
- critical and high defects are closed or formally accepted;
- Android accessibility and device matrix pass;
- support and field-verification staffing is operational;
- monitoring and incident escalation is tested;
- current Play policy checks are complete.
