# DIREKT Project Status

**Updated (Asia/Tokyo):** 2026-07-19  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1` — history-preserving synchronization completed through the promoted Phase 12 preauthorization checkpoint; no force-push or history rewrite permitted  
**Programme state:** Phases 0–10 are complete and stable. Phase 11A internal scope/operations decisions, Phase 11 synthetic functional readiness and the managed synthetic controlled-pilot activation are complete. Phase 12 release-readiness engineering is now preauthorized and the unsigned/non-publishing release AAB gate is proven, but formal Phase 12 remains blocked. The real-participant pilot, 11C–11H `PRIMARY-PILOT` evidence and the 11J exit decision remain pending.

## Stable checkpoints

| Phase/checkpoint | PR | Merge commit | Issue |
|---|---:|---|---:|
| Phase 4 verification/evidence | #21 | `d9078a78d3677a94a720de2d16483487594b261e` | #20 closed |
| Phase 5 customer discovery | #24 | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` | #23 closed |
| Phase 6 provider workspace | #26 | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` | #25 closed |
| Phase 7 operations workflow | #29 | `7ea8aa17dbced5f9e56dd259b15216223aa33921` | #28 closed |
| Phase 8 enquiries/interactions/reviews | #31 | `0182951cdc26a892b3423728bd843e2969b25bc0` | #30 closed |
| Phase 9 subscription/payment foundation | #35 | `4c78e2419aa4eca225495acaac8e7e0ee81903f1` | #34 closed |
| Phase 10 security/privacy/reliability hardening | #111 | `369fc72581b3ed27920b8fc949e32cfedf1ad8d9` | #41 closed |
| Phase 11 entry-control foundation | #113 | `53e20e67a877f481fc94458d1d2ea62bf4e47b0f` | #112 open |
| Android regression baseline repair | #118 | `e21566deb3fc3a30baf3c6ca3539721416dc1e0a` | #112 |
| Phase 11 synthetic controlled-pilot implementation | #119 | `7b886b9bee91c1337f4e4ad43f71afa4389644de` | #112 |
| Phase 11 managed synthetic activation record | #120 | `06ade25b92bdb1dc310b88ed64626037671683c4` | #112 |
| Phase 11 current external-entry package | #121 | `e24c41944675d1f31d4466127902917419e37fce` | #112 |
| Phase 11 final synthetic/status checkpoint | #123 | `25c445f4e33073d1f174b0a30ea5ca50d838859e` | #112 |
| Phase 12 preauthorization release-readiness gate | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` | #112 remains open |

## Managed infrastructure retained for Phase 11

| Service | Bound development/staging resource |
|---|---|
| Supabase | project `direct-app`, ref `aeeuscifrxcjmnswqwnq`, region `ap-northeast-1` |
| Google Cloud | project `direkt-dev-502701`, region `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| Cloud Run API | `direkt-api` — IAM-private staging |
| Cloud Run portal | `direkt-operations-portal-staging` — IAM-private staging |
| Firebase | project `direkt-dev-502701`, tester group `direkt-internal-testers`; real participant phone-auth activation remains external-gated |
| Vercel | excluded from the protected Phase 11 entry path by programme decision |

Phase 10 managed evidence remains valid. Phase 11 did not make Cloud Run public, enable real-money movement, make Maps mandatory, enable Sentry for real participant telemetry or introduce Cloudflare as a new critical pilot runtime dependency.

## Phase 11 active workstream

**Governing issue:** #112  
**Control document:** `docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`  
**Synthetic activation evidence:** `docs/phase11/PHASE11_SYNTHETIC_CONTROLLED_PILOT_ACTIVATION_2026-07-19.md`

### 11A decisions completed

- [x] Controller model selected for bounded pilot filing: Shadreck Kudzanai Musarurwa as individual-controller applicant/operator; no joint controller planned.
- [x] Exact geography approved: Kabwata Ward + Chilenje Ward, Kabwata Constituency, Lusaka District.
- [x] Alternative area evaluated: Matero Constituency retained as later stress/expansion candidate.
- [x] Four categories approved: plumbing/water repair, electrical repair/services, motor-vehicle mechanics, appliance/electronics repair.
- [x] Cohort capped at 24 providers + 60 customers in three waves of at most 8 + 20.
- [x] Provider-pathway target set per category: 2 registered businesses, 2 qualified individuals, 2 experienced informal providers where lawful and accurately represented.
- [x] Named pilot/product, privacy/security, support and incident ownership assigned.
- [x] Support hours, escalation and numeric stop/pause thresholds approved.
- [x] Representative Android/device/network matrix approved.
- [x] Privacy, layered consent, withdrawal, retention and research-code baseline approved operationally.
- [x] Wave 1 minimization approved: Maps disabled/manual-first, Sentry disabled for real pilot data, production communications delivery disabled, payments disabled.
- [x] Firebase phone-auth backend/Android implementation promoted with invite-only, policy-version, phone-recycling and fail-closed controls; real provider configuration/use remains external-gated.
- [x] Secondary evidence may narrow assumptions but cannot be relabelled as primary pilot evidence.

### Synthetic controlled-pilot activation completed

- [x] Regression-first audit performed before new Phase 11 writes.
- [x] Pre-existing broken Android dependency bundle detected and repaired through PR #118 before Phase 11 activation.
- [x] Permanent Phase 11 synthetic activation gate added and promoted through PR #119.
- [x] Activator refuses production, non-`synthetic-only` mode, missing/true real-entry latch, missing activation opt-in and non-empty targets.
- [x] Managed Phase 11 migration applied with exact repository checksum `4693680a6ce8a68e970e5707c7e82dc59654fa13f1a6dd0b10f23165b4ee34bb`.
- [x] Managed Supabase seeded with exactly 24 synthetic providers + 60 synthetic customers + 84 synthetic consents.
- [x] Exact 2/2/2 provider-pathway mix per category and exact 8+20 wave caps verified.
- [x] 48 full evidence/reviewer/recommendation/decision/claim lifecycles completed.
- [x] 24 provider/category publications created only after required scoped claims existed.
- [x] 60 enquiries exercised: 36 closed, 12 accepted/active, 6 declined, 6 unanswered/received.
- [x] 24 interaction-eligible reviews and 6 synthetic complaints created.
- [x] Privacy/runtime invariants verified: 0 contacts, 0 external Firebase identities, 0 real pilot invitations, 0 Storage objects, 0 field visits, 0 payment intents.
- [x] Post-activation Supabase security advisor showed no new Phase 11 table/cohort exposure finding; existing project-wide advisories remain tracked hardening debt.
- [x] `build/android-v1` synchronized without force-push; stale divergent Phase 11 documentation history cannot override the promoted current tree.

### Phase 12 preauthorization release readiness completed

- [x] Current Android release surface audited against the repository release plan.
- [x] Production application ID remains `com.kudzimusar.direkt`.
- [x] `compileSdk` and `targetSdk` are both API 36.
- [x] Existing stale release version (`versionCode = 8`, `versionName = 0.8.0-phase8`) identified as a formal-release task rather than silently changed early.
- [x] Permanent `.github/workflows/phase12-release-readiness.yml` gate promoted through PR #125.
- [x] Gate refuses committed signing-key material, `google-services.json` and premature production signing configuration.
- [x] Exact PR #125 head passed `lintRelease` and `bundleRelease` with no production signing or publishing action.
- [x] Short-lived CI AAB evidence produced and labelled `PREAUTHORIZATION / NOT FOR DISTRIBUTION` with SHA-256 evidence.
- [x] Documentation quality and Phase 10 supply-chain/security passed on the same exact head.
- [x] Release-readiness decision and scope explicitly preserve the Phase 11 real-evidence and legal stop gates.

This checkpoint proves Android release-variant buildability only. It does not authorize a signed production artifact, Play upload, public backend traffic, unrestricted signup, real Firebase participant use, real verification claims or real-money activity.

### Remaining real-entry gates

- [ ] DPC controller-registration evidence for the approved pilot operator/applicant.
- [ ] Applicable DPC overseas storage/transfer authorization for the exact Supabase/Google/Firebase real-data topology.
- [ ] Qualified Zambia legal/privacy/consumer review of final participant/provider notice, consent, marketplace/trust wording and retention/legal-hold treatment.
- [ ] Final approved real-participant notice/consent version ID recorded.
- [ ] Real Firebase phone-auth provider/configuration approval and canary under the authorized pilot boundary.
- [ ] Real private-storage/auth/deletion/withdrawal canary under the authorized pilot boundary.
- [ ] Zambia-based field operator/lead before any `field visited` or equivalent claim.

### Phase 11 evidence stages

Synthetic/system coverage now exists for the production-shaped workflows, but it does not close the mandatory real evidence classes.

- [ ] 11C `PRIMARY-PILOT` provider onboarding/evidence/comprehension evidence.
- [ ] 11D `PRIMARY-PILOT` discovery/location/trust-comprehension evidence.
- [ ] 11E `PRIMARY-PILOT` enquiries/contact-consent/reviews/complaints evidence.
- [ ] 11F real operations/capacity evidence; field component only after field-lead gate.
- [ ] 11G real Zambia device/connectivity/reliability evidence.
- [ ] 11H real willingness-to-pay/unit-economics evidence without real payment activation.
- [x] 11I correction loop exercised for synthetic activation defects/regressions; real-pilot corrections remain future evidence-led work.
- [ ] 11J `STOP / REPEAT / NARROW / PROCEED` exit review.

## Important Phase 11 technical truth

The managed synthetic environment is now populated and functional, but the real pilot remains deliberately fail-closed:

- `PILOT_ENTRY_APPROVED=true` remains prohibited without the real entry evidence;
- Cloud Run staging remains IAM-private;
- synthetic/demo identities are not an approved real participant path;
- Firebase real phone-auth identities/invitations remain zero in the managed synthetic cohort;
- payment remains disabled and payment intents remain zero;
- Android discovery retains manual/list fallback and does not depend on production Maps;
- Sentry is not required or approved for real participant data in Wave 1;
- no real evidence file was uploaded for the synthetic verification metadata;
- no field-visited claim was created.

No environment-variable change, synthetic result, demo dataset or unsigned AAB can authorize the real pilot or formal Phase 12 by itself.

## Current source documents

- `docs/phase11/HANDOFF_FROM_PHASE10.md`
- `docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`
- `docs/phase11/PHASE11A_REAL_PILOT_ENTRY_DECISION_2026-07-19.md`
- `docs/phase11/PILOT_PRIVACY_CONSENT_RETENTION_BASELINE.md`
- `docs/phase11/PILOT_RECRUITMENT_AND_OPERATIONS_PROTOCOL.md`
- `docs/phase11/SECONDARY_EVIDENCE_SUBSTITUTION_MATRIX.md`
- `docs/phase11/PILOT_VALIDATION_EVIDENCE_REGISTER.md`
- `docs/phase11/PHASE11_SYNTHETIC_CONTROLLED_PILOT_ACTIVATION_2026-07-19.md`
- `docs/phase12/PHASE12_PREAUTHORIZATION_RELEASE_READINESS_2026-07-19.md`
- `docs/architecture/PHASE12_PREAUTHORIZATION_RELEASE_READINESS_DECISION.md`

## Phase boundaries

- Phase 10: complete.
- Phase 11A internal decisions: complete.
- Phase 11 synthetic functional readiness: complete.
- Phase 11 managed synthetic activation: complete.
- Phase 11 repository-control housekeeping: complete.
- Phase 12 preauthorization release-readiness engineering: complete for the current unsigned/non-publishing scope; the release variant builds successfully under a permanent fail-closed CI gate.
- Phase 11 real-participant entry and 11C–11H primary evidence: pending external gates and actual Zambia pilot.
- Phase 11J: pending.
- Formal Phase 12 production release: not authorized until actual Phase 11 exit evidence supports `PROCEED` and the global release gates pass.

Issue #5 remains the historical deferred real-world validation obligation; Issue #112 remains the active Phase 11 execution tracker and must remain open until the real controlled-pilot exit criteria are actually met.
