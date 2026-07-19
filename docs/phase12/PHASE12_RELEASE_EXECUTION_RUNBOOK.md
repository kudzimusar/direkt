# Phase 12 Release Execution Runbook

**Status:** Prepared; execution prohibited until Phase 11 and global release gates authorize formal Phase 12  
**Audience:** Release owner, Android engineer, platform/on-call, support, verification operations and incident owner

## 1. Entry gate

Do not begin release-candidate signing or Play activity until all of these are evidenced:

1. Phase 11 11C–11H primary pilot is complete.
2. Phase 11J decision is `PROCEED`.
3. Qualified Zambia legal/privacy/consumer review is signed and applicable DPC registration/overseas storage-transfer evidence is recorded.
4. Final privacy notice, terms, policy versions, retention/deletion and rights handling are live.
5. Account deletion works end-to-end from both in-app and public web request paths.
6. Android production client no longer exposes synthetic/preview marketplace paths.
7. Production support and verification staffing is operational and access-tested.
8. Production monitoring/alert routes and incident escalation are active and exercised.
9. Production backup restore evidence exists.
10. Current Google Play requirements are rechecked on the release date.
11. Exact release candidate passes accessibility/device/performance/security/regression gates.

Only after evidence is reviewed may the five source-controlled latches in `android/direkt-app/release/eligibility.properties` be changed from `false` in the same controlled release change:

- `DIREKT_FORMAL_PHASE12_AUTHORIZED`
- `DIREKT_PRODUCTION_CLIENT_READY`
- `DIREKT_ACCOUNT_DELETION_READY`
- `DIREKT_PRODUCTION_OPERATIONS_READY`
- `DIREKT_PLAY_RELEASE_READY`

The latches are evidence assertions, not substitutes for the evidence. The protected signing latch and Play publication authorization remain separate controls.

## 2. Freeze exact source

- select one approved commit SHA;
- confirm `main` and the implementation lane are synchronized;
- advance `versionCode` above every version code already used in Play Console;
- change `versionName` to the reviewed release-candidate label;
- change release channel to `release-candidate`;
- record the exact OpenAPI/backend compatibility target;
- prohibit unrelated source changes after release-candidate freeze.

## 3. Recheck Play and declarations

On the exact release date:

- confirm target API deadline and current Play policy changes from official Google sources;
- rebuild the manifest/permissions inventory from the exact candidate;
- revalidate every SDK against current Data Safety disclosure guidance;
- finalize Data Safety answers, app access instructions, content rating, target audience, ads declaration and country/device availability;
- verify privacy-policy and account-deletion URLs are public and functional;
- verify listing copy/screenshots/feature graphic match actual release behavior.

## 4. Protected signing

Use the protected environment only:

1. materialize the Play upload keystore outside the repository checkout;
2. disable Gradle configuration cache;
3. set `DIREKT_RELEASE_SIGNING_ENABLED=true`;
4. provide all required `DIREKT_UPLOAD_*` inputs from the protected secret store;
5. run the release contract validator;
6. run full exact-source regression/security/documentation gates;
7. build the signed AAB twice under the approved reproducibility procedure;
8. verify signed artifact SHA-256, signature/certificate evidence and source provenance;
9. delete ephemeral signing material from the runner.

No service-account or upload-key secret may be committed or copied into public artifacts.

## 5. Play internal testing

- upload only the signed reviewed AAB;
- verify package/version/signature;
- configure approved non-production tester identities;
- verify clean install and update path;
- test authentication, consent, account deletion request, discovery, provider workspace, evidence controls, enquiries/reviews/complaints and support routes that are present in the final app;
- validate deep links/notifications only if actually shipped;
- inspect Play pre-launch report and Android vitals;
- record defects and block promotion for unresolved P0/P1 or unaccepted high/critical issues.

## 6. Closed testing

- satisfy the actual developer-account testing eligibility rules;
- use the approved bounded tester cohort;
- keep support and incident coverage active;
- collect structured install/update/device/accessibility/connectivity and task-completion evidence;
- confirm Data Safety/listing/app-access instructions still match the tested artifact;
- do not substitute internal/synthetic evidence for real closed-test results.

## 7. Production environment pre-traffic activation

Before public Android rollout:

- deploy immutable approved backend/portal images with public traffic still disabled;
- bind numeric Secret Manager versions and least-privilege runtime identities;
- apply/verify migrations;
- verify private storage and authorization canaries;
- restore an actual production backup into isolation and record integrity/application/access checks;
- enable production monitoring/notification routes;
- run rollback, kill-switch and incident-escalation exercise;
- verify support/verification staffing coverage and queue capacity.

Production traffic must remain disabled until the final go/no-go record is approved.

## 8. Staged rollout

Sequence:

1. internal;
2. closed;
3. production 5%;
4. 10%;
5. 25%;
6. 50%;
7. 100% only within the approved geography/categories.

Use `docs/phase12/release/monitoring_rollback_rollout.json` for observation windows and stop criteria. Promotion between stages requires an explicit recorded decision; elapsed time alone never promotes a release.

## 9. Stop and rollback

Immediately stop affected rollout/processing for:

- unauthorized private data/evidence/location disclosure;
- authentication/authorization bypass or cross-provider access;
- source/signature/artifact provenance mismatch;
- invalid trust claims without current required evidence;
- production secret/signing-material exposure.

For release-correlated failure:

- halt Play rollout;
- disable new admissions/intake as appropriate;
- rollback backend to last known-good immutable revision using the proven floating-`LATEST`-safe procedure;
- do not reduce Android `versionCode`; deliver a corrected higher-version release;
- rotate/revoke affected credentials when required;
- open incident record and preserve bounded evidence.

## 10. Release record

A release is not complete until the record contains:

- exact source SHA and release tag;
- version code/name/channel;
- signed AAB SHA-256 and signing evidence;
- exact CI results;
- current Play-policy check date;
- Data Safety/privacy/content-rating/listing versions;
- Play track/test cohort and results;
- production backend/migration/backup evidence;
- monitoring/staffing/incident readiness evidence;
- rollout decisions and observation windows;
- known risks/accepted defects;
- final status and rollback target.

## Current boundary

As of 2026-07-19, this runbook is prepared but cannot be executed through signed release or Play publication. Phase 11 primary evidence/11J, legal/regulatory approvals, deletion/client cutover, staffing, production environment evidence, signing credentials and Play activity remain real gates.
