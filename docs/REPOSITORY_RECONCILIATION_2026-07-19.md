# DIREKT Repository and Documentation Reconciliation — 2026-07-19

**Status:** Authoritative current-state overlay pending promotion under Issue #133  
**Purpose:** Resolve contradictions between historical planning documents, current source, managed infrastructure evidence and owner-configured external integrations without deleting useful historical specifications.

## 1. Why this reconciliation exists

The repository accumulated several kinds of truth at different times:

1. early product/design plans;
2. phase checkpoint documents;
3. current application source;
4. managed infrastructure execution evidence;
5. owner-side provider/domain configuration that was completed outside repository source;
6. later Phase 11/12 control documents.

Several older documents remained internally valid as historical plans but became stale as statements of **current** state. This caused answers based on those files alone to under-report the current domain and provider setup.

This document establishes how current truth is determined and identifies the explicit corrections.

## 2. Evidence hierarchy

For current-state questions, use this order:

1. exact current `main` source and merged PRs;
2. managed workflow/deployment evidence tied to immutable source;
3. live read-only provider/resource inspection where available;
4. `PROJECT_STATUS.md` and current phase/closeout documents;
5. `docs/integrations/CURRENT_INTEGRATION_STATUS.md`;
6. owner-confirmed external dashboard/provider configuration, clearly labelled as external provisioning evidence;
7. historical plans/specifications.

Historical plans continue to govern intended requirements unless explicitly superseded, but they must not override newer runtime evidence.

## 3. Integration-state vocabulary

Current provider status uses exactly these labels:

- **ACTIVE** — source/configuration and managed execution prove approved runtime use.
- **IMPLEMENTED_GATED** — source behavior exists but real/provider-backed use is intentionally fail-closed.
- **EXTERNALLY_PROVISIONED** — account/domain/credential/provider setup exists, but application runtime use is not proven.
- **PLANNED** — intended direction only.
- **DISABLED** — intentionally off in the current environment.
- **SUPERSEDED** — older direction retained for history/fallback but no longer preferred.

This prevents a configured account or secret from being called “integrated” without runtime evidence.

## 4. Verified current platform state

### Supabase

Live read-only inspection on 2026-07-19 verified:

- project `aeeuscifrxcjmnswqwnq`;
- display name `direct-app`;
- region `ap-northeast-1`;
- project status `ACTIVE_HEALTHY`;
- expected DIREKT application schemas present;
- all required Storage buckets present and private:
  - `provider-evidence`;
  - `provider-media-private`;
  - `provider-media-public` (still private pending publication policy);
  - `system-exports`.

Supabase is therefore an **ACTIVE managed data/storage foundation**, not merely a future candidate.

### Google Cloud

Managed Phase 10 evidence proves:

- project `direkt-dev-502701` / number `264358173369`;
- Artifact Registry `direkt-containers`;
- IAM-private Cloud Run API `direkt-api`;
- IAM-private Cloud Run operations portal `direkt-operations-portal-staging`;
- Secret Manager runtime binding with pinned versions;
- keyless GitHub Workload Identity Federation;
- Cloud Logging/Monitoring plus rollback/kill-switch/restore exercises.

These are **ACTIVE private managed staging foundations**. They are not public production services.

### Firebase

- App Distribution is **ACTIVE** for internal Android test delivery.
- Firebase phone authentication/session exchange is **IMPLEMENTED_GATED**; real participant use remains behind Phase 11 entry/legal/privacy/configuration canaries.
- FCM, Crashlytics runtime and Test Lab remain planned/not proven active according to their individual status.

## 5. Domain and web-edge reconciliation

### Current canonical public domain

```text
https://direkt.forum/
```

The earlier `https://kudzimusar.github.io/direkt/` project URL is historical/technical, not the owner-facing canonical address.

### Current roles

- Vercel Domains — registrar for `direkt.forum`.
- Cloudflare — authoritative DNS and configured email-routing edge.
- GitHub Pages — current public static origin for documentation and synthetic/non-sensitive review content.
- Google Cloud Run — protected API and operations staging runtime, not made public by the domain change.

Recorded Cloudflare nameservers:

```text
athena.ns.cloudflare.com
tate.ns.cloudflare.com
```

## 6. Cloudflare reconciliation

Owner-side configuration records:

- authoritative DNS active for `direkt.forum`;
- Email Routing configured for approved role aliases including `privacy@`, `support@`, `security@`, `legal@` and `pilot@direkt.forum`;
- DMARC monitoring policy published initially with `p=none`;
- Turnstile setup is **not complete**: the latest automated setup/token attempt returned HTTP 403 because required Turnstile permissions were unavailable.

Therefore:

- Cloudflare DNS is **ACTIVE**;
- Email Routing is **EXTERNALLY_PROVISIONED** as support infrastructure;
- Turnstile is **PLANNED / NOT ACTIVE**.

No document may claim Turnstile protection until widget/key/source verification passes.

## 7. Resend reconciliation

Owner-side provisioning records:

- `notify.direkt.forum` verified in Resend;
- a synthetic outbound test send succeeded;
- a send-only key exists in Google Secret Manager as `direkt-resend-api-key`;
- `direkt-api-runtime` has accessor permission.

Current source/runtime evidence also shows:

- no proven backend Resend adapter/runtime SDK path;
- current Cloud Run API secret allowlist has not yet been reconciled to attach/use the Resend secret;
- no managed application-event → Resend staging canary has been recorded.

Therefore Resend is **EXTERNALLY_PROVISIONED**, not yet `ACTIVE` application email.

The older Brevo preference is **SUPERSEDED** as the preferred transactional-email direction. Brevo remains historical/fallback context only unless a future decision reverses this.

## 8. OTP reconciliation

The current implemented pilot direction is Firebase phone authentication followed by DIREKT session exchange and server-side role/provider/admission enforcement.

The older Twilio Verify recommendation is therefore **SUPERSEDED as the current default direction**. It is not configured in parallel merely because it appears in an older integration plan.

Real Firebase phone use remains gated; “implemented” does not mean public signup is active.

## 9. Maps and Sentry reconciliation

Owner reports external setup for Google Maps and Sentry. The Phase 11 source audit found that the audited Android/API/portal packages did not yet prove active runtime SDK binding.

Therefore both remain **EXTERNALLY_PROVISIONED / runtime unproven** until source configuration, credential restrictions, privacy controls, kill switches and managed canaries agree.

PostGIS/manual/list discovery and Cloud Logging/Monitoring remain the active fallback/authoritative foundations respectively.

## 10. Vercel reconciliation

Earlier architecture documents planned a Vercel-hosted operations portal. Managed Phase 10 later selected and proved an IAM-private Cloud Run portal-to-API path.

Current state:

- Vercel remains domain registrar;
- Vercel portal hosting is **SUPERSEDED for the current protected staging path**;
- a later Vercel deployment could be reconsidered only if it preserves a proven private backend calling boundary.

## 11. Communications, push and payments

- Phase 8 enquiry/contact-consent domain behavior exists; production external call/WhatsApp delivery remains disabled/gated.
- FCM push remains planned, not production-active.
- Phase 9 commercial/subscription/invoice/ledger/payment-intent/reconciliation foundation exists; real provider money movement remains disabled.
- MTN MoMo/Airtel Money remain candidates, not active integrations.
- PACRA/NCC/TEVETA remain manual evidence sources unless authorized API/data-use agreements exist.

## 12. Client/platform scope reconciliation

Historical control documents said Version 1 customer/provider UI was Android-only. On 2026-07-19 the owner explicitly authorized an **Android-first customer/provider PWA companion** because the project is remote and the owner needs a visible desktop/tablet/mobile testing surface.

Current decision:

- Android remains the primary Version 1 client and Play release target;
- PWA is an additive companion, not an Android replacement;
- both share canonical REST/OpenAPI/domain semantics;
- operations portal remains separate/privileged;
- iOS remains deferred.

Where an older document says “Android-only”, interpret it as the original scope decision superseded by this owner-authorized companion-client decision.

## 13. Public PWA security boundary

Initial route after promotion:

```text
https://direkt.forum/app/
```

Initial public mode is synthetic-only:

- no real submissions;
- no real participant data;
- no private evidence;
- no protected API/session token;
- no direct database/Supabase privileged access;
- no weakening of Cloud Run IAM.

Future live browser mode requires a separate reviewed authentication/session/gateway, CORS/origin/request-integrity, caching/privacy and abuse-control gate.

## 14. Phase reconciliation

Current phase truth must preserve both progress and blockers:

- Phases 0–10 complete/stable.
- Phase 11 internal decisions, synthetic readiness and managed synthetic activation complete.
- Phase 11 real 11C–11H evidence and 11J remain pending.
- Phase 12 preauthorization engineering has progressed through Android release contracts, Play-readiness preparation and repository-clearable production-readiness controls.
- Late release-policy findings are corrected through their own exact-head checkpoint before any closeout claim is considered final.
- Formal production release remains blocked until real Phase 11 exit, legal/privacy, environment/staffing/monitoring, signing/Play and global release gates pass.

The PWA/reconciliation work does not advance those gates.

## 15. Documents that remain historically useful but may contain superseded statements

Older documents are retained because they contain detailed requirements and reasoning. They must not be deleted merely to make current-state documentation shorter.

Potential stale statements include:

- Android-only client scope;
- old GitHub Pages canonical URL;
- Vercel as expected operations runtime;
- Brevo as preferred email provider;
- Twilio Verify as preferred OTP provider;
- Maps/Sentry/provider accounts described as future or active without current evidence classification.

The current-state overlay, `PROJECT_STATUS.md`, decision records and integration register supersede those specific conflicting statements while the rest of the historical requirements remain valid.

## 16. Anti-regression rule

Future agents must not “reconcile” by deleting detailed historical specifications wholesale. Reconciliation means:

1. preserve requirements and history;
2. identify the specific stale assertion;
3. record the superseding decision/evidence;
4. update the current status/register;
5. make surgical source changes where practical;
6. keep contradictions traceable.

## 17. Current owner-facing outcome

After Issue #133 promotion, the owner should be able to:

- open `direkt.forum` for current public documentation;
- open `direkt.forum/app/` to inspect customer/provider UI on desktop/tablet/mobile;
- install/test native Android through the controlled distribution path;
- distinguish what is active, gated, externally provisioned or planned without relying on guesses;
- see exactly which real-pilot and production-release gates remain.
