# DIREKT Phase 1A Exit Review

**Current status:** PASS WITH ACCEPTED LIMITATIONS  
**Opened:** 2026-07-14  
**Approved:** 2026-07-14  
**Approval owner:** Kudzanai Musarurwa  
**Next phase:** Phase 1B — interaction design and synthetic prototype

## 1. Purpose

This review decides whether DIREKT has enough evidence to proceed into design without pretending that desk research is equivalent to Zambia field validation.

The owner has confirmed that primary fieldwork is not practical under current circumstances and has authorized the project to build a defensible baseline from current public research. Real-user, provider, device, legal and operational validation is deferred to the prototype, hardening and controlled-pilot gates.

## 2. Evidence completed

| Deliverable | State | Evidence/link | Limitation |
|---|---|---|---|
| Comprehensive product and architecture planning | COMPLETE | Repository planning pack | Based on current product strategy |
| Research plan and ethics protocol | COMPLETE | `RESEARCH_PLAN.md`; `RESEARCH_ETHICS_AND_CONSENT.md` | Retained for later pilot research |
| Official and credible desk research | COMPLETE | `DESK_RESEARCH_REGISTER.md`; `SECONDARY_RESEARCH_BASELINE.md` | No claim of representative interviews |
| Zambia population and pilot-market basis | COMPLETE | Census sources summarized in `SECONDARY_RESEARCH_BASELINE.md` | Exact neighbourhood boundary deferred |
| Business-registry route | COMPLETE FOR DESIGN | PACRA official source | Integration/access terms unconfirmed |
| Construction-registry route | COMPLETE FOR DESIGN | NCC official source | Category and matching coverage unconfirmed |
| Technical-qualification route | COMPLETE FOR DESIGN | TEVETA official source | Credential verification access unconfirmed |
| Location model | COMPLETE FOR DESIGN | Area, landmark, pin and Plus Code baseline | Must be tested with real pilot users |
| Device/connectivity constraints | COMPLETE FOR DESIGN | Mobile-first research and conservative offline assumptions | Final device matrix deferred |
| Communication model | COMPLETE FOR DESIGN | Tracked enquiry then call/WhatsApp handoff | Full chat need deferred |
| Payment scope | COMPLETE FOR DESIGN | Customer payments deferred; provider-subscription adapter later | Final provider and commercial terms deferred |
| Pilot area | PROVISIONALLY APPROVED | Lusaka District | Narrow launch boundary deferred |
| Pilot categories | PROVISIONALLY APPROVED | Plumbing, electrical, mechanics, appliance/electronics repair | Final provider supply and authority checks deferred |
| Category evidence matrix | INITIALIZED FOR DESIGN | `CATEGORY_EVIDENCE_MATRIX.md` | Real examples remain private pilot work |
| Privacy baseline | COMPLETE FOR DESIGN | Minimal public precision; private evidence; synthetic public data | Qualified Zambia legal review still required |
| Risk and decision logs | UPDATED | `RISK_REGISTER.md`; `DECISION_LOG.md` | Later evidence may revise decisions |

## 3. Accepted limitations

The following work is explicitly incomplete but is no longer a blocker to design or scaffolding:

- representative customer interviews;
- provider interviews and real evidence inspection;
- field-agent workflow observation;
- real-device and mobile-data testing;
- formal legal opinion;
- regulator data-access agreements;
- map, SMS and payment-provider contracts;
- willingness-to-pay and subscription pricing;
- field-verification cost and turnaround data.

These limitations must remain visible in product copy, issue tracking and release gates. They cannot be silently converted into validated facts.

## 4. Critical exit tests

| Gate | Result | Evidence | Notes |
|---|---|---|---|
| A plausible, material customer discovery and trust problem is documented | PASS WITH LIMITATION | Product research and fraud context | Primary demand validation deferred |
| Check-specific trust language is defined | PASS FOR PROTOTYPE | Trust documents and baseline | Comprehension must be tested in Phase 1B/pilot |
| Formal and informal provider pathways exist | PASS FOR DESIGN | `SECONDARY_RESEARCH_BASELINE.md` | Provider acceptance deferred |
| Pilot area is sufficiently bounded for prototype context | PASS | Lusaka District default | Exact neighbourhood boundary deferred |
| Initial categories are limited | PASS | Four provisional categories | Final supply and legal screening deferred |
| Public/private location model is defined | PASS FOR DESIGN | Area/landmark/pin/Plus Code rules | Real usability testing deferred |
| Low-bandwidth and offline constraints are documented | PASS FOR DESIGN | Android and research documents | Device matrix deferred |
| MVP contact model is defined | PASS | Tracked enquiry then call/WhatsApp | Full chat deferred |
| Payment scope is explicit | PASS | Customer payment deferred; subscriptions later | No provider selected |
| Critical legal questions are recorded | PASS WITH LIMITATION | Legal register | No legal conclusion claimed |
| No sensitive research data is committed publicly | PASS | Repository inspection policy | Must be continuously enforced |

## 5. Approved provisional decisions

- **Market context:** Lusaka District.
- **Launch shape:** later limited to selected neighbourhoods.
- **Initial categories:** plumbing, electrical repairs, motor-vehicle mechanics, appliance/electronics repair.
- **Provider operating models:** fixed premises, mobile and hybrid.
- **Trust model:** separate evidence-backed claims; no blanket verification.
- **Informal-provider pathway:** allowed with honest missing-claim disclosure.
- **Location:** area + landmark + pin + optional Plus Code; private precision minimized.
- **Communication:** tracked enquiry followed by consent-aware call or WhatsApp handoff.
- **Customer payments:** deferred from first MVP.
- **Provider subscriptions:** later payment-adapter integration; MTN MoMo and Airtel Money are candidates only.
- **Android:** native, low-bandwidth, offline-draft and recoverable-upload requirements remain mandatory.

## 6. Deferred validation gates

### Phase 1B

- synthetic trust-language testing;
- public Pages prototype review;
- structured remote feedback;
- design correction before scaffolding.

### Phase 10

- qualified legal and privacy review;
- regulator-access and integration approval;
- security verification and provider-contract review.

### Phase 11

- consenting Zambia customer/provider validation;
- real device and connectivity matrix;
- real provider-document workflows in private systems;
- field-verification cost and capacity;
- price and willingness-to-pay evidence;
- exact pilot neighbourhood boundary.

## 7. Decision

| Field | Value |
|---|---|
| Exit result | PASS WITH ACCEPTED LIMITATIONS |
| Approved by | Kudzanai Musarurwa |
| Approval date | 2026-07-14 |
| Accepted limitations | Primary interviews and operational field validation deferred to later gates |
| Blocking issues | None for Phase 1B design |
| Next authorized task | Build the Phase 1B synthetic interactive prototype and publish it through GitHub Pages |
| Phase 1B authorized? | YES |
| Android scaffolding authorized? | AFTER the Phase 1B design checkpoint; no production integrations or real data |
| Public pilot authorized? | NO |
| Production data collection authorized? | NO |

## 8. Approval statement

> I have reviewed the limitations of a desk-research baseline and authorize DIREKT to proceed to Phase 1B interaction design and synthetic prototype work. Primary Zambia validation is deferred, not waived, and must be completed before the controlled pilot and production claims. This approval does not authorize real evidence collection, regulator integrations, customer payments, public pilot launch or production release.
