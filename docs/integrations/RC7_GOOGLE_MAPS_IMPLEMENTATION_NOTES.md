# RC7 Google Maps Runtime Implementation Notes

**Governing issue:** #261  
**Status:** Claimed; corrective source and managed proof in progress  
**Corrective baseline:** `main@7c899295b176f767fd3da53f19b029b5582eae8a`

## Source reconciliation checkpoint

The corrective branch has completed its one-time atomic source reconciliation. The permanent branch no longer contains the temporary reconciler, formatter or diagnostic workflows. Environment schema, application adapter, unit tests, managed workflow, bootstrap, contract verifiers, trigger, status register and live ledger now describe the same service-identity OAuth architecture. A clean Node 24 runner using the repository-locked dependencies applied Prettier to the isolated adapter test and then passed both its target check and the complete backend `format:check` command before the temporary tooling was removed.

## Scope decision

RC7 activates only:

- Maps SDK for Android for native map display;
- Geocoding API v4 behind the DIREKT backend for bounded Zambian search-area normalization.

Places is not required because the approved manual area/landmark field remains functional and accessible. Routes is not required because PostGIS already owns public service-area matching and public-premises distance semantics. Neither omitted API may be enabled merely for completeness.

## Existing authority preserved

PostGIS remains canonical for private bases, consented public premises, public service-area geometry, matching and distance calculations. Google Maps does not become a trust, ranking, verification, publication or payment authority.

Publication rules remain unchanged:

- mobile providers: public service area only; no base marker or base distance;
- fixed premises: a marker only for a consented public premises point;
- hybrid: consented public premises plus the separate public service area;
- exact private coordinates: never public, logged, telemetered or included in provider payloads.

Android still requests no fine, coarse or background device-location permission. The my-location layer remains disabled. Manual/list discovery remains a first-class fallback.

## Root-cause correction

The first managed design restricted a backend API key to a reserved Public Cloud NAT address while calling a Google API. That model cannot prove the intended source address: traffic to Google APIs uses Private Google Access, and Public Cloud NAT does not translate that traffic to its external address. The Geocoding provider therefore returned `REQUEST_DENIED` even though the key metadata, quota and canary container were otherwise correct.

RC7 now rejects that architecture permanently. The backend path contains:

- no backend Maps API key;
- no backend Maps Secret Manager value;
- no Direct VPC egress requirement;
- no Cloud Router, Cloud NAT or static egress address;
- no IP-based backend credential restriction.

## Owner-budget attestation correction

The first exact-main service-identity run, `30210742617/1` on `1c6acd7972caca838f27b4e5c4a521c92cbfc7c4`, failed before Android key mutation, image build, Cloud Run Job creation or Firebase Test Lab. The GitHub deployer correctly lacked `billing.budgets.list` on the owner billing account.

RC7 does not broaden CI to billing-account viewer. The owner bootstrap directly verifies the real one-unit budget and then writes non-secret project labels for verified amount, currency and UTC check time. The exact-main proof reads only those project labels, rejects an attestation older than eight hours, and permanently prohibits managed `gcloud billing budgets` access.

## Ranked-candidate correction

The next exact-main proof, run `30225624823/1` on `6378be60199ce567671a4a307dedf5288b8be1ca`, passed exact-source checks, WIF, the fresh one-JPY owner budget attestation, quota verification, Android key restriction, immutable image execution and cleanup. The private backend canary then failed with a sanitized `outside_zambia` result before Firebase Test Lab. Artifact `8638498996` has digest `sha256:55c3b9f581ee899b5f1cac7e2a99e5d7851faedb00def2ba887e760e22a8a56a`; `cleanup.cloud_run_job_deleted=true` and `cleanup_failed=false`.

Geocoding v4 `regionCode=ZM` influences ranking but is not a strict country filter. The prior adapter treated `results[0]` as authoritative. The corrective adapter now iterates ranked results, validates every candidate before use, resolves country from `postalAddress.regionCode` or the typed country address component, and selects only the first candidate that also remains within the unchanged Zambia latitude/longitude bounds. Empty results remain `not_found`, structurally malformed-only results remain `invalid_provider_response`, and valid but non-Zambian-only results remain `outside_zambia`. Raw coordinates, formatted addresses, provider payloads and OAuth material are still excluded from logs and evidence.

## Android Test Lab evidence correction

Exact-main run `30226241329/1` on `58c3b36d15ca8b602ed2365242c93d965a7ff08d` proved the backend service-identity OAuth Geocoding v4 canary, fresh one-JPY owner attestation, quota, Android key restriction, immutable image and cleanup. The remaining result was one failed API 36 instrumentation case in Test Lab matrix `matrix-3gndt2ks91n33`. Artifact `8638705116` has digest `sha256:49fbc387d06eeb7061ca1c8923a313c8dff22f534e2940398f7d4df26d55233c`; `cleanup.cloud_run_job_deleted=true` and `cleanup_failed=false`.

The managed proof now verifies the SHA-1 certificate embedded in the final debug APK and requires it to equal the certificate restriction applied to the synthetic Android key. When Test Lab fails, the authenticated exact-main job queries the Testing and Tool Results APIs and writes a whitelisted receipt containing matrix state, step outcome, test-case identity and bounded stack traces. Raw logs, opaque tool outputs, credentials, API-key values, coordinates and participant data remain excluded. The instrumentation assertion still requires `discovery-map-ready`; a privacy-safe fallback is diagnostic evidence, not a pass.

## Deterministic APK certificate correction

Exact-main run `30228282694/1` on `40faf2e8e708994f448a3877cc9475739a0957a4` passed exact-source controls, WIF, the fresh one-JPY budget attestation, quota verification, Android key restriction, immutable backend execution, Geocoding v4 OAuth and Cloud Run cleanup. The Android build then completed successfully with 70 actionable tasks, including 34 restored from Gradle cache, but the script exited before writing the final APK certificate artifact or starting Test Lab. Artifact `8639272798` has digest `sha256:ddc1101960be5ca7d6daaea263a10bad5e25b697886bcf23cb5e2bb79c028323`; `cleanup.cloud_run_job_deleted=true` and `cleanup_failed=false`.

The next proof runs `clean` with `--no-build-cache`, extracts the certificate from the newly packaged APK, writes a sanitized expected/actual certificate receipt before validation, and fails closed on an `apksigner` error, malformed fingerprint or mismatch. Raw `apksigner` stderr is neither printed nor uploaded. The unexecuted Test Lab failure parser is also corrected to retain the real matrix ID through a literal `\1` backreference.

## APK signer-label correction

Exact-main run `30230004924/1` on `7c899295b176f767fd3da53f19b029b5582eae8a` passed backend service-identity OAuth, the fresh one-JPY budget attestation, quota, restricted Android key metadata, clean no-build-cache APK creation and Cloud Run cleanup. Artifact `8639806488` has digest `sha256:6ee216fb0e416c3013c4d26ea9246afaeb9fd663a84de89816689489533111b4`. `apksigner` exited zero, but the v2 parser returned no digest because it matched only `Signer #1`; Test Lab correctly did not start.

Android's `apksigner` output can identify certificate records with a numbered signer label or an SDK-range signer label. The corrected parser accepts both forms, normalizes and deduplicates all SHA-1 records, and requires exactly one unique digest equal to the key restriction. Multiple different digests, malformed output, a signer-tool failure or a mismatch all fail closed after the sanitized v3 certificate artifact is written. Raw signer stdout and stderr are never printed or uploaded.

## Credential and authentication boundary

Android and backend authentication remain separate:

1. **Android Maps key** — injected only at protected build time, restricted to the synthetic debug package/signing-certificate pair and Maps SDK for Android.
2. **Backend service identity OAuth** — the private Cloud Run Job uses its assigned user-managed runtime service account. The adapter obtains a metadata-server access token with `enforce_scopes=true` and only `https://www.googleapis.com/auth/maps-platform.geocode.address`, then calls Geocoding API v4 with an OAuth bearer token.

The backend token is short-lived, is never persisted or uploaded, and is never included in receipts. Production and controlled-pilot participant use remain disabled during RC7.

## Managed proof

The repository-controlled exact-main workflow performs one armed synthetic-only run after merge. It:

- confirms the reviewed SHA equals current `main` and authenticates through existing GitHub Workload Identity Federation;
- verifies only Maps SDK for Android and Geocoding dependencies are enabled and rejects Places or Routes;
- creates or updates only the Android package/signing/API-restricted synthetic key;
- builds an immutable backend image and runs a private Cloud Run Job under `direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com`;
- proves a Zambia-bounded Geocoding v4 OAuth response without logging coordinates, formatted addresses or token material;
- builds a Maps-enabled preauthorization APK and requires `discovery-map-ready` on one API 36 Firebase Test Lab device with zero flaky retries;
- verifies the project budget alert and Geocoding per-minute quota;
- publishes a sanitized terminal PASS/FAIL receipt to Issue #261;
- deletes the temporary Cloud Run Job and fails if cleanup does not succeed.

The trigger must be changed from `STATUS=ARMED` to `STATUS=CONSUMED` in the closure change so later main pushes cannot repeat managed mutation automatically.

## Failure and fallback

A disabled capability, OAuth denial, quota rejection, map-load timeout or provider outage renders the same privacy-safe public location information as text and leaves list/manual discovery available.

Backend Geocoding has bounded input, Zambia constraints, timeout, a minimal response field mask, filtered output and sanitized errors. It does not store the input or result, and its managed canary logs neither coordinates nor formatted addresses.

## Cost controls

Managed activation verifies the restricted Android key, Geocoding OAuth scope, a Geocoding request ceiling, a project budget alert and Cloud Run Job cleanup. Places and Routes are excluded, so RC7 creates no quota or credential surface for them.

## Authorization boundary

RC7 does not authorize real participants, exact private-location publication, production authentication, production communications, real money, Phase 11 exit or Phase 12 release.
