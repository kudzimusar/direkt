# DIREKT Project Status

**Updated:** 2026-07-17  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Programme state:** Phase 9 is complete and stable. Phase 10 is active under Issue #41 on the single implementation lane.

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

Issue #41 is the sole active implementation tracker. The Phase 10 checkpoint PR remains open until every hardening stage and exact-head exit criterion is satisfied.

| Stage | State | Planned capability |
|---|---|---|
| 10A — threat model and security architecture | Active | assets, data flows, abuse cases, mitigations and baseline security review |
| 10B — authorization and tenant isolation | Planned | permission matrix, scope denial, escalation review and step-up boundaries |
| 10C — privacy, retention and legal controls | Planned | data inventory, lifecycle rights, consent/policy mapping and Zambia stop gates |
| 10D — private storage and evidence access | Planned | exact-environment verification, bucket/grant tests, scanning/redaction and recovery scope |
| 10E — abuse and operational safeguards | Planned | distributed rate limits, enumeration/spam/replay controls, queue ageing and kill switches |
| 10F — reliability, recovery and performance | Planned | backup/restore, incident exercise, queue recovery, budgets, soak and outage handling |
| 10G — supply-chain, secret and configuration | Planned | dependency/secret scans, build/environment review, rotation and fail-closed configuration |
| 10H — provider and authority approvals | Planned | current map, communications, payment, registry, legal and staffing evidence or stop gates |
| 10I — checkpoint promotion | Planned | permanent regressions, Phase 11 handoff, review, exact-head gates, merge and synchronization |

## Current boundaries

No real participant or evidence data, real money movement, deployment or public pilot is authorized. Phase 10 must preserve all Phase 4–9 trust, privacy, interaction, accountability and commercial invariants.

The dedicated DIREKT Supabase project remains inaccessible through the current connector. No unrelated project may be modified. Remote activation remains blocked until exact project access is verified.

## Next work

1. complete Stage 10A threat model and security architecture baseline;
2. inventory route/function authorization and tenant isolation;
3. implement permanent hardening controls and tests in documented stage order;
4. record external approval gaps as stop gates rather than assumptions;
5. validate and promote one exact reviewed Phase 10 checkpoint.

Issue #5 remains open as a later, non-blocking Zambia pilot-validation obligation.
