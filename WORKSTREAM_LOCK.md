# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — late Phase 12 release-policy hardening after final Codex review |
| Owner/agent | OpenAI GPT-5.5 Thinking — Phase 12 release-readiness agent |
| Formal programme phase | Phase 11 remains open; formal Phase 12 production release is not authorized |
| Immediate corrective scope | Close three post-merge P1 bypasses: non-excludable formal release eligibility, release-scoped dependency/Data Safety inspection, and `uses-permission-sdk-23` merged-manifest coverage |
| Stable promoted baseline | `main` at `630d0a734e2e755d3d41bf4013aca30f7ece40fe`; implementation lane history-synchronized through PR #139 |
| Governing issue | Issue #112 remains open; real controlled-pilot evidence and Phase 11 exit are still required |
| Production-release authorization | BLOCKED |
| Closeout status | Provisional closeout must not be treated as final until these late review findings are fixed, exact-head gates pass, corrective PR is promoted, status is amended and branches are resynchronized |

## Non-negotiable controls

- No release-candidate/production build may bypass formal eligibility through Gradle task exclusion.
- Play/Data Safety dependency inspection must cover the actual release runtime configuration, including release-scoped dependencies.
- Permission inventory must include both `uses-permission` and `uses-permission-sdk-23` from the merged release manifest.
- Preserve all existing Phase 4–12A/12B trust, privacy, security, signing and fail-closed controls.
- No production signing, Play publication, public traffic, participant/payment activation or Issue #112 closure.

## Conflict rule

No second agent may write to the affected Android/Phase 12 workflow/status paths while this corrective lock is claimed. Read-only investigation is allowed.
