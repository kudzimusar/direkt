# DIREKT Project Status

**Updated (Asia/Tokyo):** 2026-07-19  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1` — history-preserving synchronization maintained; no force-push or history rewrite permitted  
**Programme state:** Phases 0–10 are complete and stable. Phase 11 internal/synthetic readiness is complete, but real-participant pilot evidence 11C–11H and the 11J exit decision remain pending. Phase 12 preauthorization foundation, Phase 12A, Phase 12B and all other currently repository-clearable Phase 12 release-readiness engineering are complete and promoted. **Formal Phase 12 production release is not authorized.**

## Stable checkpoints

| Phase/checkpoint | PR | Merge commit | Status |
|---|---:|---|---|
| Phase 4 verification/evidence | #21 | `d9078a78d3677a94a720de2d16483487594b261e` | complete |
| Phase 5 customer discovery | #24 | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` | complete |
| Phase 6 provider workspace | #26 | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` | complete |
| Phase 7 operations workflow | #29 | `7ea8aa17dbced5f9e56dd259b15216223aa33921` | complete |
| Phase 8 enquiries/interactions/reviews | #31 | `0182951cdc26a892b3423728bd843e2969b25bc0` | complete |
| Phase 9 subscription/payment foundation | #35 | `4c78e2419aa4eca225495acaac8e7e0ee81903f1` | complete |
| Phase 10 security/privacy/reliability | #111 | `369fc72581b3ed27920b8fc949e32cfedf1ad8d9` | complete |
| Phase 11 entry-control foundation | #113 | `53e20e67a877f481fc94458d1d2ea62bf4e47b0f` | Issue #112 open |
| Android regression baseline repair | #118 | `e21566deb3fc3a30baf3c6ca3539721416dc1e0a` | complete |
| Phase 11 synthetic controlled-pilot implementation | #119 | `7b886b9bee91c1337f4e4ad43f71afa4389644de` | complete |
| Phase 11 managed synthetic activation | #120 | `06ade25b92bdb1dc310b88ed64626037671683c4` | complete |
| Phase 11 external-entry package | #121 | `e24c41944675d1f31d4466127902917419e37fce` | external gates pending |
| Phase 11 final synthetic checkpoint | #123 | `25c445f4e33073d1f174b0a30ea5ca50d838859e` | complete |
| Phase 12 preauthorization release-readiness foundation | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` | complete |
| Phase 12A Android release/versioning/reproducibility/signing contract | #129 | `48f6d2d212d64192819d76d67e157b25f8a5e98b` | complete |
| Phase 12B Play listing/permissions/Data Safety preparation | #134 | `b876c499aed0f135feec39601b58f22c734879cc` | complete; post-merge review fixes promoted in #136 |
| Remaining clearable Phase 12 release-readiness controls | #136 | `c6bb694046b2fe8e82d3f745330447632169355c` | complete |

## Current Phase 11 truth

Phase 11 repository-side synthetic/readiness work is complete, including regression repair, controlled synthetic cohort activation and production-shaped workflow exercise. This does **not** substitute for mandatory real Zambia pilot evidence.

Still pending:

- DPC controller-registration evidence and any applicable overseas storage/transfer authorization;
- qualified Zambia legal/privacy/consumer review and final approved participant/provider/privacy/retention/rights wording;
- real Firebase and private-storage/auth/deletion/withdrawal canaries under the approved real-data boundary;
- Zambia-based field ownership before any field-visited/equivalent claim;
- 11C–11H `PRIMARY-PILOT` evidence from actual controlled pilot activity;
- 11J evidence-backed `STOP / REPEAT / NARROW / PROCEED` decision.

Issue #112 remains the active Phase 11 tracker and must stay open until those exit criteria are genuinely met.

## Phase 12 preauthorization — all currently clearable work complete

### Phase 12A — Android release engineering

- [x] Production package remains `com.kudzimusar.direkt`.
- [x] `compileSdk` and `targetSdk` remain API 36.
- [x] Release identity is source-controlled: `versionCode = 12`, `versionName = 0.12.0-preauth.1`, channel `preauthorization`.
- [x] Release identity/channel validation fails closed.
- [x] Signing material remains external to git and outside the repository checkout.
- [x] AGP injected-signing overrides are prohibited.
- [x] Protected signed builds require configuration cache disabled before credentials are consumed.
- [x] Two clean, build-cache-disabled release builds produce byte-for-byte identical unsigned AABs.
- [x] Verified unsigned AAB SHA-256 remains `890b710f18ad7208b6db0e5668193a739052e010462d0beeddb8f752c14dd169`.
- [x] No real upload key, signed production artifact or Play upload was created.

### Phase 12B — Google Play preparation

- [x] Repository-controlled Play listing candidate and asset/reviewer requirements.
- [x] Merged-release-manifest permission inventory.
- [x] Current merged permission baseline: `android.permission.INTERNET` only.
- [x] No current location/camera/contacts/SMS/call-log/broad-storage/media/microphone/notification runtime permission is declared.
- [x] Android `implementation(...)` dependency surface is allowlisted so unreviewed SDK additions cannot silently invalidate Data Safety.
- [x] Firebase Authentication Data Safety inventory prepared from current source/provider behavior.
- [x] No Analytics, Crashlytics, Sentry, FCM, Maps, ads, billing or payment SDK is claimed active in the current Android release dependency surface.
- [x] Content-rating questionnaire facts prepared without fabricating an IARC rating.
- [x] Target-audience/country/device/developer-account/testing prerequisites documented.
- [x] Store-copy validator rejects blanket trust/approval overclaims.
- [x] Phase 12B CI builds and inspects the merged release manifest, not only the source manifest.
- [x] Phase 12B policy-document-only changes trigger the readiness gate.
- [ ] Public support/privacy/account-deletion URLs and final Play forms remain real release prerequisites.

A late Codex review of PR #134 found four valid gaps: unreviewed SDK additions, source-manifest-only permission inspection, missing banned store-claim checks and an incomplete workflow path trigger. All four were corrected and exact-head validated in PR #136 before the final Phase 12 preauthorization promotion.

### Formal release eligibility latches

Five source-controlled latches now guard release-candidate/production packaging:

- `DIREKT_FORMAL_PHASE12_AUTHORIZED=false`
- `DIREKT_PRODUCTION_CLIENT_READY=false`
- `DIREKT_ACCOUNT_DELETION_READY=false`
- `DIREKT_PRODUCTION_OPERATIONS_READY=false`
- `DIREKT_PLAY_RELEASE_READY=false`

Preauthorization requires all five to remain false. Release-candidate/production packaging requires all five to be true, and the Gradle release task graph depends on the eligibility verification task. These latches are evidence assertions and may be changed only with the matching reviewed evidence; they do not themselves authorize signing or publishing.

### Production backend/operations readiness

Completed now:

- [x] Production configuration invariants documented and machine-checked.
- [x] Current backend deliberately forces production traffic disabled until a later reviewed release gate.
- [x] Production payments remain disabled.
- [x] Required production secret/config boundary documented.
- [x] Phase 10 managed evidence retained for database restore pattern, private Cloud Run deployment/inspection, rollback/forward recovery, kill switch, bounded IAM restoration, staging 5xx alert policy and internal Firebase App Distribution.
- [x] Preproduction mechanisms are explicitly separated from missing production-specific evidence.

Not yet claimable:

- [ ] production environment deployed and approved for public traffic;
- [ ] actual production backup restore-tested;
- [ ] production traffic enabled;
- [ ] production payment mode enabled.

### Support and verification staffing

- [x] Required production role/capacity contract defined.
- [x] Independent/four-eyes verification requirements preserved.
- [x] Field claims remain disabled until a Zambia-based field lead is formally appointed/trained.
- [ ] Production staffing is **not** claimed operational; named/contracted coverage, private escalation roster, access tests, training/calibration, launch coverage, exercises and capacity evidence remain required.

### Monitoring, rollback and staged rollout

- [x] Production monitor classes defined.
- [x] Immediate stop conditions defined.
- [x] Numeric pause/capacity thresholds defined.
- [x] Staged rollout sequence prepared: internal → closed → 5% → 10% → 25% → 50% → 100% within approved scope.
- [x] Observation/promotion rules defined; elapsed time alone cannot promote a release.
- [x] Backend rollback, kill-switch, Android higher-version correction and incident-response sequence documented.
- [x] Managed staging rollback/kill-switch/alert mechanisms already proven in Phase 10.
- [ ] Production alert routes, Android-vitals baseline, live escalation exercise, operational staffing and actual Play rollout controls remain real evidence gates.

### Release package and execution runbook

- [x] Release tag convention and required release-record/provenance fields defined.
- [x] Release-notes structure and prohibited claims defined.
- [x] Exact source freeze and versioning procedure defined.
- [x] Release-date Play policy recheck required.
- [x] Protected signing procedure defined.
- [x] Internal/closed testing sequence defined.
- [x] Production pre-traffic activation and staged rollout sequence defined.
- [x] Formal go/no-go/rollback record requirements defined.
- [ ] No actual production tag, release notes, signed AAB or Play track exists because the entry gate is not satisfied.

## Production blockers discovered and preserved

### Synthetic/preview Android production path

The current Android UI still contains explicit synthetic/fictional/preview discovery and interaction surfaces. These are valid for preauthorization/testing but cannot be presented as a real production marketplace.

This must be corrected through the same evidence-led production codebase after Phase 11/11I findings are available. Phase 12 preparation deliberately does not freeze unvalidated synthetic UX into production behavior.

### Account deletion

Current sign-out/session clearing is not end-to-end account deletion. Formal release requires:

- an in-app deletion request path;
- a public web deletion request resource;
- backend deletion/retention/legal-hold fulfillment behavior;
- audit/evidence;
- privacy/Data Safety consistency;
- qualified review before real production data.

This remains a release blocker and is not overclaimed as complete.

## Final exact-head verification for clearable Phase 12 work

Exact source head before PR #136 promotion:

`a22153d8aaa3c12acff04fdf8fa6953981e5b5a2`

Passed on that exact source:

- [x] Documentation quality;
- [x] Phase 10 supply-chain/security;
- [x] Android CI;
- [x] Android performance budget;
- [x] Phase 12A release readiness/reproducibility;
- [x] hardened Phase 12B Play readiness using the merged release manifest;
- [x] Phase 12 final preauthorization truth-boundary gate.

The Android performance gate initially recorded one cold-launch outlier while artifact size remained within budget. Because the checkpoint did not change Android runtime behavior, the exact same source was retried once; the retry passed. No performance waiver was used.

Latest short-lived exact-head evidence includes:

- Play-readiness artifact archive digest: `sha256:aca3d0d318128ca5dc51726eaf1c8abd56d95522be5b5f8dccf7a024284d4840`;
- final Phase 12 preauthorization truth-boundary archive digest: `sha256:e226fec4773ca9d39ac29c2178495f7cf72ecbcc3fed3ae78cd20c1e0fca240e`;
- reproducible AAB evidence archive digest: `sha256:de3f258978316e6c61abb8bef23f4a9134e66f22333de6710f99aaf75e8bf041`.

## Remaining gates — genuine external/real-world work only

No additional repository-only document, toggle, synthetic dataset or unsigned artifact can truthfully clear these:

1. **Phase 11 primary evidence:** execute actual 11C–11H controlled Zambia pilot evidence.
2. **Phase 11 exit:** 11J must produce evidence-backed `PROCEED`.
3. **Regulatory/legal:** DPC controller registration, applicable overseas storage/transfer authorization and qualified Zambia legal/privacy/consumer sign-off.
4. **Final privacy/rights:** approved live privacy notice/terms/retention/legal-hold/rights versions.
5. **Production Android client:** evidence-led removal/isolation of synthetic/preview marketplace surfaces.
6. **Account deletion:** complete in-app + public web request + backend fulfillment + audit/policy consistency.
7. **Production environment:** deploy/validate actual production backend/portal/data boundary with public traffic initially disabled.
8. **Production recovery:** restore-test an actual production backup.
9. **Operational staffing:** named/contracted support, verification and on-call coverage with access/training/exercise/capacity evidence.
10. **Production monitoring:** active/tested notification routes and incident escalation.
11. **Play/developer account:** verify real account state and current account-specific testing requirements.
12. **Release-date Play policy:** recheck current official Google Play requirements.
13. **Signed artifact:** authorized release-candidate identity/latches, protected upload key and signed reproducible AAB.
14. **Final Play declarations/assets:** public support/privacy/deletion URLs, screenshots/feature graphic, Data Safety submission, IARC rating, reviewer credentials.
15. **Testing:** execute Play internal testing and required closed testing; resolve findings.
16. **Production release:** formal go/no-go, staged rollout, monitoring/support observation and final release tag/notes/record.

## Current source documents

- `docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`
- `docs/phase11/PHASE11_SYNTHETIC_CONTROLLED_PILOT_ACTIVATION_2026-07-19.md`
- `docs/phase11/PILOT_VALIDATION_EVIDENCE_REGISTER.md`
- `docs/phase12/PHASE12_PREAUTHORIZATION_RELEASE_READINESS_2026-07-19.md`
- `docs/phase12/PHASE12B_PLAY_CONSOLE_PREPARATION.md`
- `docs/phase12/PHASE12_CLEARABLE_RELEASE_READINESS_MATRIX.md`
- `docs/phase12/PHASE12_RELEASE_EXECUTION_RUNBOOK.md`
- `docs/phase12/PHASE12_PREAUTHORIZATION_CLOSEOUT_2026-07-19.md`
- `docs/phase12/play/*.json`
- `docs/phase12/release/*.json`
- `docs/architecture/PHASE12A_ANDROID_RELEASE_CONTRACT_DECISION.md`
- `android/direkt-app/release/SIGNING_CONTRACT.md`
- `android/direkt-app/release/eligibility.properties`

## Phase boundaries

- Phase 10: complete.
- Phase 11 internal/synthetic readiness: complete.
- Phase 11 real-participant entry and 11C–11H primary evidence: pending external gates and actual Zambia pilot.
- Phase 11J: pending.
- Phase 12 preauthorization foundation: complete.
- Phase 12A: complete.
- Phase 12B: complete for repository preparation; Play submission/execution remains gated.
- All other currently repository-clearable Phase 12 release-readiness engineering: complete.
- **Formal Phase 12 production release: not authorized until actual Phase 11 exit evidence supports `PROCEED` and every global release gate passes.**

Issue #5 remains the historical deferred real-world validation obligation. Issue #112 remains open as the active controlled-pilot execution tracker.
