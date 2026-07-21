# DIREKT Master Build Plan

**Status:** Authoritative  
**Product:** DIREKT Zambia  
**Primary client:** Native Android  
**Companion client:** Responsive installable customer/provider web/PWA  
**Operations:** Privileged responsive web portal  
**Implementation model:** Single sequential build lane with automated checkpoint PR lifecycle  
**Baseline date:** 2026-07-14  
**Modernization direction added:** 2026-07-21

## 1. Objective

Build a trustworthy, usable, visually world-class and operationally sustainable marketplace that allows people in Zambia to discover nearby service providers, understand evidence-backed trust information before making contact, and retain accountability through enquiries, reviews and complaints.

DIREKT must solve five connected problems:

1. customers cannot reliably determine who actually provides a service nearby;
2. public-directory information can be stale, incomplete or self-asserted;
3. informal and small providers struggle to establish credible digital visibility;
4. identity, qualification and operating-location evidence is difficult to inspect consistently;
5. accountability is often lost when contact moves off-platform.

The MVP is not a directory of unreviewed listings. It is a closed-loop trust and interaction system.

The modernization programme additionally requires DIREKT to become an AI-assisted product across discovery, provider enablement, support, operations and product intelligence while preserving human/deterministic authority for authorization, verification/trust, payments, legal conclusions and final consequential decisions.

Canonical modernization documents:

- `docs/product/WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`;
- `docs/design/VISUAL_COMPLETION_PLAN.md`;
- `docs/architecture/AI_PRODUCT_ARCHITECTURE.md`.

## 2. Delivery principles

- Native Android remains the primary Version 1 customer/provider client and Play target.
- One Android app supports customer and provider modes unless evidence later requires separation.
- A responsive installable customer/provider PWA companion is additive and uses the same canonical backend boundaries.
- A separate internal web portal supports verification, moderation and operations.
- Backend begins as a TypeScript/NestJS modular monolith.
- PostgreSQL/PostGIS is the system of record.
- Verification is a lifecycle of separate claims, not one generic badge.
- Payment can never create or improve verification status.
- Exact private provider locations and evidence are private by default.
- Low bandwidth, intermittent connectivity and recoverable uploads are first-class requirements.
- Public Pages content is synthetic and non-sensitive.
- AI is an assistance layer, not the source of truth or authority.
- Core tasks retain manual/deterministic fallbacks when AI is unavailable.
- Visual implementation follows an approved Design DNA and benchmark direction rather than ad-hoc agent preference.
- Synthetic-only managed development and protected staging deployments may proceed within approved gates.
- Primary Zambia validation is mandatory before controlled pilot and production claims.
- Every phase/workstream must remain testable, reversible and documented.

## 3. Target architecture

| Layer | Baseline |
|---|---|
| Android | Kotlin, Jetpack Compose, Material 3, MVVM/Clean Architecture, Hilt, Coroutines/Flow, Room, WorkManager |
| Customer/provider web | Next.js/React/TypeScript responsive installable PWA through approved BFF/API boundaries |
| Backend | TypeScript, NestJS modular monolith, REST/OpenAPI |
| Data | PostgreSQL/PostGIS, forward migrations, private object storage |
| Managed data/storage | Supabase PostgreSQL/PostGIS/private Storage, with domain rules API-owned |
| Operations portal | Next.js/TypeScript privileged internal web application |
| Notifications | Firebase Cloud Messaging; provider adapters for approved SMS/email uses |
| Maps | Provider abstraction; area/landmark/manual pin/Plus Code support; runtime provider separately activated |
| AI | Backend-owned provider-neutral orchestration, source-controlled use cases/prompts, structured outputs, evaluation, observability and kill switches |
| Documentation/prototype | Markdown, MkDocs and GitHub Pages |
| CI | GitHub Actions |
| Early Android distribution | GitHub artifacts, then Firebase App Distribution |
| Observability | Structured logs, audit events, metrics, alerts and error reporting |

AI architecture rule:

```text
Clients
  → canonical API/BFF/authz
  → deterministic domain/privacy/trust rules
  → bounded AI orchestration
  → approved model/provider adapter
```

No client-to-model privileged authority and no unrestricted model tool access.

## 4. Governance

A phase/workstream is complete only when:

- mandatory deliverables exist;
- the documented exit decision is met;
- relevant checks pass on the exact source;
- risks and decisions are updated;
- privacy/security impact is recorded;
- AI data/authority/evaluation impact is recorded where applicable;
- visual-reference evidence is recorded for VC work where applicable;
- `PROJECT_STATUS.md` identifies the next authorized task;
- the stable checkpoint is promoted without force-pushing.

Routine checkpoint PR creation, verification, merge and eligible issue closure are handled by the active repository agent. External evidence, credentials, legal approval, owner-only design decisions and real participant evidence are never fabricated.

## 5. Foundational phase plan

### Phase 0 — Repository and planning baseline

**Goal:** Establish source of truth, documentation, CI and agent workflow.

Deliverables include planning pack, branch/lifecycle policy, Pages/docs validation, Android CI/distribution workflows, risk/decision/definition-of-done controls and the sequential implementation lane.

**Status:** Complete.

### Phase 1A — Zambia secondary research and provisional baseline

**Goal:** Establish credible Zambia-specific design assumptions without misrepresenting secondary research as field evidence.

Outputs include official/credible research, assumptions, provisional geography/categories/trust/location/communication/payment decisions, risks and retained primary-validation plan.

**Status:** Complete with accepted limitations.

### Phase 1B — Interaction design and synthetic prototype

**Goal:** Convert the baseline into interactive customer/provider/operations flows.

Deliverables include information architecture, Android flows, discovery/map-list/provider trust, tracked enquiry/contact handoff, provider onboarding/verification, operations review, responsive synthetic prototype, accessibility/offline/error states and design findings.

**Status:** Historical phase complete. Its prototype is reference evidence, not the final visual standard.

### Phase 2 — Technical foundation

**Goal:** Establish reproducible native, backend and operations builds with security boundaries.

Deliverables include Android/backend/operations workspaces, configuration/secrets, migrations, OpenAPI, auth/authz, CI, synthetic seeds, audit/logging/error foundations.

**Status:** Complete.

### Phase 3 — Identity, provider and category core

Deliver:

- customer/provider accounts;
- contact-verification abstractions;
- provider profile/authorized representatives;
- fixed/mobile/hybrid models;
- categories and versioned requirements;
- profile drafts;
- role enforcement/audit.

No profile becomes discoverable without approved evidence-derived claims.

**Status:** Complete.

### Phase 4 — Verification and evidence engine

Deliver:

- separate verification cases;
- private evidence upload/access;
- document type/validity/expiry;
- reviewer queues/reason codes;
- correction/rejection/resubmission;
- revocation/renewal;
- optional field assignments;
- derived public claims;
- immutable decision history.

Exit rules include no payment/direct database creation of trust, authorization-tested evidence access, validated state transitions and expiry degradation.

**Status:** Complete.

### Phase 5 — Customer discovery

Deliver:

- onboarding;
- permission education;
- current/manual area;
- category/text/distance/availability/check filters;
- list/map presentation;
- provider profile/trust details;
- saved/share;
- low-bandwidth imagery;
- no-location fallback.

**Status:** Functionally implemented across native/browser scope; final visual completion continues in VC1–VC8.

### Phase 6 — Provider workspace

Deliver:

- provider registration/profile;
- services/service areas;
- evidence capture;
- verification timeline;
- availability;
- enquiry inbox;
- review response;
- subscription state;
- recoverable uploads.

**Status:** Functionally implemented within approved boundaries; final visual completion continues in VC1–VC8.

### Phase 7 — Operations portal and field workflow

Deliver:

- triage queues;
- secure evidence review;
- field assignment/inspection where approved;
- reasoned decisions/escalations;
- four-eyes high-risk overrides;
- complaints/incidents/expiry;
- operational reporting.

**Status:** Functionally implemented within approved boundaries; desktop-grade visual/AI operations completion continues in VC1–VC8.

### Phase 8 — Enquiries, interactions and reviews

Deliver:

- structured enquiry;
- response states;
- consent-aware call/WhatsApp handoff;
- interaction history;
- tracked-interaction review eligibility;
- review moderation/appeals;
- complaint linkage.

Full chat remains deferred unless pilot evidence proves it necessary.

**Status:** Functionally implemented within approved boundaries.

### Phase 9 — Subscription and payment foundation

Deliver:

- provider products/entitlements;
- subscription lifecycle;
- invoices/receipts;
- approved mobile-money adapter when activated;
- idempotent webhooks;
- grace periods/reconciliation/audit;
- strict separation of commercial and trust state.

No provider is activated before commercial, technical, settlement, security and legal approval.

**Status:** Domain/foundation implementation exists; real payment activation remains gated.

### Phase 10 — Security, privacy, legal and reliability hardening

Deliver:

- threat model/authorization/private-storage testing;
- rate/abuse controls;
- location privacy;
- backup/restore and incident-response exercises;
- performance/soak/dependency/secret controls;
- legal/authority/provider approvals where required;
- synthetic-only managed environment evidence;
- rollback/environment isolation/kill switches.

Phase 10 deployment authorization is synthetic-only development/protected staging and does not authorize real participants, evidence, pilot promotion or production.

**Status:** Complete within documented boundaries.

### Phase 11 — Controlled Zambia pilot and primary validation

Required real validation includes:

- consenting customers/providers in selected boundary;
- real devices/connectivity;
- private real-evidence inspection;
- trust-language comprehension;
- provider onboarding/rejection patterns;
- field verification timing/safety/cost;
- enquiry/response behavior;
- willingness-to-pay/economics;
- complaint/support/incident operations.

Pilot uses a tightly defined geography/categories/cohort, approved private systems, staffed support and measurable stop criteria.

**Status:** Internal/synthetic readiness complete; real 11C–11H evidence and 11J decision remain pending.

### Phase 12 — Android production release

Deliver:

- signed AAB;
- Play testing;
- store/data-safety/current-policy controls;
- production backend/operations readiness;
- staffing/monitoring/rollback/staged rollout;
- release record.

**Status:** Repository-clearable/preauthorization engineering complete; formal production release is not authorized until Phase 11 and all global gates support it.

### Phase 13 — Post-launch stabilization

Prioritize reliability, trust/safety, support, unit economics, search quality and AI/marketplace measurement. Prevent uncontrolled feature expansion.

### Phase 14 — iOS decision gate

iOS begins only after Android product/API/verification-operations/funding evidence is reviewed and a native architecture decision is approved.

## 6. Product modernization programme — VC0 and VC1–VC8

The functional backend/integration work does not by itself make the visible product world-class. VC is the controlled product modernization workstream.

### VC0 — Audit, benchmark and control

- reconstruct product/design authority;
- map visible UI gaps;
- benchmark Urban Company, Checkatrade, Taskrabbit and Thumbtack capabilities;
- document DIREKT differentiation;
- define Design DNA candidates;
- define AI-native product/architecture boundaries;
- prepare owner review and regression prerequisites.

No broad UI code.

### VC1 — World-class design system

- typography;
- semantic colour/light/dark;
- spacing/grid/density;
- shape/elevation;
- professional icons;
- Zambia-relevant imagery;
- adaptive/responsive rules;
- motion/accessibility;
- trust/provider/search/map/evidence/operations components;
- AI interaction components.

### VC2 — High-fidelity benchmark and owner approval

Render at least three genuinely different directions against the same flagship customer/provider/operations experiences, including AI-assisted discovery entry. Record explicit approval/revision.

### VC3 — Approved Design DNA/component foundation

Reconcile approved Stitch/other design references into source-controlled tokens/components for Compose, customer/provider web and operations. Generated design output cannot redefine business logic.

### VC4 — Customer world-class experience

Upgrade onboarding, Discover/Home, search, AI-assisted need understanding, categories, filters, results/map/list, provider profile/trust, saved/enquiries/consent/reviews/complaints/help/account across applicable Android/PWA surfaces.

### VC5 — Provider professional workspace

Upgrade onboarding/readiness, profile/services/areas/public premises/portfolio/availability, verification/evidence/corrections/timeline, enquiries/reviews/commercial/account. AI may assist guidance/drafts/evidence quality, never self-approve trust.

### VC6 — Operations mission control

Upgrade desktop/adaptive queue → case → secure evidence → checklist/decision/audit, plus field/trust/commercial/reporting/configuration workflows. AI may summarize/highlight/draft but final authority remains role-scoped human/deterministic policy.

### VC7 — AI intelligence layer

Activate bounded evaluated use cases in order:

1. documentation-grounded support;
2. natural-language discovery/query expansion;
3. public provider comparison summaries;
4. provider onboarding/profile assistance;
5. evidence OCR/quality assistance after restricted-data approval;
6. operations case/checklist assistance;
7. moderation assistance;
8. fraud/anomaly signals;
9. analytics/taxonomy insights.

Every use case requires data classification, evaluation, security tests, observability, cost limits, human boundary and kill switch.

### VC8 — World-class product/AI quality gate

Validate:

- visual fidelity/coherence;
- complete customer/provider/operations journeys;
- accessibility;
- responsive/adaptive behavior;
- low-bandwidth/offline/retry;
- performance;
- trust/privacy accuracy;
- exact-head regressions;
- AI grounding/accuracy/fallback;
- prompt-injection/data-exfiltration resistance;
- tool authorization/no excessive agency;
- bias/fairness slices where applicable;
- cost/latency/rate limits;
- observability/kill-switch exercise.

VC8 completion does not authorize Phase 11 real pilot or Phase 12 production.

## 7. AI product rules

DIREKT is AI-assisted, not AI-authorized.

AI may:

- understand natural-language needs;
- suggest/expand categories/search;
- summarize approved public trust facts;
- draft provider public copy for confirmation;
- explain onboarding requirements;
- assist evidence quality/extraction after approval;
- summarize operations cases;
- assist moderation/risk triage;
- provide documentation-grounded support;
- generate analytics/taxonomy proposals.

AI may not autonomously:

- approve/reject/revoke/suspend verification;
- publish trust claims;
- bypass authorization/provider scope;
- expose restricted evidence/location/contact data;
- decide serious complaints/appeals;
- mutate payment ledger/reconciliation;
- make legal conclusions;
- execute unrestricted tools/admin/database/storage access.

## 8. Dependency order

```text
Secondary research baseline
→ Synthetic interaction prototype
→ Technical foundation
→ Identity/category/auth/audit
→ Verification/evidence engine
→ Provider/customer/operations core
→ Enquiries/reviews/commercial foundation
→ Security/reliability/integration closure
→ Functional Android/PWA parity
→ VC0 benchmark/control
→ VC1 design system
→ VC2 high-fidelity owner approval
→ VC3 component foundation
→ VC4 customer
→ VC5 provider
→ VC6 operations
→ VC7 AI intelligence
→ VC8 world-class quality gate
→ Controlled Zambia real pilot validation
→ Production
```

Agents must not bypass trust, privacy, AI safety or later validation gates because backend/integration infrastructure already exists.

## 9. MVP closed loop

1. provider creates account/profile;
2. provider submits required evidence;
3. authorized staff decide each separate check;
4. approved claims become visible with scope/currentness/limitations;
5. customer searches by area/category or uses approved AI-assisted need understanding;
6. deterministic eligibility creates safe results;
7. customer inspects provider/trust details and may use bounded comparison assistance;
8. customer sends tracked enquiry;
9. provider responds and contact may move to call/WhatsApp with consent;
10. eligible customer reviews or complains;
11. operations staff inspect audit trail and act;
12. AI may assist selected steps but cannot replace canonical authority.

## 10. Global release gates

No public production launch until:

- primary Zambia pilot validation is completed;
- qualified legal review is signed off;
- privacy notices/policy versioning are live;
- production backups restore successfully;
- evidence is private/access-tested;
- claims are derived, not manually typed or AI-invented;
- critical/high defects are resolved or formally accepted;
- accessibility/device matrix passes;
- support/verification staffing is operational;
- monitoring/incident escalation is tested;
- current Play requirements are confirmed;
- production AI use cases, if enabled, have approved data processing, evaluations, security tests, monitoring, kill switches and human-accountability boundaries;
- VC8 quality gates pass for the production-facing scope.

## 11. External benchmark and standards guidance

The modernization plan uses the following as external references, not product authority:

- Urban Company for marketplace/service-professional maturity;
- Checkatrade for recurring trust checks;
- Taskrabbit for transaction simplicity;
- Thumbtack for AI-guided service discovery;
- NIST AI RMF and Generative AI Profile for AI risk governance;
- OWASP GenAI/LLM guidance for prompt injection, data disclosure, excessive agency and related AI security risks;
- Google Responsible AI/recommendation-system guidance for responsible model and ranking design.

DIREKT repository rules, Zambia evidence, pilot findings and approved trust/privacy policy always win over benchmark imitation.