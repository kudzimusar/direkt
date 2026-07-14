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
- Production deployments require manual approval and current-head verification.
- Database migrations are explicit and environment-specific.
- Force-pushing is prohibited.

## Artifact rules

Every retained build must be traceable to its Git commit and workflow run. Artifacts must not contain production credentials, personal identity documents, private location evidence or production database exports.

Debug APKs are test artifacts only. Signed release Android App Bundles use a separate protected release-signing workflow when Play testing begins.
