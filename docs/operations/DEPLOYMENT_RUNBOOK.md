# DIREKT Deployment Runbook

## Authorized deployment classes

Phase 10 authorizes synthetic-only managed development and protected staging deployments. Phase 11 separately authorizes a controlled Zambia pilot; Phase 12 separately authorizes production. A development URL must not be described or promoted as a pilot or production service.

## Development pre-deploy

1. select an exact reviewed 40-character source commit;
2. confirm permanent backend/portal/documentation checks for that source or run them inside the deployment workflow;
3. verify the target project, region, service and environment names;
4. verify GitHub OIDC/Workload Identity Federation and least-privilege service accounts;
5. verify Secret Manager references exist without reading or printing values;
6. confirm Supabase migrations and private buckets against project `aeeuscifrxcjmnswqwnq`;
7. confirm synthetic-only data mode, payment disabled and no real participant/evidence data;
8. record the current Cloud Run revision and portal deployment for rollback;
9. confirm an owner for monitoring and rollback during the window.

## Supabase development activation

Run the manual workflow `DIREKT Supabase development activation` from `main` with:

```text
confirmation: ACTIVATE-DIREKT-DEVELOPMENT
source_sha: <exact reviewed commit>
```

The workflow must verify the immutable project ref, Tokyo region, migrations, PostGIS, private buckets and advisors and retain sanitized evidence.

## Cloud Run development deployment

Run `DIREKT Cloud Run development deployment` from `main` with:

```text
confirmation: DEPLOY-DIREKT-DEVELOPMENT
source_sha: <exact reviewed commit>
access_mode: private | public-synthetic
portal_origin: <required HTTPS Vercel origin only for public-synthetic>
```

Use `private` by default. Use `public-synthetic` only for a protected Vercel integration that still relies on DIREKT application authentication/authorization and contains no real data. The workflow builds an immutable SHA-tagged image, deploys Secret Manager references, performs readiness checks and records the revision.

## Vercel Preview/Staging

- root directory: `admin/direkt-operations-portal`;
- deployment protection enabled;
- Preview or protected custom Staging environment only;
- `DIREKT_API_BASE_URL` points to the approved Cloud Run development API;
- `NEXT_PUBLIC_APP_ENV=development`;
- no database, Supabase server or provider credentials;
- no indexing or public production custom domain;
- `/api/health` must report ready before use.

## Post-deploy

1. verify API liveness/readiness and portal health;
2. verify environment/data-mode labels and no-index headers;
3. run synthetic login, provider scope, private evidence, enquiry and commercial smoke paths appropriate to the source;
4. inspect Cloud Run, Supabase and Vercel logs for redaction and errors;
5. confirm queues/reconciliation are bounded;
6. record source SHA, image/revision, portal deployment, smoke result and owner;
7. keep the previous immutable revision available for rollback.

## Rollback and kill switch

- route Cloud Run traffic back to the prior healthy immutable revision or set service ingress/IAM to block invocation;
- disable the Vercel deployment or restore deployment protection;
- set external adapters to disabled and revoke environment-specific credentials where exposure is suspected;
- stop further database writes when integrity is at risk;
- use forward schema correction rather than blind production-style down migrations;
- declare an incident when security, privacy, integrity or availability thresholds are met;
- document containment, recovery and follow-up tests.

## Production boundary

No production deployment is authorized by this runbook until Phase 12. Production requires current legal/provider approvals, real-data privacy controls, tested restore, monitoring, staffing, rollback, signed Android release and explicit environment approval.
