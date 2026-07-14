# DIREKT Service Level Objectives

Final values require pilot baselines.

## Candidate production SLOs

- public API availability: 99.5% monthly initially;
- search successful responses: 99.0% excluding invalid requests;
- common API read p95: <500 ms server time;
- search p95: <1.5 s server-side planned load;
- critical notification job age: <5 minutes p95;
- high-risk report acknowledgment: defined staffed target;
- verification SLA: category/queue-specific, published carefully;
- backup success: 100% scheduled, restore exercise pass.

## Error budgets

Use to control release pace. Trust/privacy incidents override normal error-budget logic.

## Dependency exclusions

Track third-party outage separately but still design user-visible degradation and provider escalation.
