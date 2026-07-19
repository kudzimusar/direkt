# DIREKT Master Build Plan

**Status:** Authoritative — reconciled 2026-07-19  
**Product:** DIREKT Zambia  
**Primary client:** Native Android  
**Companion client:** Responsive installable customer/provider PWA  
**Privileged client:** Internal operations web portal  
**Implementation model:** Controlled sequential implementation lane with automated checkpoint PR lifecycle

## 1. Objective

Build a trustworthy, usable and operationally sustainable marketplace that allows people in Zambia to discover nearby service providers, understand exactly what DIREKT checked, contact providers through accountable interactions and operate verification safely.

DIREKT must solve five connected problems:

1. customers cannot reliably determine who actually provides a service nearby;
2. public-directory information can be stale, incomplete or self-asserted;
3. informal and small providers struggle to establish credible digital visibility;
4. identity, qualification and operating-location evidence is difficult to inspect consistently;
5. accountability is often lost when contact moves off-platform.

The MVP is not a directory of unreviewed listings. It is a closed-loop trust, discovery and interaction system.

## 2. Product surfaces

### 2.1 Native Android — primary Version 1 client

One Kotlin/Jetpack Compose application supports customer and provider modes. Android remains the primary release target and the authoritative device-specific experience for permissions, evidence capture, secure local session storage, push integration and Play distribution.

### 2.2 Customer/provider PWA — companion Version 1 client

The owner authorized a responsive installable PWA on 2026-07-19 because the project is developed remotely and needs an immediately visible desktop/tablet/mobile surface.

The PWA reuses canonical REST/OpenAPI/domain contracts, does not create a second backend, initially deploys publicly in synthetic remote-review mode at `https://direkt.forum/app/`, may become API-backed only after browser authentication/session/security gates are approved, and never weakens private evidence, location, authorization, pilot or production boundaries.

### 2.3 Operations portal

A separate Next.js internal web application supports verification, moderation, field operations, support, finance exceptions, audit and controlled configuration. It is privileged and must not be published as public PWA/Pages content.

## 3. Delivery principles

- Android-first, not Android-exclusive: native Android is primary; the PWA is the browser companion.
- One Android app supports customer/provider modes unless evidence later requires separation.
- Customer/provider PWA shares product semantics and backend contracts, not privileged client state.
- Operations portal remains a separate privileged surface.
- Backend remains a TypeScript/NestJS modular monolith unless evidence justifies decomposition.
- PostgreSQL/PostGIS is the system of record.
- Verification is a lifecycle of separate scoped claims, never one generic badge.
- Payment cannot create/improve verification, publication or ranking.
- Exact private provider locations and evidence are private by default.
- Low bandwidth, intermittent connectivity and recoverability are first-class requirements.
- Public web content before production uses synthetic/non-sensitive data only.
- Public reachability never equals real-pilot/production authorization.
- Primary Zambia validation remains mandatory before production claims.
- Every phase/workstream remains testable, reversible and documented.
- Integration state must distinguish provisioning, source implementation, runtime binding and managed evidence.

## 4. Target architecture

| Layer | Baseline |
|---|---|
| Android | Kotlin, Jetpack Compose, Material 3, MVVM/Clean boundaries, Coroutines/Flow, Room/WorkManager where required |
| Customer/provider PWA | Responsive installable web client; public synthetic static mode first; live mode only through canonical REST/OpenAPI and approved browser-session boundary |
| Backend | TypeScript/NestJS modular monolith, REST/OpenAPI |
| Data | PostgreSQL/PostGIS, forward-only checksummed migrations |
| Managed data/storage | Supabase PostgreSQL/PostGIS + private Storage, backend-only privileged access |
| Operations portal | Next.js/TypeScript internal web application |
| API runtime | Google Cloud Run, IAM-private staging until release gates |
| Containers | Google Artifact Registry |
| Runtime secrets | Google Secret Manager with least-privilege IAM and pinned versions |
| Deployment identity | GitHub Actions OIDC / Google Workload Identity Federation |
| Android distribution | GitHub artifacts + Firebase App Distribution; Play later |
| Authentication | DIREKT sessions/authorization remain authoritative; Firebase phone possession exchange is implemented but real use gated |
| Notifications | Provider-neutral domain/outbox; FCM/email/WhatsApp adapters only when runtime gates are proven |
| Maps | PostGIS + manual/list fallback authoritative; Maps provider optional/gated |
| Public domain | `direkt.forum`; Vercel registrar, Cloudflare authoritative DNS, GitHub Pages static public origin |
| Observability | Cloud Logging/Monitoring active; Sentry/Crashlytics only after source/privacy/runtime evidence |
| CI | GitHub Actions |

## 5. Canonical trust boundaries

```text
Native Android ─┐
                ├─ HTTPS / REST/OpenAPI ─> DIREKT API ─> PostgreSQL/PostGIS
Customer PWA ───┘                            │
                                             ├─ private Storage
Operations portal ─ protected server path ──┤
                                             ├─ notifications/provider adapters
                                             └─ payment/registry adapters when approved
```

Clients never receive privileged database/Supabase/service credentials. Backend authorization remains mandatory even when UI hides an action.

## 6. Governance

A phase/checkpoint is complete only when mandatory deliverables exist, documented acceptance is met, relevant checks pass on exact source, risks/decisions/integration status are updated, privacy/security impact is recorded, `PROJECT_STATUS.md` identifies truth/next work, stable checkpoint is promoted without history rewrite and external evidence is not fabricated.

Routine safe PR/check/merge/eligible-issue closure is an agent responsibility. Legal, credentials, participant, provider, field and production decisions remain genuine external gates.

## 7. Phase plan

### Phase 0 — Repository and planning baseline — complete

Planning pack, branch/lifecycle controls, Pages, CI, Android distribution planning and risk/decision controls established.

### Phase 1A — Zambia secondary research/provisional baseline — complete with accepted limitations

Credible secondary baseline, evidence classifications, provisional geography/categories/trust/location/communications/payment assumptions and retained primary-validation plan. No desk research is treated as real participant evidence.

### Phase 1B — Interaction design and synthetic prototype — complete

Customer/provider/operations flows, trust language, enquiry/contact concept, provider onboarding/evidence correction, responsive synthetic prototype, accessibility/offline/loading/error states and review findings. Historical prototype is a design artifact, not the current implemented product UI.

### Phase 2 — Technical foundation — complete

Native Android scaffold, NestJS backend, operations portal, secret/config model, migration framework, OpenAPI, identity/session/authorization, CI and synthetic/audit/logging foundations.

### Phase 3 — Identity, provider and category core — complete

Separate people/provider organizations, representatives, provider pathways, fixed/mobile/hybrid models, categories/immutable requirement versions, drafts, role enforcement and audit.

### Phase 4 — Verification/private evidence engine — complete

Separate verification cases, private evidence access, document validity/expiry, reviewer queues/reasons, correction/resubmission, renewal/revocation, field assignments, scoped derived public claims and immutable decisions.

### Phase 5 — Customer discovery — complete

Onboarding, manual/current area, filters, list/synthetic-map abstraction, provider profile/trust details, saves/sharing, low-bandwidth/no-location recovery and publication policy requiring current mandatory claims. Manual/list fallback remains first-class.

### Phase 6 — Provider workspace — complete

Provider profile/services/service areas, evidence capture/recoverable uploads, verification timeline, availability and safe workspace projections.

### Phase 7 — Operations/field workflow — complete

Triage, assignment-scoped evidence review, field workflow, reasoned decisions/escalations, four-eyes overrides, incidents/expiry/reporting and responsive privileged portal.

### Phase 8 — Enquiries/interactions/reviews — complete

Bounded enquiries, provider response lifecycle, tracked interactions, time-limited consent-aware contact handoff contract, review eligibility/moderation/appeals/provider response and complaints. Production external delivery remains disabled until provider gates pass.

### Phase 9 — Subscription/payment foundation — complete

Products/prices/entitlements, subscription lifecycle, invoices/receipts, retry-safe payment intents, webhook/reconciliation/ledger foundations and strict commercial/trust separation. No real payment provider/money movement is active.

### Phase 10 — Security/privacy/legal/reliability + managed infrastructure — complete

Threat/authorization/private-storage/rate-limit/location hardening; backup/restore, rollback, incident/kill-switch/performance/supply-chain exercises; Supabase activation; Artifact Registry/Cloud Run/Secret Manager/WIF; IAM-private API/portal; Firebase internal distribution; Logging/Monitoring. This authorizes synthetic managed development/private staging only.

### Phase 11 — Controlled Zambia pilot and primary validation — formally active, real evidence pending

Internal decisions, synthetic functional readiness and managed synthetic activation are complete. Real-entry gates still include applicable DPC/controller/transfer evidence, qualified legal/privacy/consumer review, final participant/provider notices/consent, real Firebase/private-storage/auth/deletion/withdrawal canaries, operational/field ownership and actual consenting pilot cohorts.

Required evidence stages remain 11C provider onboarding/evidence/comprehension; 11D discovery/location/trust; 11E enquiries/contact/reviews/complaints; 11F operations/capacity/field; 11G Zambia device/connectivity/reliability; 11H willingness-to-pay/unit economics; 11I evidence-led corrections; 11J `STOP / REPEAT / NARROW / PROCEED`.

### Cross-cutting owner-visible UI validation track — authorized 2026-07-19

Purpose: eliminate the visibility gap between extensive backend/integration implementation and product-owner ability to see/test the product remotely.

Deliverables:

- canonical `direkt.forum` documentation/public-review entry;
- installable responsive customer/provider PWA at `/app/`;
- Android-aligned palette/navigation/trust semantics;
- desktop/tablet/mobile adaptive layouts;
- synthetic representations of implemented Phase 5–9 workflows;
- service-worker offline shell;
- public static safety validation;
- remote UI testing runbook;
- architecture for future canonical OpenAPI live mode without exposing private backend infrastructure.

Initial public PWA is synthetic only. A live PWA cannot bypass Phase 11/12 gates.

### Phase 12 — Production release programme — preauthorization engineering substantially prepared, formal authorization blocked

#### Phase 12A — Android release contract — complete

Source-controlled release identity, fail-closed signing contract, external keystore boundary, reproducible unsigned AAB proof and release lint/provenance/security gates. No signing key, signed AAB, Play upload or production traffic activation occurred.

#### Phase 12B — Play listing/permissions/Data Safety preparation — complete as repository-controlled preauthorization work

Store listing candidates, permission/Data Safety/content/distribution inventories and permanent non-publishing validation are prepared. No Play Console submission, IARC result, track activation or release authorization is implied.

#### Additional clearable Phase 12 readiness controls — complete as preauthorization engineering

Production-runtime readiness matrices, monitoring/rollback/staged-rollout contracts, staffing requirements (without staffing claims), release package/provenance contracts and fail-closed formal release eligibility latches are prepared.

#### Remaining formal Phase 12 deliverables after 11J `PROCEED`

- real production environment and approved production-backup restore;
- operational support/verification staffing;
- active/tested production monitoring/escalation;
- end-to-end account deletion/public deletion route where required;
- evidence-led removal/isolation of synthetic preview surfaces;
- production signing/upload key/Play App Signing;
- signed reproducible AAB;
- Play internal/closed testing and final forms/assets/policy check;
- production backend/operations authorization;
- production PWA live-mode security/auth deployment if included in launch;
- production communications/maps/payment adapters only where approved/required;
- release tag/notes/checksums and staged rollout.

### Phase 13 — Post-launch stabilization

Prioritize reliability, trust/safety, support, evidence integrity and verified unit economics. Prevent uncontrolled feature expansion.

### Phase 14 — iOS decision gate

iOS begins only after Android/PWA/API/verification-operations/funding evidence supports a deliberate native-iOS architecture decision.

## 8. Dependency order

```text
Secondary research baseline
→ synthetic interaction design
→ technical foundation
→ identity/provider/category
→ verification/evidence
→ customer discovery
→ provider workspace
→ operations
→ enquiries/reviews
→ commercial foundation
→ security/private managed infrastructure
→ owner-visible PWA/remote UI validation (synthetic-safe)
→ controlled Zambia pilot / primary evidence
→ evidence-led corrections
→ 11J decision
→ formal production release
→ stabilization
```

The PWA track is additive and must not be used to skip primary validation.

## 9. MVP closed loop

1. provider creates account/profile;
2. provider submits category-required evidence;
3. authorized staff decide each separate check;
4. approved scoped claims become publishable with validity/limitations;
5. customer searches an area/category;
6. customer inspects provider profile/trust details;
7. customer sends tracked enquiry;
8. provider responds; contact may move to approved call/WhatsApp handoff after consent;
9. eligible customer submits review/complaint;
10. operations staff inspect audit trail and act;
11. commercial/subscription state remains separate from trust.

Android and future live PWA must represent the same backend-owned lifecycle.

## 10. Integration governance

`docs/integrations/CURRENT_INTEGRATION_STATUS.md` is the detailed runtime-status authority.

Provider/account setup is not runtime activation. Each external integration moves independently through planned → externally provisioned → source implemented → runtime-bound → managed canary → legal/privacy/operational approval → controlled pilot → production authorization.

Current examples: Supabase/Cloud Run/Secret Manager/WIF/Firebase App Distribution are active managed foundation; Firebase phone auth is implemented but real-use gated; Resend is externally provisioned with runtime adapter/binding not yet proven; Maps/Sentry are externally provisioned/runtime-unproven; Turnstile is not active; real payments/WhatsApp/push remain disabled/planned.

## 11. Global release gates

No public real-user production launch until Phase 11 primary validation is completed; 11J records `PROCEED`; legal/privacy/DPC requirements pass; notices/consent/versioning are live; production restore is proven; evidence/privacy/claims controls pass; high/critical defects are resolved/accepted; accessibility/device/browser matrices pass; staffing/monitoring/incident/rollback are operational; current Play/browser/provider policies are rechecked; launch integrations have approved adapters/terms/kill switches; and any live public PWA has approved browser auth/session/API security rather than exposing private Cloud Run directly.

## 12. Current next-step rule

Safe engineering may continue while real Phase 11 evidence is blocked only when it does not fabricate evidence/approval, enable production traffic/money/signing, or weaken trust/privacy/security. It may improve release readiness, testability and documentation when clearly labelled preauthorization/synthetic.

The owner-visible PWA and documentation/integration reconciliation satisfy this rule because they make existing work inspectable without enabling real participant processing.
