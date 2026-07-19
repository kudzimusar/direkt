# Firebase Phone Authentication Pilot Configuration Checklist

**Status:** CODE PATH IMPLEMENTED — REAL PARTICIPANT CONFIGURATION EXTERNALLY GATED  
**Applies to:** Phase 11 bounded Zambia pilot

## Current technical baseline

The promoted backend/Android implementation already provides:

- Firebase phone ID-token verification on the backend;
- Zambia phone-number format enforcement;
- recent-authentication-age control;
- invite-only admission;
- canonical policy-version consent binding;
- external subject HMAC hashing rather than raw Firebase UID storage;
- phone-recycling/account-conflict protection;
- rotating DIREKT application sessions after Firebase exchange;
- abuse-control integration;
- fail-closed requirement for pilot environment, controlled-pilot data mode and approved entry latch;
- Android Keystore-protected DIREKT session storage;
- participant notice/consent required before OTP initiation.

The managed synthetic cohort contains zero Firebase external identities and zero real invitations.

## Real configuration gate

Do not activate real phone authentication until DPC/legal/provider entry requirements are satisfied.

Required external evidence:

- DPC controller registration as applicable;
- overseas storage/transfer authorization for Firebase/Google real-data processing as applicable;
- qualified Zambia review of the participant disclosure/consent wording;
- final approved real notice version;
- approved real pilot environment and support/incident owners.

## Firebase console configuration

Before real canary:

- [ ] Confirm exact Firebase project: `direkt-dev-502701`.
- [ ] Confirm exact Android application/package IDs used for pilot distribution.
- [ ] Enable Phone sign-in only for the approved environment.
- [ ] Configure SMS region policy for Zambia as intended; do not leave an unintended global region policy.
- [ ] Register required SHA-256 signing fingerprints for Play Integrity/app verification.
- [ ] Register SHA-1 only where required for approved reCAPTCHA fallback.
- [ ] Confirm Play Integrity/app verification behavior for the exact pilot build.
- [ ] Confirm reCAPTCHA fallback behavior and approved API-key/domain restrictions if fallback is used.
- [ ] Configure SMS quotas/budgets/abuse controls.
- [ ] Separate Firebase fictional test numbers from real participant numbers.
- [ ] Confirm no test phone number or verification code is hardcoded in the production participant app.

## Android build inputs

Real pilot build inputs remain protected configuration, never source constants:

```text
DIREKT_PILOT_API_BASE_URL
DIREKT_FIREBASE_API_KEY
DIREKT_FIREBASE_APP_ID
DIREKT_FIREBASE_PROJECT_ID
DIREKT_PILOT_NOTICE_VERSION
```

Checklist:

- [ ] HTTPS API base URL only.
- [ ] Exact Firebase project/app values injected through approved protected build configuration.
- [ ] No unrestricted production API key committed to GitHub.
- [ ] No `google-services.json` containing unmanaged real credentials committed merely to make the pilot work.
- [ ] Exact signing artifact/fingerprint relationship documented privately.
- [ ] Restricted distribution remains limited to the approved cohort/testers.

## Backend activation inputs

Real canary requires explicit protected values:

```text
DIREKT_ENVIRONMENT=pilot
DIREKT_DATA_MODE=controlled-pilot
FIREBASE_AUTH_MODE=firebase
FIREBASE_PROJECT_ID=<approved project>
PILOT_NOTICE_VERSION=<approved real version>
EXTERNAL_SUBJECT_HASH_PEPPER=<server-only secret>
PILOT_ENTRY_APPROVED=true
```

Rules:

- `PILOT_ENTRY_APPROVED=true` is last, not first.
- Never use the synthetic notice version as the real participant notice.
- Never reuse the synthetic activation path to create real identities.
- Pepper stays server-only and must not appear in Android, logs, GitHub or public artifacts.

## Real canary sequence

Run with cohort traffic still restricted:

1. create one approved real pilot invitation through the protected operations path;
2. display the approved notice before OTP request;
3. obtain participant consent;
4. request OTP through Firebase;
5. verify app-verification behavior;
6. exchange Firebase ID token with DIREKT backend;
7. confirm exactly one external identity binding and one DIREKT identity;
8. confirm correct role/permission boundary;
9. sign out/re-enter and confirm same identity;
10. confirm different Firebase subject cannot inherit an already-bound phone identity;
11. confirm withdrawal/revocation blocks re-entry without a fresh approved invitation/consent;
12. inspect logs/telemetry for raw phone/token leakage;
13. confirm kill switch disables new entry.

## Synthetic versus real OTP tests

Firebase fictional phone-number tests may validate integration without sending a real SMS, but they do not prove:

- Zambia carrier SMS delivery;
- delivery latency;
- real-device Play Integrity behavior across recruited devices;
- real participant comprehension;
- cost/quotas under real usage.

Record fictional-number tests as `SYNTHETIC`/`SYSTEM-METRIC`, never `PRIMARY-PILOT`.

## Abuse and privacy checks

- [ ] Rate limits applied before/around exchange path.
- [ ] No raw Firebase UID persisted.
- [ ] No raw phone stored in external identity binding.
- [ ] Invitation storage remains HMAC digest + masked hint.
- [ ] Firebase phone disclosure included in approved real notice.
- [ ] Google/Firebase overseas processing included in approved DPC/legal analysis.
- [ ] No phone number in analytics/Sentry/public CI artifacts.
- [ ] Session replay/refresh rotation remains enforced.
- [ ] Revocation/withdrawal path tested.

## Exit condition

This checklist is complete for real pilot activation only when configuration evidence, canary results and external approval references are recorded. Code implementation or a Firebase console account alone is not sufficient.
