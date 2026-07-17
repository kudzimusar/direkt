# Phase 9 Handoff from Phase 8

**Next planned phase:** Phase 9 — Subscription and payment foundation  
**Predecessor:** Phase 8 — Enquiries, interactions and reviews  
**Authorization state:** Unclaimed until the Phase 8 checkpoint is merged and the workstream lock is released.

## Stable capabilities inherited from Phase 8

Phase 9 may rely on these domain contracts after the Phase 8 checkpoint is promoted:

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

Phase 9 must preserve these invariants rather than rebuilding or bypassing them.

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

Phase 9 should introduce separate aggregates instead of adding payment columns to interaction, verification or publication tables.

Recommended module boundaries:

```text
commercial.products
commercial.subscriptions
commercial.entitlements
commercial.invoices
commercial.payments
commercial.webhook_receipts
commercial.ledger_entries
commercial.reconciliation_cases
commercial.commercial_events
```

Names may change during design, but the separation must remain explicit.

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

Commercial actions must use the same active actor-resolved provider scope established before Phase 8. A client-supplied provider identifier may identify a resource but cannot establish authorization.

If one identity has zero or multiple active provider workspaces, any provider-commercial mutation must fail until the API resolves an unambiguous server-owned context or a separately approved secure context-selection contract exists.

## Idempotency and webhook rules

Every external or retryable commercial mutation must use a stable logical idempotency contract.

Minimum requirements:

- store only hashed idempotency keys;
- bind the key to a request fingerprint;
- replay an identical request without duplicating money movement;
- reject key reuse with different content;
- record external event/provider identifiers as unique values;
- verify webhook signatures before parsing state changes;
- persist the raw webhook only in an approved private, encrypted and retention-controlled location;
- make ledger entries append-only;
- reconcile provider reports, internal ledger and settlement records;
- route unresolved mismatches to an operations exception queue.

## Entitlement boundary

An entitlement may control commercial product access, limits or presentation features. It must never create evidence-backed trust.

Acceptable examples may include:

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

Phase 9 may read safe interaction aggregates only when a product requirement justifies them. Examples could include metered enquiry counts or support context, but such use requires:

- a documented product purpose;
- privacy minimization;
- no customer identity/contact leakage into commercial projections;
- no change to review eligibility;
- no change to complaint rights;
- no ranking or verification effect;
- explicit retention and audit policy.

Phase 9 should not write to Phase 8 lifecycle tables except through existing approved APIs for genuinely interaction-owned actions.

## Operations portal additions

Commercial operations require new permission families and separate workspaces. They must not reuse trust-review, review-moderation or complaint-management permissions.

Suggested permission boundaries:

- `commercial.products.read` / `commercial.products.manage`;
- `commercial.subscriptions.read` / `commercial.subscriptions.manage`;
- `commercial.invoices.read`;
- `commercial.payments.read`;
- `commercial.reconciliation.read` / `commercial.reconciliation.manage`;
- `commercial.refunds.request` / `commercial.refunds.approve` where legally supported.

Four-eyes approval should be considered for high-risk adjustments, refunds or ledger corrections. Direct ledger edits must remain prohibited.

## Android additions

The inherited synthetic subscription-status placeholder may be replaced only after backend contracts and permissions exist.

Android must support:

- low-bandwidth product and subscription state;
- explicit pending, failed, grace and cancelled states;
- retry-safe payment initiation without duplicate charges;
- restoration after process death;
- clear separation between payment status and provider trust status;
- accessible receipts and error recovery;
- no storage of sensitive payment credentials;
- external provider handoff only through an approved adapter.

## Mandatory research and approval before real payment integration

Before adding real mobile-money or card credentials, Phase 9 requires current verification of:

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

A synthetic adapter may establish contracts before those approvals, but it must be impossible to enable in production accidentally.

## Phase 9 entry checklist

Phase 9 may be claimed only after:

- [ ] Phase 8 backend, Android, portal and documentation gates pass on one exact head;
- [ ] PR #31 is merged;
- [ ] Issue #30 is closed;
- [ ] `PROJECT_STATUS.md` identifies Phase 9 as the next authorized task;
- [ ] `WORKSTREAM_LOCK.md` is released and then explicitly claimed for Phase 9;
- [ ] the Phase 8 interaction trust contract is treated as inherited architecture;
- [ ] a Phase 9 governing issue and checkpoint PR exist;
- [ ] no payment provider or credential is assumed without current approval.

## Phase 9 exit preview

A future Phase 9 checkpoint should not be promoted until:

- commercial migrations and ledger rules are forward-only and immutable where required;
- product, entitlement, subscription, invoice and payment states are explicit;
- idempotency, webhook replay and reconciliation are tested;
- payment and subscription cannot modify trust/publication/ranking;
- Android and portal critical states pass;
- no real credentials or production adapter are committed prematurely;
- decisions, risks and the Phase 10 security/legal handoff are current;
- all permanent workflows pass on one exact reviewed head.
