# DIREKT Functional Web/PWA Workstream Index

This directory is the authoritative index for the real customer/provider browser application workstream.

## Governing documents

1. [Functional PWA Parity Implementation Plan](FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md)
2. [Android ↔ Web/PWA Functional Parity Matrix](FUNCTIONAL_PARITY_MATRIX.md)
3. [W2 Public Discovery Checkpoint](W2_PUBLIC_DISCOVERY_CHECKPOINT.md)
4. [Functional PWA Architecture Decision](../architecture/FUNCTIONAL_PWA_ARCHITECTURE_DECISION.md)
5. [Functional PWA No-Regression Test Plan](../testing/FUNCTIONAL_PWA_NO_REGRESSION_TEST_PLAN.md)
6. [Project Status](../../PROJECT_STATUS.md)
7. [Workstream Lock](../../WORKSTREAM_LOCK.md)

## Source surfaces

- `android/direkt-app/` — primary native Version 1 client; regression-protected by this workstream.
- `web/direkt-app/` — real functional customer/provider Next.js PWA.
- `web/direkt-pwa/` — preserved synthetic static preview until controlled cutover.
- `backend/direkt-api/` — canonical NestJS REST/OpenAPI and business/trust boundary.
- `admin/direkt-operations-portal/` — separate IAM-private privileged operations application.

## Active W-stage

- W0 baseline/parity controls: merged through PR #153.
- W1 functional web foundation: merged through PR #153 and synchronized by PR #154.
- W2 real public discovery: repository implementation is active and must pass exact-head CI/review plus managed IAM-private staging/canary evidence before W2 exit is declared.
- W3–W8 remain sequenced behind the acceptance gates in the implementation plan and parity matrix.

No later stage may treat the preserved static `web/direkt-pwa/` preview as evidence of functional parity.
