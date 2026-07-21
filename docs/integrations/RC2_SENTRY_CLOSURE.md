# RC2 Sentry Runtime Closure

**Checkpoint:** RC2 — Sentry API and operations portal runtime observability  
**Governing issue:** #261  
**Source integration:** PR #275, merged at `15210c5b0bf1832e32f8c33a7618c69f61f65275`  
**Managed-proof dispatch merge:** PR #279, merged at `035f4e8ff60a6e571d7aa09c0eaedb831c73648b`  
**Status:** CLOSED — ACTIVE FOR THE APPROVED SYNTHETIC-ONLY MANAGED BOUNDARY

## Proven runtime boundary

RC2 now has source, regression and managed execution evidence for the approved NestJS API and private Next.js operations portal Sentry surfaces.

The managed proof executed the existing `cloud-run-sentry-canary.yml` workflow from exact merged `main` source through the one-shot source-controlled authorization path. Issue #261 contains the sanitized dispatch and final **success** receipts for `035f4e8ff60a6e571d7aa09c0eaedb831c73648b`.

The proof covered:

- separate API and operations-portal Sentry projects/DSNs;
- enabled numeric Secret Manager versions only;
- API and portal runtime service identities;
- immutable images tied to the exact source SHA;
- API synthetic exception capture, event identifier and flush;
- private portal synthetic exception capture, event identifier and flush;
- temporary portal invocation grant removal and post-run IAM verification;
- no Sentry auth token in application runtime;
- `sendDefaultPii=false` and minimized telemetry defaults;
- no traces, logs, breadcrumbs, local variables or replay enabled by this checkpoint;
- Cloud Logging/Monitoring retained as authoritative infrastructure telemetry.

## Privacy and authority boundary

RC2 remains intentionally narrow:

- `SENTRY_MODE` is fail-closed and the proved activation requires `DIREKT_DATA_MODE=synthetic-only`;
- `SENTRY_RELEASE` must be an exact 40-character source commit SHA;
- raw evidence, tokens, cookies, raw contacts, exact private coordinates and unnecessary free text must not be sent to Sentry;
- Sentry cannot become authorization, trust, verification, payment, publication or dispute authority;
- Android Sentry is not activated; Android crash/ANR ownership moves to RC3 Firebase Crashlytics;
- real participant telemetry and production restricted-data telemetry require a separate reviewed privacy/data-use decision and new managed evidence.

## Regression evidence

The RC2 source exact head passed the required backend, backend-container, integration audit, operations portal, PWA/W4/W7/W8, supply-chain, staging, recovery and Phase 11 synthetic gates before source promotion.

The temporary one-shot dispatcher/authorization marker was separately regression-verified in PR #279 before merge. It is removed as part of RC2 closure so it cannot become an uncontrolled recurring deployment path.

## Handoff

RC2 is closed for the synthetic-only managed boundary. The next dependency-safe checkpoint is **RC3 — Firebase Crashlytics Android activation**, which must claim a fresh bounded lane from current `main` and preserve all existing Android, privacy, release, Play/Data Safety and VC1–VC8 regressions.

This closure does not authorize real participants, production communications, real money, Phase 11 exit or Phase 12 production release.
