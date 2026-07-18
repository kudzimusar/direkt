# Phase 11A Managed Real-Pilot Activation Runbook

**Status:** PREPARED — DO NOT EXECUTE REAL PARTICIPANT ACTIVATION UNTIL EXTERNAL BLOCKING EVIDENCE EXISTS  
**Governing issue:** #112  
**Scope:** Wave 1 only — Kabwata + Chilenje wards, maximum 8 providers + 20 customers.

## Purpose

This runbook defines the exact sequence for moving DIREKT from the current promoted, fail-closed technical checkpoint into a controlled real-participant Wave 1.

It deliberately separates:

1. external regulatory/legal/provider evidence;
2. managed infrastructure activation;
3. privacy/security canaries;
4. invite-only cohort admission;
5. primary validation.

No step may be skipped merely because later code already exists.

## 0. Preconditions

Record safe evidence metadata for every blocking item before changing real-data/runtime flags.

Required:

- `P11A-LEGAL-DPC-REG-001` — applicable Zambia DPC controller-registration evidence;
- `P11A-LEGAL-XFER-001` — applicable overseas storage/transfer authorization/lawful mechanism for the exact real-data topology;
- `P11A-LEGAL-COUNSEL-001` — qualified Zambia legal/privacy/consumer decision for the bounded pilot;
- final approved `pilot_participation_notice` version and document hash;
- approved controller/privacy/support contact details in the private participant-facing copy;
- final processor/service topology matching the approved filings/review;
- Firebase real-pilot use approved for the exact Android/project/SMS/auth configuration;
- named Wave 1 owner/support/security/incident contacts confirmed.

Do not put certificates, applicant identity documents, signed legal opinions, raw participant contact details or secrets in GitHub.

## 1. Freeze the activation source

Choose one immutable reviewed source commit.

Requirements:

- `main` and `build/android-v1` synchronized;
- all permanent workflows green on that source;
- no unresolved critical/high security, privacy, authorization or migration blocker;
- PR/review evidence recorded;
- release/activation source SHA recorded as `P11A-MANAGED-PILOT-DEPLOY-001` metadata.

Do not deploy a moving branch tip without recording the exact commit.

## 2. Register the final policy version

The approved participant notice must use canonical policy key:

```text
pilot_participation_notice
```

Before inserting it:

- confirm qualified review is for the exact document version;
- generate a cryptographic hash of the exact final participant-facing document;
- record effective date/time;
- confirm any prior draft/test version is not active for real participants.

Insert the final version through a forward-only migration or an approved auditable administrative path consistent with existing policy-version governance.

Required checks:

- policy key/version unique;
- hash matches the final approved document byte-for-byte;
- `effective_at` correct;
- no unintended active competing version;
- Android build/runtime `DIREKT_PILOT_NOTICE_VERSION` exactly matches backend `PILOT_NOTICE_VERSION` and database version.

Do not use `2026-07-19-draft-1` for real participants.

## 3. Prepare the dedicated pilot environment

The controlled pilot must not silently turn Phase 10 synthetic/private staging into public production.

Required environment identity:

```text
DIREKT_ENVIRONMENT=pilot
DIREKT_DATA_MODE=controlled-pilot
DIREKT_TRAFFIC_MODE=disabled   # first deployment / pre-entry canaries
PILOT_ENTRY_APPROVED=true      # only after Step 0 evidence exists
AUTH_CHALLENGE_MODE=disabled
FIREBASE_AUTH_MODE=firebase
FIREBASE_PROJECT_ID=<approved project id>
FIREBASE_MAX_AUTH_AGE_SECONDS=300
PILOT_NOTICE_VERSION=<exact approved active version>
EVIDENCE_STORAGE_PROVIDER=supabase
PAYMENT_PROVIDER_MODE=disabled
```

Protected runtime secrets:

- `DATABASE_URL` / direct migration boundary as approved;
- access-token signing secret;
- contact HMAC pepper;
- challenge pepper where retained for non-pilot paths;
- external-subject HMAC pepper;
- rate-limit HMAC pepper;
- Supabase server secret/service-role key only on the backend;
- any other required runtime secret approved for the pilot.

Rules:

- numeric/pinned Secret Manager versions for managed deployment where the Phase 10 pattern requires them;
- no secret in Android source, Gradle file, GitHub issue/comment or public artifact;
- no Supabase privileged key in Android;
- no Firebase service-account private key in Android;
- backend authorization remains authoritative.

## 4. Configure Firebase for the approved Android pilot

Use the approved Firebase/Google project and exact app identity.

Required checklist:

- [ ] Android app registration matches the pilot application ID actually distributed;
- [ ] debug/pilot and later production app identities are not conflated accidentally;
- [ ] correct SHA-1/SHA-256 fingerprints registered for the signing certificate used by the pilot artifact;
- [ ] phone sign-in provider enabled only after external approval;
- [ ] SMS region policy restricted to Zambia (`ZM`) for the pilot where Firebase configuration supports it;
- [ ] SMS/verification quotas and budget/cost monitoring set conservatively;
- [ ] Firebase abuse controls enabled;
- [ ] Play Integrity/App verification path configured as required by current Firebase Android Phone Auth guidance;
- [ ] reCAPTCHA fallback behavior understood/tested for environments where required;
- [ ] test phone numbers used for synthetic/pre-real canaries where appropriate so verification quota is not consumed;
- [ ] project/app/API values supplied only through protected build inputs;
- [ ] no unrestricted Firebase project credential committed to the repository;
- [ ] phone-auth disclosure matches final approved notice.

Evidence ID:

```text
P11A-PROVIDER-FIREBASE-001
```

Record only safe configuration metadata/screenshots privately; do not expose secrets or participant phone numbers.

## 5. Deploy database migration and verify privacy boundaries

Apply all checksummed migrations to the dedicated pilot database boundary, including:

- `account.external_identities`;
- `account.pilot_invitations`;
- `pilot.invitations.manage` permission assignments.

Verify:

- migration ledger clean;
- no edited historical migration;
- private buckets remain private;
- browser/mobile clients have no direct privileged database access;
- `account.external_identities` contains only HMAC subject digests;
- `account.pilot_invitations` contains only HMAC contact identifiers + masked hints;
- policy/version FK enforcement works;
- per-wave caps enforce 8 providers / 20 customers;
- revoked/expired invites cannot be claimed;
- existing unbound/legacy phone contacts cannot auto-link to Firebase subjects.

## 6. Deploy API with traffic still disabled

Deploy the immutable API candidate with:

```text
DIREKT_TRAFFIC_MODE=disabled
```

Run readiness checks:

- process non-root;
- exact source/image digest;
- secret bindings pinned;
- no public privileged database boundary;
- `/ready` and dependency checks healthy;
- audit/rate-limit stores healthy;
- payment provider disabled;
- Maps/Sentry/communications adapters remain disabled unless separately approved;
- no public pilot promotion/indexing.

Do not open participant traffic yet.

## 7. Build the Android pilot artifact

Inject only approved non-secret runtime values through protected build inputs:

```text
DIREKT_PILOT_API_BASE_URL=https://<approved-pilot-api-host>
DIREKT_FIREBASE_API_KEY=<approved restricted client key/value>
DIREKT_FIREBASE_APP_ID=<approved Firebase Android app id>
DIREKT_FIREBASE_PROJECT_ID=<approved project id>
DIREKT_PILOT_NOTICE_VERSION=<exact active policy version>
```

Before distribution:

- app build succeeds;
- Android lint/unit/performance checks pass;
- `android:usesCleartextTraffic=false` confirmed;
- API URL is HTTPS;
- repository default build remains fail-closed;
- no privileged backend/Supabase secret in APK/resources;
- application ID/signing fingerprint matches Firebase configuration;
- distribution restricted to named Wave 1 cohort/test owners.

## 8. Create canary invitations only

Before opening general Wave 1:

- create one authorized customer canary invite and one authorized provider canary invite through the protected pilot-invitation API;
- use real data only after Step 0 approvals permit it; before that use approved Firebase test phone numbers/synthetic fixtures;
- verify masked display hints only in operations views;
- verify no raw phone appears in DB invitation rows, logs, CI artifacts or telemetry;
- verify invite expiry/revocation.

Do not bulk-load the full cohort yet.

## 9. Authentication canary

Evidence ID:

```text
P11A-CANARY-AUTH-001
```

Validate:

1. uninvited number cannot create DIREKT identity/session;
2. invited number tied to current policy version can request OTP only after active notice consent in the app;
3. backend verifies Firebase token and exact pilot latch;
4. canonical `account.consents` acceptance recorded for exact policy version;
5. invite becomes claimed;
6. raw Firebase UID not stored;
7. raw phone not stored in invitation table;
8. DIREKT access/refresh session created and encrypted on Android;
9. Firebase signs out after exchange;
10. DIREKT role resolution remains server-side;
11. second valid login for same bound subject/phone reuses same identity;
12. different Firebase subject for same phone is denied/recovery path;
13. legacy/unbound existing phone is denied/recovery path;
14. rate limiting behaves as expected.

Any P1/P0 failure => stop activation.

## 10. Consent withdrawal canary

Evidence ID:

```text
P11A-CANARY-WITHDRAWAL-001
```

Validate:

- record current-policy consent withdrawal/revocation through the approved operational workflow;
- revoke active DIREKT sessions where the approved withdrawal process requires it;
- verify a new Firebase exchange is blocked without fresh current-policy invite/re-consent;
- verify optional contact/location/research consent withdrawal remains separable;
- verify support/audit trail contains minimized metadata only.

Do not treat the automated re-entry block as the entire legal withdrawal process; processor/deletion propagation remains required.

## 11. Deletion/privacy canary

Evidence ID:

```text
P11A-CANARY-DELETION-001
```

Using approved canary data:

- exercise account/data deletion/restriction procedure as qualified review requires;
- verify expected database deletion/anonymization;
- verify external identity binding handling;
- verify invitation/consent/audit retention follows approved retention/legal-hold rules;
- verify Firebase/provider deletion/revocation steps where applicable;
- verify storage objects are removed or retained only under documented lawful hold;
- verify no public artifact/log retains protected content.

If a deletion path is not automated, record the exact manual operational step and owner; do not claim automation that does not exist.

## 12. Private storage canary

Evidence ID:

```text
P11A-CANARY-STORAGE-001
```

Validate:

- evidence upload goes only through canonical backend/storage path;
- private bucket/object;
- no public URL;
- authorized reviewer access only;
- expired/revoked assignment loses access;
- no cross-provider evidence access;
- object reference is opaque/minimized;
- deletion/retention action follows approved schedule;
- no evidence content in telemetry/logs.

## 13. Open controlled-pilot traffic

Only after Steps 0–12 pass:

```text
DIREKT_TRAFFIC_MODE=controlled-pilot
```

Keep:

```text
DIREKT_ENVIRONMENT=pilot
DIREKT_DATA_MODE=controlled-pilot
PILOT_ENTRY_APPROVED=true
FIREBASE_AUTH_MODE=firebase
PAYMENT_PROVIDER_MODE=disabled
```

Opening traffic means only the approved invite-only cohort can authenticate. It does **not** authorize:

- unrestricted signup;
- public promotion;
- public Play rollout;
- production claims;
- real payments;
- Maps/Sentry/communications activation not separately approved;
- field-visit claims before field gate.

## 14. Wave 1 invitation release

Release no more than:

- 8 provider invitations;
- 20 customer invitations.

The backend enforces the per-wave cap.

Operationally verify the intended mix rather than filling all slots indiscriminately.

Do not create Wave 2/3 invitations before the prior-wave checkpoint.

## 15. Begin 11C–11H evidence capture

Use `PILOT_VALIDATION_EVIDENCE_REGISTER.md`.

Required evidence includes:

- provider onboarding completion/abandonment and evidence rework;
- trust-language comprehension;
- discovery/manual/location fallback;
- enquiry/response/contact-consent behavior;
- operations/reviewer/support load;
- device/network/recovery matrix;
- privacy/withdrawal/incidents;
- willingness-to-pay/unit-cost evidence without real payment activation.

Synthetic tests remain regression evidence only; they cannot replace real participant findings.

## 16. Wave checkpoint

After Wave 1:

- apply numeric stop/pause thresholds;
- classify each finding as defect/assumption/request;
- correct legitimate defects in canonical production code;
- run full regressions/staging validation;
- decide STOP / REPEAT / NARROW / continue to next bounded wave.

Never expand because slots are available. Expand only because evidence supports it.

## Emergency kill switch

Immediate actions if a critical/high incident occurs:

1. set pilot traffic disabled / revoke participant access at the approved runtime control;
2. stop new invitations;
3. revoke affected sessions/contact grants;
4. preserve necessary incident evidence without uncontrolled copying;
5. notify security/privacy/incident owners;
6. apply regulator/data-subject notification rules from qualified review;
7. remediate and revalidate before restart.

Payments, Maps, Sentry and unapproved communications remain independent kill-switchable boundaries.

## Exit from 11A

11A real entry is marked complete only after:

- external blocking evidence is real and recorded;
- final policy version is approved and active;
- managed pilot deployment exists;
- Firebase provider/app configuration is approved and verified;
- invitation/auth/consent/withdrawal/deletion/storage canaries pass;
- Wave 1 can be opened without weakening any prior Phase 4–10 trust/privacy/security invariant.

At that point Phase 11 continues into 11C–11J. It is **not** Phase 11 completion and does not authorize Phase 12.
