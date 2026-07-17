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

Stage 10A security architecture, Stage 10B route/permission enforcement, Phase 10 privacy/retention registers and the controlled staging repository foundation are implemented on the active branch. Storage verification, remaining abuse/reliability exercises, supply-chain review, provider approvals and checkpoint promotion remain in progress.

### Controlled staging boundary

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

| Service | Development/staging binding |
|---|---|
| Supabase | project ref `aeeuscifrxcjmnswqwnq`, region `ap-northeast-1` |
| Google Cloud | project `direkt-dev-502701`, region `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| Cloud Run API | `direkt-api` with `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com` |
| Cloud Run portal | `direkt-operations-portal-staging` with `direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com` |
| Firebase | project `direkt-dev-502701`, tester group `direkt-internal-testers` |
| Vercel | protected Preview/Staging project still requires its private API-calling and owner-side binding checkpoint |

The API and portal are private Cloud Run services. The portal runtime receives `roles/run.invoker` only on the API and uses a Google-signed audience token in `X-Serverless-Authorization` while preserving DIREKT application authorization.

## Staging repository checkpoint

The active Phase 10 branch now contains:

- non-root multi-stage API and Next.js standalone portal containers;
- minimal Docker contexts that exclude environment files, credentials, caches, tests and artifacts;
- a manual-only, WIF-authenticated two-service staging deployment workflow;
- immutable SHA image tags;
- minimum 0 and maximum 1 Cloud Run instance per service;
- pinned Secret Manager version variables and strict API/portal secret allowlists;
- a private service-to-service identity path;
- IAM checks rejecting public invocation bindings;
- a non-deploying readiness workflow that builds, migrates and smoke-tests both containers;
- a non-disclosing protected-literal review that classifies explicit synthetic fixtures separately.

No Cloud Run deployment has been triggered by these repository changes. Deployment remains a manual action after the exact reviewed source is merged to `main` and all required staging variables are present.

The workspace Supabase connector currently exposes only unrelated CarUp projects, so it cannot independently inspect DIREKT. The protected GitHub activation workflow remains the exact-project migration and verification authority; no unrelated project may be mutated.

## Phase boundaries

- Phase 10: synthetic-only development/IAM-protected staging integration and hardening.
- Phase 11: consenting real participants, real pilot evidence and controlled Zambia pilot validation.
- Phase 12: production backend/portal/Android release and public rollout.

Issue #5 remains open as a later, non-blocking Zambia pilot-validation obligation.
