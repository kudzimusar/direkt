# DIREKT Android ↔ Web/PWA Functional Parity Matrix

**Status:** Active implementation control  
**Owner:** Functional PWA parity workstream  
**Baseline:** current synchronized `main` after PR #152

## Status legend

- `PASS` — implemented and evidenced on both applicable clients against authoritative backend state.
- `IMPLEMENTING` — active work in current W-stage.
- `API_READY` — canonical backend/OpenAPI capability exists; browser implementation pending.
- `GATED` — implementation may exist but real activation requires separate legal/provider/production evidence.
- `PREVIEW_ONLY` — current Android or synthetic PWA presentation exists but is not yet a fully backend-backed equivalent.
- `N/A` — intentionally client-specific.

## Cross-client foundation

| Capability | Android current truth | Canonical backend/API | Functional Web/PWA target | Status |
|---|---|---|---|---|
| Product identity/design tokens | Implemented | N/A | Same DIREKT visual language | IMPLEMENTING |
| Customer/provider navigation | Implemented | N/A | Same destinations; mobile bottom nav, desktop side nav | IMPLEMENTING |
| Responsive desktop/tablet/mobile | Android native phone/tablet behavior | N/A | Required | IMPLEMENTING |
| Installable PWA | N/A | N/A | Required | IMPLEMENTING |
| Offline-safe static shell | Android native app shell | N/A | Required; no fake offline mutation success | IMPLEMENTING |
| Canonical REST/OpenAPI boundary | Partial client integration; canonical backend exists | Active | Required | IMPLEMENTING |
| Direct privileged Supabase access | Prohibited | Prohibited | Prohibited | PASS |
| Backend-authoritative roles/provider scope | Required | Active | Required | API_READY |

## Authentication and account

| Capability | Android current truth | Canonical backend/API | Functional Web/PWA target | Status |
|---|---|---|---|---|
| Synthetic/dev auth challenge | Development/test path | `/auth/challenges*` | Test-only where needed | API_READY |
| Firebase phone-possession proof | Implemented but gated | `/auth/firebase/exchange` | Browser Firebase flow + BFF exchange | GATED |
| DIREKT session creation | Implemented for pilot flow | Active | Secure browser session | API_READY |
| Session rotation | Supported | `/auth/sessions/rotate` | Required | API_READY |
| Session listing | Supported contract | `/auth/sessions` | Required | API_READY |
| Revoke other sessions | Supported contract | protected route | Required | API_READY |
| Revoke individual session | Supported contract | protected route | Required | API_READY |
| Pilot invitation/admission | Implemented/gated | Active | Same backend authority | GATED |
| Notice/consent version enforcement | Implemented/gated | Active | Same backend authority | GATED |
| Account profile | Implemented contract | `/account/profile` | Required | API_READY |
| Logout/expiry UX | Partial/native | session APIs | Required | API_READY |

## Customer discovery

| Capability | Android current truth | Canonical backend/API | Functional Web/PWA target | Status |
|---|---|---|---|---|
| Category list | Implemented/preview-backed depending path | `/public/categories` | Real API-backed | API_READY |
| Manual area selection | Product requirement; active fallback | search/location contracts | Required | API_READY |
| Provider search | Implemented/preview-backed depending path | `/public/providers/search` | Real API-backed | API_READY |
| Search filters | Product requirement | canonical query contract | Required | API_READY |
| Provider result cards | Implemented | public provider projection | Required | API_READY |
| Provider profile | Implemented | `/public/providers/{id}` | Required | API_READY |
| Scoped trust claims | Implemented semantics | `/public/providers/{id}/claims` | Required | API_READY |
| Availability | Implemented | `/public/providers/{id}/availability` | Required | API_READY |
| Public reviews | Implemented semantics | `/public/providers/{id}/reviews` | Required | API_READY |
| Share projection | Contract exists | `/public/providers/{id}/share` | Required where UX supports it | API_READY |
| Saved providers | Android UX exists | verify/extend canonical save contract before mutation | Required | PREVIEW_ONLY |
| Map view | Synthetic/privacy-safe | Maps runtime unproven | Preserve list/manual fallback; no Maps activation in this workstream | GATED |

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

### W1 complete when

- `web/direkt-app/` builds and typechecks;
- responsive mobile/tablet/desktop shell exists;
- mobile bottom nav and desktop side nav are enforced by tests;
- PWA manifest/service-worker safety exists;
- typed API/BFF scaffolding exists;
- no privileged material enters browser output;
- Android regression gate remains green.

### W2–W6 complete when

Each capability moves from `API_READY`/`GATED`/`PREVIEW_ONLY` to `PASS` only with backend-observable evidence and applicable security tests.

### W7 complete when

All applicable rows are `PASS` or explicitly remain `GATED` for external evidence. No required row may remain fixture-only.

### W8 complete when

The functional browser app is promoted through an approved route/runtime without weakening private API/security gates and the old synthetic preview remains explicitly archived.
