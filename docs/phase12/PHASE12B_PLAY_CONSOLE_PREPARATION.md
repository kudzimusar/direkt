# Phase 12B — Google Play Console Preparation

**Date:** 2026-07-19  
**Status:** Preauthorization engineering complete when the permanent gate passes; Play submission remains blocked  
**Formal Phase 12 authorization:** Not granted

## Purpose

Prepare the Google Play listing, permissions declaration, Data Safety source inventory, content/distribution answers and reviewer-access requirements from repository truth without submitting anything to Play Console or pretending the current synthetic/preview Android surfaces are production-ready.

## Repository-controlled sources

- `docs/phase12/play/store_listing.json` — canonical candidate listing copy and store/contact/asset requirements.
- `docs/phase12/play/permissions_inventory.json` — exact merged release-manifest permission inventory and future permission rules.
- `docs/phase12/play/data_safety_inventory.json` — SDK/runtime data collection inventory and candidate Play mappings.
- `docs/phase12/play/content_distribution_inventory.json` — IARC/target-audience/country/device/testing-account preparation.
- `scripts/verify-phase12-play-readiness.py` — fail-closed consistency validator.
- `.github/workflows/phase12-play-readiness.yml` — permanent non-publishing Phase 12B gate.

## Current Android truth

The source application manifest explicitly requests `android.permission.INTERNET`, but the **merged release manifest** also includes declarations contributed by Android/Firebase/AndroidX dependencies. The exact current merged permission inventory is:

```text
android.permission.ACCESS_NETWORK_STATE
android.permission.INTERNET
com.google.android.providers.gsf.permission.READ_GSERVICES
com.kudzimusar.direkt.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
```

These declarations do not add a dangerous runtime permission prompt. No location, background location, contacts, SMS, call-log, broad storage, camera, microphone or notification runtime permission is currently declared. Therefore the current artifact does not require a high-risk/sensitive permission justification based on these declarations. Google Play still makes the final determination from the uploaded AAB, so this must be rechecked on the exact release candidate.

The Phase 0–12 integration audit corrected an earlier Phase 12B inventory assumption that inspected the app-authored permission as though it were the complete packaged permission surface. The permanent gate now treats the reviewed merged-manifest inventory as authoritative and fails whenever the actual merged manifest changes without a matching reviewed inventory update.

Firebase Authentication is the only Firebase runtime SDK declared in the Android release dependency surface. When protected phone authentication is enabled, the Data Safety inventory accounts for phone number, authentication/user identifiers and Firebase automatic security/service metadata. No analytics, Crashlytics, Sentry, FCM, Maps, ad or payment SDK is currently activated in the Android release dependency surface.

## Store listing candidate

The candidate listing intentionally describes the durable product purpose rather than claiming that the current preauthorization artifact is publicly launch-ready.

- App name: `DIREKT Local Services`
- Initial market: Zambia
- Candidate category: Business
- Ads: none
- Real payments: disabled during preauthorization
- Public trust language: scoped evidence-backed claims only; no blanket verified badge claim

The listing source enforces current Play text limits:

- app name: 30 characters maximum;
- short description: 80 characters maximum;
- full description: 4,000 characters maximum.

## Graphic asset specification

Before Play submission the release owner must provide assets that match the actual release-candidate UI:

- 512×512 Play icon, 32-bit PNG with alpha, maximum 1024 KB;
- 1024×500 feature graphic, JPEG or 24-bit PNG without alpha;
- at least two phone screenshots; four high-resolution phone screenshots are the planned baseline;
- alt text for screenshots/graphics;
- only synthetic or explicitly consented non-sensitive content in capture data.

Current preview/synthetic screenshots must not be presented as production behavior if the release-candidate UI differs.

## Data Safety boundary

Google Play requires accurate Data Safety declarations for apps on closed, open and production tracks; an app exclusively on internal testing is exempt until it moves beyond internal testing. DIREKT must still prepare the form before closed testing because Phase 12 requires closed testing.

The repository inventory deliberately does **not** claim:

- end-to-end account deletion support;
- final legal retention/lawful-basis approval;
- collection of real evidence/location/enquiry/review data through Android before those flows are actually production-connected;
- analytics/crash/advertising SDK collection that is not present;
- independent security-review badges or optional claims without evidence.

## Account deletion blocker

Current Android supports sign-out/session clearing but does not yet prove the complete Google Play account deletion requirement. Because the app supports account creation/admission when Firebase phone authentication is activated, release readiness eventually requires:

1. an in-app path to request account deletion;
2. a public web resource that allows a former/uninstalled user to request deletion without reinstalling the app;
3. backend deletion/retention/legal-hold fulfillment behavior;
4. privacy policy and Data Safety answers consistent with that behavior;
5. qualified Zambia review for retention, legal holds and rights handling before real production data.

This remains a formal-release blocker. Phase 12B records it rather than fabricating a support email, public deletion URL or completed deletion workflow.

## Content rating and audience

An IARC content rating is mandatory and must be generated by the Play Console questionnaire. The repository therefore stores candidate questionnaire facts but makes no rating claim.

Current product facts for the eventual questionnaire include:

- no violence, sexual content, gambling, ads or controlled-substance content in product scope;
- bounded user-generated reviews/enquiries/complaints when the production interaction flow is connected;
- potential user-to-provider communication through a tracked enquiry and separately consented external contact handoff;
- no background location sharing;
- provider commercial subscriptions exist architecturally, but real payments remain disabled in preauthorization.

The candidate target audience is adults (18+) because service contracting, provider evidence, complaints and subscriptions are not designed for children. The final Play Console answer remains a manual release decision.

## Developer account and testing prerequisites

Before any Play track activity, the release owner must verify the actual Play developer account state rather than assume it:

- verified identity and contact details;
- correct Personal versus Organization account type for the operating entity;
- D-U-N-S/organization verification when an Organization account is used;
- physical Android device verification when Play requires it for the account;
- any closed-test production-access requirement that applies to the account.

For Personal developer accounts created after 2023-11-13, current Play guidance requires a closed test with at least 12 opted-in testers continuously for 14 days before applying for production access. This condition must be checked against the actual account because the repository does not know the account type/creation date.

## Current 2026 Play policy checkpoint

Official sources reviewed on 2026-07-19:

- Target API requirement: <https://developer.android.com/google/play/requirements/target-sdk>
- Data Safety: <https://support.google.com/googleplay/android-developer/answer/10787469>
- User Data policy: <https://support.google.com/googleplay/android-developer/answer/10144311>
- Permission declarations: <https://support.google.com/googleplay/android-developer/answer/9214102>
- Account deletion: <https://support.google.com/googleplay/android-developer/answer/13327111>
- Store assets: <https://support.google.com/googleplay/android-developer/answer/9866151>
- Store listing setup: <https://support.google.com/googleplay/android-developer/answer/9859152>
- Content ratings: <https://support.google.com/googleplay/android-developer/answer/9859655>
- New Personal account testing: <https://support.google.com/googleplay/android-developer/answer/14151465>
- Firebase Android data disclosure guidance: <https://firebase.google.com/docs/android/play-data-disclosure>

From 2026-08-31, standard mobile new apps and updates must target Android 16 / API 36 or higher. DIREKT already compiles and targets API 36.

## Production eligibility blocker discovered by Phase 12B

The current Android UI still includes explicit synthetic/preview surfaces, including fictional discovery providers/maps and synthetic interaction flows. That is acceptable for preauthorization/testing but cannot be silently represented as a production marketplace.

The Phase 12B validator reports this as `synthetic_preview_release_blocker=true`. This is deliberately **not** a failing condition for preauthorization inventory preparation, but the formal release gate must refuse a production/release-candidate artifact until the evidence-led post-pilot client cutover has removed or isolated preview content from the production path.

This blocker is tied to Phase 11/11I because real pilot findings may change the final production client behavior. Phase 12 preparation must not freeze unvalidated synthetic UX as the production product.

## What Phase 12B clears

- repository-controlled store listing candidate;
- exact merged Android permission inventory;
- current Data Safety/SDK source inventory;
- content-rating questionnaire facts without fabricating a rating;
- target-audience/country/device/testing prerequisites;
- graphic asset requirements;
- permanent consistency CI;
- explicit account-deletion and synthetic-preview blockers.

## What remains manual/external

- actual Play developer account verification;
- final public support contact, website and privacy policy URL;
- qualified Zambia approval of the final privacy/retention/rights wording;
- production account-deletion request and fulfillment evidence;
- final screenshots/feature graphic captured from the approved release candidate;
- IARC questionnaire submission and generated rating;
- Play Console Data Safety form submission;
- reviewer test credentials;
- internal/closed track creation and tester activity;
- Play review/approval.

None of those may be marked complete from repository preparation alone.
