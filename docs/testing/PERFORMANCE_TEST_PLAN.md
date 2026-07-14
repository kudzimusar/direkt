# DIREKT Performance Test Plan

## Workloads

- provider search by category/area;
- provider profile/trust projection;
- evidence upload/finalization;
- verification queue;
- expiry batch;
- enquiry creation/notification;
- payment webhook burst;
- admin evidence view authorization.

## Data sets

Synthetic pilot, projected launch and stress sizes with realistic geometry, check history and reviews.

## Measures

Latency percentiles, throughput, errors, DB/query plan, queue age, CPU/memory, Android startup/frame/memory/data and third-party dependency impact.

## Gates

Targets begin in PRD/performance budgets and are refined after baseline. No optimization that weakens authorization, privacy or correctness.

## Resilience

Slow/failed map, SMS, payment, storage, notification and database failover/restart. Validate timeouts, backoff, circuit/degradation and no duplicate side effects.
