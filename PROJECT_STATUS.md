# DIREKT Project Status

**Updated:** 2026-07-17  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Programme state:** Phase 9 is complete and stable. Phase 10 is active under Issue #41 and checkpoint PR #42.

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

All Stage 9A–9G capabilities are stable and all permanent workflows passed on the reviewed head.

## Phase 10 implementation state

Issue #41 is the sole active tracker and PR #42 is the checkpoint PR. The single implementation lane is claimed on `build/android-v1`.

Stage 10A security architecture and the Stage 10B route/permission baseline are implemented on the active branch. Privacy, retention, legal, storage, abuse, reliability, supply-chain, provider approval and checkpoint work remain in progress.

### Infrastructure activation correction

Phase 10 now explicitly permits:

- synthetic-only managed development infrastructure;
- protected staging infrastructure using synthetic or separately approved non-personal fixtures;
- exact-source Supabase activation and verification;
- immutable Cloud Run API deployment through GitHub OIDC;
- protected, no-index Vercel Preview/Staging portal deployment;
- Firebase internal tester distribution.

This corrects the previous over-broad deployment prohibition. It does **not** authorize real participant/evidence data, unrestricted public invitations, a Zambia pilot, public promotion or production release.

## Bound infrastructure

| Service | Development binding |
|---|---|
| Supabase | project ref `aeeuscifrxcjmnswqwnq`, region `ap-northeast-1` |
| Google Cloud | project `direkt-dev-502701`, region `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| Cloud Run | `direkt-api` |
| Firebase | project `direkt-dev-502701`, tester group `direkt-internal-testers` |
| Vercel | protected Preview/Staging project still requires owner-side project binding and identifiers |

The workspace Supabase connector currently exposes only unrelated CarUp projects, so it cannot independently inspect the DIREKT project. The existing protected GitHub activation workflow remains the exact-project migration and verification authority; no unrelated project may be mutated.

## Phase boundaries

- Phase 10: synthetic-only development/protected staging integration and hardening.
- Phase 11: consenting real participants, real pilot evidence and controlled Zambia pilot validation.
- Phase 12: production backend/portal/Android release and public rollout.

Issue #5 remains open as a later, non-blocking Zambia pilot-validation obligation.
