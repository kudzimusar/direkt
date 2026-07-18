# DIREKT Project Status

**Updated:** 2026-07-18  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Programme state:** Phase 9 is complete and stable. Phase 10 implementation and managed exit evidence are complete; final documentation promotion, Issue #41 closure and branch synchronization remain administrative closeout actions before Phase 11 is claimed.

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

Issue #41 remains the sole tracker until final documentation promotion and branch synchronization. Phase 10 stages 10A–10I and the required managed synthetic/private-staging evidence are complete. The final managed source is `5d9313333c49d6501944e6ddba4cd408c540ff47`.

See `docs/phase10/PHASE10_CLOSEOUT_2026-07-18.md` for the authoritative managed evidence and retained Phase 11 entry stop gates.

### Infrastructure activation correction

Phase 10 explicitly permits:

- synthetic-only managed development infrastructure;
- protected staging infrastructure using synthetic or separately approved non-personal fixtures;
- exact-source Supabase activation and verification;
- immutable Cloud Run API deployment through GitHub OIDC;
- IAM-private Cloud Run operations-portal staging;
- Firebase internal tester distribution.

This does **not** authorize real participant/evidence data, unrestricted public invitations, a Zambia pilot, public promotion or production release.

## Bound infrastructure

| Service | Development binding |
|---|---|
| Supabase | project `direct-app`, ref `aeeuscifrxcjmnswqwnq`, region `ap-northeast-1` |
| Google Cloud | project `direkt-dev-502701`, region `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| Cloud Run API | `direkt-api` |
| Cloud Run portal | `direkt-operations-portal-staging` |
| Firebase | project `direkt-dev-502701`, tester group `direkt-internal-testers` |
| Vercel | explicitly excluded from the current Phase 10/Phase 11-entry path by programme decision |

### Supabase activation and restore state — complete

Protected activation, independent inspection and managed restore confirm:

- PostgreSQL 17 and PostGIS are active;
- 37 checksummed DIREKT migrations are recorded;
- all 13 DIREKT application schemas exist;
- all four required Storage buckets exist and are private;
- the Storage object count is zero for Phase 10 evidence;
- browser-facing roles have no direct DIREKT application-schema/table access;
- managed restore run `29641165494` passed clean restore, integrity, migration-ledger, forward-migration and restored API-readiness checks.

### Cloud Run managed staging state — complete

Final exact-source evidence on `5d9313333c49d6501944e6ddba4cd408c540ff47`:

- private deployment run `29647717734`: passed;
- independent staging inspection run `29647798494`: passed;
- managed operations run `29647821458`: passed.

The final chain verifies immutable images, bounded runtime identities, numeric Secret Manager versions, no public invokers, latest-created/latest-ready revision integrity, rollback and floating-`LATEST` recovery, portal-to-API kill switch and restoration, scale-to-zero/post-idle readiness, Cloud Monitoring alerting and temporary-Invoker cleanup.

Firebase internal distribution run `29635486574` also passed for internal debug testing only.

## Phase boundaries

- Phase 10: synthetic-only development/protected staging integration and hardening — managed evidence complete.
- Phase 11: consenting real participants and controlled Zambia pilot validation — separately entry-gated by legal/privacy/consent/owner/provider prerequisites.
- Phase 12: production backend/portal/Android release and public rollout.

Issue #5 remains open as a later, non-blocking Zambia pilot-validation obligation.