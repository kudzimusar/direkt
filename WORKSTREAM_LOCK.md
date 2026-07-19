# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED — Phase 0–12 integration/runtime audit and all currently repository-clearable Phase 12 work complete |
| Owner/agent | None — lane available for the next explicitly authorized task |
| Formal programme phase | Phase 11 remains open; formal Phase 12 production release is not authorized |
| Final implementation checkpoint | PR #149 merged to `main` at `25deaae72ca2974c5560a8059a50fce37c810f63` |
| Exact audited implementation head | `e3cddf7645e514d9a6254fff86283d4055d745c4` |
| Managed Supabase hardening | migration `202607191200_integration_runtime_privilege_hardening.sql`, checksum `e02d1be228a992b7541db92328e9528b8fe0e184660fb78206ca405e9c7b2372`, migration count `39` |
| Governing issue | Issue #112 remains open for real pilot evidence/exit |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## Final integration truth

Active managed boundaries include Supabase PostgreSQL/PostGIS/private Storage, canonical REST/OpenAPI backend, Artifact Registry, private Cloud Run staging, Secret Manager, GitHub WIF/Actions, Cloud Logging/Monitoring and Firebase App Distribution.

Firebase phone authentication is implemented but gated. Maps, Sentry and Resend remain externally provisioned/runtime-unproven. Crashlytics, FCM, Test Lab automation, Turnstile, production WhatsApp, real payment providers and automated registry access remain planned/disabled. No inactive provider was promoted merely because an account or credential exists.

The public customer/provider PWA remains synthetic-only for remote UI review. Native Android remains the authoritative native test surface. The operations portal remains IAM-private.

## Remaining genuine gates

- real 11C–11H Zambia pilot evidence and 11J `PROCEED`;
- required regulatory/legal/privacy approvals and final live policy versions;
- production client cutover from synthetic preview surfaces;
- end-to-end account deletion;
- actual production environment and backup restore;
- operational support/verification/on-call staffing and production monitoring;
- authorized signed reproducible AAB, final Play declarations/assets/content rating and internal/closed testing;
- formal go/no-go, staged rollout and final release record.

## Conflict rule

A new agent may claim the lane only for an explicitly authorized next task and must update this file before overlapping writes. Read-only investigation remains allowed.
