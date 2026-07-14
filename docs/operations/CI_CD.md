# DIREKT CI/CD

## Current documentation phase

- validate required docs;
- scan placeholders/obvious secrets;
- generate Pages source;
- run MkDocs strict build;
- publish Pages from `main`.

## Product phase pipeline

### Android
format/static analysis → unit → Compose/instrumented as appropriate → assemble → signed release in protected job.

### Backend
format/lint/type → unit → PostgreSQL integration/migrations → contract/security → container build.

### Admin
format/lint/type → component → browser E2E → build.

### Security
dependency/secret/code scan and artifact provenance as capabilities mature.

## Deployment

- pushes to build branch validate only;
- stable phase checkpoint to `main`;
- staging deployment after explicit phase rules;
- production manual approval and current head verification;
- migrations explicit;
- no force push.

## Artifacts

Retain reports/builds without personal data. Release artifacts are traceable to commit and dependency lock.
