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
- a full backend migration, test, build, and OpenAPI checkpoint;
- immutable Artifact Registry image tagging by source SHA;
- the bounded `direkt-api-runtime` service account;
- six pinned Secret Manager version numbers;
- zero `allUsers` or `allAuthenticatedUsers` invoker bindings;
- an audience-bound ID token and `X-Serverless-Authorization` readiness smoke test.

The workflow no longer permits `:latest` Secret Manager references.

## Fail-closed deployment evidence

Deployment run `29623925889` stopped at the pinned-secret preflight before checkout, build, Google authentication, image push, or Cloud Run mutation because `DIREKT_DATABASE_URL_SECRET_VERSION` was unset.

The version synchronization workflow then confirmed:

- GitHub-to-Google OIDC authentication succeeds;
- the deployer identity is `direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com`;
- `secretmanager.versions.list` is not granted;
- the narrower `secretmanager.versions.get` permission is also not granted;
- no secret payload was read;
- no numeric version was guessed or written.

## Required external IAM action

Grant `roles/secretmanager.viewer` to the deployer on only these six secrets:

- `direkt-database-url`
- `direkt-supabase-url`
- `direkt-supabase-secret-key`
- `direkt-access-token-secret`
- `direkt-contact-hash-pepper`
- `direkt-challenge-hash-pepper`

The role is metadata-only. It permits version metadata inspection but does not include secret payload access.

An authorized Google Cloud administrator can apply the binding with:

```bash
PROJECT_ID="direkt-dev-502701"
DEPLOYER="direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com"

for SECRET in \
  direkt-database-url \
  direkt-supabase-url \
  direkt-supabase-secret-key \
  direkt-access-token-secret \
  direkt-contact-hash-pepper \
  direkt-challenge-hash-pepper
do
  gcloud secrets add-iam-policy-binding "${SECRET}" \
    --project "${PROJECT_ID}" \
    --member "serviceAccount:${DEPLOYER}" \
    --role "roles/secretmanager.viewer"
done
```

Do not grant `roles/secretmanager.secretAccessor` to the deployer.

## Recovery sequence after IAM is granted

1. Run `DIREKT Secret Manager version sync` from `main` with confirmation `SYNC-DIREKT-SECRET-VERSIONS`.
2. Confirm all six GitHub repository variables contain positive numeric versions.
3. Run `DIREKT Cloud Run development deployment` from the exact current `main` SHA with confirmation `DEPLOY-DIREKT-DEVELOPMENT`.
4. Require private IAM verification and database readiness success.
5. Record the deployed revision, source SHA, image URI, runtime identity, pinned versions, and sanitized readiness evidence.

Cloud Run is not yet accepted as recovered. Phase 11 remains blocked.
