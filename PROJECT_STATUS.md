# DIREKT Project Status

**Updated:** 2026-07-19 (Asia/Tokyo)  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1` — history-preserving synchronization only  
**Programme state:** Phases 0–10 are complete. Phase 11 internal/synthetic readiness is complete; real 11C–11H evidence and 11J remain pending. All currently repository-clearable Phase 12 preauthorization engineering and the Phase 0–12 integration/runtime reconciliation are complete. **Formal Phase 12 production release is not authorized.**

## Current checkpoints

| Checkpoint | PR | Main merge |
|---|---:|---|
| Phase 11 entry foundation | #113 | `53e20e67a877f481fc94458d1d2ea62bf4e47b0f` |
| Phase 11 synthetic pilot | #119 | `7b886b9bee91c1337f4e4ad43f71afa4389644de` |
| Phase 12 preauthorization foundation | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` |
| Phase 12A Android release engineering | #129 | `48f6d2d212d64192819d76d67e157b25f8a5e98b` |
| Phase 12B Play/Data Safety preparation | #134 | `b876c499aed0f135feec39601b58f22c734879cc` |
| Remaining clearable Phase 12 controls | #136 | `c6bb694046b2fe8e82d3f745330447632169355c` |
| Late Phase 12 release-policy hardening | #140 | `8363e2196739f5bad2393eaa8896d4c43bd64e0f` |
| Phase 0–12 integration/runtime audit and corrective hardening | #149 | `25deaae72ca2974c5560a8059a50fce37c810f63` |

## Phase 12 and integration audit result

Completed repository-side work now includes:

- Android release identity/version/channel and reproducible unsigned AAB controls;
- non-excludable formal release eligibility checks;
- protected signing contract and release truth-boundary CI;
- merged Android permission inspection and reviewed release runtime dependency inventory;
- Play listing/Data Safety/content/distribution preparation;
- production runtime/staffing/monitoring/rollback/staged-rollout readiness contracts;
- Phase 0–12 integration status reconciliation;
- permanent cross-platform integration-runtime truth CI;
- backend/database/OpenAPI, operations portal, Android and PWA cross-surface regression coverage;
- live Supabase application-function privilege hardening.

Current Android release identity remains `com.kudzimusar.direkt`, version code `12`, version name `0.12.0-preauth.1`, channel `preauthorization`.

The exact merged release manifest currently declares four non-runtime-prompt permissions:

- `android.permission.ACCESS_NETWORK_STATE`;
- `android.permission.INTERNET`;
- `com.google.android.providers.gsf.permission.READ_GSERVICES`;
- `com.kudzimusar.direkt.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`.

Location, camera, contacts, SMS/call-log, broad storage/media, microphone and notification runtime permissions remain absent. The earlier `INTERNET`-only inventory was corrected by the integration audit.

All five formal release eligibility assertions remain false in preauthorization. No signed production artifact or Play production release was created.

## Integration runtime truth

### Active in approved boundaries

- Supabase PostgreSQL/PostGIS and private server-side Storage;
- canonical NestJS REST/OpenAPI backend;
- Artifact Registry and IAM-private Cloud Run staging;
- Secret Manager;
- GitHub Actions and Workload Identity Federation;
- Cloud Logging/Monitoring;
- Firebase App Distribution;
- GitHub Pages/static public edge and `direkt.forum` domain/DNS foundation;
- native Android implementation;
- transactional outbox domain foundation.

### Implemented but gated

- Firebase phone authentication/session exchange;
- real participant admission and private evidence processing;
- real contact handoff;
- Google Play release/signing execution;
- real payment-provider activation.

### Externally provisioned or planned, but not runtime-active

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

Vercel is currently the registrar role, not the protected staging application runtime. Brevo and Twilio are historical/superseded directions unless a later reviewed decision changes them.

OpenAPI generation/drift checking is active. Fully generated Kotlin/TypeScript network-client packages are not falsely claimed as current runtime integrations; current clients preserve the canonical REST/API boundary without privileged Supabase access.

## Live Supabase post-audit checkpoint

Project `aeeuscifrxcjmnswqwnq` received migration:

`202607191200_integration_runtime_privilege_hardening.sql`

Recorded checksum:

`e02d1be228a992b7541db92328e9528b8fe0e184660fb78206ca405e9c7b2372`

Post-apply managed verification:

- DIREKT migration count: `39`;
- browser application-schema usage: `0`;
- browser executable DIREKT application functions: `0`;
- PUBLIC executable DIREKT application functions: `0`;
- application `SECURITY DEFINER` functions: `0`;
- all four required Storage buckets remain private;
- Storage object count remains `0`.

Supabase advisor warnings about mutable function `search_path`, extension placement and index opportunities remain explicit hardening/performance debt. They were not mass-mutated without workload/regression evidence because the callable browser/PUBLIC application-function surface is now closed.

## Regression findings corrected by this audit

The audit found and corrected several real defects before closeout:

1. the new privilege migration initially assumed Supabase roles existed in vanilla CI PostgreSQL;
2. integration credential scanning initially treated negative test assertions as leaked credentials;
3. the service-worker audit initially depended on a symbol name rather than bounded-cache behavior;
4. an integration verifier piped through `tee` without reliable failure propagation;
5. the historical Phase 12B permission inventory incorrectly treated the app-authored `INTERNET` permission as the complete merged release manifest;
6. the canonical Phase 12B validator also had a `tee` failure-propagation defect that could produce a false-green workflow;
7. Kotlin standard library was present in the resolved release runtime dependency surface but absent from the reviewed direct-module inventory;
8. the integration audit path filters initially did not include all Phase 12B Play sources.

All were corrected and exact-head regression-tested before PR #149 promotion.

## Definitive integration audit validation

Final exact implementation head before PR #149 promotion:

`e3cddf7645e514d9a6254fff86283d4055d745c4`

Passed on that exact head:

- Backend CI and migration validation;
- backend container checks;
- supply-chain/security;
- controlled staging readiness;
- recovery checks;
- Phase 11 synthetic pilot checks;
- documentation quality;
- PWA CI;
- hardened canonical Phase 12B Play readiness;
- Phase 12 final truth-boundary gate;
- consolidated integration runtime audit:
  - source/runtime integration truth;
  - backend/database/OpenAPI;
  - protected operations portal;
  - Android unit/lint/debug assembly;
  - merged release manifest and resolved dependency verification.

## Remaining genuine gates

No repository-only document, toggle, synthetic dataset or unsigned artifact can clear these:

1. actual 11C–11H Zambia pilot evidence;
2. evidence-backed 11J `PROCEED`;
3. required Zambia regulatory/legal/privacy approvals and final live policy versions;
4. evidence-led removal/isolation of synthetic preview marketplace surfaces from production;
5. end-to-end account deletion, including public request and backend fulfillment;
6. actual production environment plus production-backup restore;
7. operational support/verification/on-call staffing and exercises;
8. active/tested production monitoring and escalation;
9. real Play account/current-policy verification, authorized signed reproducible AAB, final forms/assets/content rating and internal/closed testing;
10. formal go/no-go, staged rollout and final release record.

## UI testability

The synthetic customer/provider PWA is the immediate owner-facing visual review surface and remains intentionally disconnected from privileged/live backend paths. Native Android remains the correct surface for Firebase phone auth, device storage, native permissions/performance and future Play validation. The operations portal remains IAM-private.

See `docs/operations/REMOTE_UI_TESTING.md` and `docs/integrations/PHASE_INTEGRATION_RUNTIME_AUDIT_2026-07-19.md`.

## Boundary

- Phase 10: complete.
- Phase 11 internal/synthetic readiness: complete.
- Phase 11 real evidence and 11J: pending.
- Phase 12 repository-clearable/preauthorization engineering: complete.
- Phase 0–12 integration/runtime reconciliation: complete.
- **Formal Phase 12: blocked until Phase 11 supports `PROCEED` and all global release gates pass.**

Issue #112 remains open as the real-pilot tracker.
