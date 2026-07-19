# Phase 12 Preauthorization Closeout — 2026-07-19

**Status:** ALL CURRENTLY CLEARABLE PHASE 12 REPOSITORY/ENGINEERING WORK COMPLETE  
**Formal Phase 12 production release:** NOT AUTHORIZED  
**Governing Phase 11 issue:** #112 remains open  
**Latest corrective checkpoint:** Phase 0–12 integration/runtime audit PR #149 merged at `25deaae72ca2974c5560a8059a50fce37c810f63`

## Executive conclusion

DIREKT has completed every Phase 12 item that can truthfully be completed through repository engineering, managed preproduction evidence, integration reconciliation and release preparation without inventing real Zambia pilot results, legal/regulatory approvals, operational staffing, production credentials, signed production artifacts or Google Play production activity.

This closeout does **not** mark formal Phase 12 complete. Actual Phase 11 primary validation, an evidence-backed 11J `PROCEED` decision and all global release gates remain mandatory.

## Promoted Phase 12 checkpoints

| Checkpoint | PR | Main merge |
|---|---:|---|
| Preauthorization release-readiness foundation | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` |
| Phase 12A Android release/signing/reproducibility contract | #129 | `48f6d2d212d64192819d76d67e157b25f8a5e98b` |
| Phase 12B Play/Data Safety preparation | #134 | `b876c499aed0f135feec39601b58f22c734879cc` |
| Remaining clearable release-readiness controls | #136 | `c6bb694046b2fe8e82d3f745330447632169355c` |
| Late release-policy hardening | #140 | `8363e2196739f5bad2393eaa8896d4c43bd64e0f` |
| Phase 0–12 integration/runtime audit and corrective hardening | #149 | `25deaae72ca2974c5560a8059a50fce37c810f63` |

## Android release engineering

Completed:

- production application ID `com.kudzimusar.direkt`;
- API 36 compile/target baseline;
- source-controlled release identity `12 / 0.12.0-preauth.1 / preauthorization`;
- fail-closed channel/version rules;
- external protected signing contract;
- AGP injected-signing rejection;
- signed-build configuration-cache protection;
- formal release eligibility validation that cannot be removed with Gradle task exclusion;
- permanent negative regression tests for release-policy bypasses;
- two clean build-cache-disabled unsigned AAB builds remain byte-for-byte reproducible.

Verified unsigned AAB SHA-256:

```text
890b710f18ad7208b6db0e5668193a739052e010462d0beeddb8f752c14dd169
```

No production signing key, signed production AAB or Play production release has been created.

## Formal release eligibility

The five source-controlled assertions remain false during preauthorization:

- `DIREKT_FORMAL_PHASE12_AUTHORIZED`
- `DIREKT_PRODUCTION_CLIENT_READY`
- `DIREKT_ACCOUNT_DELETION_READY`
- `DIREKT_PRODUCTION_OPERATIONS_READY`
- `DIREKT_PLAY_RELEASE_READY`

Release-candidate/production source requires every matching evidence assertion to be true before release-capable configuration may proceed. The assertions do not replace the underlying evidence, signing controls or publishing controls.

## Corrected Google Play / Data Safety truth

The Phase 0–12 integration audit found that the earlier Phase 12B document incorrectly treated the app-authored `INTERNET` permission as the complete packaged permission surface.

The exact merged release manifest currently declares:

```text
android.permission.ACCESS_NETWORK_STATE
android.permission.INTERNET
com.google.android.providers.gsf.permission.READ_GSERVICES
com.kudzimusar.direkt.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
```

None creates a dangerous runtime permission prompt. Location, camera, contacts, SMS/call-log, broad storage/media, microphone and notification runtime permissions remain absent.

The permanent Phase 12B gate now:

- rebuilds the merged release manifest;
- compares the exact packaged permission set with the reviewed inventory;
- inspects selected resolved `releaseRuntimeClasspath` direct modules;
- accounts for Kotlin standard library as reviewed runtime infrastructure;
- detects dependency substitution/project targets;
- verifies Firebase Authentication Data Safety inventory;
- rejects prohibited blanket trust/approval claims;
- propagates verifier failures through CI rather than allowing `tee` to mask them.

The integration audit also corrected a historical CI weakness where the canonical Phase 12B verifier could appear green despite a failing verifier process. That defect is closed.

## Production readiness prepared but not overclaimed

Repository/managed preparation now covers:

- private Cloud Run staging patterns;
- Artifact Registry, Secret Manager and WIF boundaries;
- database restore/rollback patterns;
- portal/API kill switch and recovery procedures;
- monitoring classes and stop thresholds;
- support/verification/on-call staffing requirements;
- staged rollout sequence and rollback rules;
- release tag/provenance/notes/runbook requirements;
- integration-status truth across Phase 0–12.

Still intentionally not claimed:

- production environment approved for public traffic;
- production backup restore-tested;
- operational production staffing;
- active production monitoring/escalation routes;
- real payment mode;
- signed/approved Play release.

## Live Supabase integration hardening

The Phase 0–12 audit applied and verified:

```text
migration=202607191200_integration_runtime_privilege_hardening.sql
sha256=e02d1be228a992b7541db92328e9528b8fe0e184660fb78206ca405e9c7b2372
```

Managed post-apply state:

- DIREKT migration count `39`;
- browser application-schema usage `0`;
- browser executable DIREKT application functions `0`;
- PUBLIC executable DIREKT application functions `0`;
- application `SECURITY DEFINER` functions `0`;
- four required Storage buckets remain private.

Mutable function `search_path`, extension-placement and index advisor warnings remain explicit technical debt. They were not mass-mutated without workload-specific regression evidence because the current browser/PUBLIC callable application-function surface is closed.

## Definitive latest regression checkpoint

Exact implementation head before PR #149 promotion:

```text
e3cddf7645e514d9a6254fff86283d4055d745c4
```

Passed:

- Backend CI/migrations/OpenAPI;
- backend container checks;
- supply-chain/security;
- controlled staging readiness;
- recovery checks;
- Phase 11 synthetic pilot checks;
- documentation quality;
- PWA CI;
- hardened canonical Phase 12B Play readiness;
- Phase 12 final truth-boundary gate;
- consolidated integration audit covering source/runtime truth, backend/database/OpenAPI, operations portal, Android tests/lint/debug, merged release manifest and resolved runtime dependencies.

## Remaining blockers — genuine external/real-world evidence only

1. Actual controlled Zambia pilot evidence for 11C–11H.
2. Evidence-backed 11J `PROCEED`.
3. Required Zambia DPC/legal/privacy/consumer approvals and final live policies.
4. Evidence-led production Android client cutover removing/isolation of synthetic preview marketplace surfaces.
5. End-to-end account deletion: in-app request, public web request, backend fulfillment/retention/legal-hold behavior and audit/policy consistency.
6. Actual production backend/portal/data boundary and isolated production-backup restore.
7. Operational support/verification/on-call staffing and exercises.
8. Active/tested production monitoring and escalation.
9. Real Play account/current-policy verification, authorized signed reproducible AAB, final declarations/assets/content rating and internal/closed testing.
10. Formal go/no-go, staged rollout and final release record.

## Final boundary

No additional repository-only document, synthetic dataset, toggle or unsigned artifact can truthfully clear the remaining formal Phase 12 gates.

Issue #112 remains open. Formal Phase 12 remains blocked until actual Phase 11 evidence supports `PROCEED` and every global release gate passes.

Detailed integration audit evidence:

- `docs/integrations/PHASE_INTEGRATION_RUNTIME_AUDIT_2026-07-19.md`
- `docs/integrations/PHASE_INTEGRATION_AUDIT_CLOSEOUT_2026-07-19.md`
