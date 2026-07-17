# DIREKT Project Status

**Updated:** 2026-07-17  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1` pending synchronization  
**Programme state:** Phase 9 is complete and stable. Phase 10 is the next documented phase and remains unclaimed.

## Stable checkpoints

| Phase | PR | Merge commit | Issue |
|---|---:|---|---:|
| Phase 4 verification/evidence | #21 | `d9078a78d3677a94a720de2d16483487594b261e` | #20 closed |
| Phase 5 customer discovery | #24 | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` | #23 closed |
| Phase 6 provider workspace | #26 | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` | #25 closed |
| Phase 7 operations workflow | #29 | `7ea8aa17dbced5f9e56dd259b15216223aa33921` | #28 closed |
| Phase 8 enquiries/interactions/reviews | #31 | `0182951cdc26a892b3423728bd843e2969b25bc0` | #30 closed |
| Phase 9 subscription/payment foundation | #35 | `4c78e2419aa4eca225495acaac8e7e0ee81903f1` | #34 closed |

## Phase 9 checkpoint

```text
Exact reviewed head: 4a2694351b6c0fc03c63a1c97f463e0cb1d96e78
Merge commit:       4c78e2419aa4eca225495acaac8e7e0ee81903f1
Issue #34:          closed as completed
```

All Stage 9A–9G capabilities are complete: isolated commercial aggregates, actor-scoped subscriptions and entitlements, immutable invoices, synthetic-only payment contracts, signed/replay-safe webhook processing, balanced append-only ledger entries, reconciliation, controlled adjustments, Android recovery states, API-only finance operations and permanent governance/testing records.

All permanent workflows passed on the reviewed head:

- backend/PostGIS run #1163;
- Android run #448;
- operations portal run #531;
- documentation run #1824.

The review queue is resolved. Additional permanent regressions cover conflicting webhook reuse, canonical processed-receipt integrity and adjustment invoice/payment relationship integrity.

## Boundaries

No real payment provider, real money movement, deployment or public pilot is authorized. Commercial state remains independent from verification, publication, ranking and accountability records.

The dedicated DIREKT Supabase project is not accessible through the current connector. No unrelated project was modified. Remote activation remains blocked until the correct project access is available.

## Next phase boundary

Phase 10 remains unclaimed. It owns security, privacy, legal and reliability hardening under `docs/phase10/HANDOFF_FROM_PHASE9.md`.

Issue #5 remains open as a later, non-blocking Zambia pilot-validation obligation.
