# DIREKT Deployment Runbook

## Pre-deploy

Confirm approved commit, CI, change log, migrations, configuration/secrets, backup, dependency health, rollback and on-call ownership.

## Backend/admin deployment

1. announce window if needed;
2. verify current production state;
3. take/confirm backup;
4. apply backward-compatible migration;
5. deploy workers/API/admin in planned order;
6. run health/readiness and synthetic smoke;
7. inspect errors/queues;
8. complete post-deploy migration/backfill if approved;
9. record deployment.

## Failure

Stop, prevent additional writes if integrity risk, roll back application or forward-fix schema according to plan, declare incident if thresholds met. Do not blindly down-migrate production.

## Post-deploy

Monitor SLOs, jobs, search, evidence access, enquiry and payment. Update status and release record.
