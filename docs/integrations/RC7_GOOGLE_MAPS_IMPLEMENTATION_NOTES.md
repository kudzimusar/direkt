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

## Credential boundary

Two credentials are mandatory and may not be reused:

1. Android Maps key — injected only at protected build time, restricted to approved DIREKT package/signing-certificate pairs and Maps SDK for Android.
2. Backend Maps key — Secret Manager/runtime only, restricted to Geocoding API and to approved server egress when static egress exists.

Both switches default disabled. Production and controlled-pilot participant use remain disabled during RC7.

## Failure and fallback

Manual area entry and list discovery remain first-class. Android requests no fine, coarse or background location permission for RC7. A disabled key, denied capability, map-load timeout or provider outage renders the same privacy-safe public location information as text and leaves list/manual discovery available.

Backend Geocoding has bounded input, Zambia constraints, timeout, filtered output and sanitized errors. It does not store the input/result and its managed canary logs neither coordinates nor formatted addresses.

## Cost controls

Managed activation must verify API restrictions, quota ceilings, budget alerts and rotation instructions. Places and Routes are excluded, so their usage quota remains zero through RC7.

## Authorization boundary

RC7 does not authorize real participants, exact private-location publication, production authentication, production communications, real money, Phase 11 exit or Phase 12 release.
