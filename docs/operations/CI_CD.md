# DIREKT CI/CD

## Current documentation and Pages pipeline

The Pages workflow on `main`:

1. validates required documentation;
2. scans for placeholders and obvious secret patterns;
3. generates the downloadable planning pack;
4. prepares the MkDocs source tree;
5. runs a strict MkDocs build;
6. uploads the static Pages artifact;
7. deploys the approved documentation site.

GitHub Pages is a documentation and synthetic-prototype surface. It is not the Android runtime, backend host, authenticated operations portal or production deployment target.

## Android continuous integration

Workflow: `.github/workflows/android-ci.yml`

Triggers:

- Android changes pushed to `build/android-v1`;
- Android changes promoted to `main`;
- a manual workflow dispatch.

Before Android scaffolding exists, the workflow reports a dormant but correctly connected state. After `android/direkt-app/gradlew` and the Gradle settings file exist, the workflow runs:

`unit tests → Android lint → debug assembly → report upload → APK artifact upload`

The build uses a standard Ubuntu GitHub-hosted runner, JDK 17 and the Gradle build cache. The debug APK and reports are retained for 14 days to control artifact storage and prevent old test builds from being mistaken for current releases.

## Android tester distribution

Workflow: `.github/workflows/android-distribute.yml`

Distribution is manual and gated. It must never run automatically on every commit. The operator chooses the approved Firebase tester group and provides release notes.

Required repository secrets:

- `FIREBASE_ANDROID_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

The distribution workflow reruns unit tests and Android lint, builds the exact APK, uploads it to Firebase App Distribution and retains the distributed APK in GitHub Actions for traceability.

See [`REMOTE_ANDROID_TESTING.md`](REMOTE_ANDROID_TESTING.md) for the full testing-channel model.

## Managed development deployment pipelines

### Supabase development activation

`.github/workflows/supabase-development-activate.yml` is manual, main-only and protected by the `development` Environment. It verifies the exact DIREKT project, an exact source commit, migrations, PostGIS, private buckets and sanitized advisor evidence.

### Cloud Run development API

`.github/workflows/cloud-run-development-deploy.yml` is manual, main-only and protected by the `development` Environment. It uses GitHub OIDC/Workload Identity Federation, verifies an exact source commit, builds an immutable SHA-tagged image, binds runtime secret references, deploys the synthetic-only API and runs readiness smoke tests. Private invocation is the default; `public-synthetic` is an explicit protected-Vercel integration mode and does not authorize real data or a pilot.

### Vercel Preview/Staging portal

The Vercel project is configured in the provider dashboard with root `admin/direkt-operations-portal`, Preview deployment and deployment protection. Phase 10 URLs remain no-indexed and use only the server-side DIREKT API base URL and portal session configuration. No database or Supabase server credential enters the browser or Vercel client bundle.

## Later product pipelines

### Backend

`format/lint/type-check → unit tests → PostgreSQL integration/migrations → API contract/security tests → container build`

### Administration portal

`format/lint/type-check → component tests → browser E2E → production build`

### Android instrumented and device tests

Instrumented tests are added after the Compose application and test harness exist. They should run in a separate workflow because emulator/device jobs are slower than the standard unit-test pipeline. Firebase Test Lab may later provide broader virtual and physical device coverage.

### Security

Dependency, secret, code and artifact-provenance checks are introduced with the corresponding implementation layers. No workflow may print secret values or upload private verification evidence.

## Deployment rules

- `build/android-v1` is the sequential implementation branch.
- Pushes to the build branch validate code and produce test artifacts.
- Stable phase checkpoints are promoted to `main` only after required quality gates pass.
- GitHub Pages deploys only from `main`.
- Firebase distribution is manual and targets named tester groups.
- Synthetic-only managed development and protected staging deployment are authorized during Phase 10.
- A development/staging URL is not a Phase 11 pilot or Phase 12 production release.
- Bootstrap workflows that require the default branch may be promoted through a narrow reviewed PR and synchronized back without force-pushing.
- Production deployments require manual approval and current-head verification.
- Database migrations are explicit and environment-specific.
- Force-pushing is prohibited.

## Artifact rules

Every retained build must be traceable to its Git commit and workflow run. Artifacts must not contain production credentials, personal identity documents, private location evidence or production database exports.

Debug APKs are test artifacts only. Signed release Android App Bundles use a separate protected release-signing workflow when Play testing begins.
