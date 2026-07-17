# Phase 9 Handoff from Phase 8

**Next planned phase:** Phase 9 — Subscription and payment foundation  
**Predecessor:** Phase 8 — Enquiries, interactions and reviews  
**Authorization state:** Claimed on 2026-07-17 under Issue #34 and PR #35 after the Phase 8 checkpoint was promoted and the workstream lock was released.

## Stable capabilities inherited from Phase 8

Phase 9 relies on these domain contracts from the promoted Phase 8 checkpoint:

- current public provider publications are the customer-facing provider identifiers;
- provider workspace ownership is resolved from active server-side assignments;
- structured enquiries are bounded and idempotent;
- accepted enquiries open tracked interactions;
- closed interactions create deterministic review eligibility;
- contact handoff is channel-specific, expiring, revocable and synthetic-disabled;
- interaction history is immutable and scope-safe;
- reviews, provider responses, moderation, appeals, reports and customer complaints have separate state machines;
- customer complaints remain distinct from Phase 7 internal incidents;
- interaction and review state cannot create verification claims, publication eligibility or ranking.

Phase 9 preserves these invariants rather than rebuilding or bypassing them.

## Phase 9 authorized scope

The master plan authorizes Phase 9 to design and implement:

- provider products and entitlements;
- subscription lifecycle;
- invoices and receipts;
- an approved mobile-money adapter only after provider approval;
- idempotent payment webhooks;
- grace periods;
- reconciliation and exception queues;
- commercial audit history;
- explicit separation of commercial status from verification and trust.

## Required commercial aggregates

Phase 9 introduces separate aggregates instead of adding payment columns to interaction, verification or publication tables.

Implemented module boundaries:

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

The separation remains explicit in the NestJS module and PostgreSQL schema.

## Prohibited coupling

Phase 9 must not:

1. publish an unverified provider because payment succeeded;
2. strengthen, extend or create a verification claim;
3. improve discovery ranking because a provider pays more;
4. suppress a review, complaint, appeal or incident because of commercial status;
5. expose raw customer contact or private evidence to a payment provider;
6. use an interaction handoff consent as payment or marketing consent;
7. convert a customer complaint into a billing dispute without an explicit separate workflow;
8. place commercial fields in public trust claim projections;
9. treat subscription cancellation as provider suspension unless an independent policy explicitly requires and authorizes it;
10. integrate real payment credentials before legal, settlement, security and operational approval.

## Identity and provider scope

Commercial actions use the same active actor-resolved provider scope established before Phase 8. A client-supplied provider identifier may identify a resource but cannot establish authorization.

If one identity has zero or multiple active provider workspaces, any provider-commercial mutation fails until the API resolves an unambiguous server-owned context or a separately approved secure context-selection contract exists.

## Idempotency and webhook rules

Every external or retryable commercial mutation uses a stable logical idempotency contract.

Minimum requirements:

- store only hashed idempotency keys;
- bind the key to a request fingerprint;
- replay an identical request without duplicating money movement;
- reject key reuse with different content;
- record external event/provider identifiers as unique values;
- verify webhook signatures before parsing state changes;
- persist no raw webhook in Phase 9; any future approved raw-payload storage must be private, encrypted and retention-controlled;
- make ledger entries append-only;
- reconcile provider reports, internal ledger and settlement records;
- route unresolved mismatches to an operations exception queue.

## Entitlement boundary

An entitlement may control commercial product access, limits or presentation features. It must never create evidence-backed trust.

Acceptable examples include:

- access to a provider workspace feature;
- usage quota;
- invoice history;
- subscription management;
- non-ranking cosmetic or productivity options after policy review.

Unacceptable examples include:

- a paid verified badge;
- paid claim validity extension;
- paid evidence approval;
- paid appeal outcome;
- paid complaint suppression;
- paid discovery ranking presented as trust relevance.

## Interaction-domain integration

Phase 9 may read safe interaction aggregates only when a product requirement justifies them. Any future metering or support use requires:

- a documented product purpose;
- privacy minimization;
- no customer identity/contact leakage into commercial projections;
- no change to review eligibility;
- no change to complaint rights;
- no ranking or verification effect;
- explicit retention and audit policy.

Phase 9 does not write to Phase 8 lifecycle tables.

## Operations portal additions

Commercial operations use new permission families and separate workspaces. They do not reuse trust-review, review-moderation or complaint-management permissions.

Permission boundaries include:

- `commercial.products.read` / `commercial.products.manage`;
- `commercial.subscriptions.read` / `commercial.subscriptions.manage`;
- `commercial.invoices.read`;
- `commercial.payments.read` / `commercial.payments.initiate`;
- `commercial.reconciliation.read` / `commercial.reconciliation.manage`;
- `commercial.adjustments.request` / `commercial.adjustments.approve`;
- `finance.ledger.read`.

High-risk adjustments and synthetic refunds use four-eyes approval. Direct ledger edits remain prohibited.

## Android additions

The inherited synthetic subscription-status placeholder is replaced by the live actor-scoped commercial workspace after backend contracts and permissions were implemented.

Android supports:

- low-bandwidth product and subscription state;
- explicit pending, failed, grace, past-due and cancelled states;
- retry-safe payment initiation without duplicate charges;
- restoration after process death;
- clear separation between payment status and provider trust status;
- accessible receipts and error recovery;
- no storage of sensitive payment credentials;
- external provider handoff only through an approved adapter.

## Mandatory research and approval before real payment integration

Before adding real mobile-money or card credentials, DIREKT still requires current verification of:

- provider availability and supported Zambia payment rails;
- settlement currency and timing;
- refund and reversal capabilities;
- webhook signing and retry semantics;
- transaction fees and minimums;
- account/KYC requirements;
- data residency and privacy terms;
- dispute and customer-support obligations;
- tax, invoicing and receipt requirements;
- consumer, payments and anti-money-laundering advice from qualified Zambia professionals;
- reconciliation and operational staffing.

The synthetic adapter establishes contracts before those approvals, and production configuration cannot enable it.

## Phase 9 entry checklist — satisfied before implementation

- [x] Phase 8 backend, Android, portal and documentation gates passed on one exact head;
- [x] PR #31 was merged;
- [x] Issue #30 was closed;
- [x] `PROJECT_STATUS.md` identified Phase 9 as the next authorized task;
- [x] `WORKSTREAM_LOCK.md` was released and explicitly claimed for Phase 9;
- [x] the Phase 8 interaction trust contract was treated as inherited architecture;
- [x] Phase 9 governing Issue #34 and checkpoint PR #35 were created;
- [x] no payment provider or credential was assumed without current approval.

## Phase 9 exit requirements

The Phase 9 checkpoint may be promoted only when:

- commercial migrations and ledger rules are forward-only and immutable where required;
- product, entitlement, subscription, invoice and payment states are explicit;
- idempotency, webhook replay and reconciliation are tested;
- payment and subscription cannot modify trust, publication or ranking;
- Android and portal critical states pass;
- no real credentials or production adapter are committed prematurely;
- decisions, risks and the Phase 10 security/legal handoff are current;
- all permanent workflows pass on one exact reviewed head;
- PR #35 is merged, Issue #34 is closed and the implementation branch is synchronized.

The detailed exit evidence is maintained in `docs/phase9/VALIDATION_PLAN.md` and `docs/phase9/COMMERCIAL_TRUST_CONTRACT.md`.
