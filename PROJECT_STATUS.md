# DIREKT Project Status

**Updated:** 2026-07-17  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Programme state:** Phase 8 is complete and stable. Phase 9 is active under Issue #34 on the single implementation lane.

## Stable checkpoints

| Phase | PR | Merge commit | Issue |
|---|---:|---|---:|
| Phase 4 verification/evidence | #21 | `d9078a78d3677a94a720de2d16483487594b261e` | #20 closed |
| Phase 5 customer discovery | #24 | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` | #23 closed |
| Phase 6 provider workspace | #26 | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` | #25 closed |
| Phase 7 operations workflow | #29 | `7ea8aa17dbced5f9e56dd259b15216223aa33921` | #28 closed |
| Phase 8 enquiries/interactions/reviews | #31 | `0182951cdc26a892b3423728bd843e2969b25bc0` | #30 closed |

## Phase 8 checkpoint

Phase 8 completed through PR #31 and Issue #30.

```text
Phase 8 exact reviewed head: 380687bf8044bc44ec1f70c58e4b71c6b3e3c6a7
Phase 8 merge commit:       0182951cdc26a892b3423728bd843e2969b25bc0
Issue #30:                  closed as completed
```

## Phase 9 implementation state

Issue #34 is the sole active implementation tracker. The checkpoint PR will remain open until Stage 9A–9G criteria and exact-head validation are complete.

| Stage | State | Planned capability |
|---|---|---|
| 9A — foundation, products and permissions | Active | isolated commercial schema, catalogue, prices and permission families |
| 9B — subscriptions and entitlements | Planned | actor-resolved lifecycle, optimistic revisions and bounded grants |
| 9C — invoices and synthetic payment intents | Planned | immutable minor-unit invoices, receipts and retry-safe disabled/synthetic adapter |
| 9D — webhooks, ledger and reconciliation | Planned | signature/replay controls, append-only ledger and exception queue |
| 9E — grace and exception controls | Planned | deterministic grace, failure/recovery, adjustments and four-eyes controls |
| 9F — Android and portal experiences | Planned | low-bandwidth native states and API-only operations workspaces |
| 9G — checkpoint promotion | Planned | permanent regression, documentation, exact-head gates, review, merge and synchronization |

## Phase 9 boundaries

No real payment provider, payment credential, customer/provider money movement, deployment or public pilot is authorized. The implementation uses explicit disabled and synthetic adapter modes only.

Products, entitlements, subscriptions, invoices, payments, receipts, webhooks, ledger entries and reconciliation cases remain separate from verification, discovery publication, ranking, reviews, complaints, appeals and incidents. Payment success cannot create a claim, publish a provider, improve discovery order or suppress accountability records.

Provider-commercial mutations resolve one active provider workspace from server-side assignments. Client-supplied provider identifiers cannot establish authorization. Retryable operations store only hashed idempotency keys and request fingerprints. Material ledger and commercial history are append-only.

## Supabase execution status

The supplied DIREKT project reference is `aeeuscifrxcjmnswqwnq`. The current Supabase connector cannot access that project and exposes only unrelated CarUp projects, so no live database changes will be sent to Supabase. Forward migrations and clean PostgreSQL/PostGIS CI are authoritative until the correct project is connected and permission is verified.

## Current Phase 9 work

1. define commercial schema, state machines, permissions and safe projections;
2. implement NestJS products, subscriptions, entitlements, invoices, payment intents, webhook and reconciliation contracts;
3. replace the provider subscription placeholder and add Android commercial recovery states;
4. add API-only operations commercial workspaces;
5. add permanent cross-domain, privacy, idempotency, ledger and accessibility regressions;
6. update OpenAPI, decision, risk, commercial trust and Phase 10 handoff documentation;
7. validate one exact reviewed head, merge, close Issue #34 and synchronize the implementation branch.

## Next phase boundary

Phase 10 remains unclaimed. It owns security, privacy, legal and reliability hardening, including threat modelling, abuse controls, backup/restore, incident response, performance, secret/dependency scanning and qualified Zambia legal/payment-provider approval.

Issue #5 remains open as a later, non-blocking Zambia pilot-validation obligation.
