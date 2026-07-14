# DIREKT App Design Plan

This is the primary product-design specification for DIREKT Version 1. It controls the native Android experience, trust presentation and relationship with the internal operations portal.

## 1. Design objective

Help a customer answer, quickly and honestly:

1. Who provides the service I need near this area?
2. What exactly has DIREKT checked?
3. Where does the provider operate?
4. Is the evidence current?
5. How do I contact them and preserve accountability?

Help a provider answer:

1. How do I establish a credible presence?
2. What evidence is required for my category?
3. What is the status of each check?
4. How do I correct a rejected or expired item?
5. How do I receive and respond to customer enquiries?

## 2. Design principles

### Proof before persuasion
Trust details, check dates and limitations take precedence over promotional language.

### Specific, not generic
Use “Phone confirmed”, “Qualification reviewed” or “Premises visited”, never a context-free “Verified”.

### Map plus list
Maps provide geographic context; lists provide accessibility, comparison and resilience when maps or location permission are unavailable.

### Privacy by precision
Show only the precision needed for the task. A mobile provider may show a service area and approximate base, while a storefront may consent to an exact public pin.

### Low-bandwidth first
Text and trust state load before large imagery. Images use multiple sizes, compression and explicit retry.

### Actionable states
Every rejection, expiry, permission denial and empty result explains the next safe action.

### Familiar Android behaviour
Follow Material 3 patterns, system back behaviour, adaptive layouts, edge-to-edge guidance and platform permission conventions.

## 3. Brand direction

DIREKT should feel:

- trustworthy without appearing governmental;
- local and approachable without becoming visually informal;
- efficient rather than luxurious;
- transparent rather than sales-heavy;
- calm during disputes and verification failures.

### Provisional palette

Final colours require contrast testing and brand approval.

| Token | Intended role |
|---|---|
| Primary green | positive action, active navigation, approved check |
| Deep ink | body text, high-trust structural elements |
| Warm amber | pending, expiry warning, attention |
| Red | rejection, suspension, destructive action |
| Sky/blue | information and location context |
| Neutral surfaces | cards, sheets and evidence sections |

Colour never carries status alone. Every status also uses text and iconography.

## 4. Typography and density

- Use a modern Android-available sans-serif family; default to system/Roboto until branding is approved.
- Support Android font scaling without clipping.
- Body text generally 16sp equivalent; critical trust details must not use tiny captions.
- Minimum interactive target: 48dp.
- Use whitespace and grouping rather than many borders.
- Avoid more than two primary actions in one viewport.

## 5. Navigation model

### Customer mode

Bottom destinations:

1. **Discover**
2. **Saved**
3. **Enquiries**
4. **Account**

Discover contains search, category, area, map/list toggle and filters.

### Provider mode

Bottom destinations:

1. **Overview**
2. **Profile**
3. **Enquiries**
4. **Account**

Overview shows verification progress, urgent actions, expiry and performance summaries.

### Role switching

A user with a provider relationship may switch modes from the account area. The app must clearly change context and never expose provider-management actions to an unauthorized customer identity.

## 6. Core customer screens

1. splash/session restore;
2. introduction and consent;
3. phone/email sign-in;
4. area selection and optional location permission;
5. Discover home;
6. search and suggestions;
7. map/list results;
8. filters;
9. provider profile;
10. trust details;
11. service and availability details;
12. tracked enquiry;
13. call/message handoff consent;
14. saved providers;
15. enquiry history;
16. review eligibility and submission;
17. report/complaint;
18. notification centre;
19. account, privacy and help.

## 7. Provider profile hierarchy

The public profile must present:

1. provider name, category and operating model;
2. service area or public premises location;
3. current check-specific trust summary;
4. primary enquiry/contact action;
5. services and typical availability;
6. trust details with dates, scope and limitations;
7. premises and work imagery, clearly separated from evidence;
8. reviews from eligible interactions;
9. provider response statistics when statistically meaningful;
10. report-information action.

Do not put an overall star rating above more important safety/trust facts without research validation.

## 8. Trust-details pattern

Each check appears as a row/card:

- check name;
- state;
- scope;
- completed/reviewed date;
- expiry date when applicable;
- source class, not sensitive evidence;
- “What this means” explanation;
- “What DIREKT did not check” limitation.

Example:

> **Plumbing qualification — Current**  
> DIREKT reviewed a qualification document matching the provider’s submitted identity. Reviewed 12 June 2026; expires 12 June 2027. DIREKT does not guarantee workmanship or the outcome of a future service.

## 9. Location design

The UI must distinguish:

- **Use my current area** — temporary search origin;
- **Choose area manually** — province/district/locality or map;
- **Travels to customers** — provider service area;
- **Visit business** — consented public premises pin;
- **Location checked by DIREKT** — private evidence check, without exposing private coordinates.

Customers must not assume a wide service area was physically verified.

## 10. Provider onboarding flow

Use a resumable checklist rather than one long form:

1. account and representative identity;
2. provider type and legal/business details;
3. category and services;
4. operating model;
5. service area/public location;
6. contact information;
7. category-specific evidence;
8. premises evidence where required;
9. declarations and consent;
10. review and submit.

Each step saves locally and remotely when acknowledged. The app shows upload progress and recovery after interruption.

## 11. Verification states in UI

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

A provider sees operational detail. A customer sees only relevant public states and limitations. “Rejected” evidence details are never public.

## 12. Empty, loading and error states

Every data screen must define:

- skeleton or progress state;
- empty state with meaningful next action;
- recoverable network error;
- authentication/session expiry;
- permission denial;
- insufficient privilege;
- stale cached data marker;
- partial data when one dependency fails.

Do not use indefinite spinners without explanation.

## 13. Offline and low-connectivity design

- Previously loaded public profiles may be shown with “Last updated”.
- Search requires connectivity but preserves filters and area.
- Provider forms save drafts locally.
- Evidence uploads queue only after explicit user submission.
- Queued items show pending/failed/retry states.
- Trust state is never upgraded offline.
- Contact actions that cannot be tracked show a clear limitation.

## 14. Accessibility

- TalkBack labels describe status and action, not colour/icon only.
- Map results have an equivalent ordered list.
- All dialogs and sheets return focus correctly.
- Font scaling through at least 200% must be tested for critical flows.
- Errors are announced and connected to fields.
- Timeouts are avoidable or extendable.
- Motion is restrained and respects system preferences.

## 15. Internal operations portal design

The portal prioritizes queue efficiency and evidence safety:

- role-based dashboard;
- split-view queue and case detail where screen size allows;
- evidence viewer with access banner and audit trail;
- structured checklist, reason codes and notes;
- no download by default;
- field assignment and escalation;
- comparison of previous/current evidence;
- four-eyes confirmation for specified overrides;
- keyboard accessibility and responsive layout.

## 16. Prototype and usability gates

Before implementation:

- test customer discovery and trust comprehension;
- test provider onboarding and correction flow;
- test administrator evidence review;
- use synthetic data only on public Pages;
- record task success, confusion, trust interpretation and accessibility findings;
- resolve any case where participants misinterpret “verified”.

## 17. Design handoff requirements

Each implemented screen requires:

- screen identifier and route;
- user role;
- entry/exit conditions;
- data contract;
- loading/empty/error/offline states;
- analytics events;
- accessibility notes;
- screenshot or preview using synthetic data;
- acceptance tests.
