# DIREKT Project Status

**Updated:** 2026-07-21 (Asia/Tokyo)  
**Stable branch:** `main`  
**Visual Completion:** VC1–VC8 merged through PR #270 at `c7f5985bc20372b4761e063dc3a66ecc736556e2`; Issue #259 closed/completed  
**Runtime integration tracker:** Issue #261  
**Latest integration checkpoint:** RC2 Sentry API/portal closed for the synthetic-only managed boundary  
**Active repository write lane:** none after RC2 closeout; RC3 Crashlytics requires a fresh claim

## 1. Programme state

DIREKT’s current repository state is:

- Phases 0–10 — **complete**;
- Phase 11 internal/synthetic readiness — **complete**;
- Phase 11 real 11C–11H evidence and 11J — **pending / externally gated**;
- repository-clearable Phase 12 preauthorization engineering — **complete**;
- formal Phase 12 production release — **not authorized**;
- functional customer/provider web/PWA W0–W8 — **closed**;
- VC0 preparation/control — **closed**;
- VC1–VC8 world-class product/AI modernization — **complete and merged**;
- RC0 integration audit/ledger — **closed**;
- AI0 provider-neutral AI foundation — **closed / runtime-gated**;
- RC1 Resend — **closed / ACTIVE for synthetic-only managed canary boundary**;
- RC2 Sentry API/portal — **closed / ACTIVE for synthetic-only managed canary boundary**;
- RC3 Firebase Crashlytics — **next dependency-safe runtime-integration checkpoint after a fresh workstream claim**.

No repository-only integration checkpoint replaces or weakens Phase 11 real-world evidence, privacy/legal, payment, external-communications or production-release gates.

## 2. Current product truth

DIREKT now has:

- native Android customer/provider implementation using Jetpack Compose/Material 3;
- functional responsive customer/provider web/PWA companion;
- privileged internal operations portal;
- canonical NestJS REST/OpenAPI backend;
- PostgreSQL/PostGIS/private-storage foundation;
- check-specific verification/trust engine;
- enquiries, reviews, complaints and commercial foundations;
- active managed development/staging infrastructure within documented boundaries;
- canonical browser application at `https://app.direkt.forum`;
- preserved synthetic historical preview at `https://direkt.forum/preview/`;
- completed VC1–VC8 modernization using the approved Structured Trust + Neighbourhood Marketplace + Field Utility hybrid;
- bounded AI-assistance product surfaces behind backend/BFF authority with deterministic/manual fallback and fail-closed switches;
- permanent synthetic-safe responsive/native visual-evidence generation in normal CI;
- transactional Resend runtime proven at the approved synthetic-only managed boundary;
- Sentry API/private-portal observability proven at the approved synthetic-only managed boundary while Cloud Logging/Monitoring remains authoritative infrastructure telemetry.

Android remains the primary native Version 1 client. Web/PWA is additive and shares product semantics through canonical backend contracts, not shared privileged credentials.

## 3. Integration closure sequence

The authoritative runtime integration sequence remains one bounded checkpoint at a time:

1. RC0 — ledger/dependency/source audit — **closed**.
2. AI0 — provider-neutral AI foundation — **closed; Gemini/Groq sandbox proven, managed DIREKT runtime not bound**.
3. RC1 — Resend — **closed; synthetic-only managed canary proven**.
4. RC2 — Sentry API/portal — **closed; synthetic-only managed canary proven**.
5. RC3 — Firebase Crashlytics Android — **next**.
6. RC4 — FCM push delivery.
7. RC5 — Firebase Test Lab device matrix.
8. RC6 — WhatsApp Cloud API application adapter.
9. RC7 — Google Maps runtime.
10. RC8 — sandbox payment adapters/reconciliation.
11. RC9 — OpenAPI-generated Kotlin/TypeScript client adoption/decision.
12. RC10 — Turnstile threat-model decision.
13. RC11 — combined integration regression/evidence index/final lane release.

Detailed authority:

- `WORKSTREAM_LOCK.md`;
- `docs/integrations/RUNTIME_INTEGRATION_CLOSURE_PLAN.md`;
- `docs/integrations/CURRENT_INTEGRATION_STATUS.md`;
- `docs/integrations/LIVE_INTEGRATION_LEDGER.md`;
- Issue #261.

## 4. RC1 Resend status

RC1 is closed only for the approved synthetic-only managed boundary.

Proven:

- provider-neutral Resend adapter through the transactional outbox;
- deterministic idempotency/retry/failure persistence;
- verified sender domain `notify.direkt.forum`;
- sending-only/domain-restricted provider key;
- Secret Manager/runtime access;
- managed Cloud Run execution `direkt-resend-canary-ct9mp` on exact source `8e367f47f16b3f9f28a26a62ee8bdd305a286153`;
- outbox path reached durable `published` state.

Not authorized by RC1:

- uncontrolled participant email;
- production marketing/bulk email;
- Phase 11 exit or production release.

## 5. RC2 Sentry status

RC2 is closed only for the approved synthetic-only managed boundary.

Source:

- Sentry API/private operations portal integration promoted through PR #275;
- managed proof dispatched from exact merged source `035f4e8ff60a6e571d7aa09c0eaedb831c73648b`;
- Issue #261 contains the sanitized dispatch and final success receipts;
- closeout detail: `docs/integrations/RC2_SENTRY_CLOSURE.md`.

Proven boundaries:

- separate API/portal DSNs;
- enabled numeric Secret Manager versions only;
- exact 40-character release/source binding;
- synthetic-only data-mode gate;
- API and portal Sentry event generation/flush;
- private portal invocation/IAM cleanup after the canary;
- no Sentry auth token in application runtime;
- `sendDefaultPii=false` and minimized telemetry;
- traces/logs/breadcrumbs/local-vars/replay not activated by RC2;
- Cloud Logging/Monitoring remains authoritative infrastructure telemetry.

Not authorized by RC2:

- real participant or production restricted-data telemetry;
- raw evidence/contact/private-coordinate telemetry;
- Android Sentry;
- any trust, authorization, verification, payment, publication or dispute authority.

Android crash/ANR ownership moves to RC3 Firebase Crashlytics.

## 6. What AI is doing now

AI is implemented as a bounded assistance layer, not as canonical authority.

Implemented product use cases:

1. customer natural-language service-need/category assistance;
2. grounded public Help using approved DIREKT facts/source identifiers;
3. provider onboarding/readiness guidance;
4. provider public-profile drafting requiring provider confirmation.

Current managed runtime truth:

- provider-neutral `AiProvider` backend contract — **implemented/gated**;
- Gemini — **sandbox proven, DIREKT runtime not bound**;
- Groq fallback — **sandbox proven, DIREKT runtime not bound**;
- AI provider mode and per-use-case modes default fail-closed;
- production AI provider activation is disabled;
- `AiService` currently accepts synthetic model input only;
- deterministic/manual fallback remains active for core tasks when AI is disabled/unavailable/invalid;
- restricted evidence OCR/extraction and restricted operations-case AI remain disabled.

Therefore, in the current managed DIREKT runtime, the visible AI-capable features do **not** imply live Gemini/Groq calls. Unless a reviewed synthetic environment explicitly enables both the use-case switch and provider binding, the product uses deterministic/manual behavior.

AI cannot:

- verify or reject a provider;
- create or improve trust/publication/ranking;
- authorize payments or escrow;
- decide serious disputes/appeals;
- override consent/authorization;
- expose restricted evidence/private coordinates/raw contacts;
- make legal/regulatory conclusions.

## 7. W0–W8 and VC1–VC8 remain closed

Stable W8 evidence:

- functional managed runtime source: `c1262ce2bfb76e06d2296d793f1acd6cf5cc3ca2`;
- managed run: `29721199177`;
- canonical-domain verification: `29802524466`;
- canonical host: `https://app.direkt.forum`.

VC1–VC8 final reviewed closure head:

`cc7cdb5760c01498f27ca1daba738e02296320cb`

The completed visual/AI modernization does not bypass integration/provider/runtime gates.

## 8. Payments remain sandbox/runtime-gated

Provider evidence currently includes:

- MTN MoMo Collections — sandbox proven;
- DPO Pay — sandbox proven;
- Stripe Checkout — sandbox proven;
- PayPal — sandbox proven;
- Airtel Money Zambia Cash-In — provider approval/credentials pending;
- Flutterwave — deferred/blocked by onboarding availability.

Real money movement, escrow and customer-to-provider service payment remain disabled unless separate legal/commercial/provider/pilot/release gates authorize them.

Payment state can never create verification, publication or ranking authority.

## 9. Remaining formal programme gates

Still externally/operationally open:

1. actual Phase 11 Zambia pilot evidence 11C–11H;
2. evidence-backed 11J `PROCEED`;
3. required Zambia legal/privacy/regulatory approvals and current live policy versions;
4. production evidence/private-data readiness;
5. production environment/backup-restore readiness;
6. operational staffing/exercises and active monitoring/escalation;
7. real Play/current-policy/signed-release controls;
8. formal go/no-go/staged rollout;
9. any broader AI data class/provider activation beyond the currently approved synthetic-only boundaries.

## 10. Next execution rule

Before RC3 begins:

1. fetch current `main` after RC2 closeout merge;
2. verify predecessor exact-head regression state;
3. re-read `WORKSTREAM_LOCK.md`, Issue #261 and the runtime closure plan;
4. claim only RC3 Crashlytics Android surfaces;
5. preserve Android identity, release signing, Play/Data Safety, privacy and VC1–VC8 regressions;
6. add source integration and fail-closed configuration;
7. prove release mapping/privacy and synthetic crash/ANR behavior on managed Firebase infrastructure;
8. merge only after exact-head Android/integration/security/release regressions and status reconciliation are green.
