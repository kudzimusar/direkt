# RC7 Google Maps Runtime Implementation Notes

**Governing issue:** #261  
**Status:** Claimed; source and managed proof in progress  
**Baseline:** `main@10cc243c1d051422b37e2f7481bba1dca4a2f5ed`

## Scope decision

RC7 activates only:

- Maps SDK for Android for native map display;
- Geocoding API behind the DIREKT backend for bounded Zambian search-area normalization.

Places is not required because the approved manual area/landmark field remains functional and accessible. Routes is not required because PostGIS already owns public service-area matching and public-premises distance semantics. Neither omitted API may be enabled or added to a key merely for completeness.

## Existing authority preserved

PostGIS remains canonical for private bases, consented public premises, public service-area geometry, matching and distance calculations. Google Maps does not become a trust, ranking, verification, publication or payment authority.

Publication rules are unchanged:

- mobile providers: public service area only; no base marker or base distance;
- fixed premises: a marker only for a consented public premises point;
- hybrid: consented public premises plus the separate public service area;
- exact private coordinates: never public, logged, telemetered or included in provider payloads.

The permanent RC5 and RC6 verifiers explicitly accept bounded RC7 ownership while continuing to require their original exact source, managed run, artifact and production-disabled closure evidence.

The backend Maps source and tests are formatted through the repository's pinned Prettier toolchain before exact-head verification.

The Phase 12B SDK and Play Data Safety source inventory now explicitly records the optional Maps SDK processing boundary, default-off activation, absence of Android device-location permissions, disabled my-location layer and prohibition on exact private provider coordinates. Final Play submission answers still require exact-release revalidation.

## Credential boundary

Two credentials are mandatory and may not be reused:

1. Android Maps key — injected only at protected build time, restricted to the synthetic debug package/signing-certificate pair and Maps SDK for Android.
2. Backend Maps key — Secret Manager/runtime only, restricted to Geocoding API and a temporary static Cloud NAT egress IP for the bounded managed canary.

The backend key, secret version, Cloud Run Job, NAT, router and static address are deleted after proof. Cleanup is machine-enforced: any failed deletion records `false`, changes the terminal result to failed and keeps the managed workflow red. Temporary backend key IDs include the workflow run and attempt so a retry cannot collide with a soft-deleted key. The Android debug key remains package/certificate/API restricted for synthetic internal builds and is not a production credential.

Both switches default disabled. Production and controlled-pilot participant use remain disabled during RC7.

## Managed proof

The repository-controlled exact-main workflow performs one armed synthetic-only run after merge. It:

- confirms the reviewed SHA equals current `main` and authenticates through the existing GitHub Workload Identity Federation identity;
- enables only Maps SDK for Android and Geocoding API dependencies, and positively rejects fully qualified Places or Routes services;
- creates separate application/API-restricted Android and backend keys;
- sends the private backend canary through Direct VPC egress, a `/26` subnet, Cloud NAT and a temporary static IP;
- proves a Zambia-bounded Geocoding response without logging coordinates or formatted addresses;
- builds a Maps-enabled preauthorization APK and requires the `discovery-map-ready` state on one API 36 Firebase Test Lab device with zero flaky retries;
- retains a project budget alert and a Geocoding per-minute quota override;
- allows a bounded key-restriction propagation interval before runtime proof;
- publishes a sanitized terminal PASS/FAIL receipt to Issue #261;
- cleans temporary backend credentials and recurring-cost networking resources after the run.

The trigger must be changed from `STATUS=ARMED` to `STATUS=CONSUMED` in the closure change so later main pushes cannot repeat the infrastructure mutation automatically.

## Failure and fallback

Manual area entry and list discovery remain first-class. Android requests no fine, coarse or background location permission for RC7. A disabled key, denied capability, map-load timeout or provider outage renders the same privacy-safe public location information as text and leaves list/manual discovery available.

Backend Geocoding has bounded input, Zambia constraints, timeout, filtered output and sanitized errors. It does not store the input/result and its managed canary logs neither coordinates nor formatted addresses.

## Cost controls

Managed activation verifies API restrictions, a Geocoding request ceiling, a project budget alert and credential cleanup/rotation behavior. Places and Routes are excluded, so RC7 creates no quota or credential surface for them.

## Authorization boundary

RC7 does not authorize real participants, exact private-location publication, production authentication, production communications, real money, Phase 11 exit or Phase 12 release.
