# DIREKT Runtime Integration Closure Plan

**Governing issue:** #261 — Runtime integration closure after W8  
**Baseline:** `main@a06a66d313d8417d8b7731e3d845c1c71bda3dd4`  
**Workstream branch:** `integration/runtime-closure-261`  
**Status:** RC0 — dependency/current-source audit and control baseline

## 1. Purpose

W8 is closed and no longer blocks runtime integration work. This plan converts externally provisioned or planned services into correctly bounded DIREKT runtime integrations one checkpoint at a time without weakening Android, backend/database/OpenAPI, browser/BFF, operations, privacy, payment or release controls.

The checklist in Issue #261 is not implementation order. This plan derives the safer order from current dependencies and the existing architecture.

## 2. Non-negotiable architecture

- Android and browser clients call DIREKT-controlled API/BFF boundaries.
- Privileged database, Supabase service, payment-provider, registry and server-only map credentials never enter Android/browser code.
- The transactional outbox remains the source of truth for external asynchronous delivery.
- External delivery is idempotent and durable; outbox state is not deleted until delivery outcome is recorded.
- Cloud Logging/Monitoring remains authoritative for infrastructure health.
- Android crash/ANR telemetry uses Crashlytics by default; NestJS/Next.js use Sentry.
- Manual/list location fallback remains available even after Maps activation.
- Real payment movement, real participants, production communications and production release remain separately gated.

## 3. Dependency findings

### 3.1 Clean baseline versus historical branch

`main` contains the authoritative W8 closure at `a06a66d...`. The historical `build/android-v1` branch is currently diverged and is not a safe base for new runtime-integration work. This workstream therefore starts from clean `main` on `integration/runtime-closure-261`.

### 3.2 VC0 separation

VC0 design/audit work is isolated in draft PR #262 and may continue on non-overlapping design-control surfaces. Broad visual implementation is not part of this workstream.

### 3.3 Permanent-gate ownership hazard

VC0 identified historical coupling where later W8 assertions can be invoked through aggregate W7 verification. Before a new legitimate lock owner causes CI false failures, RC0 must verify/decouple historical gate ownership so permanent regressions test behavior, not stale workstream ownership text.

### 3.4 Communications dependency

The transactional outbox is already active. Resend is the safest first runtime provider because it can establish the reusable provider-adapter, idempotency, retry, privacy/template and managed-canary pattern used later by FCM and WhatsApp.

### 3.5 Observability before higher-risk client changes

Sentry for API/portal and Crashlytics for Android should be established before Maps and broader device/runtime changes so later integration failures are diagnosable without changing the authority model.

### 3.6 Android dependency stabilization before Test Lab

Crashlytics and FCM change the Android runtime/dependency surface. Firebase Test Lab should follow those changes so the automated device matrix validates the intended stabilized Firebase-enabled Android baseline rather than an interim dependency graph.

### 3.7 Maps is privacy/high-surface

Maps changes Android/runtime/location behavior and may introduce keys, permissions, SDKs and map-specific UI. It follows observability/device-test foundations and must retain PostGIS/manual-list fallback plus exact-private-coordinate non-leakage.

### 3.8 Generated clients should follow API shape stabilization

Generated Kotlin/TypeScript client adoption is a cross-client migration, not a prerequisite for external provider activation. It should follow backend/provider API stabilization to avoid regenerating/migrating clients repeatedly while endpoints are still changing.

### 3.9 Payments are sandbox-proven but not runtime-active

MTN, DPO, Stripe Checkout and PayPal have real sandbox evidence. Airtel is provider-pending; Flutterwave is deferred. Sandbox provider adapters may be implemented fail-closed, but real money remains disabled and payment state must never affect verification/publication/ranking authority.

### 3.10 Turnstile is conditional

Turnstile is not a completeness checkbox. Implement it only if an approved public abuse-sensitive flow and threat model justify the challenge; otherwise document a deliberate `NOT CURRENTLY REQUIRED` decision.

## 4. Sequential closure plan

### RC0 — control baseline and evidence reconciliation

Deliverables:

- claim the integration workstream lock;
- promote `LIVE_INTEGRATION_LEDGER.md`;
- record sandbox payment-provider receipts without claiming runtime activation;
- inspect/decouple stale W7/W8 workstream-ownership assertions from permanent regression behavior if required;
- confirm exact-head baseline gates before RC1.

Exit:

- documentation/status truth agrees;
- permanent historical gates tolerate the new legitimate workstream owner while still protecting W8 behavior;
- exact-head CI is green.

### RC1 — Resend runtime email

Why first: backend/outbox-only, lowest client-surface risk, establishes reusable delivery semantics.

Required:

- provider-neutral email adapter;
- Secret Manager runtime binding;
- outbox consumer/delivery state;
- idempotency/retry/backoff;
- template/privacy controls;
- synthetic managed email canary;
- fail-closed provider selection and kill switch.

### RC2 — Sentry API and operations portal

Required:

- separate API and portal projects/config;
- no raw request bodies, tokens, cookies, phone/email, evidence metadata, private coordinates or free text by default;
- environment/release tagging;
- protected source-map upload where applicable;
- synthetic privacy canary;
- DSN/telemetry kill switch;
- Cloud Logging remains infrastructure authority.

### RC3 — Firebase Crashlytics Android

Required:

- reviewed Gradle/plugin/dependency changes;
- debug/staging configuration;
- release mapping/obfuscation handling as applicable;
- privacy controls;
- synthetic crash/ANR evidence;
- no production release authorization change.

### RC4 — Firebase Cloud Messaging

Required:

- backend send adapter through approved event/outbox path;
- token registration/rotation/deletion lifecycle;
- Android foreground/background notification behavior;
- notification permission handling where platform version requires it;
- retry/idempotency/privacy controls;
- synthetic managed push canary.

### RC5 — Firebase Test Lab

Required:

- CI workflow and authenticated Firebase project use;
- controlled device/API-level matrix;
- unit/instrumented test APK strategy;
- artifacts/results retention;
- no production credentials or participant data.

### RC6 — WhatsApp Cloud API runtime adapter

Required:

- consent-at-send and opt-out enforcement;
- approved templates where required;
- signed webhook verification;
- idempotency/retry/delivery receipts;
- no identity/evidence documents in WhatsApp payloads;
- managed synthetic canary where provider state permits;
- production delivery remains gated until business/template/provider/legal approvals exist.

### RC7 — Google Maps runtime

Required:

- separate Android and backend credentials;
- Android package/signing SHA restrictions and API restrictions;
- backend API/egress/quota restrictions where applicable;
- budgets/quotas;
- privacy-approved publication semantics;
- manual/list fallback and kill switch;
- exact private provider coordinates never public;
- permission-denial/provider-outage tests;
- managed/device evidence.

### RC8 — sandbox payment-provider adapters and reconciliation

Scope:

- MTN MoMo — sandbox proven;
- DPO — sandbox proven;
- Stripe Checkout — sandbox proven;
- PayPal — sandbox proven;
- Airtel — provider-pending;
- Flutterwave — deferred.

Required:

- provider-neutral adapters behind existing payment domain;
- sandbox-only configuration and explicit target environments;
- independent transaction verification/webhook or status handling;
- immutable event/ledger mapping;
- idempotency/reconciliation/refund/adjustment semantics where provider supports them;
- provider secrets server-side only;
- Android/browser cannot assert payment success;
- real money disabled.

### RC9 — OpenAPI generated client adoption

Required:

- decide generator/versioning strategy;
- generated code deterministic and CI drift-controlled;
- incremental Kotlin migration preserving Android behavior;
- TypeScript adoption only where it improves the reviewed BFF/API boundary;
- no direct privileged backend access;
- cross-client compatibility/regression evidence.

### RC10 — Turnstile decision

Either:

- implement on a specific reviewed abuse-sensitive public flow with server verification, accessibility fallback, privacy and kill switch;

or:

- document `NOT CURRENTLY REQUIRED` with threat-model rationale.

Do not install it globally merely to clear a checklist.

### RC11 — final integration closure

Required:

- combined Android/backend/database/OpenAPI/web/portal integration regression;
- managed canary/device evidence index;
- `LIVE_INTEGRATION_LEDGER.md` reconciled;
- `CURRENT_INTEGRATION_STATUS.md` reconciled;
- blocked/provider-pending items explicitly retained as such;
- no false `ACTIVE` claims;
- lane released with clean handoff to the next authorized frontend/visual/pilot workstream.

## 5. Global acceptance rule

An integration may become `ACTIVE` only when all applicable evidence exists:

1. source adapter/SDK/client integration;
2. least-privilege credential/secret placement and runtime binding;
3. privacy/security/PII controls;
4. retry/idempotency/fallback/kill-switch behavior;
5. managed canary/device/runtime evidence;
6. Android/backend/database/OpenAPI/PWA/portal regressions as applicable;
7. documentation/status reconciliation.

## 6. Global stop conditions

Stop rather than merge if work would:

- weaken Cloud Run IAM or privileged data boundaries;
- expose raw evidence/contact/private coordinates/secrets;
- introduce production payment/participant/communication activation without approval;
- make payment state influence verification/public trust;
- bypass consent/authorization/provider scope;
- regress Android/web/backend/OpenAPI/portal required gates;
- use external provisioning as false runtime evidence;
- turn synthetic fixtures into claimed production functionality.

## 7. Handoff requirement

Every checkpoint handoff must include:

```text
Integration:
Previous state:
New state:
External provisioning:
Repo/source changes:
Secret Manager names/versions:
Runtime binding:
Managed canary evidence:
Privacy/security checks:
Fallback/kill switch:
Production authorization:
Known blockers:
Next exact step:
Ledger updated: YES
```
