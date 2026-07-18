# Phase 10 Hosting, Distribution and External-Provider Decisions

**Recorded:** 2026-07-18  
**Governing issue:** #41  
**Checkpoint PR:** #42

## Decision 1 — protected portal staging uses Cloud Run

DIREKT will use the IAM-private Cloud Run service `direkt-operations-portal-staging` as the authoritative Phase 10 operations-portal staging target.

Vercel Preview/Staging is explicitly excluded from the Phase 10 and Phase 11 entry path because:

- the owner does not approve a separate paid Vercel plan or trial for this programme;
- the portal already has a reviewed standalone Cloud Run container and service-to-service identity contract;
- using Cloud Run keeps the API and portal under one Google Cloud project, OIDC trust boundary, runtime identity model and synthetic-only staging policy;
- no real participant data or public portal access is required for the controlled pilot entry gate.

This exclusion is not a claim that Vercel is unsuitable generally. It is a programme decision for DIREKT. Reversal requires an owner-approved account/project binding, cost decision, private API reachability proof and a new security review.

## Decision 2 — Firebase is internal distribution only

Firebase App Distribution remains the Phase 10 Android installation channel. The exact debug package is `com.kudzimusar.direkt.debug`, and releases may target only the group alias `direkt-internal-testers`.

The distribution workflow must:

- build from an exact reviewed commit already merged to `main`;
- resolve the Firebase Android app by exact package name;
- refuse to distribute when that app or tester group is missing;
- publish only a pre-release debug APK;
- record the APK SHA-256 and size;
- prohibit external tester lists, Play production release and public distribution.

## Decision 3 — external production adapters remain disabled

Phase 10 does not select or activate a production map/geocoder, OTP/SMS/WhatsApp provider, registry integration or payment provider.

The following modes remain mandatory until their provider-specific approval packages are accepted:

- `PAYMENT_PROVIDER_MODE=disabled` in managed environments;
- no production communications delivery;
- manual/synthetic location fallback;
- no automated registry scraping or certificate reproduction;
- no real-money collection, holding, payout, refund or settlement.

These stop gates satisfy the Phase 10 requirement to make unapproved integrations technically and operationally explicit. They do not satisfy the separate legal and operating prerequisites for a real-participant Phase 11 pilot.

## Decision 4 — Phase 11 entry is conditional, not automatic

Completing Phase 10 repository and managed-infrastructure evidence creates an opportunity to authorize Phase 11. It does not itself authorize recruitment or real data.

Phase 11 remains blocked until the owner records:

- legal entity and Zambia operating model;
- qualified Zambia privacy, consumer, payments and tax advice;
- DPC registration/controller-processor determination and overseas storage/transfer authorization where required;
- approved participant notice, consent, retention and withdrawal package;
- named pilot, privacy/security, support and incident owners;
- bounded cohort, location, device/network and support plan.
