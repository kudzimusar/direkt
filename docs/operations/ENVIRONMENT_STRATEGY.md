# DIREKT Environment Strategy

## Local

Containerized/emulated dependencies where practical, synthetic seed and developer-specific secrets outside repo.

## Development

Shared integration, disposable synthetic data, frequent changes, no pilot personal evidence.

## Staging

Production-like configuration, restricted access, synthetic plus explicitly approved test accounts/evidence, payment/map sandboxes and release candidate validation.

## Production

Real users/evidence, strict access, separate credentials/data/storage, controlled migrations and monitoring.

## Rules

- never point debug builds at production;
- environment visually identifiable;
- no production database copy to lower environment;
- migration path tested in staging;
- vendor webhooks separated;
- Pages never functions as an environment for backend/authenticated data.
