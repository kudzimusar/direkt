# DIREKT Deployment Runbook

## Authorized deployment classes

Phase 10 authorizes synthetic-only managed development and IAM-protected staging. Phase 11 separately owns the controlled Zambia pilot; Phase 12 separately owns production. A staging URL must not be described or promoted as a pilot or production service.

## Staging pre-deploy

1. select an exact reviewed 40-character source commit already merged to `main`;
2. confirm permanent backend, portal, documentation and staging-container readiness checks;
3. verify repository variables resolve the approved project, region, registry, services and runtime identities;
4. verify GitHub OIDC/Workload Identity Federation; do not create a service-account JSON key;
5. verify pinned numeric Secret Manager versions without reading or printing secret values;
6. confirm Supabase migrations/private buckets against project ref `aeeuscifrxcjmnswqwnq`;
7. confirm synthetic-only data mode, payment disabled and no real participant/evidence data;
8. record current API and portal revisions for rollback;
9. confirm monitoring and rollback ownership for the deployment window.

## Supabase development activation

Run `DIREKT Supabase development activation` from `main` with:

```text
confirmation: ACTIVATE-DIREKT-DEVELOPMENT
source_sha: <exact reviewed commit>
```

The workflow verifies immutable project identity, region, migrations, PostGIS, private buckets and sanitized advisor evidence.

## Container readiness before deployment

`DIREKT controlled staging container readiness` runs automatically for relevant source changes and may also be dispatched manually. It does not authenticate to Google Cloud or deploy anything.

Required evidence:

- both images build from committed lockfiles;
- disposable PostGIS receives all migrations;
- API and portal honor non-default `PORT` values;
- both containers run as non-root;
- API liveness/readiness succeeds;
- portal health reaches the API over the container network;
- protected-literal review reports no violations;
- sanitized artifact records `deploymentTriggered: false`.

## Cloud Run staging deployment

Run `DIREKT controlled Cloud Run staging deployment` from `main` with:

```text
confirmation: DEPLOY-DIREKT-STAGING
source_sha: <exact reviewed commit already merged to main>
```

The workflow is manual-only and uses the GitHub `staging` Environment. It:

1. authenticates through Workload Identity Federation variables;
2. builds API and portal images tagged only with the exact commit SHA;
3. pushes both images to the configured Artifact Registry;
4. deploys `direkt-api` and `direkt-operations-portal-staging` with minimum 0 and maximum 1 instance;
5. attaches only the documented API seven-secret allowlist and the portal cookie secret;
6. never attaches the administrative direct-database secret;
7. disables unauthenticated invocation for both services;
8. grants the portal runtime identity `roles/run.invoker` only on the API;
9. verifies no broad/public invocation member exists;
10. verifies runtime identities, secret names and pinned versions;
11. tests API readiness with a deployer identity token;
12. tests portal health, which uses the portal runtime audience token to reach the API.

There is no public or unauthenticated Phase 10 deployment mode.

## Private portal-to-API path

The portal requests a Google-signed ID token from the Cloud Run metadata server with the API service URL as audience. It sends that token in `X-Serverless-Authorization` and preserves the DIREKT application bearer token in `Authorization`.

Cloud Run identity is an additional platform boundary; application session, role, permission and provider-scope checks remain mandatory.

## Vercel Preview/Staging

Vercel remains a later protected portal target with:

- root directory `admin/direkt-operations-portal`;
- deployment protection and no indexing;
- portal-only server configuration;
- no database, Supabase server or provider credentials.

A Vercel-hosted portal must not make the API publicly invokable. Its private API calling mechanism must be reviewed and proven before it replaces or supplements the Cloud Run portal staging service.

## Post-deploy

1. verify API liveness/readiness and portal health;
2. verify no public IAM binding exists;
3. verify environment/data-mode labels and no-index headers;
4. run synthetic login, provider scope, private evidence, enquiry and commercial smoke paths appropriate to the source;
5. inspect Cloud Run and Supabase logs for redaction and errors;
6. confirm queues/reconciliation remain bounded;
7. record source SHA, image digests/revisions, smoke result and owner without secret values;
8. retain the previous immutable revision for rollback.

## Rollback and kill switch

- route traffic to the prior healthy immutable revision or block invocation through IAM/ingress;
- disable the portal revision if API integrity is uncertain;
- set external adapters to disabled and revoke environment-specific credentials where exposure is suspected;
- stop further writes when integrity is at risk;
- use forward schema correction rather than blind down-migrations;
- declare and document an incident when security, privacy, integrity or availability thresholds are met.

## Production boundary

No production deployment is authorized by this runbook until Phase 12. Production requires current legal/provider approvals, real-data privacy controls, tested restore, monitoring, staffing, rollback, signed Android release and explicit production approval.
