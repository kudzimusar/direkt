# Phase 10 Infrastructure Activation Contract

**Status:** Authorized controlled development and staging integration boundary  
**Governing issue:** #41  
**Checkpoint PR:** #42  
**Data mode:** Synthetic-only until Phase 11 separately authorizes a controlled pilot

## 1. Purpose

Phase 10 requires managed infrastructure to prove private storage, deployment, identity, backup, restore, monitoring, security and performance controls. Remotely reachable development or staging services are therefore allowed when they are IAM-restricted, synthetic-only and never represented as a public pilot or production service.

This contract distinguishes infrastructure availability from participant access:

- Phase 10 may build, push and deploy controlled synthetic staging;
- Phase 11 owns consenting real participants and controlled Zambia pilot data;
- Phase 12 owns production/public release.

## 2. Deployment classes

| Class | Owner phase | Data | Audience | Status |
|---|---|---|---|---|
| Local/emulated | Phases 0–10 | synthetic | developers | allowed |
| Managed development | Phase 10 | synthetic only | repository agents and named internal testers | allowed |
| IAM-protected staging | Phase 10 | synthetic/non-personal fixtures only | named team members with explicit cloud access | allowed |
| Controlled Zambia pilot | Phase 11 | consented pilot data | approved pilot cohort | prohibited until Phase 11 entry gates pass |
| Production | Phase 12 | approved real data | public users and operations staff | prohibited until Phase 12 release gates pass |

An internet-addressable URL does not make a service public when Cloud Run IAM still rejects unauthenticated invocation. Phase 10 prohibits public invocation bindings, search indexing, unrestricted invitations, real participant processing and production claims.

## 3. Bound infrastructure

### Supabase development

| Field | Value |
|---|---|
| Project display name | `direct-app` (informational) |
| Immutable project ref | `aeeuscifrxcjmnswqwnq` |
| URL | `https://aeeuscifrxcjmnswqwnq.supabase.co` |
| Region | `ap-northeast-1` |
| Use | PostgreSQL/PostGIS and private object storage |

The backend remains the only privileged Supabase client. Android and browser code receive no database URL, secret key or service-role credential.

Required private buckets:

- `provider-evidence`;
- `provider-media-private`;
- `provider-media-public` (still private until publication approval);
- `system-exports`.

The manual `DIREKT Supabase development activation` workflow remains the exact-project migration and verification authority. Evidence must be sanitized and bound to the immutable project ref.

### Google Cloud staging

| Field | Required value |
|---|---|
| Project ID | `direkt-dev-502701` |
| Project number | `264358173369` |
| Region | `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| API service | `direkt-api` |
| Portal service | `direkt-operations-portal-staging` |
| API runtime identity | `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com` |
| Portal runtime identity | `direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com` |
| GitHub deployer identity | `direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com` |
| WIF provider | `projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main` |

The deployment workflow consumes these through repository variables rather than embedding deployment identities in workflow source.

## 4. Runtime secret allowlists

Secret Manager values are injected only as pinned numeric versions. `latest` is prohibited for environment-variable injection because a new secret version must not silently change a previously reviewed revision.

### API runtime — exactly seven values

| Environment variable | Secret name |
|---|---|
| `DATABASE_URL` | `direkt-database-url` |
| `SUPABASE_URL` | `direkt-supabase-url` |
| `SUPABASE_SECRET_KEY` | `direkt-supabase-secret-key` |
| `ACCESS_TOKEN_SECRET` | `direkt-access-token-secret` |
| `CONTACT_HASH_PEPPER` | `direkt-contact-hash-pepper` |
| `CHALLENGE_HASH_PEPPER` | `direkt-challenge-hash-pepper` |
| `RATE_LIMIT_HASH_PEPPER` | `direkt-rate-limit-hash-pepper` |

The administrative `direkt-direct-database-url` secret is never attached to the API runtime.

### Portal runtime — exactly one value

| Environment variable | Secret name |
|---|---|
| `PORTAL_COOKIE_SECRET` | `direkt-portal-cookie-secret` |

The portal receives no database, Supabase, token-signing, payment, registry or communications credential.

## 5. Private service-to-service authentication

Both Cloud Run services are deployed with unauthenticated invocation disabled. No service IAM policy may contain a public or broad authenticated-user member.

The only service-level `roles/run.invoker` grant on `direkt-api` is:

```text
serviceAccount:direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com
```

For portal-to-API calls:

1. the portal runtime requests a Google-signed ID token from the Cloud Run metadata server;
2. the token audience is the canonical `direkt-api` Cloud Run URL;
3. the token is sent in `X-Serverless-Authorization`;
4. the DIREKT application access token remains in `Authorization`;
5. no service-account JSON key is created, downloaded or mounted.

The platform token proves the calling Cloud Run workload. It does not replace DIREKT session, role, provider-scope or permission enforcement.

## 6. Container contract

### API image

- reproducible multi-stage Node 24 build using `npm ci` and the committed lockfile;
- TypeScript build in a build stage;
- production dependencies and `dist` only in the runtime stage;
- non-root `node` user;
- listens on `process.env.PORT` and `0.0.0.0`;
- excludes environment files, credentials, tests, coverage, artifacts and caches;
- retains `/api/v1/health/live` and `/api/v1/health/ready`.

### Portal image

- Next.js standalone output;
- reproducible multi-stage Node 24 build using `npm ci` and the committed lockfile;
- runtime contains only `public`, standalone server output and static assets;
- non-root `node` user;
- listens on Cloud Run `PORT` and `0.0.0.0`;
- excludes environment files, credentials, tests, coverage and caches;
- remains no-indexed.

## 7. Repository variables

The `staging` GitHub Environment/repository must provide these non-secret variables with the values above:

```text
GCP_PROJECT_ID
GCP_REGION
GCP_ARTIFACT_REGISTRY
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT
GCP_API_SERVICE
GCP_PORTAL_SERVICE
GCP_API_RUNTIME_SERVICE_ACCOUNT
GCP_PORTAL_RUNTIME_SERVICE_ACCOUNT
```

Pinned numeric secret-version variables:

```text
DIREKT_DATABASE_URL_SECRET_VERSION
DIREKT_SUPABASE_URL_SECRET_VERSION
DIREKT_SUPABASE_SECRET_KEY_SECRET_VERSION
DIREKT_ACCESS_TOKEN_SECRET_VERSION
DIREKT_CONTACT_HASH_PEPPER_SECRET_VERSION
DIREKT_CHALLENGE_HASH_PEPPER_SECRET_VERSION
DIREKT_RATE_LIMIT_HASH_PEPPER_SECRET_VERSION
DIREKT_PORTAL_COOKIE_SECRET_VERSION
```

These are version numbers, not secret values.

## 8. Workflows and execution boundary

### Non-deploying readiness

`DIREKT controlled staging container readiness` runs on relevant branch/PR changes and manual dispatch. It:

- reruns the static staging contract;
- scans tracked files without printing matched protected values;
- classifies explicit `not-for-production` placeholders as synthetic examples;
- builds both containers;
- migrates disposable PostgreSQL/PostGIS;
- runs API and portal on non-default ports;
- verifies both runtime UIDs are non-root;
- verifies API liveness/readiness and portal-to-API readiness;
- records `deploymentTriggered: false` in its sanitized artifact.

### Manual deployment

`DIREKT controlled Cloud Run staging deployment` is `workflow_dispatch` only and:

1. requires `DEPLOY-DIREKT-STAGING`;
2. accepts one exact 40-character source commit;
3. requires that commit to be an ancestor of `main`;
4. uses the GitHub `staging` Environment;
5. authenticates through Workload Identity Federation;
6. builds immutable SHA-tagged API and portal images;
7. deploys minimum 0 and maximum 1 instance per service;
8. keeps both services IAM-private;
9. grants the portal runtime invoker access only on the API;
10. verifies runtime identities and secret allowlists;
11. rejects unpinned secret versions and forbidden public IAM members;
12. runs private API and portal health smoke tests;
13. publishes only sanitized identifiers and results.

Repository changes and CI do not trigger this workflow automatically.

## 9. Vercel boundary

Vercel remains an approved protected Preview/Staging portal target when its project binding is completed. It must use the portal root directory, deployment protection, no indexing and server-side calls to the same private API boundary. Vercel does not receive database or Supabase credentials.

The Cloud Run portal staging service is the current end-to-end private service-identity validation target. Vercel integration must not make the API publicly invokable; a later approved identity-aware gateway or equivalent private calling design is required before a Vercel-hosted portal can call the IAM-private API.

## 10. Phase boundaries retained

Phase 10 does not authorize:

- real participant, provider or evidence data;
- unrestricted signup, invitations or public IAM invocation;
- real OTP, WhatsApp, map, registry or payment credentials without their adapter approval gate;
- real money movement;
- public search-engine indexing;
- public product claims, marketing launch or uncontrolled traffic;
- a Zambia pilot outside Phase 11;
- a production release outside Phase 12.

## 11. Exit evidence

Infrastructure integration is complete only when the repository records:

- passing exact-project Supabase activation/verification evidence;
- passing container readiness on the exact reviewed Phase 10 head;
- a manually approved immutable Cloud Run staging deployment and private smoke result;
- no public invocation binding;
- runtime secret allowlists and pinned versions;
- protected Vercel Preview/Staging evidence when that separate binding is implemented;
- Firebase internal distribution evidence where Android changes require it;
- sanitized advisor, rollback, kill-switch and incident-response evidence;
- all permanent CI gates on one reviewed head.
