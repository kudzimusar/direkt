# DIREKT RC1 — Resend Runtime Email Closure

**Governing issue:** #261  
**Checkpoint:** RC1  
**Source status:** `IMPLEMENTED_GATED / MANAGED CANARY PENDING`  
**Production/real-participant external email:** `DISABLED`

## Proven external preflight

- verified sending domain: `notify.direkt.forum`;
- Secret Manager: `direkt-resend-api-key`, version `1`, enabled;
- secret value is never stored in repository evidence.

External provisioning is not `ACTIVE` runtime evidence by itself.

## Source architecture

```text
approved domain event / synthetic canary
              |
              v
platform.outbox_events
              |
              v
EmailOutboxService
  - atomic claim / SKIP LOCKED
  - bounded attempts
  - stale-lock recovery
  - deterministic idempotency key
  - sanitized failure code
              |
              v
EmailProviderPort
  |-- DisabledEmailProviderAdapter
  `-- ResendEmailProviderAdapter
              |
              v
Resend HTTPS API
```

No Resend key enters Android, browser bundles or public environment variables. No Resend vendor SDK is required; the adapter uses the provider-neutral server-side port and native HTTPS fetch boundary.

## RC1 source controls

### Kill switch and data mode

- `EMAIL_PROVIDER_MODE=disabled|resend`;
- default is `disabled`;
- Resend may be enabled only with `DIREKT_DATA_MODE=synthetic-only` at this checkpoint;
- controlled-pilot and production data modes require external email to remain disabled;
- missing Resend credential fails environment validation when provider mode is enabled.

### Sender boundary

The current source contract permits Resend only from the verified sending domain:

```text
DIREKT <canary@notify.direkt.forum>
```

General production templates/senders are not authorized by RC1.

### Synthetic managed canary

The only source-controlled RC1 template is `synthetic_canary_v1` and the only canary recipient is Resend's delivered test sink:

```text
delivered@resend.dev
```

The managed canary contains no participant, evidence, contact, payment or production data.

### Idempotency and retry

- outbox event type: `communications.email.send.v1`;
- stable provider idempotency key is derived from the durable outbox event UUID;
- 408, 429 and 5xx provider failures are retryable;
- non-retryable provider rejection exhausts the bounded attempt budget;
- exponential retry delay is bounded;
- only sanitized failure codes are persisted, never provider response bodies;
- stale processing locks are recovered after a bounded timeout.

### Continuous delivery remains off

RC1 source adds an executable outbox consumer and a private managed canary path but does **not** add Cloud Scheduler, Pub/Sub, Cloud Tasks or a continuous worker schedule. Real application-event external delivery remains gated until the corresponding participant/privacy/legal/operations authorization exists.

## Managed Cloud Run Job proof

Workflow:

```text
.github/workflows/cloud-run-resend-canary.yml
```

The workflow:

1. accepts only an exact commit already merged to `main`;
2. re-runs backend validation;
3. authenticates to Google Cloud through WIF;
4. resolves enabled Secret Manager versions and converts them to numeric pins;
5. builds/pushes the exact immutable backend image;
6. deploys private Cloud Run Job `direkt-resend-canary` using `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com`;
7. binds only `DATABASE_URL` and `EMAIL_RESEND_API_KEY` as job secrets;
8. executes `node dist/communications/resend-canary.js` with one task, zero Cloud Run retries and a bounded timeout;
9. runs the actual application path: outbox insert → claim → Resend send → published state;
10. publishes only sanitized execution metadata.

The managed workflow is intentionally manual and unscheduled.

## Source-phase closure requirements

Before the source PR merges:

- backend format/lint/typecheck/tests/build/OpenAPI pass;
- integration-runtime verifier proves the RC1 source/runtime contract;
- Android/web/PWA/portal/database regressions remain green;
- current status and live integration ledger say `IMPLEMENTED_GATED / MANAGED CANARY PENDING`, not `ACTIVE`;
- no production/participant communication authorization changes.

## Managed-phase closure requirements

After the source PR merges:

1. verify the Resend key is least-privilege sending access and domain-restricted where supported;
2. verify/grant the Cloud Run runtime identity access to `direkt-resend-api-key` only as required;
3. dispatch the managed canary from the exact source merge SHA;
4. require Cloud Run Job execution success and durable outbox `published` evidence;
5. record job/execution/source/image/secret-version evidence without secret values;
6. update this document, `CURRENT_INTEGRATION_STATUS.md`, `LIVE_INTEGRATION_LEDGER.md` and `WORKSTREAM_LOCK.md` in the RC1 closure PR;
7. promote only the exact proven scope, for example `ACTIVE synthetic-only managed email canary`; do not claim real participant or production external communications.

## Stop conditions

Stop rather than promote RC1 if:

- the runtime key is broad/unreviewed and cannot be safely restricted;
- the runtime identity cannot receive least-privilege secret access;
- the canary contains non-synthetic data;
- retry/idempotency or outbox state is not durable;
- the provider response leaks into persisted error/telemetry data;
- any protected Android/backend/database/OpenAPI/web/portal gate regresses;
- the managed canary has not genuinely run successfully.
