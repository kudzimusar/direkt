# DIREKT Android Protected Signing Contract

**Status:** Phase 12A preauthorization engineering contract  
**Production signing authorization:** NOT GRANTED

## Purpose

Define how the Android release build may eventually use a protected Google Play upload key without placing signing material, passwords, service-account credentials or release capability in the public repository.

The contract is deliberately fail-closed. The current source-controlled release channel is `preauthorization`, and the Gradle build rejects signing whenever that channel is active.

## Release identity source of truth

`release/version.properties` is the only source of truth for:

- `DIREKT_RELEASE_VERSION_CODE`;
- `DIREKT_RELEASE_VERSION_NAME`;
- `DIREKT_RELEASE_CHANNEL`.

Accepted channels are:

- `preauthorization` — unsigned, non-publishable engineering evidence only;
- `release-candidate` — reserved for a formally authorized candidate after the Phase 11/11J/global gates permit release activity;
- `production` — reserved for the approved production release source.

Every version change must be reviewed in source control. `versionCode` must remain monotonically increasing across anything uploaded to Google Play. Preauthorization names must contain `preauth`; release-candidate names must contain `rc`; production names must contain neither label.

The Phase 12A baseline is:

```text
DIREKT_RELEASE_VERSION_CODE=12
DIREKT_RELEASE_VERSION_NAME=0.12.0-preauth.1
DIREKT_RELEASE_CHANNEL=preauthorization
```

This is not a Play release version and must not be uploaded.

## Signing activation contract

Signing requires all of the following conditions simultaneously:

1. formal release activity has been authorized outside this contract by the governing Phase 11 exit and global release gates;
2. a reviewed source commit changes `DIREKT_RELEASE_CHANNEL` from `preauthorization` to `release-candidate` or `production` and advances the release identity deliberately;
3. the protected execution environment explicitly sets:
   - `DIREKT_RELEASE_SIGNING_ENABLED=true`;
   - `DIREKT_UPLOAD_KEYSTORE_PATH`;
   - `DIREKT_UPLOAD_KEYSTORE_PASSWORD`;
   - `DIREKT_UPLOAD_KEY_ALIAS`;
   - `DIREKT_UPLOAD_KEY_PASSWORD`;
4. `DIREKT_UPLOAD_KEYSTORE_PATH` is an absolute path to a readable keystore materialized outside the repository checkout;
5. the protected release workflow has explicit publishing authorization separate from signing authorization.

Any missing condition is a hard failure. There is no silent fallback from an intended signed release to an unsigned artifact.

## Key ownership model

DIREKT will use Google Play App Signing for the app-signing-key boundary. CI/release operators use only the Play **upload key** required to authenticate an uploaded AAB.

The public repository must never contain:

- `.jks`, `.keystore`, `.p12` or `.pfx` key material;
- keystore or key passwords;
- service-account JSON;
- production environment files;
- a base64-encoded copy of any signing secret.

A future authorized CI implementation must materialize the upload keystore into an ephemeral protected-runner path, preferably under the runner temporary directory, and remove it when the job ends. Repository checkout paths are prohibited for the protected keystore.

## Preauthorization CI boundary

`.github/workflows/phase12-release-readiness.yml` always sets:

```text
DIREKT_RELEASE_SIGNING_ENABLED=false
```

It maps no upload-key secrets and fails if protected signing inputs appear in its environment or key material exists in the checkout. It may only produce an unsigned AAB labelled `PREAUTHORIZATION / NOT FOR DISTRIBUTION`.

The workflow builds twice from a clean state with build cache disabled and accepts the artifact only when both AAB files are byte-for-byte identical and have the same SHA-256 digest.

## Future protected workflow requirements

A future signing/publishing workflow is a separate controlled change. It must not be created or activated merely because this contract exists.

Before it can run, it must require:

- formal Phase 12 authorization;
- protected GitHub environment approval or equivalent owner-controlled release approval;
- upload-key secrets scoped only to that environment;
- exact source SHA pinning;
- source-controlled release identity validation;
- full mandatory regression/security/documentation gates;
- signed AAB signature and SHA-256 evidence;
- Play internal/closed-track authorization before any broader rollout;
- no public production rollout unless the staged-release gate is separately approved.

## Rotation and recovery

Upload-key rotation or compromise response must be handled through the Google Play-supported upload-key reset/rotation process and the protected secret store. No replacement key may be committed to git.

Changing the upload key does not justify changing DIREKT identity, package name, trust semantics or application data boundaries.

## Current limitations

- No real upload key has been configured or tested by this Phase 12A work.
- No signed AAB is produced.
- No Play Console upload is performed.
- `isMinifyEnabled = false` remains unchanged; R8/minification is a separate deliberate release decision and must not be enabled merely to satisfy a checklist.
- This contract proves configuration safety and unsigned reproducibility only; it does not prove Google Play acceptance, production readiness or Phase 11 validation.
