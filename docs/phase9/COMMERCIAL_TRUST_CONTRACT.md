# Phase 9 Commercial Trust Contract

**Status:** Implemented synthetic commercial foundation; production payment integration remains prohibited  
**Owning phase:** Phase 9 — Subscription and payment foundation  
**Governing issue:** #34  
**Checkpoint PR:** #35  
**Policy baseline:** `phase9-v1`

## Purpose

Phase 9 introduces DIREKT's commercial aggregates without turning payment into evidence of trust. It provides products, prices, entitlements, subscriptions, invoices, synthetic payment intents, safe receipts, verified webhook processing, append-only ledger entries, grace periods, reconciliation and controlled adjustments.

This contract does not approve or enable a real mobile-money, card, bank, wallet or settlement provider. It does not move customer or provider money, store payment credentials, deploy production services or authorize a public pilot.

## Non-negotiable invariants

1. Commercial state is separate from provider identity, verification evidence, verification decisions, claims, publication, discovery ordering, reviews, complaints, appeals and incidents.
2. Payment success cannot create, extend or strengthen a verification claim.
3. A paid or higher-priced product cannot publish a provider or improve trust-relevant discovery ordering.
4. Subscription cancellation, expiry, grace or past-due state cannot suppress a review, complaint, appeal or incident.
5. Provider-commercial scope is resolved from one active server-side provider assignment. A client-supplied provider identifier never establishes authorization.
6. Zero or ambiguous active provider assignments deny provider-commercial mutations.
7. Retryable commercial mutations store only a SHA-256 idempotency-key hash and a request fingerprint.
8. Replaying the same key and fingerprint returns the existing aggregate; reusing the key with different content is rejected.
9. All currency amounts are immutable integer minor units paired with an ISO-style three-letter currency code.
10. Invoice lines are immutable snapshots. Later product or price changes cannot rewrite an issued invoice.
11. Raw webhook request bodies are not stored in the commercial schema. Phase 9 stores bounded event metadata, a fingerprint and verification outcome only.
12. A webhook cannot change payment state unless its signature and timestamp pass the configured adapter contract.
13. External event identifiers and fingerprints are unique and replay-safe.
14. Ledger history is append-only and every posted ledger transaction must balance total debits and credits.
15. Direct edits to material subscription, invoice, payment, webhook, ledger, reconciliation or adjustment history are prohibited.
16. Amount, currency or lifecycle mismatches do not silently mutate money state; they create or update a reconciliation case.
17. High-risk credits, debits or synthetic refunds require two distinct eligible approvers who are not the requester.
18. A synthetic refund records accounting and audit state only. It performs no production money movement.
19. Commercial API projections exclude payment credentials, raw webhook payloads, private evidence, private contact values and internal actor identities.
20. Production accepts only the disabled payment-adapter mode until Phase 10 approval conditions are satisfied.

## Commercial architecture

The commercial domain is a separate NestJS module and PostgreSQL schema. It consumes identity and provider authorization contracts but does not write to verification, discovery, interaction, review, complaint or incident aggregates.

The implemented aggregate map is:

```text
commercial.products
commercial.product_prices
commercial.product_entitlements
commercial.subscriptions
commercial.subscription_events
commercial.entitlement_grants
commercial.invoices
commercial.invoice_lines
commercial.payment_intents
commercial.payment_events
commercial.webhook_receipts
commercial.ledger_transactions
commercial.ledger_entries
commercial.reconciliation_cases
commercial.reconciliation_events
commercial.adjustment_requests
commercial.adjustment_approvals
```

Application controllers delegate lifecycle authority to database functions. PostgreSQL remains the final concurrency, authorization and immutability boundary.

## Authorization boundary

Permission families are commercial-specific:

- `commercial.products.read` and `commercial.products.manage`;
- `commercial.subscriptions.read` and `commercial.subscriptions.manage`;
- `commercial.invoices.read`;
- `commercial.payments.read` and `commercial.payments.initiate`;
- `commercial.reconciliation.read` and `commercial.reconciliation.manage`;
- `commercial.adjustments.request` and `commercial.adjustments.approve`;
- `finance.ledger.read`.

Trust reviewers, field agents, complaint operators and review moderators do not gain finance access from their existing roles. Portal visibility is not authorization; the API guard and database permission checks are authoritative.

Provider mutations use actor-resolved scope. Operations actions use active global assignments and record the requesting or approving identity internally while safe API projections hide those identities.

## Product and entitlement boundary

A product may provide a workspace feature, quota, invoice history, subscription management or another non-ranking productivity capability. Every product and entitlement explicitly records that verification and ranking effects are absent.

Prohibited commercial benefits include:

- paid verified badges;
- paid evidence approval;
- paid claim validity extension;
- paid publication eligibility;
- paid trust ranking;
- paid review or complaint suppression;
- paid appeal outcomes.

## Subscription lifecycle

The implemented states are explicit and revisioned:

```text
pending → active | cancelled
active → grace | past_due | cancelled | expired
past_due → active | grace | cancelled | expired
grace → active | past_due | cancelled | expired
cancelled → terminal
expired → terminal
```

Every transition records the prior state, next state, actor kind, reason, policy version and timestamp. Stale revisions, repeated terminal actions, invalid transitions and wrong-scope actions are rejected.

Entitlement grants are derived from the current subscription state and product definition. Grace and past-due behavior is deterministic and does not affect verification or accountability rights.

## Invoice and receipt boundary

An invoice contains:

- actor-resolved provider and subscription references;
- immutable invoice number;
- currency;
- subtotal, tax and total in minor units;
- immutable line snapshots;
- revisioned status and timestamps;
- policy version.

A receipt is a safe projection derived only after backend-confirmed successful payment and balanced ledger posting. It excludes account numbers, phone numbers, card details, PINs, access tokens, provider credentials and raw external payloads.

## Payment-provider port

Phase 9 defines two modes:

| Mode | Allowed environment | Behaviour |
|---|---|---|
| `synthetic` | development and test | deterministic action and signed webhook simulation; no money movement |
| `disabled` | all environments; mandatory in production | historical commercial records remain readable; initiation is unavailable |

No production configuration can select the synthetic adapter. No MTN, Airtel, card, Stripe, PayPal, bank or wallet credential is included.

## Webhook contract

Synthetic webhook processing requires:

- canonical bounded fields;
- HMAC-SHA256 signature;
- timestamp within the configured freshness window;
- unique external event identifier;
- payload fingerprint;
- expected amount and currency;
- valid payment lifecycle transition;
- explicit policy version and reason code.

Invalid signatures or timestamps are recorded as rejected safe metadata. Identical replays return the existing receipt. Conflicting replays are rejected. Amount or currency mismatches leave the payment actionable and create reconciliation work.

## Ledger and reconciliation

Ledger transactions and entries are append-only. Posting is performed only by controlled database functions. Each transaction must contain balanced debit and credit totals in one currency.

Reconciliation compares internal payment intent, invoice, webhook and ledger facts. Exceptions use explicit mismatch codes and an operations-owned lifecycle. Resolution requires an authorized reason, expected revision and policy version. Resolution cannot edit historical ledger entries.

## Adjustment control

Credits, debits and synthetic refunds are separate requests rather than direct invoice, payment or ledger edits. A request records provider scope, amount, currency, reason and policy version.

Application requires two distinct eligible approvals. The requester cannot approve their own request, duplicate approvals are rejected and rejected requests cannot be applied. Phase 9 synthetic refunds do not call an external provider.

## Privacy and data minimization

Commercial records and projections exclude:

- raw customer or provider contact values;
- interaction handoff consent;
- private evidence or storage identifiers;
- verification reviewer rationale;
- payment PINs, card data, account numbers or wallet credentials;
- raw webhook bodies;
- secret keys;
- public trust-ranking controls.

Android recovery persists only an opaque logical request identifier, invoice identifier, currency, minor-unit amount, expected revision, attempt count, bounded state and safe error code. The operations portal consumes only the versioned backend API and imports no database, Supabase or payment-provider client.

## Supabase boundary

The repository includes a reviewed backend-only Supabase development foundation for project reference `aeeuscifrxcjmnswqwnq`. Supabase remains managed infrastructure, not the commercial domain layer.

Commercial migrations are forward-only and validated against clean PostgreSQL/PostGIS CI. Remote activation requires verified access to the exact project and protected GitHub Environment secrets. No database URL, access token, server key or payment secret may be committed or exposed to Android or browser clients.

## Android contract

The provider commercial experience represents:

- products and prices;
- pending, active, grace, past-due and cancelled subscription states;
- immutable invoice totals;
- payment initiation, interruption, retry, stale revision, required action, processing, failed, paid, reversed, cancelled and expired states;
- process-death restoration with one stable logical retry identifier;
- accessible status and recovery copy;
- explicit separation between commercial and trust state.

No sensitive payment credential is stored on the device.

## Operations portal contract

The API-only finance workspace represents:

- product policy;
- subscription and entitlement lifecycle;
- invoices and backend-confirmed payment status;
- ledger balance status;
- reconciliation exceptions;
- separated adjustment request and approval actions.

A dedicated finance permission family controls access. Trust-supervisor and reviewer sessions do not inherit commercial access.

## Production stop gates

Before a real payment adapter or real money movement is permitted, DIREKT requires:

- completed Phase 10 threat model and authorization review;
- qualified Zambia payments, consumer, tax, invoicing, privacy and anti-money-laundering advice;
- written provider and authority approval for data use and settlement;
- approved provider terms, KYC/account requirements, fees, limits, settlement timing, refunds and reversals;
- production secret management and rotation;
- webhook key rotation, replay monitoring and incident response;
- reconciliation staffing, exception service levels and settlement evidence;
- backup/restore and disaster-recovery evidence;
- production rate limits and abuse controls;
- performance and soak evidence;
- secure Android storage and representative device/connectivity validation;
- controlled Zambia pilot authorization.

Phase 9 does not satisfy these production gates.
