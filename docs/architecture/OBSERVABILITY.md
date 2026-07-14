# DIREKT Observability

## Objectives

Detect user-facing failure, verification backlog, integration failure, abuse and data-integrity risk without leaking sensitive data.

## Signals

### Logs
Structured JSON with correlation ID, environment, service, safe entity reference, outcome and latency. Redact tokens, document content, exact private coordinates and allegations.

### Metrics
- API request rate/error/latency;
- database pool/query;
- job queue age/failure;
- evidence processing;
- search success/latency;
- verification queue age/turnaround;
- notification delivery;
- payment/reconciliation;
- Android crash/ANR/startup;
- storage and backup.

### Traces
Cross API, database and integration calls using sampling and safe attributes.

### Audit
Separate immutable business/security audit for privileged actions.

## Alerts

Alert on user impact and actionable thresholds:

- authentication outage;
- search failure;
- evidence access anomaly;
- overdue high-risk verification;
- webhook/reconciliation backlog;
- backup failure;
- crash/ANR regression;
- suspicious privileged activity.

## Environment

No production personal data in lower environments. Production diagnostics require least privilege and access logging.

## Correlation

Expose a safe support reference to users; map it to internal traces without exposing internal stack details.
