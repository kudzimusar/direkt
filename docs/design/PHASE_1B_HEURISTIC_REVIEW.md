# DIREKT Phase 1B Heuristic Review

**Review type:** structured expert review  
**Date:** 2026-07-14  
**Scope:** static interactive prototype  
**Evidence class:** `SYNTHETIC-TEST`  
**Limitation:** this is not representative Zambia participant research

## 1. Review method

The prototype was reviewed against:

- the primary `design.md` principles;
- the Phase 1A secondary-research baseline;
- the screen inventory;
- accessibility and low-connectivity requirements;
- trust, privacy and verification-state specifications;
- common usability heuristics: system status, real-world language, user control, consistency, error prevention, recognition, efficiency, recovery and help.

Each finding is classified as:

- **PASS** — design requirement is represented sufficiently for Phase 2;
- **CORRECTED** — issue found and addressed in the prototype or specification;
- **ACCEPTED LIMITATION** — requires native, backend or real-user testing later;
- **BLOCKER** — must be resolved before Phase 2.

## 2. Trust comprehension

| Test | Result | Evidence |
|---|---|---|
| Generic verification badge avoided | PASS | Separate claim cards across customer profiles |
| Claim scope is visible | PASS | Each detail dialog includes `What this means` |
| Limitations are visible | PASS | Each detail dialog includes `What DIREKT did not check` |
| Dates and expiry are visible | PASS | Trust detail dialogs and provider timeline |
| Pending is not presented as approved | PASS | BrightFix qualification and scheduled field visit |
| Expired state degrades public meaning | PASS | BrightFix identity example |
| Registration is not competence | PASS | Business registration limitation copy |
| Experience is not formal qualification | PASS | Kafue Road Auto Care example |
| Field visit is distinct from location evidence | PASS | Mwamba Water Works example |
| Customer understands wording in practice | ACCEPTED LIMITATION | Requires real-user testing in controlled pilot |

## 3. Location and operating model

| Test | Result | Evidence |
|---|---|---|
| Fixed premises explained | PASS | ZedSpark and BrightFix profiles |
| Mobile provider privacy explained | PASS | Mwamba profile and operating-model screen |
| Hybrid operation explained | PASS | Kafue Road Auto Care |
| Map has list equivalent | PASS | CU-005 and CU-006 |
| Location permission is optional | PASS | Discover copy and denied-state simulator |
| Manual area and landmark represented | PASS | Discover and enquiry screens |
| Plus Code concept represented | PASS | Denied-state and area-selection copy |
| Exact private location protected | PASS | Profile and provider operating-model copy |
| Real map coverage and geocoding accuracy | ACCEPTED LIMITATION | Requires provider selection and field test |

## 4. Customer journey

| Test | Result | Evidence |
|---|---|---|
| Value proposition is concise | PASS | SH-002 welcome |
| Category discovery is understandable | PASS | CU-001 category cards |
| Results allow provider-model comparison | PASS | CU-005 cards |
| Profile prioritizes trust over promotion | PASS | CU-008 hierarchy |
| Enquiry purpose is explained | PASS | CU-011 |
| Contact disclosure requires consent | PASS | CU-012 |
| External actions are safe in prototype | PASS | No real phone or WhatsApp link |
| Review eligibility concept represented | PASS | Profile review section |
| Account, real authentication and support completion | ACCEPTED LIMITATION | Phase 2+ implementation |

## 5. Provider journey

| Test | Result | Evidence |
|---|---|---|
| Onboarding is resumable | PASS | PR-002 checklist and draft copy |
| Informal provider has honest pathway | PASS | PR-003 |
| Evidence request is claim-specific | PASS | PR-010 |
| Optional business evidence is not disguised as required | PASS | PR-010 |
| Interrupted upload is recoverable | PASS | PR-011 |
| Rejection reason is actionable | PASS | PR-014 |
| Rejected evidence remains private | PASS | PR-014 copy |
| Timeline makes lifecycle visible | PASS | PR-013 |
| Real upload, image quality and accessibility | ACCEPTED LIMITATION | Phase 2 native implementation |

## 6. Operations journey

| Test | Result | Evidence |
|---|---|---|
| Queue is check-specific | PASS | OP-002 |
| Payment tier is excluded from priority | PASS | OP-002 commercial-separation notice |
| Evidence view is visibly restricted | PASS | OP-004 |
| Synthetic evidence cannot be mistaken for real | PASS | Explicit fictional labels and redaction |
| Reviewer outcomes are structured | PASS | OP-005 |
| Action-required guidance is supported | PASS | Reason code and provider-facing note |
| Audit events are append-only in concept | PASS | OP-016 |
| Real role authorization and evidence access | ACCEPTED LIMITATION | Phase 2–4 implementation/testing |

## 7. State and recovery review

| State | Result | Notes |
|---|---|---|
| Loading | PASS | Skeleton content rather than unexplained spinner |
| Slow network | PASS | Text-first explanation |
| Offline | PASS | Cached-state limitation and no trust upgrade |
| No results | PASS | Widen area/remove filters; no unreviewed filler |
| Location denied | PASS | Manual area fallback |
| Recoverable error | PASS | Last safe data and explicit retry |
| Upload interruption | PASS | Draft safety, retry and acknowledgment language |
| Session expiry | ACCEPTED LIMITATION | Requires authentication implementation |

## 8. Accessibility review

| Requirement | Result | Notes |
|---|---|---|
| Semantic landmarks/headings | PASS | Header, aside, main, nav and sections |
| Keyboard navigation | PASS BY INSPECTION | Native buttons, links, inputs and dialogs |
| Visible focus | PASS | Global `:focus-visible` treatment |
| Colour-independent status | PASS | Text and icon accompany colour |
| Minimum target intent | PASS BY DESIGN | Main controls use approximately 42–50 px targets |
| Map list equivalent | PASS | Dedicated result list |
| Reduced motion | PASS | Media query present |
| Screen-reader labels | PASS BY INSPECTION | Controls and map pins include labels |
| TalkBack and 200% Android font scale | ACCEPTED LIMITATION | Native-device testing required |

## 9. Privacy and public-repository review

| Check | Result |
|---|---|
| Real identities absent | PASS |
| Real documents absent | PASS |
| Real phone numbers absent | PASS |
| Precise private coordinates absent | PASS |
| Secrets or credentials absent | PASS |
| Third-party tracking absent | PASS |
| External data submission absent | PASS |
| Local review notes disclosed | PASS |
| Prototype limitation banner present | PASS |

## 10. Corrections made during review

1. Pages generator updated to copy the static prototype into the published site.
2. Landing page generator updated with a direct prototype launch link.
3. Screen inventory updated to distinguish prototype coverage from implementation.
4. Fieldwork requirements moved from Phase 1A blocker to later validation gates.
5. Informal-provider pathway given the same profile structure while missing claims remain explicit.
6. Fixed, mobile and hybrid examples added.
7. No-results copy explicitly prevents filling results with unreviewed profiles.
8. Operations queue explicitly excludes subscription status from prioritization.
9. External call/WhatsApp actions converted to non-functional safety simulations.
10. Feedback notes restricted to local browser storage.

## 11. Accepted limitations entering Phase 2

- no representative participant usability study;
- no native Android rendering or TalkBack run;
- no real network, offline database or upload implementation;
- no authentication or authorization;
- no API, database, regulator, map, payment or notification integration;
- no real evidence storage;
- no measured provider/customer willingness;
- no field-operation cost evidence.

These limitations are already assigned to later phases and do not justify keeping technical scaffolding blocked.

## 12. Review conclusion

**Result: PASS WITH ACCEPTED LIMITATIONS**

No interaction-design blocker was found that should prevent Phase 2 technical scaffolding. Native implementation must preserve the check-specific trust language, location privacy, offline semantics, synthetic-test discipline and commercial/trust separation represented here.
