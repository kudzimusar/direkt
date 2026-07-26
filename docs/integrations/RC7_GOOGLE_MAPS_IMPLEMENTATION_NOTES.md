# RC7 Google Maps Runtime Implementation Notes

**Governing issue:** #261  
**Status:** Claimed; corrective source and managed proof in progress  
**Corrective baseline:** `main@4fa12358269297eb926d45952712eddec5506596`

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
