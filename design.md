# DIREKT App Design Plan

This is the primary product-design specification for DIREKT Version 1. It controls the **native Android customer/provider experience**, the **responsive customer/provider PWA companion**, trust presentation and the relationship with the privileged operations portal.

## 1. Design objective

Help a customer answer quickly and honestly:

1. Who provides the service I need near this area?
2. What exactly has DIREKT checked?
3. Where does the provider operate?
4. Is the evidence current?
5. How do I contact them while preserving accountability?

Help a provider understand how to establish a credible presence, what evidence is required, the state of each check, how to correct rejected/expired items and how to receive/respond to enquiries.

## 2. Product surfaces

### Native Android

Primary Version 1 customer/provider experience. Device-specific permissions, secure session storage, evidence capture, background work, notifications and Play release remain Android-owned concerns.

### Customer/provider PWA

Responsive installable companion for desktop/tablet/mobile. It mirrors product semantics and canonical API contracts, not Android implementation details. Initial public deployment at `https://direkt.forum/app/` is synthetic-only for remote visual review. Live API/auth mode is separately gated.

### Operations portal

Separate privileged browser application for verification, evidence review, field operations, support, trust/safety, finance exceptions and audit. It must never be exposed as public PWA content.

## 3. Design principles

### Proof before persuasion
Trust details, check dates and limitations take precedence over promotional language.

### Specific, not generic
Use “Phone confirmed”, “Qualification reviewed” or “Premises visited”, never a context-free “Verified”.

### Map plus list/manual fallback
Maps may provide context, but lists/manual-area flows remain first-class for accessibility, low connectivity, permission denial and provider outage.

### Privacy by precision
Show only precision needed for the task. Mobile-provider private bases are not public pins or public distance origins.

### Low-bandwidth first
Text/trust state loads before imagery; public images use bounded sizes and retry.

### Actionable states
Every rejection, expiry, denial, empty result and recoverable error explains the next safe action.

### Platform-appropriate behavior
Android follows Material/system conventions. PWA uses responsive browser conventions while preserving the same information architecture and trust semantics.

## 4. Brand direction and palette

DIREKT should feel trustworthy without appearing governmental, local and approachable without looking informal, efficient rather than luxurious, transparent rather than sales-heavy and calm during disputes/verification failures.

The implemented baseline palette is:

| Token | Value | Role |
|---|---|---|
| Primary green | `#087A55` | primary action, active navigation, current check |
| Deep green | `#00513A` | high-trust structure/brand depth |
| Mint | `#D9F5E9` | positive/status containers |
| Ink | `#16211C` | primary text |
| Base | `#F8FAF9` | application background |
| Amber | `#F2A900` | pending/expiry/attention |
| Red | Material error semantic | rejection/suspension/destructive action |

Colour never carries status alone. Text and iconography are always present.

## 5. Typography and density

- system/Roboto-compatible sans serif until final branding;
- body text generally 16sp/CSS equivalent;
- critical trust details never tiny captions;
- Android minimum targets 48dp; PWA targets at least 44–48 CSS px;
- whitespace/grouping over excessive borders;
- avoid more than two competing primary actions in one viewport;
- support font scaling/zoom and reflow.

## 6. Navigation model

### Customer

1. Discover
2. Saved
3. Enquiries
4. Account

Discover contains area, categories/search, map/list abstraction, filters, provider profiles and trust details.

### Provider

1. Overview
2. Evidence/Profile readiness
3. Enquiries
4. Account

Overview summarizes verification progress, urgent actions, expiry and safe operational/commercial state.

### Responsive behavior

- Android/mobile PWA: four-destination bottom navigation.
- Desktop PWA: persistent sidebar with wide content workspace.
- Tablet: adaptive one/two-column flow without stretched phone screens.
- A user with authorized provider relationship may switch context, but client mode never grants provider scope.

## 7. Core customer experience

1. splash/session restore where applicable;
2. introduction/consent;
3. phone/email access state;
4. area selection and optional location permission;
5. Discover;
6. search/categories/suggestions;
7. map/list/manual fallback results;
8. filters;
9. provider profile;
10. check-specific trust details;
11. services/availability;
12. tracked enquiry;
13. call/WhatsApp handoff consent;
14. saved providers;
15. enquiry history;
16. review eligibility/submission;
17. report/complaint;
18. notification centre when activated;
19. account/privacy/help.

The public synthetic PWA represents these concepts without real submission or protected API access.

## 8. Provider profile hierarchy

1. provider name/category/operating model;
2. service area or consented public premises;
3. current check-specific trust summary;
4. primary enquiry/contact action;
5. services/availability;
6. trust details with dates/scope/limitations;
7. approved public media, clearly separate from evidence;
8. eligible reviews;
9. response statistics only when meaningful;
10. report-information action.

Do not place an overall star rating above more important trust facts without validation.

## 9. Trust-details pattern

Each check shows:

- check name;
- state;
- scope;
- reviewed/completed date;
- expiry where applicable;
- source class, not private evidence;
- “what this means”;
- “what DIREKT did not check”.

Payment/subscription state is visually and logically separate from trust.

## 10. Location design

The UI distinguishes:

- **Use my current area** — temporary search origin;
- **Choose area manually** — resilient default;
- **Travels to customers** — provider service area;
- **Visit business** — consented public premises;
- **Location checked by DIREKT** — private evidence-derived claim without exposing private coordinates.

A wide service area is never represented as physically verified merely because it is configured.

## 11. Provider onboarding and evidence

Use resumable steps: account/representative, provider type, category/services, operating model, service area/public location, contact, category-specific evidence, premises evidence where required, declarations/consent, review/submit.

Drafts and uploads must be recoverable. Public synthetic PWA does not upload real evidence; native/protected live clients use short-lived private storage grants and backend authorization.

## 12. Verification states

- Not started
- In progress
- Submitted
- Under review
- Action required
- Approved/current
- Expiring soon
- Expired
- Rejected
- Revoked
- Suspended

Providers see operational detail; customers see only public-safe state/limitations. Rejected evidence details are never public.

## 13. Empty/loading/error/offline states

Every data screen defines loading/progress, empty next action, recoverable network error, auth/session expiry, permission denial, insufficient privilege, stale cached marker and partial-data behavior.

Never use indefinite unexplained spinners. Offline cannot upgrade trust or fabricate a successful write.

## 14. PWA-specific public review rules

The public `/app/` build must always show a synthetic-review banner and contain no real participant data, private evidence, auth/session material, private API credentials or protected writes.

Service worker caches static public shell only. Theme/mode preferences may be local; sensitive domain/session state may not be persisted casually in browser storage.

## 15. Accessibility

- semantic landmarks/skip navigation;
- TalkBack/screen-reader labels describe status/action, not colour alone;
- equivalent list for maps;
- visible keyboard focus;
- dialogs return/manage focus correctly;
- zoom/font scaling through at least 200% for critical flows;
- connected/announced errors;
- reduced-motion support;
- timeouts avoidable/extendable where practical.

## 16. Internal operations portal

The portal prioritizes queue efficiency and evidence safety: role-based dashboard, split view where space allows, private evidence viewer/access banner/audit, structured checklist/reason codes, no download by default, field assignment/escalation, previous/current evidence comparison, four-eyes confirmation and keyboard accessibility.

## 17. Remote UI gates

Before claiming a user-facing milestone complete, provide an owner-visible surface:

- native Android through Firebase App Distribution or retained APK artifact;
- PWA through the canonical public synthetic route when appropriate;
- operations portal only through protected access.

Each screen requires route/role, entry/exit conditions, data contract, loading/empty/error/offline states, analytics intent, accessibility notes, synthetic screenshot/preview capability and acceptance tests.

## 18. Production boundary

A visually complete PWA/Android screen is not proof that its external providers are active. Email, OTP, Maps, Sentry, Turnstile, WhatsApp, push, payments and registry integrations must be represented according to `docs/integrations/CURRENT_INTEGRATION_STATUS.md` and remain visibly gated where not runtime-proven.
