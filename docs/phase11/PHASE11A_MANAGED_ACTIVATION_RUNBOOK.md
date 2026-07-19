# Phase 11A Managed Real-Pilot Activation Runbook

**Status:** REAL-PARTICIPANT ACTIVATION RUNBOOK — NOT YET AUTHORIZED  
**Synthetic managed activation:** Complete and separately recorded  
**Governing issue:** #112

## Purpose

Define the controlled sequence for moving from the completed synthetic checkpoint into a real, bounded Zambia pilot without weakening the existing production-shaped architecture or confusing configuration with legal authorization.

## Preconditions

Before any real participant invitation:

- [ ] DPC controller registration evidence recorded.
- [ ] Applicable overseas storage authorization recorded.
- [ ] Applicable overseas transfer authorization recorded.
- [ ] Zambia-qualified privacy/data-protection/consumer review recorded by private reference.
- [ ] Final participant/provider notice and consent wording approved.
- [ ] Real notice version/hash/effective date registered.
- [ ] Processor/provider terms confirmed for services receiving real data.
- [ ] Named access list, support contacts and incident contacts confirmed.
- [ ] Firebase real provider configuration approved.
- [ ] No unresolved critical/high security or privacy blocker.

## Step 1 — Freeze source

Select an immutable source checkpoint that has passed:

- backend CI;
- Android CI and performance gates where applicable;
- container/build gates;
- supply-chain/security gates;
- migration checks;
- OpenAPI/client compatibility checks;
- recovery/reliability checks;
- documentation quality.

Do not deploy from a mutable local workspace.

## Step 2 — Register external evidence references

Record sanitized/private references only:

```text
DPC controller registration reference: <private reference>
Overseas storage authorization reference: <private reference>
Overseas transfer authorization reference: <private reference>
Qualified legal/privacy review reference: <private reference>
Approved notice version: <version>
Approved notice hash: <hash>
Effective date: <date>
```

Never commit private regulator credentials, identity documents or privileged legal advice.

## Step 3 — Register final policy version

Create the immutable real participant policy version only after qualified approval.

Requirements:

- unique real version ID;
- exact document hash;
- publication/effective timestamp;
- no reuse of `synthetic-demo-v1`;
- no invitations bound to an unapproved policy version.

## Step 4 — Prepare protected pilot runtime

Keep traffic disabled/restricted while configuring:

- Supabase/Postgres/PostGIS/private Storage;
- Cloud Run API and operations portal with IAM/private controls;
- Secret Manager/runtime secrets;
- Firebase project/application/signing configuration;
- approved logging/monitoring boundary;
- restricted Android distribution.

Maps, Sentry real-participant telemetry, production WhatsApp/call delivery and payments remain disabled unless separately approved.

## Step 5 — Verify migrations and storage

- [ ] DIREKT migration ledger matches repository checksums.
- [ ] No unknown/out-of-band schema drift.
- [ ] Required private Storage buckets exist and are non-public.
- [ ] Signed/private upload paths cannot be enumerated publicly.
- [ ] Real evidence objects are accessible only through approved authorization.
- [ ] Backup/restore and deletion behavior remain valid.

## Step 6 — Configure Firebase real phone authentication

Follow `FIREBASE_PHONE_AUTH_PILOT_CONFIGURATION_CHECKLIST.md`.

Keep `PILOT_ENTRY_APPROVED=false` until all canaries below pass.

## Step 7 — Build restricted Android artifact

- exact approved source;
- protected configuration injection;
- correct Firebase app/project values;
- exact signing fingerprints;
- no debug/test secrets;
- no fictional numbers embedded;
- restricted tester distribution only.

## Step 8 — Invitation canary

Using a single approved real test participant/contact under the legal boundary:

1. create invitation through protected operations API;
2. verify raw phone is not stored in invitation table;
3. verify masked display hint/HMAC digest behavior;
4. verify wave/type cap enforcement;
5. verify duplicate/revoked/expired invitation behavior.

## Step 9 — Authentication canary

1. show approved notice;
2. record consent;
3. request Firebase OTP;
4. verify real SMS/app verification;
5. exchange valid Firebase ID token;
6. confirm one DIREKT identity/external binding;
7. confirm no role escalation;
8. confirm re-entry identity stability;
9. confirm phone-recycling/account-conflict protection;
10. inspect logs for phone/token leakage.

## Step 10 — Private evidence/storage canary

For an approved test provider:

```text
upload request
→ private object upload
→ completion/checksum
→ evidence item/version
→ reviewer access
→ case linkage
→ deletion/retention test
```

Confirm:

- object is not public;
- unrelated users/providers cannot access it;
- evidence metadata and object state stay consistent;
- private coordinates/evidence do not enter public discovery/logs.

## Step 11 — Withdrawal/deletion canary

1. withdraw consent/participation;
2. revoke active contact grants;
3. remove/pause public discovery where applicable;
4. cancel unnecessary pending uploads;
5. block silent re-entry;
6. delete/anonymize eligible data;
7. preserve only approved legal/security/complaint holds;
8. verify processor propagation where applicable;
9. record minimized completion receipt.

## Step 12 — Kill-switch canary

Prove the accountable owner can stop:

- new invitations;
- new authentication entry;
- evidence intake;
- affected public discovery/interaction paths;
- pilot traffic.

Do not proceed if containment depends on an ad-hoc database edit.

## Step 13 — Entry decision

Only after Steps 1–12 pass may the accountable owner record a real-entry authorization and set the technical latch.

Then, and only then:

```text
DIREKT_ENVIRONMENT=pilot
DIREKT_DATA_MODE=controlled-pilot
DIREKT_TRAFFIC_MODE=controlled-pilot
PILOT_ENTRY_APPROVED=true
```

The exact environment vocabulary must match the promoted runtime configuration schema.

## Step 14 — Wave 1 release

Maximum:

- 8 providers;
- 20 customers.

Supply-before-demand rule:

- at least 3 eligible discoverable providers before customer recruitment for an active category.

Wave 1 defaults:

- manual/list-first discovery;
- no field-visited claim;
- no real payments;
- no production WhatsApp/call automation;
- no Sentry real-participant telemetry unless separately approved;
- Maps not required.

## Pause/stop behavior

Apply the documented numeric thresholds and immediate-stop rules. Any auth/authz bypass, unauthorized private-data exposure, false trust claim or inability to honor required consent/withdrawal restrictions stops the affected path immediately.

Restart requires documented containment, corrective action and revalidation.

## Evidence classification

- real participant/operation finding → `PRIMARY-PILOT`;
- approved runtime measurement → `SYSTEM-METRIC`;
- demo/fake identity/device scenario → `SYNTHETIC`;
- online/regulator research → `SECONDARY-OFFICIAL`;
- unvalidated model/value → `ASSUMPTION`.

Never upgrade a synthetic or secondary result to `PRIMARY-PILOT` merely because it helped the app reach functional readiness.
