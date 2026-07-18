# Phase 10 Cloud Run development recovery

**Google Cloud project:** `direkt-dev-502701`  
**Region:** `asia-northeast1`  
**API service:** `direkt-api`  
**Data boundary:** synthetic-only development data; no Phase 11 participant data

## Database prerequisite

The original `503 Database or PostGIS is not ready` cause is resolved in Supabase:

- project `direct-app`, ref `aeeuscifrxcjmnswqwnq`, is healthy;
- `PostGIS_Version()` succeeds;
- 34 checksummed DIREKT migrations are recorded exactly once;
- all four required Storage buckets exist and are private;
- Storage contains zero objects;
- the DIREKT migration ledger has RLS enabled and no `anon` or `authenticated` table grants.

## Hardened deployment control

The `DIREKT Cloud Run development deployment` workflow is private-only and requires:

- an exact source SHA already merged to `main`;
- a full backend migration, test, build and OpenAPI checkpoint;
- immutable Artifact Registry image tagging by source SHA;
- the bounded `direkt-api-runtime` service account;
- six enabled Secret Manager versions resolved to numeric references in-memory;
- zero `allUsers` or `allAuthenticatedUsers` invoker bindings;
- an audience-bound ID token and `X-Serverless-Authorization` readiness smoke test.

The deployer has metadata-only `roles/secretmanager.viewer` bindings on the six allowlisted secrets. The runtime identity, not the deployer, has payload access required by Cloud Run. The deployment workflow does not use Secret Manager `:latest` references in the deployed service configuration.

## Fail-closed history

Deployment run `29623925889` stopped before checkout, build, image push or Cloud Run mutation because the previous workflow required unset GitHub repository variables.

A temporary synchronization workflow then established two facts:

1. Google OIDC and per-secret metadata inspection worked after the external IAM grant;
2. the built-in GitHub Actions token could not create repository variables and returned `Resource not accessible by integration (HTTP 403)`.

No secret payload was read, no numeric version was guessed, and no personal access token was introduced. The unsupported repository-variable path was removed. Numeric versions are now resolved after Google OIDC authentication and retained only within the deployment job.

## Successful recovery checkpoint

The protected deployment completed successfully:

| Evidence | Verified value |
|---|---|
| Deployment run | `29625346221` |
| Deployment job | `88028515197` |
| Application source | `c6530f18792b498d5603885d5871f4ecdf91979d` |
| Immutable image | `asia-northeast1-docker.pkg.dev/direkt-dev-502701/direkt-containers/direkt-api:c6530f18792b498d5603885d5871f4ecdf91979d` |
| Image digest | `sha256:1236ff6449d8d1cd5287bd451984ae604b872373a71e6a3a88ce42552bb8c4b9` |
| Ready revision | `direkt-api-00003-g9d` |
| Private service URL | `https://direkt-api-6cvw322xxq-an.a.run.app` |
| Runtime identity | `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com` |
| Invocation | IAM-private |
| Public invokers | absent |
| Readiness | passed |

All six runtime references resolved to enabled numeric version `1`:

- `direkt-database-url`;
- `direkt-supabase-url`;
- `direkt-supabase-secret-key`;
- `direkt-access-token-secret`;
- `direkt-contact-hash-pepper`;
- `direkt-challenge-hash-pepper`.

The deployment workflow successfully completed the full backend gate, image build and push, private Cloud Run deployment, public-IAM rejection, runtime identity and numeric-secret verification, audience-bound token minting, and database readiness smoke test.

## Independent read-only inspection

The permanent `DIREKT Cloud Run development inspection` workflow was merged at `ec39be6abb79ec12db4ecc114e3d062b197cdcca` and run as inspection `29625635650`.

It independently confirmed:

- `direkt-api-00003-g9d` is both the latest created and latest ready revision;
- the deployed image exactly matches source `c6530f18792b498d5603885d5871f4ecdf91979d`;
- the runtime identity is the bounded API service account;
- exactly six Secret Manager references use positive numeric versions;
- no public Cloud Run invoker binding exists;
- the authenticated readiness endpoint reports the database ready.

## Promotion result

The Cloud Run development API recovery gate is complete for Phase 10 synthetic-only infrastructure. The original database/PostGIS `503` is resolved.

This does not complete Phase 10 as a whole and does not authorize Phase 11, real participant data, public access, pilot recruitment or payments. Remaining Phase 10 gates include controlled staging/portal evidence, managed recovery and rollback exercises, external approvals and final checkpoint promotion.
