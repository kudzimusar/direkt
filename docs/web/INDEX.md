# DIREKT Functional Web/PWA Workstream Index

This directory is the authoritative index for the real customer/provider browser application workstream.

## Governing documents

1. [Functional PWA Parity Implementation Plan](FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md)
2. [Android ↔ Web/PWA Functional Parity Matrix](FUNCTIONAL_PARITY_MATRIX.md)
3. [Functional PWA Architecture Decision](../architecture/FUNCTIONAL_PWA_ARCHITECTURE_DECISION.md)
4. [Functional PWA No-Regression Test Plan](../testing/FUNCTIONAL_PWA_NO_REGRESSION_TEST_PLAN.md)
5. [Project Status](../../PROJECT_STATUS.md)
6. [Workstream Lock](../../WORKSTREAM_LOCK.md)

## Source surfaces

- `android/direkt-app/` — primary native Version 1 client; regression-protected by this workstream.
- `web/direkt-app/` — real functional customer/provider Next.js PWA.
- `web/direkt-pwa/` — preserved synthetic static preview until controlled cutover.
- `backend/direkt-api/` — canonical NestJS REST/OpenAPI and business/trust boundary.
- `admin/direkt-operations-portal/` — separate IAM-private privileged operations application.

## Active W-stage

W0 documentation/baseline controls and W1 functional web foundation are active. Later W2–W8 stages may proceed only through the acceptance gates in the implementation plan and parity matrix.
