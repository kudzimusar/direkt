# DIREKT Phase 1B Interactive Prototype Specification

**Status:** Implemented for checkpoint review  
**Prototype source:** `prototype/`  
**Expected Pages path:** `/direkt/prototype/`  
**Data classification:** synthetic only

## 1. Objective

Translate the Phase 1A product and trust baseline into an interactive experience before native Android code is scaffolded. The prototype tests information architecture, state language, trust limitations, location privacy, provider correction and operations review.

It is not a visual mock-up only. Navigation and principal actions must be operable with keyboard, pointer and touch input.

## 2. Design stance

The prototype implements the following design priorities:

- proof before promotion;
- separate check-specific claims;
- list and map equivalence;
- public location precision matched to the operating model;
- low-bandwidth and offline recovery;
- actionable rejection, expiry and permission states;
- commercial status excluded from trust decisions;
- fictional public data and visibly restricted evidence views.

## 3. Market context represented

- Default context: Lusaka District.
- General area examples: Woodlands, Chelstone and Matero.
- No exact residential address or private coordinate.
- Categories: plumbing, electrical repair, motor-vehicle mechanics and appliance/electronics repair.
- Provider models: fixed premises, mobile and hybrid.
- Provider pathways: registered business, qualified individual and experienced informal individual.

All provider names, cases, reviews, evidence and check dates are fictional.

## 4. Prototype architecture

The prototype is a dependency-free static web application:

```text
prototype/
├── index.html
├── styles.css
├── app.js
└── README.md
```

No package manager, framework, API, remote font, analytics script or third-party asset is required. `scripts/build_pages_source.py` copies the directory into the MkDocs source tree, where it is emitted as static Pages content.

## 5. Global review controls

The left review panel provides:

- customer/provider/operations role switching;
- stable screen-ID navigation;
- phone and wide viewport previews;
- simulated slow, offline, loading, empty, denied and error states;
- local-only structured review notes.

The prototype banner remains visible outside the device frame and states that the experience contains fictional data, makes no real submissions and has no backend.

## 6. Customer-flow coverage

| Prototype screen | Stable ID | Requirement |
|---|---|---|
| Welcome and trust explanation | SH-002 | Explains area search, separate claims and tracked enquiry |
| Discover | CU-001 | Manual area, category and service search |
| Provider results | CU-005 | Comparable cards, provider models and claim summaries |
| Map results | CU-006 | Synthetic map with accessible list equivalent |
| Provider profile | CU-008 | Public hierarchy, location, current checks and enquiry action |
| Trust details | CU-009 | Scope, date, expiry, evidence class and limitation per check |
| Create enquiry | CU-011 | General area, service need, timing and accountability notice |
| Contact-sharing consent | CU-012 | Explicit data disclosure before call/WhatsApp handoff |

## 7. Trust-state coverage

The prototype presents:

- current;
- checked;
- under review;
- scheduled;
- expiring soon;
- expired;
- not supplied;
- not checked;
- action required;
- rejected evidence visible only to provider/operations.

The customer-facing profile never exposes a rejected document or reason. It exposes only the status of a public claim where relevant.

## 8. Provider-flow coverage

| Prototype screen | Stable ID | Requirement |
|---|---|---|
| Overview | PR-001 | Progress, action-required item, enquiries and check summary |
| Onboarding checklist | PR-002 | Resumable steps and acknowledged-save explanation |
| Provider pathway | PR-003 | Registered, qualified and experienced-informal pathways |
| Operating model | PR-007 | Fixed, mobile and hybrid with privacy effects |
| Evidence requirements | PR-010 | Required, optional and pathway-dependent evidence |
| Upload and retry | PR-011 | Interrupted upload, local draft, retry and privacy checklist |
| Action required | PR-014 | Reason code, correction instructions and public visibility |
| Verification timeline | PR-013 | Separate lifecycle and expiry events |
| Enquiry inbox | PR-016 | New, replied and closed tracked enquiries |

## 9. Operations-flow coverage

| Prototype screen | Stable ID | Requirement |
|---|---|---|
| Dashboard | OP-001 | Queue and expiry overview without commercial priority |
| Verification queue | OP-002 | Check-specific work ordered by risk and age |
| Verification case | OP-003 | Claim scope, evidence and reviewer checklist |
| Secure evidence viewer | OP-004 | Restricted banner and synthetic redacted evidence |
| Decision form | OP-005 | Approve, action required or reject with reason code |
| Audit history | OP-016 | Append-only interaction and decision sequence |

## 10. Provider examples

### Mwamba Water Works

- Mobile individual provider.
- Identity, phone, qualification and private operating-area claims.
- No registered-business claim.
- No field-visit claim.

### ZedSpark Electrical Studio

- Registered fixed-premises provider.
- Business and premises checks.
- Qualification expiring soon.
- Field visit scheduled but not completed.

### Kafue Road Auto Care

- Hybrid provider.
- Workshop and experience evidence.
- No formal qualification claim.

### BrightFix Appliance Lab

- Fixed-premises provider.
- Current phone and premises claims.
- Expired identity review and pending qualification review.

These examples demonstrate that providers can have different truthful evidence patterns without being collapsed into one overall status.

## 11. Accessibility requirements implemented

- Skip link to prototype content.
- Semantic headings, buttons, labels, tables, dialogs and navigation.
- Visible keyboard focus.
- Minimum target sizes near the intended 48dp baseline.
- Text labels paired with status colour.
- Map pins have accessible names and a list equivalent.
- Role and viewport controls expose pressed state.
- Dialogs use native `dialog` behaviour.
- Reduced-motion media query.
- Responsive phone and wide views.

Native Android TalkBack, font-scale and system-permission testing remain Phase 2 and later requirements.

## 12. Low-bandwidth and failure states

The state simulator demonstrates:

- text-first slow-network behaviour;
- offline cached-information explanation;
- loading skeletons;
- honest no-results recovery;
- manual-area fallback after location denial;
- recoverable refresh error;
- interrupted evidence upload with retry/local draft.

No trust status is presented as upgraded while offline.

## 13. Feedback model

The prototype includes three local review prompts:

- what was clear;
- what was confusing;
- what should change first.

The notes use browser `localStorage` and are not submitted to DIREKT or a third party. This avoids creating an unapproved public data-collection form. Reviewers can share non-sensitive summaries separately.

## 14. Security and privacy review

The prototype contains:

- no real identity or qualification evidence;
- no functional upload;
- no API request;
- no real phone number;
- no external WhatsApp link;
- no precise private coordinate;
- no authentication or credential;
- no analytics or tracking script;
- no production claim.

## 15. Known limitations

- It is not a pixel-identical Android Compose rendering.
- It does not test a physical Android device or TalkBack.
- It does not persist application state beyond local review notes.
- It does not validate real provider willingness or user comprehension.
- Synthetic map geometry is illustrative rather than geographic.
- Dates and response metrics are fictional.
- Full review research remains deferred to the controlled pilot.

These limitations do not prevent Phase 2 scaffolding. They remain release and pilot obligations.
