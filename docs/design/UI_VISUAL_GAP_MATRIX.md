# DIREKT UI Visual Gap Matrix

**Programme:** VC1–VC8 world-class modernization  
**Status:** Current functional implementation audited against final world-class target  
**Primary surfaces:** Android, customer/provider web/PWA, operations portal  
**Purpose:** tell implementation agents what is functionally present, what remains visually incomplete and what must not be mistaken for an integration/product gap.

## 1. Classification

- **Functional + visually ready** — production-quality composition and states; only maintenance expected.
- **Functional + needs polish** — core journey works but hierarchy, language, imagery, adaptive behavior or component quality is below final standard.
- **Functional + prototype-level UI** — working implementation exposes preview/development/test/form-heavy patterns or lacks final product composition.
- **Missing visual implementation** — required dedicated final UI is absent or only represented indirectly.
- **Externally gated** — final experience depends on an integration/real evidence/production gate that is not runtime-active; truthful fallback still required.

A feature can be functionally mature while visually incomplete.

## 2. Overall finding

No flagship customer, provider or operations journey is yet **functional + visually ready end to end** against the world-class target.

The largest cross-product deficits are:

1. typography hierarchy;
2. professional iconography;
3. marketplace/category/provider imagery;
4. coherent check-specific trust component family;
5. final navigation and task hierarchy;
6. search/provider/map-list card patterns;
7. provider professional workspace composition;
8. desktop operations queue/case/evidence/decision workspace;
9. adaptive/responsive polish;
10. motion/accessibility/low-bandwidth state completion;
11. removal of developer/workstream/API/test language;
12. AI assistance patterns and manual fallbacks.

## 3. Shared/authentication

| ID | Screen | Current visual state | VC target |
|---|---|---|---|
| SH-001 | Splash/session restore | Functional + needs polish | Fast branded restoration with no unnecessary delay. |
| SH-002 | Welcome/value explanation | Functional + prototype-level UI | Concise world-class value/trust education. |
| SH-003 | Sign in/register | Missing/partial final visual implementation | Complete account entry with accessible error/recovery states. |
| SH-004 | OTP/verification | Functional + prototype-level UI | Final phone/email possession flow, retry/abuse-safe and visually coherent. |
| SH-005 | Terms/privacy consent | Functional + prototype-level UI | Readable versioned consent with clear summary/detail. |
| SH-006 | Notification permission education | Externally gated / missing final surface | Contextual education before any active permission prompt. |
| SH-007 | Mode selector/switcher | Functional + prototype-level UI | Clear customer/provider context switch without preview language. |
| SH-008 | Notification centre | Missing visual implementation / integration dependent | Authoritative in-app notification experience. |
| SH-009 | Support/help | Missing/partial | Searchable help + later grounded AI assistance + human/manual fallback. |
| SH-010 | Account/security | Functional + needs polish | Sessions/privacy/security/deletion/support in coherent account IA. |

## 4. Customer

| ID | Screen | Current visual state | VC target |
|---|---|---|---|
| CU-001 | Discover home | Functional + prototype-level UI | Flagship marketplace home with strong search/area/categories/provider preview. |
| CU-002 | Area selector | Functional + prototype-level UI | Human locality control, permission education and privacy-safe precision. |
| CU-003 | Category browser | Functional + prototype-level UI | Visual category system with approved icons/lightweight imagery. |
| CU-004 | Search suggestions | Missing final implementation | Search suggestions plus bounded AI intent/query expansion with manual fallback. |
| CU-005 | Result list | Functional + needs polish | High-quality provider cards, relevance, trust, imagery and filters. |
| CU-006 | Result map | Externally gated / prototype shell | Real map only after Maps activation; accessible list fallback always complete. |
| CU-007 | Filters | Functional + prototype-level UI | Human-readable service/location/trust/availability filters. |
| CU-008 | Provider profile | Functional + needs polish | Flagship identity/service/imagery/trust/action hierarchy. |
| CU-009 | Trust details | Functional + needs polish | Best-in-class check-specific proof with scope/date/currentness/limitations. |
| CU-010 | Service details | Functional + needs polish | Clear service scope/coverage/availability within profile/enquiry journey. |
| CU-011 | Create enquiry | Functional + needs polish | Simple structured conversion, optional AI wording assist with confirmation. |
| CU-012 | Contact-sharing consent | Functional + needs polish | Explicit share/revoke/expiry and safe handoff explanation. |
| CU-013 | Enquiry detail | Functional + needs polish | Clear timeline/response/contact/accountability state. |
| CU-014 | Saved providers | Functional/partial + needs polish | Final list/empty/unavailable/recovery states. |
| CU-015 | Review eligibility | Functional + needs polish | Explain why review is/is not eligible. |
| CU-016 | Submit review | Functional/partial + needs polish | Final review/rating/report/moderation-safe flow. |
| CU-017 | Report provider/interaction | Functional + needs polish | Clear safety vs platform complaint pathway. |
| CU-018 | Complaint detail | Missing/partial dedicated visual | Status/timeline/evidence-safe/appeal presentation. |
| CU-019 | No-results recovery | Functional + needs polish | Area/query/category recovery without fabricated matches. |
| CU-020 | Location-permission fallback | Functional fallback; live location externally gated | Manual area remains first-class and visually intentional. |

### Customer AI gaps

Not yet production-active:

- natural-language `Describe what you need`;
- bounded clarifying questions;
- explainable semantic/category expansion;
- provider comparison summary;
- `Why this result` AI explanation;
- grounded support assistant.

These belong to VC7 after the manual journey/component foundation is complete and the AI architecture/evaluation gates are implemented.

## 5. Provider

| ID | Screen | Current visual state | VC target |
|---|---|---|---|
| PR-001 | Provider overview | Functional + prototype-level UI | Professional task/readiness workspace. |
| PR-002 | Onboarding checklist | Functional + prototype-level UI | Clear next actions/blockers and optional bounded AI guidance. |
| PR-003 | Provider pathway | Functional + prototype-level UI | Plain-language pathway selection and implications. |
| PR-004 | Representative details | Missing dedicated final visual | Complete dedicated form/summary. |
| PR-005 | Business/professional details | Missing dedicated final visual | Complete dedicated form/summary. |
| PR-006 | Category/services | Functional + prototype-level UI | Human taxonomy controls; no raw keys. |
| PR-007 | Operating model | Functional + prototype-level UI | Clear fixed/mobile/hybrid model and privacy explanation. |
| PR-008 | Service areas | Functional + prototype-level UI | Human area/map controls; no raw coordinate/WKT inputs. |
| PR-009 | Public premises consent | Functional + prototype-level UI | Explicit public-location precision/consent. |
| PR-010 | Evidence requirements | Functional + needs polish | Requirement cards with why/acceptable evidence/current state. |
| PR-011 | Evidence capture/upload | Functional + prototype-level UI | Real upload/resume/retry/quality guidance; AI/OCR gated. |
| PR-012 | Review/declaration | Missing dedicated final visual | Confirmation/declaration before submission. |
| PR-013 | Verification timeline | Functional + needs polish | Calm chronological current/action-required/expiry history. |
| PR-014 | Action-required correction | Functional + prototype-level UI | Exact safe reason, replacement guidance and resubmission. |
| PR-015 | Availability | Functional + needs polish | Dedicated user-friendly editing and customer-visible effect. |
| PR-016 | Enquiry inbox | Functional + needs polish | Fast task triage and unread/priority hierarchy. |
| PR-017 | Enquiry response | Functional + needs polish | Clear response/handoff/accountability states. |
| PR-018 | Portfolio | Missing/partial | Public work imagery separate from evidence. |
| PR-019 | Provider reviews/response | Functional/partial + needs polish | Reputation/response/report/appeal presentation. |
| PR-020 | Subscription/receipts | Functional foundation + needs polish; real payment gated | Commercial visual family entirely separate from trust. |
| PR-021 | Provider members | Missing / separately authorized | Team/member management only where product scope permits. |
| PR-022 | Publication status | Functional + needs polish | Explain exact blockers/current discoverability without generic scores. |

### Provider implementation artifacts to remove from primary UX

Current implementation has exposed or historically used patterns such as:

- raw category keys;
- provider/public identifiers as user inputs;
- raw latitude/longitude;
- WKT polygon concepts;
- development/phase labels;
- synthetic simulation controls.

Canonical contracts may remain technical internally; VC5 replaces these with safe user-facing controls without rewriting domain models.

## 6. Operations portal

| ID | Screen | Current visual state | VC target |
|---|---|---|---|
| OP-001 | Operations dashboard | Functional + prototype-level UI | Mission-control action dashboard. |
| OP-002 | Verification queue | Functional + prototype-level UI | Dense role-aware filters/SLA/assignment/keyboard efficiency. |
| OP-003 | Verification case | Functional + prototype-level UI | Canonical facts/history/check context. |
| OP-004 | Secure evidence viewer | Missing/incomplete final composition; real evidence gated | Secure desktop viewer integrated with case/checklist/decision. |
| OP-005 | Decision/reason form | Functional + prototype-level UI | Structured reason/checklist/high-impact confirmation. |
| OP-006 | Field assignment | Functional/partial + prototype-level UI | Assignment/safety/status workflow. |
| OP-007 | Field visit record | Missing/partial | Dedicated offline-capable structured visit task. |
| OP-008 | Provider operations profile | Functional + prototype-level UI | Trust/publication/interaction/ops summary. |
| OP-009 | Complaint queue | Functional/partial + prototype-level UI | Severity/SLA/ownership and dedicated case navigation. |
| OP-010 | Incident case | Functional/partial + prototype-level UI | High-severity chronology/action workspace. |
| OP-011 | Appeal review | Functional/partial + prototype-level UI | Independent history/source/decision review. |
| OP-012 | Subscription exception | Functional foundation + prototype-level UI | Commercial exception UI; real payment authority gated. |
| OP-013 | Reconciliation | Functional foundation + prototype-level UI; real payment gated | Ledger/provider reconciliation workspace when activated. |
| OP-014 | Taxonomy configuration | Missing/partial | Versioned governed configuration. |
| OP-015 | Evidence-rule configuration | Missing/partial | Requirement/version governance. |
| OP-016 | Audit search/history | Functional + needs polish | Search/filter/detail with strong immutable-history presentation. |
| OP-017 | User/role management | Missing/separately authorized | Privileged role admin with high-risk controls. |
| OP-018 | System health/queues | Missing/partial | Runtime/integration/job health and actionable degradation. |

### Operations artifacts to remove from final production presentation

- stage/workstream labels as primary content;
- API route labels;
- fixture/source labels intended for developers;
- `Open state test`-style navigation;
- development/test-state controls visible as normal operator tasks.

Environment/synthetic state remains truthfully disclosed where required, but does not define the information architecture.

## 7. Design-system gap matrix

| Area | Current gap | Required VC result |
|---|---|---|
| Typography | Too many similar-weight text/card layers; technical labels compete with task titles. | Stable page/section/card/body/supporting/metadata hierarchy. |
| Iconography | Primitive glyphs/letters and inconsistent semantics remain in places. | Approved Material Symbols/vector family with labels/accessibility. |
| Imagery | Very limited category/provider marketplace imagery. | Zambia-relevant public work/category imagery with low-bandwidth variants. |
| Trust | Strong semantics but uneven/technical presentation. | Canonical reusable check cards/details with scope/date/currentness/limitations. |
| Navigation | Functional foundations but visual/IA polish incomplete. | Consistent compact bottom nav, adaptive rail and desktop side nav. |
| Search/discovery | Functional but form/text-heavy. | World-class search/area/category/filter/result patterns plus later bounded AI assistance. |
| Provider workspace | Technically capable but prototype/form oriented. | Task/readiness/business management workspace. |
| Operations | Broad routes but test/admin presentation. | Mission control + queue/case/evidence/decision workspace. |
| Responsive/adaptive | PWA foundation stronger than final Android/ops composition. | Deliberate compact/medium/expanded patterns per task. |
| Motion | Minimal and inconsistent. | Short functional transitions with reduced-motion support. |
| Accessibility | Baseline exists; full large-text/focus/reference proof incomplete. | VC8 TalkBack/screen-reader/keyboard/200%/contrast/target verification. |
| Low bandwidth | Architecture principle exists; imagery/product-state implementation incomplete. | Image tiers, placeholders, stale/offline/retry and manual fallbacks. |
| AI UX | Not yet first-class. | Bounded assistance components with clear fact/suggestion/confirmation distinctions and manual fallback. |

## 8. Benchmark-relative gaps

### Behind leading marketplaces today

- visual richness and first impression;
- provider/category imagery;
- short, intuitive customer conversion path;
- discovery/search guidance;
- provider comparison clarity;
- mature provider self-service presentation;
- polished desktop operations workspace;
- real marketplace network effects/review volume;
- AI-guided service-need understanding.

### Potential DIREKT advantages to preserve/amplify

- check-specific proof instead of one generic badge;
- explicit currentness/expiry/limitations;
- privacy-by-precision for mobile/home/fixed providers;
- payment-independent trust;
- service-area/manual-location resilience;
- human-accountable evidence operations;
- architecture suited to low bandwidth and provider diversity;
- ability to make AI explain/assist without allowing it to invent trust.

## 9. VC implementation priority

1. VC1 design-system reconciliation;
2. VC2 same-scope high-fidelity candidate review/owner approval;
3. VC3 approved tokens/components/icons/imagery/AI patterns;
4. VC4 customer discovery → provider decision → enquiry/accountability;
5. VC5 provider readiness → verification → work management;
6. VC6 operations queue → case → evidence → decision/audit;
7. VC7 bounded AI assistance;
8. VC8 full visual/accessibility/performance/security/regression/AI gate.

## 10. External gates that visual work must not fake

- live Google Maps runtime;
- real notification/communications delivery where not active;
- real payment movement;
- automated registry access;
- real participant/evidence pilot;
- production Play release;
- any external AI model/provider runtime.

VC must design truthful disabled/fallback/pending states until each integration status becomes genuinely `ACTIVE`.

## 11. Completion criterion

The visual gap is closed only when primary customer/provider/operations journeys:

- no longer expose prototype/developer/test presentation;
- match the owner-approved Design DNA;
- are coherent across Android/PWA/operations;
- preserve check-specific trust/privacy/commercial boundaries;
- pass responsive/accessibility/offline/low-bandwidth states;
- include bounded AI assistance only after its architecture/evaluation controls pass;
- retain exact-head predecessor regression evidence.