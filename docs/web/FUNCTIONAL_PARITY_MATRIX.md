# DIREKT Android ↔ Web/PWA Functional Parity Matrix

**Status:** Active implementation control  
**Owner:** Functional PWA parity workstream  
**Baseline:** W3 closed on exact managed source `012a7b9c24e93087d823661298d051c08ea34ec0`; managed run `29703117963` PASS

## Status legend

- `PASS` — implemented and evidenced on both applicable clients against authoritative backend state.
- `IMPLEMENTING` — active work in current W-stage; repository implementation may exist but required runtime/managed evidence is not yet complete.
- `API_READY` — canonical backend/OpenAPI capability exists; browser implementation pending.
- `GATED` — implementation may exist but real activation requires separate legal/provider/production evidence.
- `PREVIEW_ONLY` — current Android or synthetic PWA presentation exists but is not yet a fully backend-backed equivalent.
- `N/A` — intentionally client-specific.

## Cross-client foundation

| Capability | Android current truth | Canonical backend/API | Functional Web/PWA target | Status |
|---|---|---|---|---|
| Product identity/design tokens | Implemented | N/A | Same DIREKT visual language | PASS |
| Customer/provider navigation | Implemented | N/A | Same destinations; mobile bottom nav, desktop side nav | PASS |
| Responsive desktop/tablet/mobile | Android native phone/tablet behavior | N/A | Required | PASS |
| Installable PWA | N/A | N/A | Required | PASS |
| Offline-safe static shell | Android native app shell | N/A | Required; no fake offline mutation success | PASS |
| Canonical REST/OpenAPI boundary | Partial client integration; canonical backend exists | Active | Required | PASS — W2/W3 managed private invocation evidenced |
| Direct privileged Supabase access | Prohibited | Prohibited | Prohibited | PASS |
| Backend-authoritative roles/provider scope | Required | Active | Required | PASS — W3 managed actor-derived provider-mode evidence |

## Authentication and account

| Capability | Android current truth | Canonical backend/API | Functional Web/PWA target | Status |
|---|---|---|---|---|
| Synthetic/dev auth challenge | Development/test path | `/auth/challenges*` | Test-only where needed | PASS — controlled synthetic evidence only |
| Firebase phone-possession proof | Implemented but gated | `/auth/firebase/exchange` | Browser BFF exchange implemented; real Web Firebase activation separately gated | GATED |
| DIREKT session creation | Implemented for pilot flow | Active | Secure browser session | PASS |
| Session rotation | Supported | `/auth/sessions/rotate` | Required | PASS |
| Session listing | Supported contract | `/auth/sessions` | Required | PASS |
| Revoke other sessions | Supported contract | protected route | Required | PASS |
| Revoke individual session | Supported contract | protected route | Required | PASS |
| Pilot invitation/admission | Implemented/gated | Active | Same backend authority | GATED |
| Notice/consent version enforcement | Implemented/gated | Active | BFF exchange preserves server-controlled notice/consent boundary; real admission remains gated | GATED |
| Account profile | Implemented contract | `/account/profile` | Required | PASS |
| Logout/expiry UX | Partial/native | session APIs | Required | PASS |

W3 closure is recorded in `docs/web/W3_AUTH_ACCOUNT_CHECKPOINT.md`. Managed run `29703117963` on exact source `012a7b9c24e93087d823661298d051c08ea34ec0` proved HttpOnly credential containment, CSRF/origin negatives, backend-observable account/session state, actor-derived provider mode, idle refresh rotation, logout/revocation, IAM-private denial and temporary Invoker cleanup. Firebase Web phone-possession and real participant admission remain explicitly `GATED`.

## Customer discovery

| Capability | Android current truth | Canonical backend/API | Functional Web/PWA target | Status |
|---|---|---|---|---|
| Category list | Implemented/preview-backed depending path | `/public/categories` | Real API-backed | PASS |
| Manual area selection | Product requirement; active fallback | search/location contracts | Required | PASS |
| Provider search | Implemented/preview-backed depending path | `/public/providers/search` | Real API-backed | PASS |
| Search filters | Product requirement | canonical query contract | Required | PASS |
| Provider result cards | Implemented | public provider projection | Required | PASS |
| Provider profile | Implemented | `/public/providers/{id}` | Required | PASS |
| Scoped trust claims | Implemented semantics | `/public/providers/{id}/claims` | Required | PASS |
| Availability | Implemented | `/public/providers/{id}/availability` | Required | PASS |
| Public reviews | Implemented semantics | `/public/providers/{id}/reviews` | Required | PASS |
| Share projection | Contract exists | `/public/providers/{id}/share` | Required where UX supports it | PASS |
| Saved providers | Android UX exists | canonical save contract | Required | PREVIEW_ONLY |
| Map view | Synthetic/privacy-safe | Maps runtime unproven | Preserve list/manual fallback; no Maps activation in this workstream | GATED |

W2 closure is recorded in `docs/web/W2_PUBLIC_DISCOVERY_CHECKPOINT.md`. Managed run `29694862350` on exact source `4b892b90c42239c81c4f9c6f8c9f5447519dd6f6` proved API↔BFF discovery/profile parity, managed synthetic observability, privacy-safe projections, rendered shell/security headers, unauthenticated denial and temporary Invoker cleanup.

## Customer enquiries and interactions

| Capability | Android current truth | Canonical backend/API | Functional Web/PWA target | Status |
|---|---|---|---|---|
| Create enquiry | Implemented UI/domain | `POST /enquiries` | Required | API_READY |
| List enquiries | Implemented UI/domain | `GET /enquiries` | Required | API_READY |
| Enquiry detail | Implemented UI/domain | `GET /enquiries/{id}` | Required | API_READY |
| Cancel enquiry | Implemented contract | `POST /enquiries/{id}/cancel` | Required | API_READY |
| Consent-aware contact handoff | Implemented/gated | handoff routes | Required | GATED |
| List handoffs | Implemented contract | handoff routes | Required | API_READY |
| Revoke handoff | Implemented contract | revoke route | Required | API_READY |
| Interaction history | Implemented contract | `/interactions*` | Required | API_READY |
| Review eligibility | Implemented contract | `/interactions/{id}/review-eligibility` | Required | API_READY |
| Submit review | Implemented contract | `/interactions/{id}/reviews` | Required | API_READY |
| List/read own reviews | Implemented contract | `/reviews*` | Required | API_READY |
| Review appeal | Implemented contract | `/reviews/{id}/appeals` | Required | API_READY |
| Review report | Implemented contract | `/reviews/{id}/reports` | Required | API_READY |
| Interaction complaint | Implemented contract | `/interactions/{id}/complaints` | Required | API_READY |
| Complaint list/detail | Implemented contract | `/complaints*` | Required | API_READY |

## Provider workspace

| Capability | Android current truth | Canonical backend/API | Functional Web/PWA target | Status |
|---|---|---|---|---|
| Provider workspace summary | Implemented UI/domain | `/provider-workspace/me` | Required | API_READY |
| Actor-resolved provider scope | Required | Active server-side rule | Required; no client-selected tenant | PASS boundary/API_READY UI |
| Profile and operating model | Implemented | provider/workspace contracts | Required | API_READY |
| Service/category selections | Implemented | provider/category contracts | Required | API_READY |
| Service area/public locality | Implemented semantics | location/provider contracts | Required | API_READY |
| Verification/readiness timeline | Implemented | safe aggregate projections | Required | API_READY |
| Evidence requirements/status | Implemented | verification/evidence contracts | Required | API_READY |
| Recoverable evidence upload | Implemented domain | short-lived private upload grants | Required | API_READY |
| Evidence retry/resubmission | Implemented domain | upload intent/version contracts | Required | API_READY |
| Provider enquiry inbox | Implemented | `/provider-workspace/me/enquiries` | Required | API_READY |
| Provider enquiry detail | Implemented | provider enquiry detail route | Required | API_READY |
| Enquiry transitions | Implemented | transitions route | Required | API_READY |
| Provider contact-handoff view | Implemented contract | provider handoff route | Required | API_READY |
| Provider interaction history | Implemented contract | provider interactions route | Required | API_READY |
| Provider reviews | Implemented | provider reviews route | Required | API_READY |
| Provider response | Implemented | response route | Required | API_READY |
| Provider appeal | Implemented | provider appeal route | Required | API_READY |

## Commercial

| Capability | Android current truth | Canonical backend/API | Functional Web/PWA target | Status |
|---|---|---|---|---|
| Product catalogue | Implemented domain | `/commercial/products` | Required | API_READY |
| Provider commercial summary | Implemented | `/provider-workspace/me/commercial` | Required | API_READY |
| Create subscription | Implemented contract | subscriptions route | Required | API_READY |
| Cancel subscription | Implemented contract | cancel route | Required | API_READY |
| Invoice creation/state | Implemented contract | invoice route | Required where current product UX exposes it | API_READY |
| Payment intent lifecycle | Synthetic/disabled provider mode | payment-intent routes | Functional controlled mode only | GATED |
| Real MTN/Airtel money movement | Disabled | no approved production route | Must remain disabled | GATED |
| Payment changes trust score/verification | Prohibited | enforced invariant | Prohibited | PASS |

## External-provider/runtime gates

| Integration | Current truth | Web/PWA treatment |
|---|---|---|
| Google Maps | Externally provisioned/runtime unproven | Do not activate; preserve manual/list fallback |
| Sentry | Externally provisioned/runtime unproven | Do not claim active without separate runtime work |
| Resend | Externally provisioned/runtime adapter unproven | Do not claim app delivery active |
| FCM | Planned | No dependency for parity |
| WhatsApp Cloud API | Planned/disabled | Domain handoff only until separately activated |
| Turnstile | Planned/not active | Not assumed in auth architecture |
| MTN MoMo/Airtel Money | Planned/disabled | No real money movement |

## W-stage completion controls

### W0 complete when

- architecture decision exists;
- this matrix is present and mapped to canonical contracts;
- Android protected-path/no-regression contract is documented;
- workstream lock is claimed;
- project status/master plan/readme/index point to this workstream.

**Status:** complete and merged through PR #153.

### W1 complete when

- `web/direkt-app/` builds and typechecks;
- responsive mobile/tablet/desktop shell exists;
- mobile bottom nav and desktop side nav are enforced by tests;
- PWA manifest/service-worker safety exists;
- typed API/BFF scaffolding exists;
- no privileged material enters browser output;
- Android regression gate remains green.

**Status:** complete and merged through PR #153; branch synchronized by PR #154.

### W2 complete when

- public categories/search/results/profile/claims/availability/reviews/share use canonical backend state;
- backend-managed test publication changes are observable in the browser client;
- public projections remain privacy-safe;
- manual/list fallback remains first-class;
- exact-head CI/review and managed IAM-private canary evidence pass.

**Status:** CLOSED — managed run `29694862350` PASS on exact source `4b892b90c42239c81c4f9c6f8c9f5447519dd6f6`.

### W3 complete when

- secure browser session creation/rotation/logout/revocation are backend-observable;
- credentials remain HttpOnly and out of browser-readable storage/JSON;
- CSRF/origin/session expiry controls pass;
- provider-mode availability is actor-derived server-side;
- direct API/web IAM privacy and cleanup pass;
- real Firebase/participant gates remain explicit rather than fabricated.

**Status:** CLOSED — managed run `29703117963` PASS on exact source `012a7b9c24e93087d823661298d051c08ea34ec0`.

### W4–W6 complete when

Each capability moves from `API_READY`/`GATED`/`PREVIEW_ONLY` to `PASS` only with backend-observable evidence and applicable security tests. Gated external/real-participant capabilities remain explicitly `GATED`; they are not fabricated as active.

### W7 complete when

All applicable rows are `PASS` or explicitly remain `GATED` for external evidence. No required row may remain fixture-only.

### W8 complete when

The functional browser app is promoted through an approved route/runtime without weakening private API/security gates and the old synthetic preview remains explicitly archived.
