# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 9 subscription and payment foundation agent |
| Phase | Phase 9 — Subscription and payment foundation |
| Task | Implement products, entitlements, subscriptions, invoices, synthetic payment intents, webhook contracts, append-only ledger, grace periods, reconciliation and commercial client experiences |
| Modules/paths | `database`, `backend/direkt-api`, `android/direkt-app`, `admin/direkt-operations-portal`, `docs`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-17 after Phase 8 checkpoint promotion and branch synchronization |
| Expected handoff | Reviewed Phase 9 checkpoint with isolated commercial aggregates, synthetic-disabled payment adapter, green permanent CI and Phase 10 handoff |
| Last stable checkpoint | `0182951cdc26a892b3423728bd843e2969b25bc0` |
| Governing issue | Issue #34 |

## Stable predecessor

Phase 8 completed through PR #31 and Issue #30.

```text
Phase 8 exact reviewed head: 380687bf8044bc44ec1f70c58e4b71c6b3e3c6a7
Phase 8 merge commit:       0182951cdc26a892b3423728bd843e2969b25bc0
Issue #30:                  closed as completed
```

## Phase 9 objective

Create a synthetic-first commercial foundation for provider products, entitlements, subscriptions, invoices, receipts, retry-safe payment intents, verified webhook processing, append-only ledger accounting, grace periods and reconciliation while keeping commercial state completely independent from verification, publication, review outcomes, complaints and ranking.

## Delivery stages

### Stage 9A — commercial foundation, products and permissions

- forward-only `commercial` schema and explicit aggregates;
- separate commercial permission families and role grants;
- synthetic product/price catalogue with currency, interval, version and activation lifecycle;
- provider-safe and operations-safe catalogue projections;
- no verification, publication or ranking side effects.

### Stage 9B — subscriptions and entitlements

- actor-resolved provider scope;
- pending, active, grace, past-due, cancelled and expired subscription lifecycle;
- optimistic revisions, reasoned events and duplicate-active-subscription prevention;
- explicit product entitlement grants and deterministic effective-state projection;
- cancellation independent from provider suspension and trust/publication state.

### Stage 9C — invoices, receipts and synthetic payment intents

- immutable invoice/line snapshots in minor units;
- hashed idempotency keys and request fingerprints;
- disabled/synthetic payment adapter only;
- explicit pending, requires-action, processing, succeeded, failed, cancelled, expired and reversed states;
- backend-confirmed safe receipt projection;
- no credential, PIN, card or Phase 8 contact storage.

### Stage 9D — webhooks, ledger and reconciliation

- bounded webhook receipts with unique provider event identifiers;
- signature, timestamp, provider and replay verification before state mutation;
- idempotent verified replays;
- balanced append-only ledger entries;
- deterministic reconciliation and separate exception queue.

### Stage 9E — grace periods, adjustments and exception controls

- deterministic grace start/end and entitlement degradation;
- cancellation, expiry, failure and recovery state machines;
- synthetic adjustment/refund requests separate from ledger correction;
- four-eyes approval for high-risk commercial adjustments where implemented;
- immutable commercial decisions and events.

### Stage 9F — Android and operations experiences

- live subscription status replacing the Phase 6 placeholder;
- native low-bandwidth product, subscription, invoice, payment, receipt and recovery states;
- process-death recovery without sensitive credential storage;
- API-only operations product, subscription, invoice/payment and reconciliation workspaces;
- permission-denied, empty, stale, duplicate, signature-failure and mismatch states;
- TalkBack, keyboard, focus and screen-reader semantics.

### Stage 9G — regression, documentation and checkpoint promotion

- permanent database, API, Android and portal regressions;
- OpenAPI, architecture, authorization, privacy, commercial trust, decision and risk records;
- explicit real-provider approval gate and Phase 10 handoff;
- green backend, Android, portal and documentation workflows on one exact reviewed head;
- review remediation, merge, Issue #34 closure and branch synchronization.

## Supabase execution state

The supplied project reference is `aeeuscifrxcjmnswqwnq`, derived from `https://aeeuscifrxcjmnswqwnq.supabase.co`.

The current Supabase connector cannot access that project and lists only unrelated CarUp projects. No live database mutation is authorized through the connector until the DIREKT project is connected and permission is confirmed. Repository migrations and clean PostgreSQL/PostGIS CI remain the Phase 9 implementation authority meanwhile.

## Non-negotiable stop gates

- No real payment provider, production credential, customer/provider money movement, deployment or public pilot.
- Only hashed idempotency keys and bounded fingerprints may be persisted.
- Webhook signatures and timestamps are verified before business parsing or mutation.
- Raw provider payload retention requires a later encrypted, private and retention-controlled store; this phase stores safe metadata/fingerprints only.
- Ledger and material commercial history are append-only.
- Provider scope is actor-resolved from one active server-side assignment; client identifiers do not grant access.
- Commercial state cannot create, strengthen, extend or suppress verification claims, publication, ranking, reviews, complaints, appeals or incidents.
- Interaction handoff consent is not payment or marketing consent.
- Android and portal store no payment credentials or provider secrets.
- Real Zambia mobile-money integration requires current commercial, settlement, security, tax, consumer, AML, privacy, support and legal approval.
- Phase 10 retains security, privacy, legal and reliability hardening.
- Issue #5 remains a later, non-blocking Zambia pilot-validation obligation.

## Conflict rule

A second agent must not modify the listed Phase 9 paths while this lock is claimed. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
