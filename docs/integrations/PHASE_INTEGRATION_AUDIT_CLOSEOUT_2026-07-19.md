# DIREKT Phase 0–12 Integration Audit Closeout — 2026-07-19

**Status:** repository-clearable integration/runtime reconciliation complete  
**Implementation checkpoint:** PR #149 merged to `main` at `25deaae72ca2974c5560a8059a50fce37c810f63`  
**Exact audited implementation head:** `e3cddf7645e514d9a6254fff86283d4055d745c4`  
**Formal Phase 12 production release:** not authorized  
**Phase 11 tracker:** Issue #112 remains open

## Result

The audit traced integrations from Phase 0 through Phase 12 against source, CI, managed infrastructure evidence and the live Supabase project. It separated five states that had previously been easy to conflate:

- active runtime integration;
- implemented but gated;
- externally provisioned but runtime-unproven;
- planned/disabled;
- superseded historical direction.

No service was promoted to ACTIVE merely because an account, secret, DNS record or API key exists.

## Active managed integrations

- Supabase PostgreSQL/PostGIS as the system-of-record foundation;
- Supabase private Storage through server-side signed grants;
- NestJS canonical REST/OpenAPI backend;
- Artifact Registry;
- IAM-private Cloud Run staging for API and operations portal;
- Google Secret Manager;
- GitHub Workload Identity Federation;
- GitHub Actions;
- Cloud Logging/Monitoring;
- Firebase App Distribution;
- GitHub Pages/static public edge and `direkt.forum` domain/DNS foundation;
- native Android implementation;
- transactional outbox domain foundation.

## Implemented but gated

- Firebase phone authentication/session exchange;
- real participant admission;
- real private evidence processing;
- real contact handoff;
- Google Play signing/release execution;
- real payment-provider activation.

## Externally provisioned/runtime-unproven or planned

- Google Maps;
- Sentry;
- Resend application delivery;
- Firebase Crashlytics;
- FCM;
- Firebase Test Lab automation;
- Cloudflare Turnstile;
- production WhatsApp delivery;
- MTN MoMo/Airtel Money;
- automated PACRA/NCC/TEVETA access.

Vercel is currently a registrar role rather than the protected staging application runtime. Brevo and Twilio remain superseded historical directions unless a later reviewed architecture decision changes them.

## OpenAPI/client truth

OpenAPI generation and drift validation are active and canonical. Fully generated Kotlin/TypeScript network-client packages are not falsely claimed as current runtime integrations. Android, portal and future live PWA flows must continue through the canonical backend trust boundary and may not obtain privileged Supabase credentials.

## Managed Supabase hardening applied

Project:

```text
name: direct-app
ref: aeeuscifrxcjmnswqwnq
region: ap-northeast-1
```

Applied migration:

```text
202607191200_integration_runtime_privilege_hardening.sql
sha256=e02d1be228a992b7541db92328e9528b8fe0e184660fb78206ca405e9c7b2372
```

Post-apply verification:

- migration count `39`;
- browser application-schema usage `0`;
- browser executable DIREKT application functions `0`;
- PUBLIC executable DIREKT application functions `0`;
- application `SECURITY DEFINER` function count `0`;
- all four required Storage buckets remain private;
- audited Storage object count `0`.

Supabase advisor warnings for mutable function `search_path`, extension placement and index opportunities remain documented technical debt. They were not mass-mutated because the current application function surface is no longer callable by browser/PUBLIC roles and broad function/index rewrites require workload-specific regression evidence.

## Regression defects found and corrected

1. The new privilege-hardening migration originally assumed Supabase-specific roles existed in vanilla CI PostgreSQL.
2. The first integration credential scan treated negative test assertions as leaked credentials.
3. The first service-worker audit depended on a source symbol rather than actual bounded-cache behavior.
4. The integration truth validator was initially piped through `tee` without reliable failure propagation.
5. The historical Phase 12B permission inventory incorrectly treated the app-authored `INTERNET` permission as the complete packaged release permission surface.
6. The canonical Phase 12B workflow also had a `tee` failure-propagation defect that could present a false-green gate.
7. Kotlin standard library was present in the resolved release runtime dependency surface but absent from the reviewed direct-module inventory.
8. The initial integration-audit workflow path filters omitted Phase 12B Play source files.

Every defect above was corrected before PR #149 promotion.

## Correct merged Android permission truth

The exact merged release manifest currently declares:

```text
android.permission.ACCESS_NETWORK_STATE
android.permission.INTERNET
com.google.android.providers.gsf.permission.READ_GSERVICES
com.kudzimusar.direkt.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
```

These declarations do not create a dangerous runtime permission prompt. Location, camera, contacts, SMS/call-log, broad storage/media, microphone and notification runtime permissions remain absent.

The permanent Phase 12B gate now treats the reviewed merged-manifest inventory as authoritative and fails when the actual packaged manifest changes without a matching reviewed inventory update.

## Exact-head validation

The following passed on `e3cddf7645e514d9a6254fff86283d4055d745c4`:

- Backend CI and migration checks;
- backend container checks;
- supply-chain/security;
- controlled staging readiness;
- recovery checks;
- Phase 11 synthetic pilot checks;
- documentation quality;
- PWA CI;
- hardened canonical Phase 12B Play readiness;
- Phase 12 final preauthorization truth boundary;
- consolidated integration runtime audit covering:
  - source/runtime integration truth;
  - backend/database/OpenAPI;
  - protected operations portal;
  - Android unit/lint/debug assembly;
  - merged release manifest;
  - resolved release runtime dependency inventory.

## UI test boundary

The customer/provider PWA is the immediate synthetic visual review surface. It is intentionally disconnected from privileged/live backend paths and is suitable for layout, navigation, accessibility, scoped trust wording, customer/provider journeys and offline-shell review.

Native Android remains the correct test surface for Firebase phone auth, secure device storage, native permissions/performance and eventual Play validation. The operations portal remains IAM-private.

Canonical documented PWA path:

```text
https://direkt.forum/app/
```

An exact-source CI-packaged PWA artifact is also produced so UI review does not depend on public routing availability.

## Remaining external/real-world gates

The audit does not clear:

- actual 11C–11H Zambia pilot evidence;
- 11J evidence-backed `PROCEED`;
- Zambia regulatory/legal/privacy approvals;
- production client cutover from synthetic preview surfaces;
- end-to-end account deletion;
- actual production environment and backup restore;
- operational support/verification/on-call staffing;
- active production monitoring/escalation;
- signed AAB and Play internal/closed testing;
- formal go/no-go, staged rollout and final production release record.

Those remain genuine Phase 11/formal Phase 12 evidence gates, not repository tasks that can be cleared by synthetic implementation alone.
