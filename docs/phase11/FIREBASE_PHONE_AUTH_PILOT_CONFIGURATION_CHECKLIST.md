# Firebase Phone Authentication — Phase 11 Wave 1 Configuration Checklist

**Status:** CONFIGURATION CHECKLIST — REAL SMS/OTP ACTIVATION STILL EXTERNAL-GATED  
**Project direction:** approved Firebase/Google project only; do not create a second identity authority in DIREKT.

## Architecture invariant

Firebase is used only to prove recent possession of an invited Zambia phone number.

```text
Firebase phone OTP
→ Firebase ID token
→ DIREKT backend verifies token + pilot latch + invite + notice/consent
→ DIREKT rotating session
→ DIREKT roles/scopes/authorization
```

Never use Firebase custom/client claims as provider/admin/reviewer authorization.

## Android app identity

Current repository application IDs:

```text
Base/release: com.kudzimusar.direkt
Debug:        com.kudzimusar.direkt.debug
```

Wave 1 should use the exact package/application identity of the artifact actually distributed. Do not register one package in Firebase and sign/distribute another.

Before enabling real phone verification, record privately:

- Firebase project ID;
- Firebase Android app ID;
- package name;
- signing certificate SHA-1;
- signing certificate SHA-256;
- artifact/release source SHA;
- distribution group/tester list.

The public repository stores no signing private key and no participant phone number.

## Provider enablement

- [ ] Phase 11 external/DPC/legal blocking evidence is complete.
- [ ] `PILOT_ENTRY_APPROVED=true` is authorized for the dedicated pilot environment.
- [ ] Firebase Authentication phone provider enabled only in the approved project.
- [ ] exact Android package registered.
- [ ] exact signing SHA fingerprints registered.
- [ ] app verification / Play Integrity path configured according to current Firebase Android Phone Auth requirements.
- [ ] reCAPTCHA fallback behavior tested where applicable.
- [ ] Firebase test phone numbers used for pre-real canaries where possible.
- [ ] real SMS region policy restricted to Zambia for Wave 1 where provider controls support it.
- [ ] conservative SMS/verification quotas configured.
- [ ] billing/cost alerting and abuse monitoring configured.
- [ ] support/security owner knows how to disable phone auth immediately.

## Build configuration

Supply through protected Gradle properties/environment variables only:

```text
DIREKT_PILOT_API_BASE_URL
DIREKT_FIREBASE_API_KEY
DIREKT_FIREBASE_APP_ID
DIREKT_FIREBASE_PROJECT_ID
DIREKT_PILOT_NOTICE_VERSION
```

Repository defaults are empty and therefore fail closed.

Required checks:

- `DIREKT_PILOT_API_BASE_URL` is HTTPS;
- `android:usesCleartextTraffic=false` remains present;
- notice version exactly equals backend `PILOT_NOTICE_VERSION` and active database policy version;
- no backend access-token secret, Supabase privileged key, external-subject HMAC pepper or service-account private key appears in APK/resources;
- Firebase client API key is restricted appropriately to the intended app/API boundary and treated as a client identifier rather than a server secret;
- distribution artifact is restricted to the approved cohort/internal test boundary.

## Firebase ID-token backend verification

The promoted backend requires:

- Firebase mode enabled only in approved pilot environment/data mode/latch;
- RS256 token signature from Google SecureToken certificate;
- exact configured project audience;
- exact `https://securetoken.google.com/<project>` issuer;
- token unexpired;
- issued/authentication times within policy;
- recent authentication ceremony (default maximum age 300 seconds);
- `firebase.sign_in_provider=phone`;
- Zambia `+260` phone number shape;
- current configured pilot notice version accepted;
- current invite/admission requirement satisfied.

A valid Firebase token alone is insufficient for DIREKT admission.

## Invite-only control

Before real OTP distribution to a participant, operations should create a bounded invitation through the protected pilot invitation API.

The backend stores:

- phone HMAC digest;
- masked display hint;
- customer/provider participant type;
- wave number;
- exact canonical policy version;
- expiry/status/creator/claim metadata.

It does not store the raw invitation phone value in the invitation row.

Per-wave hard caps:

- 8 providers;
- 20 customers.

Uninvited verified phones cannot create a new DIREKT identity/session.

## Phone recycling and recovery

Permanent rule:

- same already-bound Firebase subject + same verified phone may re-enter subject to current admission/consent;
- different Firebase subject for a bound phone is denied;
- an existing legacy/unbound DIREKT phone contact is never auto-linked to a new Firebase subject;
- recovery/manual verification is required for those cases.

Do not weaken this to reduce support friction.

## Consent behavior

The Android UI must require active acceptance of the exact injected approved notice version before OTP starts and while code verification is completed.

The backend also requires:

```text
noticeVersion == configured PILOT_NOTICE_VERSION
consentAccepted == true
```

On first/current-policy admission, canonical `account.consents` is written.

If the latest current-policy consent becomes revoked:

- a new Firebase-backed DIREKT session is blocked;
- fresh current-policy invitation + explicit re-consent is required to re-enter, subject to approved withdrawal/re-entry policy.

## Abuse and privacy canaries

Before Wave 1:

- [ ] invalid/non-Zambia phone cannot pass backend token policy;
- [ ] wrong Firebase project token rejected;
- [ ] stale auth ceremony rejected;
- [ ] uninvited number cannot create identity/session;
- [ ] invite expiry/revocation blocks admission;
- [ ] different-subject same-phone attempt blocked;
- [ ] legacy/unbound phone auto-link blocked;
- [ ] backend exchange rate limit enforced;
- [ ] raw Firebase UID absent from DB/logs;
- [ ] raw invitation phone absent from invitation DB/logs;
- [ ] ID token not logged;
- [ ] Android DIREKT refresh/access session encrypted at rest;
- [ ] Firebase local user signs out after successful DIREKT exchange;
- [ ] session revocation works;
- [ ] consent withdrawal/re-entry canary works.

## SMS/recruitment boundary

The app can only prove invite admission after Firebase verifies the phone and the backend sees the verified number. Therefore operational Wave 1 control also requires:

- restricted app distribution to named/approved invitees;
- invitations created before recruitment;
- Zambia-only SMS policy/quotas where available;
- no public APK/link promotion;
- no unrestricted signup messaging;
- monitoring for unexpected OTP attempts.

If OTP abuse exceeds the approved threshold, disable phone auth/pilot traffic and investigate before restart.

## Evidence to retain privately

Evidence ID:

```text
P11A-PROVIDER-FIREBASE-001
```

Retain privately:

- project/app/provider configuration screenshots/export;
- package + SHA fingerprint evidence;
- SMS region/quota/abuse settings;
- Play Integrity/app-verification evidence;
- test-number canary output;
- real first canary delivery result after legal/regulatory approval;
- billing/quota owner;
- kill-switch procedure.

Only safe metadata/reference should enter GitHub.
