# DIREKT Project Status

**Updated (Asia/Tokyo):** 2026-07-19  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1` — history-preserving synchronization maintained; no force-push/history rewrite  
**Active corrective workstream:** Issue #133 — authoritative documentation/integration reconciliation + remote customer/provider PWA

## Programme state

Phases 0–10 are complete and stable. Phase 11 internal decisions, synthetic functional readiness and managed synthetic activation are complete, but real-participant pilot evidence (11C–11H) and 11J remain pending. Phase 12 preauthorization engineering is substantially prepared, including Android release contracts, Play-readiness sources and all currently clearable repository-controlled release-readiness controls, but formal production release is **not authorized**.

The owner has additionally authorized an Android-first **customer/provider PWA companion** for remote desktop/tablet/mobile visual testing. Its initial public mode is synthetic-only and does not enable real participant traffic or expose the IAM-private backend.

## Stable checkpoints

| Checkpoint | PR | Status |
|---|---:|---|
| Phase 4 verification/evidence | #21 | complete |
| Phase 5 customer discovery | #24 | complete |
| Phase 6 provider workspace | #26 | complete |
| Phase 7 operations workflow | #29 | complete |
| Phase 8 enquiries/interactions/reviews | #31 | complete |
| Phase 9 subscription/payment foundation | #35 | complete |
| Phase 10 security/privacy/reliability + managed staging | #111 | complete |
| Phase 11 entry-control foundation | #113 | Issue #112 remains open |
| Android regression repair | #118 | complete |
| Phase 11 synthetic controlled-pilot implementation | #119 | complete |
| Phase 11 managed synthetic activation | #120 | complete |
| Phase 11 external-entry package | #121 | external gates pending |
| Phase 11 final synthetic checkpoint | #123 | complete |
| Phase 12 preauthorization foundation | #125 | complete |
| Phase 12A Android release contract | #129 | complete |
| Phase 12B Play-readiness package | #134 | complete as non-publishing preauthorization |
| Clearable Phase 12 release-readiness controls | #136 | complete as preauthorization; production gates preserved |
| Reconciliation + remote PWA | #133 | active until promoted/verified |

## Current managed infrastructure truth

| Service | Current verified role |
|---|---|
| Supabase | project `direct-app`, ref `aeeuscifrxcjmnswqwnq`, `ap-northeast-1`; PostgreSQL/PostGIS + private Storage |
| Google Cloud | project `direkt-dev-502701`, region `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| Cloud Run API | `direkt-api` — IAM-private staging |
| Cloud Run portal | `direkt-operations-portal-staging` — IAM-private staging |
| Secret Manager | runtime secret authority with pinned-version deployment contracts |
| GitHub WIF/Actions | active keyless CI/deployment boundary |
| Firebase App Distribution | active internal Android distribution to `direkt-internal-testers` |
| Firebase phone auth | source-integrated but real participant use gated |
| Cloud Logging/Monitoring | active managed observability/rollback/kill-switch evidence |

Live read-only verification on 2026-07-19 confirmed Supabase project `aeeuscifrxcjmnswqwnq` is `ACTIVE_HEALTHY`, with the expected DIREKT schemas and all four required Storage buckets private.

## Public domain and remote UI truth

Canonical public domain:

```text
https://direkt.forum/
```

Current edge model:

```text
Vercel Domains (registrar)
  → Cloudflare authoritative DNS
  → GitHub Pages public static origin
      /      documentation/public non-sensitive material
      /app/  customer/provider synthetic PWA
```

The old `kudzimusar.github.io/direkt` URL is not the owner-facing canonical URL.

The PWA is a safe synthetic review surface: no real submissions, participant data, private evidence, private coordinates, auth tokens or protected API calls. Future live API mode requires an approved browser authentication/session/API access design.

Native Android remains the primary client and is remotely testable through Firebase App Distribution/GitHub artifacts. The operations portal remains separate and privileged on IAM-private Cloud Run staging.

## Integration truth

Detailed authoritative register: `docs/integrations/CURRENT_INTEGRATION_STATUS.md`.

### Active managed foundation

- Supabase PostgreSQL/PostGIS/private Storage;
- NestJS API and Next.js operations portal on private Cloud Run staging;
- Artifact Registry;
- Secret Manager;
- GitHub Actions + Workload Identity Federation;
- Cloud Logging/Monitoring;
- Firebase App Distribution;
- canonical `direkt.forum` public static path through Cloudflare DNS + GitHub Pages.

### Implemented but gated

- Firebase phone OTP/session exchange and invite/consent controls;
- real participant admission;
- consent-aware real contact handoff;
- production Android signing/Play release;
- commercial/payment engine with real provider/money movement disabled.

### Externally provisioned but runtime source/binding evidence incomplete

- **Resend:** `notify.direkt.forum` verified; synthetic outbound test passed; send-only key stored as `direkt-resend-api-key` in Secret Manager and API runtime identity has access. Current backend/source/deployment allowlist does not yet prove application email runtime activation.
- **Google Maps:** owner setup reported; runtime SDK/source integration was not present at Phase 11 audit; manual/PostGIS/list fallback remains authoritative.
- **Sentry:** external setup reported; runtime SDK integration was not present at Phase 11 audit; Cloud Logging/Monitoring remains authoritative.
- **Cloudflare Email Routing:** approved role aliases configured; application outbound messaging is separate.

### Not active / planned / superseded

- Cloudflare Turnstile: not active; latest setup attempt hit a 403 permission boundary.
- FCM production push: planned.
- Crashlytics runtime: planned/not source-active at audited baseline.
- WhatsApp production delivery: planned/disabled.
- MTN MoMo/Airtel Money: planned/disabled; no real money.
- PACRA/NCC/TEVETA automated APIs: not authorized; manual evidence-source mode.
- Brevo: superseded as preferred email direction by Resend.
- Twilio Verify: superseded for the current pilot identity direction by Firebase phone authentication.
- Vercel application hosting: superseded for current protected staging by Cloud Run; Vercel remains registrar.

## Phase 11 real-entry blockers

Still pending genuine external/primary evidence:

- applicable DPC controller-registration and overseas storage/transfer requirements;
- qualified Zambia legal/privacy/consumer review;
- final approved participant/provider notice and consent version;
- real Firebase/private-storage/auth/deletion/withdrawal canaries inside the approved pilot boundary;
- Zambia operational/field ownership before field-visited claims;
- 11C provider onboarding/evidence/comprehension evidence;
- 11D discovery/location/trust-comprehension evidence;
- 11E enquiry/contact/review/complaint evidence;
- 11F real operations/capacity/field evidence;
- 11G Zambia device/connectivity/reliability evidence;
- 11H willingness-to-pay/unit-economics evidence;
- 11J evidence-backed `STOP / REPEAT / NARROW / PROCEED` decision.

Issue #112 remains open until those criteria genuinely pass.

## Phase 12 preauthorization truth

### Completed repository-controlled engineering

- source-controlled Android preauthorization versioning;
- fail-closed protected signing contract;
- reproducible unsigned AAB evidence;
- Play listing/permission/Data Safety/content/distribution source inventories;
- production runtime readiness matrix;
- monitoring/rollback/staged-rollout/stop-criteria contract;
- staffing requirement matrix without staffing claims;
- release package/provenance/runbook controls;
- formal release-eligibility latches that remain false until real evidence exists.

### Still blocked for formal release

- Phase 11 real evidence + 11J `PROCEED`;
- qualified legal/DPC/final privacy approval;
- account deletion end-to-end/public deletion route as required;
- evidence-led removal/isolation of synthetic preview production blockers;
- actual production environment and production backup restore;
- operational staffing;
- active/tested production monitoring/escalation;
- real signing key and signed reproducible AAB;
- Play internal/closed testing, final forms/IARC/assets and release-date policy check;
- public production backend traffic and real participant activation.

## Current owner-visible UI workstream

Issue #133 is authorized to:

1. reconcile the authoritative plan/status/integration/domain documents against current source and managed evidence;
2. publish an installable responsive customer/provider PWA under `direkt.forum/app/` using synthetic data;
3. align PWA palette/navigation/trust semantics with the Android design system;
4. preserve the canonical REST/OpenAPI boundary for future live mode;
5. validate the public static bundle against secret/private-data leakage;
6. keep production/pilot gates unchanged.

This workstream exists because code/backend/security/integration progress must be inspectable visually by the owner rather than inferred only from CI and source files.

## Current source-of-truth documents

- `MASTER_BUILD_PLAN.md`
- `docs/integrations/CURRENT_INTEGRATION_STATUS.md`
- `docs/integrations/INTEGRATION_AND_SECRETS_PLAN.md`
- `docs/architecture/PWA_ARCHITECTURE.md`
- `docs/design/PWA_UI_SPECIFICATION.md`
- `docs/operations/REMOTE_UI_TESTING.md`
- `docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`
- `docs/phase11/PILOT_VALIDATION_EVIDENCE_REGISTER.md`
- `docs/phase12/PHASE12_CLEARABLE_RELEASE_READINESS_MATRIX.md`
- `docs/phase12/PHASE12_RELEASE_EXECUTION_RUNBOOK.md`

## Boundary summary

- Phases 0–10: complete.
- Phase 11 internal/synthetic readiness: complete.
- Phase 11 real-participant pilot/primary evidence: pending.
- Phase 11J: pending.
- Phase 12 preauthorization engineering: substantially prepared.
- Formal Phase 12 production release: blocked.
- Remote customer/provider PWA: authorized for synthetic remote review; live/production browser mode separately gated.
