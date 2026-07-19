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
| Stable checkpoint | W3 closed on exact merged source `012a7b9c24e93087d823661298d051c08ea34ec0`; managed run `29703117963` PASS; Issue #133 contains sanitized evidence |
| Current task | W4 — complete customer journey parity; W5 blocked until W4 closure evidence passes |
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
9. W2 public discovery uses backend-managed synthetic/test state through the reviewed `authenticated-bff` private API boundary; production unauthenticated API mode remains prohibited.
10. W2 managed evidence passed without exposing API/web publicly. The bounded canary reused `direkt-portal-runtime` only for the private synthetic exercise and bound no portal secret; this does not authorize public deployment.
11. A dedicated least-privilege customer/provider web runtime identity is required before W8 public cutover.
12. W3 browser authentication keeps session material HttpOnly and server-controlled, enforces CSRF/origin/session rotation/replay/expiry controls, and never derives provider scope or authorization from client-selected state or Firebase claims.
13. W4 customer actions must remain backend-authoritative and use the same enquiry, contact-consent, interaction, review and complaint lifecycle rules as Android.

## Active implementation sequence

- W0 — baseline freeze, Android/API/screen inventory, functional parity matrix and project-wide documentation. **Closed.**
- W1 — additive Next.js/React/TypeScript PWA shell, design system, responsive navigation, manifest/service-worker safety, BFF boundary and typed API foundation. **Closed.**
- W2 — real public discovery vertical slice through canonical API contracts plus managed IAM-private evidence. **Closed — managed run `29694862350` PASS on `4b892b90c42239c81c4f9c6f8c9f5447519dd6f6`.**
- W3 — browser authentication/account/session boundary. **Closed — managed run `29703117963` PASS on `012a7b9c24e93087d823661298d051c08ea34ec0`.**
- W4 — complete customer journey parity. **Active; W5 blocked until W4 closure evidence passes.**
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
- parity is claimed from static fixtures instead of backend-observable state;
- browser authentication would expose session credentials to JavaScript-readable storage, accept client-selected provider scope, skip CSRF/origin protections, or activate real participant access without the separate Phase 11 gates;
- a W4 customer mutation could report success without authoritative backend acknowledgement or bypass canonical eligibility/consent rules.

## Conflict rule

No parallel overlapping writes are permitted while this lock is claimed. Read-only investigation is allowed. A subsequent agent must continue this exact workstream or leave a complete handoff before changing overlapping Android, backend/OpenAPI, web/PWA, CI or control-document paths.
