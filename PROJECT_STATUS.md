# DIREKT Project Status

**Updated:** 2026-07-18  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Programme state:** Phase 9 is complete and stable. Phase 10 is technically hardened in repository/CI but remains active and blocked from Phase 11 by managed-integration and external-approval gates.

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

Issue #41 is the sole active tracker and PR #42 is the checkpoint PR. The single implementation lane remains claimed on `build/android-v1`.

The repository-side implementation for Stages 10A–10G is substantially complete: authorization and tenant boundaries, privacy/retention controls, private storage adapters, distributed abuse controls, location minimization, backup/restore and outage recovery, performance budgets, secret scanning, dependency auditing and private staging controls are implemented.

A representative exact technical checkpoint, `3a387e31626f0669f33ca464b428492694df8c32`, passed nine permanent workflows together:

- documentation quality;
- backend CI and backend container CI;
- operations portal CI;
- Android CI;
- staging container readiness;
- recovery/reliability exercise;
- supply-chain security;
- Android performance budget.

Phase 10 is **not complete** because managed activation, final external approvals, operational exercises and checkpoint promotion remain open. Phase 11 has not started.

## Technical evidence checkpoint

- PostgreSQL/PostGIS restore: 118/118 tables, 1/1 synthetic identities, PostGIS 3.6.4 and integrity sentinel preserved.
- Restore duration: 2 seconds in the synthetic CI exercise; zero synthetic sentinel loss.
- Dependency outage: readiness failed closed and recovered after dependency return.
- API recovery soak: 600/600 requests, concurrency 10, p95 15 ms, maximum 173 ms.
- API container soak: 300/300, p95 10 ms, maximum 125 ms.
- Portal-through-API soak: 300/300, p95 23 ms, maximum 70 ms.
- Android debug APK: 11,676,451 bytes.
- Android API 35 cold launch: median 3,358 ms, p95 4,777 ms.
- Supply chain: locked installs, protected-literal scan, Gradle resolution and zero high/critical npm audit findings pass.

## Controlled staging boundary

Phase 10 permits:

- synthetic-only managed development infrastructure;
- IAM-protected staging using synthetic/non-personal fixtures;
- exact-source Supabase activation and verification;
- immutable Cloud Run images and revisions through GitHub OIDC;
- private API and operations-portal Cloud Run services;
- protected, no-index Vercel Preview/Staging integration after its private API calling design is approved;
- Firebase internal tester distribution.

This does **not** authorize real participant/evidence data, unrestricted public invocation, public invitations, a Zambia pilot, public promotion or production release.

## Bound infrastructure

| Service | Development/staging binding | Current evidence state |
|---|---|---|
| Supabase | project ref `aeeuscifrxcjmnswqwnq`, region `ap-northeast-1` | Repository integration exists; connected tool does not expose the exact project, so remote activation remains unverified |
| Google Cloud | project `direkt-dev-502701`, region `asia-northeast1` | Identity and deployment contracts exist; final private staging readiness remains unrecorded |
| Artifact Registry | `direkt-containers` | Immutable SHA tagging is implemented |
| Cloud Run API | `direkt-api` with `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com` | Private deployment reached GCP previously; successful final readiness still required |
| Cloud Run portal | `direkt-operations-portal-staging` with `direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com` | Private two-service workflow implemented; manual managed run still required |
| Firebase | project `direkt-dev-502701`, tester group `direkt-internal-testers` | Final internal distribution evidence absent |
| Vercel | protected Preview/Staging project | Owner binding/private API evidence absent |

The API and portal design keeps both Cloud Run services private. The portal runtime receives `roles/run.invoker` only on the API and uses a Google-signed audience token in `X-Serverless-Authorization` while preserving DIREKT application authorization.

## Remaining Phase 10 gates

1. Expose and verify exact Supabase project `aeeuscifrxcjmnswqwnq`; apply migrations and private-bucket checks through the protected activation workflow.
2. Merge the exact reviewed source to `main`, configure approved staging variables and run the manual private Cloud Run deployment/smoke workflow.
3. Record managed rollback, scale-to-zero, kill-switch, restore and incident-tabletop evidence.
4. Complete or explicitly exclude protected Vercel and Firebase evidence according to the authoritative plan.
5. Obtain qualified Zambia legal, privacy, authority, payment, tax and provider findings; keep unapproved adapters disabled.
6. Review and merge PR #42, close Issue #41 and synchronize long-lived branches without force-pushing.

## Phase boundaries

- Phase 10: synthetic-only development/IAM-protected staging integration and hardening.
- Phase 11: consenting real participants, real pilot evidence and controlled Zambia pilot validation, only after the blocked handoff checklist is satisfied.
- Phase 12: production backend/portal/Android release and public rollout.

Issue #5 remains open as a later, non-blocking Zambia pilot-validation obligation.
