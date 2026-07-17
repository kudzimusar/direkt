# Phase 10 Handoff from Phase 9

**Next planned phase:** Phase 10 — Security, privacy, legal and reliability hardening  
**Predecessor:** Phase 9 — Subscription and payment foundation  
**Authorization state:** Active under Issue #41 and checkpoint PR #42 after the Phase 9 checkpoint was promoted and the workstream lock was explicitly claimed.

## Stable capabilities inherited from Phase 9

Phase 10 may rely on the following contracts after Phase 9 promotion:

- commercial products, prices and entitlements are separate from trust and interaction domains;
- provider-commercial scope is resolved from active server-side assignments;
- subscription lifecycle is explicit, revisioned and event-audited;
- invoices and lines are immutable minor-unit snapshots;
- synthetic payment intents are retry-safe and store only hashed idempotency keys;
- webhook processing verifies a bounded signature/timestamp contract and stores no raw body;
- ledger history is append-only and balanced;
- reconciliation routes mismatches to a separate operations queue;
- adjustments require separated request and two-approver control;
- Android restores commercial retry state without storing payment credentials;
- the operations finance workspace uses separate commercial permissions and the backend API only;
- payment, subscription and entitlement state cannot create verification, publication, ranking or accountability outcomes;
- production payment mode remains disabled.

Phase 10 must preserve these invariants rather than weakening them while adding production controls.

## Phase 10 authorized scope

The master plan authorizes Phase 10 to deliver:

- completed threat model;
- authorization review;
- private-storage and evidence-access testing;
- rate limits and abuse controls;
- location-privacy review;
- backup/restore exercise;
- incident-response exercise;
- performance and soak tests;
- dependency and secret scanning;
- qualified Zambia legal review;
- authority-access and data-use approval;
- approved map, OTP and payment-provider terms;
- synthetic-only managed development and protected staging infrastructure needed to execute the hardening, restore, security and performance evidence.

Phase 10 is a hardening, approval and controlled infrastructure-activation phase. It may create restricted development/staging deployments, but it must not be used to bypass Phase 11 controlled Zambia pilot validation or Phase 12 production-release gates.

## Required workstreams

### 10A — Threat model and security architecture

Deliver:

- system and data-flow threat model covering Android, API, PostgreSQL/PostGIS, Supabase Storage, operations portal and external adapters;
- asset classification and trust boundaries;
- abuse cases for account takeover, provider-scope confusion, evidence leakage, webhook replay, ledger manipulation, moderation abuse and location disclosure;
- prioritized mitigations with owners and verification evidence;
- review of security headers, TLS assumptions, CORS, token lifetime, session rotation and administrative access.

### 10B — Authorization and tenant isolation review

Deliver:

- complete permission-to-route/function matrix;
- global versus provider-scope review;
- zero, revoked, expired and ambiguous assignment tests;
- direct database function authorization tests;
- privilege-escalation and confused-deputy review;
- operations role separation review for trust, support, finance, audit and administration;
- step-up authentication design for high-risk actions.

No client navigation, Android mode or request-body identifier may become an authorization boundary.

### 10C — Privacy, retention and legal controls

Deliver:

- data inventory and processing-purpose review;
- retention, deletion, correction and export rules;
- contact, precise location, evidence, interaction, review, complaint, incident and commercial privacy review;
- consent and policy-version mapping;
- lawful-use and data-sharing review for authorities, verification sources and external providers;
- approved privacy notice, terms requirements and internal access policy drafts;
- qualified Zambia legal findings and unresolved legal stop gates.

No repository document may represent qualified legal approval before signed evidence exists.

### 10D — Private storage and evidence access

Deliver:

- verified Supabase project identity and protected activation evidence;
- private bucket and object-policy tests;
- signed upload/read expiry and revocation tests;
- MIME, size, checksum and malware-scanning design;
- object-key and provider-error redaction tests;
- storage retention/deletion procedure;
- access audit and incident procedure;
- backup and restore scope for evidence metadata and objects;
- protected Supabase-to-Cloud-Run integration evidence using synthetic records only;
- protected Vercel Preview/Staging integration evidence without browser database/storage credentials.

Real evidence remains prohibited until these controls and legal approvals pass. Synthetic-only remote integration is authorized by `INFRASTRUCTURE_ACTIVATION_CONTRACT.md`.

### 10E — Abuse, rate limiting and operational safeguards

Deliver:

- distributed rate limits for authentication, search, enquiry, review, complaint and webhook endpoints;
- enumeration, credential stuffing, spam, replay and cost-abuse controls;
- moderation, complaint, appeal, incident and reconciliation queue ageing/SLA controls;
- fraud and anomaly alert requirements;
- opt-out and consent-at-send rules for future communications;
- pause and kill-switch procedures for external adapters.

### 10F — Reliability, recovery and performance

Deliver:

- database and object-storage backup policy;
- successful restore exercise with evidence and recovery-time/recovery-point results;
- incident-response tabletop and technical exercise;
- queue/outbox recovery tests;
- migration rollback/forward-recovery procedure;
- Android/API/portal performance budgets and representative soak tests;
- alerting and service-level objectives;
- dependency failure and external-provider outage scenarios;
- immutable Cloud Run revision deployment, readiness, rollback and scale-to-zero evidence;
- protected Vercel Preview/Staging health and API-connectivity evidence.

### 10G — Supply-chain, secret and configuration hardening

Deliver:

- dependency vulnerability scanning;
- secret scanning across repository history and build artifacts;
- signed/reproducible build review where applicable;
- GitHub Environment and branch-protection review;
- secret ownership, rotation and revocation runbook;
- production configuration schema and fail-closed tests;
- no credentials in Android, browser bundles, documentation or public artifacts.

### 10H — Provider and authority approval package

Before any real provider activation, record current evidence for:

- map/location provider terms, quotas, pricing and privacy;
- OTP/communications provider terms, sender identity, abuse controls and consent obligations;
- payment-provider availability, account/KYC requirements, fees, limits, settlement, webhook signing, refunds and reversals;
- registry/authority access rights and data-use limitations;
- qualified Zambia consumer, privacy, payments, tax, invoicing and anti-money-laundering advice;
- operational staffing and escalation ownership.

Provider names or credentials must not be assumed before approval.

## Managed development and staging deployment boundary

Phase 10 explicitly authorizes remotely reachable managed development and protected staging infrastructure when all data is synthetic, access is restricted or deliberately bounded, search indexing and public promotion are disabled, exact-source deployment is recorded and rollback/kill-switch controls exist.

The deployment classes, bound project identifiers, Cloud Run access modes, Vercel protection requirements and retained Phase 11/12 gates are authoritative in `INFRASTRUCTURE_ACTIVATION_CONTRACT.md`. An internet-addressable development URL is not a controlled Zambia pilot or production launch by itself. Real participant processing, unrestricted invitations, real evidence and production claims remain prohibited.

## Supabase activation boundary

The dedicated DIREKT development project reference is `aeeuscifrxcjmnswqwnq` in Tokyo region infrastructure. Phase 9 includes the protected activation workflow and backend-only integration contract.

Activation is allowed only when:

1. the connector or GitHub Environment can verify access to that exact project;
2. `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DATABASE_URL` are stored only as protected environment secrets;
3. the database URL uses the rotated password and approved pooler/direct connection for its purpose;
4. project identity is checked before migrations;
5. all migrations are applied and rechecked;
6. PostGIS and all required private buckets are verified;
7. security and performance advisor output is captured without secrets;
8. no client receives a Supabase server key or database URL.

If project access is unavailable, Phase 10 must record the block and continue local clean-database validation without mutating another project.

## Payment-provider boundary

Phase 10 may research, negotiate and design a real adapter, but production activation remains prohibited until legal, settlement, security, reconciliation and operational approval is documented.

A future real adapter must preserve:

- the existing `PaymentProviderPort` boundary;
- signature verification before state mutation;
- stable external event and idempotency identity;
- no raw credential persistence;
- balanced ledger posting;
- reconciliation and exception routing;
- refund/reversal controls;
- fail-closed production configuration;
- no effect on verification, publication or ranking.

## Required permanent testing

Phase 10 must add permanent regressions for:

- route/function permission coverage;
- cross-provider, revoked and ambiguous assignment denial;
- token/session abuse and step-up boundaries;
- distributed rate limits and enumeration-safe responses;
- storage policy, signed grant expiry and revocation;
- object/error/log redaction;
- secret absence from source, artifacts and client bundles;
- dependency vulnerability policy;
- backup restoration and integrity checks;
- incident detection, containment and recovery steps;
- location-privacy non-disclosure;
- webhook replay, key rotation and provider outage;
- performance and soak thresholds;
- production configuration failing closed.

## Phase 10 entry checklist

Phase 10 may be claimed only after:

- [x] all Phase 9 permanent workflows passed on one exact reviewed head;
- [x] PR #35 was merged;
- [x] Issue #34 was closed as completed;
- [x] `PROJECT_STATUS.md` records Phase 9 as stable and Phase 10 as active;
- [x] `WORKSTREAM_LOCK.md` was released and explicitly claimed for Phase 10;
- [x] the Phase 9 commercial trust contract is inherited architecture;
- [x] Issue #41 and PR #42 govern Phase 10;
- [x] real providers, real credentials, a public pilot and production remain gated, while controlled synthetic-only development/staging deployment is explicitly authorized.

## Phase 10 exit preview

Phase 10 must not be promoted until:

- threat, authorization, privacy and legal reviews are current and evidence-backed;
- production configuration fails closed;
- secret and dependency scans pass;
- private storage and evidence access are verified against the correct environment;
- backup restore and incident-response exercises succeed;
- rate limits and abuse controls are tested;
- performance and soak thresholds pass;
- Supabase, Cloud Run, protected Vercel Preview/Staging and Firebase internal distribution evidence is recorded where applicable;
- external provider and authority terms are approved or remain explicit stop gates;
- no critical or high unresolved security/privacy/legal/reliability defect remains;
- Phase 11 pilot entry criteria and handoff are current;
- all permanent workflows pass on one exact reviewed head.

## Phase 11 remains separate

Phase 10 hardening does not replace primary Zambia validation. Phase 11 still owns consenting real participants, representative devices/connectivity, private real-evidence examples, trust-language comprehension, operational timing/cost, willingness to pay and controlled pilot stop criteria.
