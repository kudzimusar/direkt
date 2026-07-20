# DIREKT Functional Web/PWA Workstream Index

This directory is the authoritative index for the real customer/provider browser application workstream.

## Governing documents

1. [Functional PWA Parity Implementation Plan](FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md)
2. [Android ↔ Web/PWA Functional Parity Matrix](FUNCTIONAL_PARITY_MATRIX.md)
3. [W7 Cross-Client Regression Checkpoint](W7_CROSS_CLIENT_REGRESSION_CHECKPOINT.md)
4. [W8 Controlled Cutover Checkpoint](W8_CONTROLLED_CUTOVER_CHECKPOINT.md)
5. [Functional PWA Architecture Decision](../architecture/FUNCTIONAL_PWA_ARCHITECTURE_DECISION.md)
6. [Functional PWA No-Regression Test Plan](../testing/FUNCTIONAL_PWA_NO_REGRESSION_TEST_PLAN.md)
7. [Project Status](../../PROJECT_STATUS.md)
8. [Workstream Lock](../../WORKSTREAM_LOCK.md)

## Source surfaces

- `android/direkt-app/` — primary native Version 1 client; regression-protected by this workstream.
- `web/direkt-app/` — real functional customer/provider Next.js PWA and reviewed browser/BFF boundary.
- `web/direkt-pwa/` — preserved dependency-free synthetic static preview; W8 packages it under explicit `/preview/` while retaining historical `/app/` during transition.
- `backend/direkt-api/` — canonical IAM-private NestJS REST/OpenAPI and business/trust boundary.
- `admin/direkt-operations-portal/` — separate IAM-private privileged operations application; its runtime identity is not the permanent customer/provider web identity.

## W-stage status

- W0 baseline/parity controls: **Closed.**
- W1 functional web foundation: **Closed.**
- W2 canonical public discovery through the private API/BFF: **Closed — managed evidence PASS.**
- W3 browser authentication/account/session boundary: **Closed — managed evidence PASS.**
- W4 complete customer journey parity: **Closed — managed customer evidence plus lifecycle contract evidence PASS.**
- W5 complete provider journey parity: **Closed — managed evidence PASS.**
- W6 commercial parity within authorized synthetic/gated boundaries: **Closed — managed evidence PASS.**
- W7 cross-client parity/regression closure: **Closed — exact-head Android/backend/database/OpenAPI/web gates and trusted-main managed browser canary PASS.**
- W8 controlled route/deployment cutover: **Active.** Preserve the synthetic preview, deploy the functional BFF with a dedicated least-privilege runtime, prove a working public UI while keeping the API private, then close only after the approved custom-domain DNS/TLS/runtime route is externally verified.

No W-stage may treat the preserved static `web/direkt-pwa/` preview as evidence of functional parity, and no browser deployment checkpoint may overclaim real participant, external-provider, payment, Phase 11 or formal Phase 12 production readiness.
