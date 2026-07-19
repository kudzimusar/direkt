# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED — functional customer/provider web/PWA parity implementation |
| Owner/agent | Active repository agent — functional PWA parity workstream |
| Authorized scope | Document and implement the real customer/provider web/PWA companion using the same canonical REST/OpenAPI backend, identity, authorization, trust, enquiry, review and commercial rules as Android; desktop replaces bottom navigation with side navigation while mobile retains bottom navigation |
| Protected surface | `android/direkt-app/**` is regression-protected; no Android architecture, dependency, Gradle, release/signing or UI refactor is authorized by this workstream unless a separately reviewed compatibility fix is strictly required |
| Implementation lane | `build/android-v1` — historical name retained; single sequential product lane |
| Stable checkpoint | W0/W1 merged through PR #153 at `3302f9571d8e4837a6c33c77b93abff066780bc2` and synchronized by PR #154 |
| Current task | W2 — real public discovery vertical slice through canonical public discovery/review contracts and IAM-private server-side invocation boundary |
| Governing plan | `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md` |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized |
| Governing issues | Issue #133 for customer/provider PWA/reconciliation; Issue #112 remains open for real pilot evidence/exit |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates |

## Workstream contract

1. The existing synthetic `web/direkt-pwa/` remains a preserved review surface until the functional web client passes the documented parity and security gates.
2. The real browser client is additive under `web/direkt-app/`; it must not be created by refactoring Android into Kotlin Multiplatform/Compose Web.
3. Android and web share product semantics through the canonical NestJS REST/OpenAPI boundary, not shared UI binaries.
4. A live browser client must use a reviewed browser session/BFF/gateway boundary. The IAM-private API must not be made public merely to support the web client.
5. No direct privileged Supabase/database/Storage credentials or authority may enter browser code.
6. Every shared backend/OpenAPI change must remain backward compatible with Android and pass Android regression gates.
7. Mobile web uses bottom navigation aligned to Android. Desktop uses persistent side navigation with the same destinations and capabilities; desktop is a layout adaptation, not a different product.
8. No synthetic fixture or preview-only behavior may be counted as functional parity when a canonical backend capability exists.
9. W2 public discovery may use backend-managed synthetic/test state, but production browser invocation must remain server-side through `authenticated-bff`; unauthenticated production API mode is prohibited.

## Active implementation sequence

- W0 — baseline freeze, Android/API/screen inventory, functional parity matrix and project-wide documentation. **Checkpoint merged.**
- W1 — additive Next.js/React/TypeScript PWA shell, design system, responsive navigation, manifest/service-worker safety, BFF boundary and typed API foundation. **Checkpoint merged.**
- W2 — real public discovery vertical slice through canonical API contracts. **Active verification/merge task.**
- W3 — browser authentication/account/session boundary.
- W4 — complete customer journey parity.
- W5 — complete provider journey parity.
- W6 — commercial parity within currently authorized/gated payment boundaries.
- W7 — cross-client parity, security, accessibility, responsive, offline/network and Android regression closure.
- W8 — controlled route/deployment cutover only after parity evidence passes; preserve historical preview separately.

## Stop conditions

Do not merge or promote the functional PWA checkpoint if:

- Android unit/lint/build or release-policy regressions appear;
- the web client requires weakening Cloud Run IAM or exposing privileged Supabase access;
- protected API behavior is changed incompatibly for Android;
- private evidence, contact data or exact provider coordinates can leak into public/browser caches;
- a real participant, legal, payment, production or release gate would need to be fabricated or bypassed;
- parity is claimed from static fixtures instead of backend-observable state.

## Conflict rule

No parallel overlapping writes are permitted while this lock is claimed. Read-only investigation is allowed. A subsequent agent must continue this exact workstream or leave a complete handoff before changing overlapping Android, backend/OpenAPI, web/PWA, CI or control-document paths.
