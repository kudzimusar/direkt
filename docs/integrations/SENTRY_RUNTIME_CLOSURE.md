# DIREKT RC2 — Sentry Runtime Observability Closure

**Governing issue:** #261  
**Checkpoint:** RC2  
**Source merge:** `15210c5b0bf1832e32f8c33a7618c69f61f65275`  
**Managed state:** `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY`  
**Participant/production Sentry telemetry:** `DISABLED`

## Runtime surfaces

- NestJS API → Sentry project `direkt-api`
- private Next.js operations portal → Sentry project `direkt-operations-portal`
- Android → not Sentry; RC3 retains Firebase Crashlytics ownership
- Cloud Logging / Monitoring remains authoritative infrastructure telemetry

## Secret boundary

- `direkt-sentry-api-dsn` — version 1 enabled; API runtime only
- `direkt-sentry-portal-dsn` — version 1 enabled; portal runtime only
- `direkt-sentry-auth-token` — version 2 enabled; CI/release tooling only; never application runtime

No secret values are recorded here.

## Privacy and telemetry controls

RC2 source enforces:

- `sendDefaultPii=false`
- tracing sample rate `0`
- Sentry SDK logs disabled
- breadcrumbs disabled
- local-variable capture disabled
- Session Replay/browser telemetry not enabled
- user/context/extra/request payload minimization
- contact/email/phone redaction
- token/JWT/credential redaction
- precise/private-coordinate redaction
- exact 40-character source SHA release binding
- fail-closed activation outside `DIREKT_DATA_MODE=synthetic-only`

Source-map upload is not enabled as a general application-runtime capability in RC2. The Sentry auth token remains reserved to controlled CI/release tooling and is not injected into API or portal runtime.

## Managed canary receipt

Workflow:

`DIREKT managed Sentry synthetic canary #1`

Result:

`SUCCESS`

Duration:

`4m15s`

Exact source:

`15210c5b0bf1832e32f8c33a7618c69f61f65275`

The workflow proved both isolated Sentry surfaces:

1. private Cloud Run Job `direkt-sentry-api-canary`
   - runtime identity: `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com`
   - numeric `direkt-sentry-api-dsn` version only
   - synthetic API exception captured
   - event ID validated
   - Sentry flush succeeded

2. IAM-private Cloud Run service `direkt-sentry-portal-canary`
   - runtime identity: `direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com`
   - numeric `direkt-sentry-portal-dsn` version only
   - `--no-allow-unauthenticated`
   - temporary deployer invoker permission used only for the canary and removed afterward
   - synthetic portal exception captured
   - event ID validated
   - Sentry flush succeeded

The workflow explicitly verifies that `direkt-sentry-auth-token` is not bound to either runtime.

## Promotion boundary

RC2 proves only synthetic managed observability.

It does **not** authorize:

- real participant telemetry
- production Sentry ingestion
- raw request bodies
- contact/evidence payloads
- exact private coordinates
- tokens/cookies/auth headers
- browser Session Replay
- Android Sentry
- production release

Any broader telemetry data class requires a separate privacy/data-use review and explicit activation gate.

## Next checkpoint

RC3 — Firebase Crashlytics Android activation with privacy/release mapping and synthetic crash/ANR evidence.
