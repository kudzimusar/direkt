# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — authoritative reconciliation + remote customer/provider PWA |
| Owner/agent | OpenAI GPT-5.5 Thinking — repository reconciliation/PWA agent |
| Formal programme phase | Phase 11 real-participant validation remains open; Phase 12 preauthorization engineering is substantially prepared but formal production release is not authorized |
| Authorized engineering scope | Reconcile current documentation/integration truth and add an Android-aligned responsive installable customer/provider PWA for remote synthetic UI testing |
| Governing issue | Issue #133 |
| Stable baseline | `main` includes Phase 12B and all currently clearable Phase 12 preauthorization controls through PR #136; PR #137 synchronized `build/android-v1` |
| Owner decisions incorporated | `direkt.forum` is the canonical public domain; Cloudflare/Resend state must be reconciled; Version 1 may include an Android-first customer/provider PWA alongside native Android for remote desktop/tablet/mobile testing |
| Real-pilot authorization | BLOCKED pending legal/privacy/provider/consent/support/device/field gates and actual 11C–11H primary evidence |
| Production-release authorization | BLOCKED pending 11J `PROCEED`, global release gates, production environment/staffing/monitoring, signing and Play approval |
| Expected handoff | Promote only after authoritative docs and current code agree, PWA static remote-review surface is safe/installable, permanent checks pass, review findings are resolved and Issue #133 acceptance evidence is recorded |

## Prior lock reconciliation

The previous Phase 12 preauthorization agent completed its claimed work through PR #136 and history-preserving synchronization PR #137. Its lock text remained stale after completion; this claim explicitly resolves that stale state without discarding any Phase 12 work.

## Reconciliation rules

- Do not infer runtime activation from an external account existing. Classify integrations as `ACTIVE`, `IMPLEMENTED_GATED`, `EXTERNALLY_PROVISIONED`, `PLANNED`, `DISABLED` or `SUPERSEDED` with evidence provenance.
- Owner-reported Cloudflare/Resend/DNS facts may be recorded as external provisioning evidence, but runtime delivery claims require source/configuration and managed execution evidence.
- Stale GitHub Pages/Vercel/Brevo/Twilio statements must be corrected where superseded while historical decisions remain traceable.
- The public PWA uses synthetic data for remote visual/product testing. It must not expose private evidence, real participant data, privileged tokens, private coordinates or protected Cloud Run services.
- Any future live PWA API path must use canonical REST/OpenAPI through an approved browser authentication/session boundary; no direct database or privileged Supabase access.

## Preserved release controls

- Current Android preauthorization identity remains governed by `android/direkt-app/release/version.properties` and the Phase 12 release contracts.
- Formal release eligibility latches remain fail-closed until their evidence exists.
- No real upload key, signing secret, signed production AAB, Play publication, public production traffic or participant activation is authorized by this workstream.
- Phase 11 synthetic/system evidence must never be relabelled as `PRIMARY-PILOT` evidence.

## Conflict rule

No other agent may write overlapping reconciliation/PWA control paths while Issue #133 holds this lock. Parallel read-only investigation is allowed. New external integration evidence must be reconciled into the same status register rather than creating a competing source of truth.
