# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED — RC2 Sentry API/portal synthetic-managed runtime closure complete |
| Owner/agent | None — next material repository work requires a fresh bounded claim |
| Authorized scope | No active RC2 write scope. RC3 Firebase Crashlytics is the next dependency-safe checkpoint and must claim a new lane from the merged RC2 closure baseline before source changes. |
| Protected surface | Android, backend/database/OpenAPI, web/PWA, operations portal, CI, trust/privacy, payments, integrations, VC1–VC8 completion and release boundaries remain regression-protected. |
| Stable baseline | VC1–VC8 merged through PR #270 at `c7f5985bc20372b4761e063dc3a66ecc736556e2`; RC1 Resend closed at its synthetic managed boundary; RC2 Sentry source merged through PR #275 at `15210c5b0bf1832e32f8c33a7618c69f61f65275`; managed synthetic Sentry proof succeeded from exact merged source `035f4e8ff60a6e571d7aa09c0eaedb831c73648b`. |
| Current task | RC2 closure/status reconciliation only. After this closeout merges, RC3 Crashlytics may claim a fresh bounded lane from current `main`. |
| Governing issue | Issue #261 — Runtime integration closure after W8; Issue #259 VC1–VC8 is closed/completed. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |

## RC2 Sentry closure record

1. PR #275 integrated Sentry into the approved NestJS API and private Next.js operations portal surfaces without adding Android Sentry.
2. Runtime activation is fail-closed: `SENTRY_MODE=enabled` is accepted only with `DIREKT_DATA_MODE=synthetic-only`, a valid HTTPS DSN and exact 40-character `SENTRY_RELEASE` source SHA.
3. Separate API/portal DSNs use enabled numeric Secret Manager versions; Sentry auth tokens remain CI/release tooling only and are prohibited from application runtime.
4. Default PII is disabled and the RC2 runtime minimizes request/user/context/extra data. Raw evidence, tokens, cookies, contacts, exact private coordinates and unnecessary free text remain prohibited telemetry.
5. The managed API canary produced a Sentry event identifier and flushed successfully; the private portal canary produced the expected `DIREKT_SENTRY_PORTAL_OK` receipt/event identifier and flushed successfully.
6. The portal canary remained private, used temporary least-privilege invocation for the managed proof, removed that grant afterward and verified no deployer/public invocation remained.
7. Cloud Logging/Monitoring remains the authoritative infrastructure telemetry baseline.
8. PR #279 provided a temporary, source-controlled one-shot dispatcher because the connected GitHub tool could not directly invoke `workflow_dispatch`. The dispatcher and authorization marker are removed in the RC2 closure change after the success receipt was recorded on Issue #261.
9. RC2 is `ACTIVE` only for the approved synthetic-only managed boundary. Real participant/production telemetry or broader data classes require a separate privacy/data-use review and new managed evidence.
10. Android crash/ANR telemetry ownership remains RC3 Firebase Crashlytics.

Detailed closure evidence: `docs/integrations/RC2_SENTRY_CLOSURE.md`.

## Runtime integration closure contract

1. Close one bounded integration checkpoint at a time; do not batch unrelated SDK/provider activation.
2. An external account, API key, DSN, secret or dashboard project is not `ACTIVE` evidence by itself.
3. Each closure requires applicable source integration, least-privilege secret/runtime binding, privacy/security controls, fallback or kill switch, managed canary/device evidence, exact-head regressions and status documentation.
4. Android/browser clients call DIREKT-controlled API/BFF boundaries; they do not receive privileged provider, database, payment, AI, registry or telemetry-auth credentials.
5. Real participants, real external communications, real payment movement, production auth and production release remain separately gated.
6. Payment state cannot create or improve verification, publication or ranking authority.
7. AI output cannot independently verify providers, change trust/ranking/publication, authorize payments/escrow, decide disputes, override consent/authorization or act as legal/regulatory authority.
8. Exact private provider coordinates, raw evidence, contact data, credentials and tokens must not leak into telemetry, public maps, browser caches or provider payloads.
9. Sentry auth tokens remain CI/release tooling only and must never bind to API, portal, Android or browser runtime.
10. Every checkpoint must preserve deterministic/manual fallback or a safe disabled mode where applicable.
11. The lane releases only after status/ledger reconciliation, exact-head regressions, managed evidence and handoff are promoted.

## Dependency-safe implementation sequence

- RC0 — integration ledger, dependency/source audit, permanent-gate ownership sanity check and payment evidence reconciliation. **Closed — PR #263.**
- AI0 — provider-neutral AI foundation. **Closed — PR #265; Gemini/Groq sandbox proven, DIREKT runtime not bound; per-use-case activation remains fail-closed.**
- RC1 — Resend transactional-outbox runtime. **Closed — ACTIVE for the synthetic-only managed boundary; real-participant/production email disabled.**
- RC2 — Sentry API/portal observability. **Closed — ACTIVE for the synthetic-only managed boundary; real participant/production restricted-data telemetry not authorized.**
- RC3 — Firebase Crashlytics Android activation with privacy/release mapping and synthetic crash/ANR evidence. **NEXT CHECKPOINT after a fresh claim.**
- RC4 — FCM push delivery: server send path, token lifecycle, Android notification handling/permissions, retries and managed canary.
- RC5 — Firebase Test Lab device-matrix automation after Android runtime dependencies stabilize through RC3–RC4.
- RC6 — WhatsApp Cloud API application adapter using outbox/idempotency/consent/template/delivery-receipt rules; production sends remain gated until provider/legal approvals exist.
- RC7 — Google Maps runtime activation with separate restricted Android/backend credentials, privacy-safe publication semantics, quotas, manual/list fallback and kill switch.
- RC8 — sandbox-only payment-provider adapter closure/reconciliation for proven MTN, DPO, Stripe and PayPal rails; Airtel remains provider-pending and Flutterwave deferred; real money remains disabled.
- RC9 — OpenAPI-generated Kotlin and TypeScript client adoption/decision after backend integration/API shape stabilizes; migrate incrementally with cross-client regressions.
- RC10 — Turnstile threat-model decision; implement only if a reviewed public abuse-sensitive flow requires it, otherwise close as not currently justified.
- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release.

## AI contract preserved

1. AI is assistive, never authoritative: it cannot approve/reject verification, publish trust, suspend providers, decide serious complaints/appeals, mutate payment truth, widen permissions or make legal/regulatory conclusions.
2. Implemented bounded use cases are customer discovery/category assistance, grounded public Help, provider onboarding/readiness guidance and provider public-profile drafting.
3. Those use cases have deterministic/manual fallback and per-use-case fail-closed switches.
4. External model runtime is not active by default; Gemini and Groq remain sandbox-proven but not bound to the managed DIREKT runtime at this checkpoint.
5. Restricted evidence/OCR/operations-case AI remains disabled until separate privacy/security/data-processing/provider approval and dedicated evaluation/runtime evidence exist.
6. No model/provider credential or privileged retrieval authority enters Android/browser code.

## Persistent stop conditions

Stop rather than merge or activate a later checkpoint if it would:

- regress Android/backend/database/OpenAPI/web/portal required gates;
- weaken Cloud Run IAM or expose privileged Supabase/database/Storage access;
- expose private evidence, raw contact data or exact private provider coordinates;
- fabricate or bypass participant, legal/privacy, payment, AI-provider or production-release gates;
- accept client-selected provider scope or authorization;
- allow commercial/payment state to influence verification or public trust claims;
- allow AI output to become authoritative verification/trust/payment/dispute/publication authority;
- store production credentials, model/provider secrets or Sentry auth tokens in application runtime or browser-readable surfaces;
- replace backend-authoritative behavior with static fixtures while claiming runtime completion;
- mark an integration or AI use case `ACTIVE` without exact configured-provider/runtime evidence.

## Conflict rule

No active implementation lane is held after RC2 closure. Before RC3 or any other material work begins, the next agent must fetch current `main`, verify predecessor exact-head regressions, re-read Issue #261 and this lock, then claim only the bounded checkpoint it owns.
