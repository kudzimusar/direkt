# DIREKT Cost Guardrails

## Objective

Prevent uncontrolled infrastructure and verification cost while preserving trust quality.

## Cost centres

Maps/geocoding, SMS/OTP, storage/egress, evidence processing, database/compute, notifications/email, monitoring, field visits, reviewer/support labour and payments.

## Controls

- budgets/alerts per environment;
- sandbox/staging quotas;
- map search debouncing/caching consistent with licence;
- SMS rate limits and fallback;
- image compression/derivatives;
- retention/lifecycle;
- queue batching;
- field visits only by requirement/risk;
- no approval incentive;
- per-provider/category unit-cost dashboard;
- vendor abstraction and contract review.

## Stop triggers

Unexpected daily spend, repeated OTP abuse, runaway job, map-key exposure, storage growth, verification backlog or negative unit economics.

## Pages

Use public Pages for static collaboration, not as a workaround for secure backend requirements.
