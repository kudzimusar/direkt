# DIREKT Phase 1A Assumptions Register

## Status vocabulary

- `UNTESTED` — no adequate evidence collected;
- `PARTIALLY_SUPPORTED` — some evidence supports the assumption, but critical gaps remain;
- `SUPPORTED` — evidence is sufficient for the controlled next phase;
- `REJECTED` — evidence contradicts the assumption;
- `DEFERRED` — not required for the current product decision;
- `LEGAL_REVIEW_REQUIRED` — no implementation decision may rely on it until qualified review.

Confidence is recorded as `LOW`, `MEDIUM` or `HIGH`. Confidence is not a substitute for the status.

## Critical assumptions

| ID | Assumption | Risk if wrong | Required evidence | Status | Confidence | Owner/action |
|---|---|---|---|---|---|---|
| A-001 | Customers have a significant problem finding legitimate nearby service providers | DIREKT solves a weak problem | customer interviews, recent hiring journeys, incident examples | UNTESTED | LOW | interview at least 12 customers |
| A-002 | Reliable service-area and location information materially improves provider selection | location becomes costly but low-value | task observation, concept test, wrong-location incidents | UNTESTED | LOW | compare location card variants |
| A-003 | Customers understand check-specific trust claims better than a generic verification badge | trust UI may confuse or overpromise | comprehension tests with synthetic claims | UNTESTED | LOW | test at least 3 trust-state variants |
| A-004 | Customers will inspect verification details before contacting a provider | evidence work may not influence behaviour | prototype task tests, interview recall | UNTESTED | LOW | record what participants inspect first |
| A-005 | Providers will submit identity and operating-location evidence | provider supply may be too low | provider interviews, evidence walkthroughs | UNTESTED | LOW | test concerns, friction and refusal reasons |
| A-006 | A meaningful share of legitimate providers has usable qualification, trade or registration evidence | formal-evidence model may exclude viable providers | category document walkthroughs, issuing-body research | UNTESTED | LOW | classify evidence by category |
| A-007 | Informal providers can be represented honestly without being labelled unsafe or fully verified | platform may exclude the majority or mislead customers | provider/customer tests, trust-language review | UNTESTED | LOW | design partial-verification states |
| A-008 | Field verification is affordable and operationally repeatable | unit economics may fail | field-agent interviews, route simulations, cost model | UNTESTED | LOW | estimate time/cost per visit |
| A-009 | Lusaka or another dense urban area is the correct first pilot | pilot may be expensive, unrepresentative or too broad | candidate-area scorecard, recruitment feasibility | UNTESTED | LOW | compare at least two areas |
| A-010 | Four or fewer initial categories can demonstrate the model | scope may be too broad or too narrow | demand, evidence, safety and recruitment scorecards | UNTESTED | LOW | approve category set explicitly |
| A-011 | One Android app can support customer and provider modes without confusing users | navigation and identity complexity may increase | role-switch concept tests | UNTESTED | LOW | test customer-only, provider-only and dual-role participants |
| A-012 | Direct calls or external messaging after a tracked enquiry are sufficient for MVP | accountability may disappear off-platform | journey interviews, complaint expectations | UNTESTED | LOW | compare direct handoff with in-app messaging |
| A-013 | A subscription or verification fee can be justified by provider value | business model may not sustain operations | provider pricing research, behavioural pilot | UNTESTED | LOW | avoid final price before pilot |
| A-014 | Customers and providers can use a native Android app under realistic data and device constraints | product may fail on target devices | device inventory, network observation, prototype performance | UNTESTED | LOW | record OS, storage, camera and data constraints |
| A-015 | Phone OTP is usable and sufficiently reliable | onboarding may fail | phone/SIM behaviour, vendor research, retry tests later | UNTESTED | LOW | document multi-SIM and shared-phone patterns |
| A-016 | Map pins are accurate enough for discovery and field verification | wrong pins may create trust harm | pin-sharing observation and field comparison | UNTESTED | LOW | test public and private precision separately |
| A-017 | Providers accept that exact private location evidence is hidden from customers | trust may appear weaker or providers may fear exposure | provider/customer privacy tests | UNTESTED | LOW | explain service area vs private premises evidence |
| A-018 | Official or issuer confirmation is available for key credentials | DIREKT may only inspect images, not verify claims | authority engagement, documented verification routes | PARTIALLY_SUPPORTED | LOW | PACRA, NCC and TEVETA appear relevant; access method unconfirmed |
| A-019 | A public business search can support some business-registration checks | API/legal/availability constraints may block automation | PACRA terms, access and reliability review | PARTIALLY_SUPPORTED | LOW | verify permitted usage and fallback process |
| A-020 | Construction-related categories can use NCC evidence where applicable | individual trades may not map to contractor registration | NCC rules and provider document sampling | PARTIALLY_SUPPORTED | LOW | distinguish firms, contractors and individual artisans |
| A-021 | TEVETA credentials can support some skill or qualification checks | credential formats and verification access may vary | TEVETA engagement and certificate samples | PARTIALLY_SUPPORTED | LOW | confirm certificate types and validation process |
| A-022 | Storing identity, certificate and location evidence is lawful with consent and safeguards | legal exposure and user harm | qualified Zambian privacy/legal review | LEGAL_REVIEW_REQUIRED | LOW | no production collection before review |
| A-023 | DIREKT may display verification outcomes and expiry information publicly | public claims may create liability or defamation risk | legal review and authority terms | LEGAL_REVIEW_REQUIRED | LOW | define neutral, factual wording |
| A-024 | Field agents may photograph premises and collect coordinates with provider consent | consent may not resolve all legal/safety issues | legal review, field protocol and participant testing | LEGAL_REVIEW_REQUIRED | LOW | use synthetic evidence until approved |
| A-025 | Public repository and Pages can safely support remote prototype testing | feedback may accidentally collect personal data | form/privacy review | PARTIALLY_SUPPORTED | MEDIUM | use static synthetic prototypes and approved feedback route only |

## Secondary assumptions

| ID | Assumption | Required evidence | Status | Confidence |
|---|---|---|---|---|
| A-026 | English-first UI is acceptable for the pilot | language preference interviews and usability tests | UNTESTED | LOW |
| A-027 | Familiar local terms can be added without full multilingual support | terminology testing | UNTESTED | LOW |
| A-028 | Customers prefer list and map views rather than one format only | prototype comparison | UNTESTED | LOW |
| A-029 | Availability indicators are useful and providers will maintain them | task interviews and pilot behaviour | UNTESTED | LOW |
| A-030 | Reviews tied to tracked interactions are acceptable | customer/provider concept tests | UNTESTED | LOW |
| A-031 | Providers will respond to platform-tracked enquiries promptly | pilot response-time data | UNTESTED | LOW |
| A-032 | Customers will report stale or incorrect location information | concept test and pilot behaviour | UNTESTED | LOW |
| A-033 | A limited field-verification badge is commercially valuable | provider value testing | UNTESTED | LOW |
| A-034 | Institutional buyers need a different supplier-search view | institutional interviews | UNTESTED | LOW |
| A-035 | Firebase App Distribution is usable for the early tester cohort | tester account/device test after package approval | UNTESTED | LOW |
| A-036 | The permanent Android application ID should use a DIREKT-owned namespace | brand/domain ownership and release decision | UNTESTED | LOW |

## Evidence update rule

For each status change, add a note below with:

- date;
- evidence IDs from `RESEARCH_LOG.md`;
- decision owner;
- what changed;
- remaining contradictions;
- impacted product or technical documents.

## Change log

### 2026-07-14 — Register initialized

All assumptions remain provisional. PACRA, NCC and TEVETA official sites establish that relevant registration and certification systems exist, but DIREKT has not confirmed permitted verification access, category coverage, document formats, operational reliability or legal use. No product claim is approved from desk research alone.