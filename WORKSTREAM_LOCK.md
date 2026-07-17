# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED |
| Owner/agent | None |
| Phase | Phase 10 is next and unclaimed |
| Task | No active implementation task |
| Modules/paths | None reserved |
| Released at | 2026-07-17 after Phase 9 checkpoint promotion |
| Last stable checkpoint | `4c78e2419aa4eca225495acaac8e7e0ee81903f1` |
| Governing issue | None until Phase 10 is explicitly claimed |

## Stable predecessor

Phase 9 completed through PR #35 and Issue #34.

```text
Phase 9 exact reviewed head: 4a2694351b6c0fc03c63a1c97f463e0cb1d96e78
Phase 9 merge commit:       4c78e2419aa4eca225495acaac8e7e0ee81903f1
Issue #34:                  closed as completed
```

All Stage 9A–9G work is stable: commercial aggregates, subscriptions and entitlements, immutable invoices, synthetic-only payment contracts, signed/replay-safe webhooks, balanced append-only ledger entries, reconciliation, controlled adjustments, Android recovery, finance portal, permanent regressions and Phase 10 handoff.

## Next claim boundary

Phase 10 may be claimed only under `docs/phase10/HANDOFF_FROM_PHASE9.md` after a governing issue and checkpoint PR are created. It owns threat modelling, authorization review, private-storage testing, privacy/legal controls, abuse/rate limits, backup/restore, incident response, performance/soak and supply-chain/secret hardening.

The dedicated DIREKT Supabase project remains inaccessible through the current connector. No unrelated project may be mutated.

## Conflict rule

A second agent must not modify claimed paths while a lock is active. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.
