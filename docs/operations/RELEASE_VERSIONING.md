# DIREKT Release Versioning

## Versions

Use semantic versioning for public API/app capabilities where practical:

- `0.x` planning/pilot;
- `1.0` approved Android production baseline;
- patch for backward-compatible fixes;
- minor for compatible capability;
- major for breaking API/policy semantics.

Android `versionCode` always increases; `versionName` maps to release version.

## Tags

- planning: `v0.1.0-planning`;
- phase checkpoints: `phase-1-complete` etc.;
- Android releases: `android-v1.0.0`.

Tags are not moved. Release notes include migration/API/known issues.

## Compatibility

Backend supports deployed client window according to explicit policy. Breaking API requires new version and migration period.
