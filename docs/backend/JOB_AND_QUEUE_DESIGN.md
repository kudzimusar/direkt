# DIREKT Job and Queue Design

## Job categories

- evidence scan/derivative;
- verification expiry/reminder;
- notification;
- search projection;
- payment webhook/reconciliation;
- analytics aggregation;
- retention/deletion;
- backup checks/integration health.

## Job envelope

- job ID/type/version;
- idempotency/business key;
- safe resource references;
- created/available time;
- attempt/max attempts;
- correlation/causation;
- priority;
- no large sensitive payload.

## Delivery semantics

Assume at-least-once delivery. Handlers are idempotent. Critical event publication uses transactional outbox.

## Retry

Classify:

- transient: exponential backoff/jitter;
- rate limited: provider-specified delay;
- invalid/permanent: no blind retry;
- unknown: bounded retry then dead letter.

## Dead letter

Alert, show operations queue, preserve safe context, support replay after remediation with audit.

## Scheduling

Expiry/retention jobs use UTC and tolerate duplicate execution. Large scans paginate and checkpoint.

## Metrics

queue depth/oldest age, attempts, failure, dead letter, handler latency and downstream errors.
