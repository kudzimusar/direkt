# W8 Managed Public Functional Web Main Trigger

Purpose: dispatch the reviewed W8 public synthetic-only functional browser/BFF cutover from trusted `main` against this exact merged source.

Attempt: 3 — valid dedicated runtime identity prerequisite confirmed by owner. Expected runtime identity: `direkt-cp-web-runtime@direkt-dev-502701.iam.gserviceaccount.com`. The deployment workflow may verify and attach this pre-provisioned identity, grant only the bounded service-level API invoker permission, and must fail closed on unsuccessful cutover.

Scope: evidence trigger only. No Android, canonical API public exposure, real participant, external-provider, payment, Phase 11 exit or formal production-release authorization change.
