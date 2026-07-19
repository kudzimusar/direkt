# DIREKT Repository and Documentation Reconciliation — 2026-07-19

**Status:** Authoritative current-state overlay under Issue #133  
**Purpose:** Resolve contradictions between historical plans, current source, managed infrastructure evidence and owner-configured external integrations without deleting useful historical specifications.

## 1. Why this reconciliation exists

DIREKT accumulated several valid but time-separated truth layers: early plans, phase checkpoints, current source, managed infrastructure evidence, owner-side provider/domain configuration completed outside the repository, and later Phase 11/12 controls.

Some older documents remain useful requirements/history but became stale as statements of **current** state. This overlay identifies the superseding truth while preserving those documents.

## 2. Evidence hierarchy

For current-state questions use, in order:

1. exact current `main` source and merged PRs;
2. managed workflow/deployment evidence tied to immutable source;
3. live read-only provider/resource inspection where available;
4. `PROJECT_STATUS.md` and current phase/closeout documents;
5. `docs/integrations/CURRENT_INTEGRATION_STATUS.md`;
6. owner-confirmed external dashboard/provider setup, explicitly labelled external provisioning evidence;
7. historical plans/specifications.

Historical plans continue to govern intended requirements unless explicitly superseded, but they do not override newer runtime evidence.

## 3. Current-state corrections

### Supabase

Live read-only inspection on 2026-07-19 verified project `aeeuscifrxcjmnswqwnq` / `direct-app` in `ap-northeast-1` is `ACTIVE_HEALTHY`, expected DIREKT schemas exist and all required Storage buckets are private. Supabase is therefore an **ACTIVE managed data/storage foundation**, not merely a candidate.

### Google Cloud

Managed Phase 10 evidence proves Artifact Registry, IAM-private Cloud Run API/portal staging, Secret Manager, WIF, Logging/Monitoring, restore/rollback/kill-switch controls. These are active managed foundations, not public production.

### Firebase

App Distribution is active for controlled Android testing. Firebase phone authentication/session exchange is implemented but real participant use remains gated. FCM/Crashlytics/Test Lab retain their individual planned/not-active status until proven.

### Canonical domain

Current public domain:

```text
https://direkt.forum/
```

The earlier `https://kudzimusar.github.io/direkt/` project address is historical/technical, not the owner-facing canonical URL.

Current roles:

- Vercel Domains — registrar;
- Cloudflare — authoritative DNS and configured email-routing edge;
- GitHub Pages — public static documentation/synthetic UI origin;
- Cloud Run — protected API/operations staging runtime.

Cloudflare DNS does not authorize public backend traffic.

### Cloudflare

Owner-side setup records authoritative DNS, approved role aliases and initial DMARC monitoring. Turnstile is **not active**: latest automated setup/token attempt returned HTTP 403 due missing required Turnstile permissions.

### Resend

Owner-side setup records `notify.direkt.forum` verified, synthetic test send passed, send-only key stored as `direkt-resend-api-key` in Secret Manager and API runtime identity has access.

Current source/runtime evidence does **not** yet prove a backend Resend adapter, Cloud Run runtime secret attachment or managed app-event delivery canary. Resend is therefore **EXTERNALLY_PROVISIONED**, not runtime-active application email.

Brevo is superseded as the preferred email direction unless a later decision reverses it.

### OTP

Firebase phone authentication is the current implemented pilot phone-possession direction. The older Twilio Verify recommendation is superseded as the default. Real Firebase use remains gated.

### Maps and Sentry

Owner reports external setup, but Phase 11 source audit did not prove runtime SDK binding. Both remain externally provisioned/runtime-unproven. PostGIS/manual/list discovery and Cloud Logging/Monitoring remain active foundations.

### Vercel application hosting

Earlier plans expected Vercel for the operations portal. Managed Phase 10 proved IAM-private Cloud Run portal-to-API instead. Vercel application hosting is superseded for current protected staging; Vercel remains registrar.

### Communications/payments/registries

- consent-aware enquiry/contact handoff domain exists; production external delivery remains gated;
- FCM/WhatsApp production delivery are not active;
- commercial/payment domain foundation exists; real money movement remains disabled;
- MTN MoMo/Airtel Money are candidates, not active;
- PACRA/NCC/TEVETA remain manual evidence sources unless authorized interfaces/data-use agreements exist.

## 4. Client/platform scope correction

Historical plans said Version 1 customer/provider UI was Android-only. On 2026-07-19 the owner explicitly authorized an **Android-first customer/provider PWA companion** because remote-only development requires a visible desktop/tablet/mobile test surface.

Current decision:

- Android remains the primary Version 1 client and Play target;
- PWA is additive, not an Android replacement;
- both share canonical REST/OpenAPI/domain semantics;
- operations portal remains separate and privileged;
- iOS remains deferred.

Where an older document says “Android-only”, that platform exclusivity is superseded by this companion-client decision; the underlying Android-first requirements remain valid.

## 5. Public PWA security boundary

Initial route after promotion:

```text
https://direkt.forum/app/
```

Initial public mode is synthetic-only:

- no real submissions;
- no real participant data;
- no private evidence;
- no protected API/session token;
- no direct privileged database/Supabase access;
- no weakening of Cloud Run IAM.

Future live browser mode requires reviewed authentication/session/gateway, origin/request-integrity, caching/privacy and abuse-control gates.

## 6. Phase reconciliation

- Phases 0–10 complete/stable.
- Phase 11 internal decisions, synthetic readiness and managed synthetic activation complete.
- Phase 11 real 11C–11H evidence and 11J remain pending.
- Phase 12 preauthorization engineering has progressed through Android release contracts, Play-readiness and repository-clearable production-readiness controls.
- Late release-policy findings must complete their exact-head corrective checkpoint before final closeout remains authoritative.
- Formal production release remains blocked until Phase 11 exit, legal/privacy, production environment/staffing/monitoring, signing/Play and global gates pass.

The PWA/reconciliation work does not advance those gates.

## 7. Historical documents and anti-regression rule

Older detailed plans may contain stale statements about Android exclusivity, old Pages URL, Vercel hosting, Brevo, Twilio, Maps or Sentry. They remain useful for detailed requirements/history.

Future reconciliation must not delete detailed specifications wholesale. Instead:

1. preserve requirements/history;
2. identify the stale assertion;
3. record the superseding decision/evidence;
4. update current status/register;
5. make surgical source changes where practical;
6. keep contradictions traceable.

This overlay and the current integration register supersede only the specific conflicting current-state assertions.

## 8. Owner-facing outcome

After Issue #133 promotion the owner should be able to open `direkt.forum` for current public documentation, open `direkt.forum/app/` for desktop/tablet/mobile customer/provider UI review, install/test Android through controlled distribution, and distinguish active/gated/provisioned/planned integrations without guessing.
