# DIREKT CI/CD

## Documentation and Pages

The Pages workflow on `main` validates required documentation, scans for placeholders and obvious secret patterns, creates the planning archive, performs a strict MkDocs build and deploys only synthetic documentation/prototype content.

GitHub Pages is not an Android runtime, backend host, authenticated portal or production target.

## Permanent product validation

### Android

`.github/workflows/android-ci.yml` runs unit tests, Android lint, debug assembly, Compose test assembly and retained reports for relevant `build/android-v1`, `main` and manual runs.

### Backend/PostGIS

`.github/workflows/backend-ci.yml` runs formatting, lint, TypeScript, route-authorization inventory, checksummed migrations, tests, production build and OpenAPI validation.

### Operations portal

The portal workflow runs formatting, lint, TypeScript, tests, production build and the API-only isolation checks.

### Documentation

The documentation workflow validates required records, packages the archive and runs the strict MkDocs build.

## Controlled staging container readiness

Workflow: `.github/workflows/staging-container-readiness.yml`

This workflow does **not** deploy. It runs for relevant branch/PR changes and by manual dispatch. It:

1. checks required Docker and staging artifacts;
2. runs the non-disclosing protected-literal scan;
3. builds the API and portal containers;
4. creates disposable PostgreSQL/PostGIS and applies the complete migration chain;
5. runs API and portal on non-default ports;
6. verifies both runtime UIDs are non-root;
7. verifies API liveness/readiness;
8. verifies portal-to-API readiness;
9. uploads only sanitized readiness reports with `deploymentTriggered: false`.

Explicit development strings containing `not-for-production` and disposable local database URLs are classified as synthetic examples. Real token, key, private-key and credential-bearing URL patterns fail without printing the matched value.

## Managed infrastructure workflows

### Supabase activation

`.github/workflows/supabase-development-activate.yml` is manual, exact-source, main-only and protected by the `development` Environment. It verifies the immutable DIREKT project, migrations, PostGIS, private buckets and sanitized advisor evidence.

### Cloud Run staging deployment

`.github/workflows/cloud-run-staging-deploy.yml` is manual-only and protected by the `staging` Environment. It requires an exact reviewed commit already merged to `main` and the confirmation phrase `DEPLOY-DIREKT-STAGING`.

It uses:

- `contents: read` and `id-token: write` only;
- GitHub OIDC/Workload Identity Federation from repository variables;
- immutable commit-SHA image tags;
- Artifact Registry repository variables;
- separate API and portal runtime identities;
- pinned Secret Manager version variables;
- minimum 0 and maximum 1 instance per service;
- IAM-private API and portal services;
- a portal-runtime `roles/run.invoker` grant only on the API;
- Google-signed audience tokens in `X-Serverless-Authorization` while retaining DIREKT application authorization;
- post-deploy identity, secret-allowlist, IAM and health verification.

The workflow contains no unauthenticated deployment mode and no service-account JSON key path.

### Vercel Preview/Staging

Vercel remains a protected portal target after its project binding and private API-calling design are approved. Preview/Staging URLs remain no-indexed. Vercel receives portal server configuration only and never database or Supabase server credentials.

### Firebase internal distribution

Android tester distribution remains manual and targets the named internal tester group. Public Play release remains Phase 12.

## Deployment rules

- `build/android-v1` is the sequential implementation branch.
- Branch pushes validate and create test artifacts; they do not trigger Cloud Run deployment.
- Stable phase checkpoints are promoted to `main` only after required exact-head gates pass.
- Managed Phase 10 staging is synthetic-only and IAM-protected.
- A staging URL is not a Phase 11 pilot or Phase 12 production release.
- No public Cloud Run invocation binding is permitted in Phase 10.
- Production deployment requires later manual approval and current-head verification.
- Migrations are explicit and environment-specific.
- Force-pushing is prohibited.

## Artifact rules

Every retained build is traceable to a commit and workflow run. Artifacts must not contain credentials, personal identity documents, private location evidence or production database exports. Debug APKs and staging containers are test artifacts only.
