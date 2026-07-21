# DIREKT Screen Inventory

IDs are stable references for design, analytics and tests. Historical `Prototype` coverage identifies Phase 1B intent, not final production visual readiness. VC1–VC8 must modernize the existing implemented surfaces against `VISUAL_COMPLETION_PLAN.md` without changing IDs unnecessarily.

AI assistance is generally embedded in existing journeys rather than creating a separate chatbot-only product. New `AI-*` IDs identify reusable AI interaction surfaces/components that require independent evaluation and fallback.

## Shared and authentication

| ID | Screen | Historical prototype | VC/AI target notes |
|---|---|---|---|
| SH-001 | Splash/session restore | Deferred | Polish only; fast usable start, no marketing delay. |
| SH-002 | Welcome/value explanation | Interactive | World-class value/trust explanation, concise and visual. |
| SH-003 | Sign in/register | Deferred | Final account flow; no implementation jargon. |
| SH-004 | OTP/verification | Deferred | Retry/accessibility/abuse-safe states. |
| SH-005 | Terms/privacy consent | Represented in copy | Versioned consent and readable summaries. |
| SH-006 | Notification permission education | Deferred | Context before system prompt. |
| SH-007 | Mode selector/switcher | Interactive review control | Clear customer/provider switching; auth remains server-side. |
| SH-008 | Notification centre | Deferred | In-app source of truth. |
| SH-009 | Support/help | Partial | Add documentation-grounded AI assistance only with manual/human fallback. |
| SH-010 | Account/security | Deferred | Sessions, privacy, deletion request, support. |

## Customer

| ID | Screen | Historical prototype | VC/AI target notes |
|---|---|---|---|
| CU-001 | Discover home | Interactive | Flagship marketplace surface; search/area/categories/provider preview/AI need entry. |
| CU-002 | Area selector | Interactive dialog/fallback | Current/manual area, privacy-safe precision. |
| CU-003 | Category browser | Interactive | Visual category system with lightweight imagery/icons. |
| CU-004 | Search suggestions | Visual placeholder | Real suggestions + AI intent/query expansion with manual fallback. |
| CU-005 | Result list | Interactive | World-class provider cards, explainable relevance. |
| CU-006 | Result map | Interactive synthetic map | Map/list equivalence; Maps activation truthful; no private base pins. |
| CU-007 | Filters | Visual controls | Human-readable service/location/trust/availability filters. |
| CU-008 | Provider profile | Interactive | Flagship imagery/service/trust/action hierarchy. |
| CU-009 | Trust details | Interactive | Check-specific scope/date/currentness/limitations; strongest differentiator. |
| CU-010 | Service details | Embedded | Dedicated/embedded pattern according to approved Design DNA. |
| CU-011 | Create enquiry | Interactive; no historical submission | Structured, simple, optional AI description help with user confirmation. |
| CU-012 | Contact-sharing consent | Interactive | Explicit consent/revoke/expiry; no hidden data sharing. |
| CU-013 | Enquiry detail | Confirmation state | Full timeline/response/contact state. |
| CU-014 | Saved providers | Navigation placeholder | Final list/empty/unavailable states. |
| CU-015 | Review eligibility | Explained in profile | Clear eligibility reason. |
| CU-016 | Submit review | Deferred | Rating/text/report safeguards, optional writing assistance without meaning change. |
| CU-017 | Report provider/interaction | Interactive safety dialog | Clear emergency vs platform report distinction. |
| CU-018 | Complaint detail | Deferred | Status/timeline/appeal-safe presentation. |
| CU-019 | No-results recovery | State simulator | Area/category/query recovery, no fabricated matches. |
| CU-020 | Location-permission fallback | State simulator | Manual area remains first-class. |

## Provider

| ID | Screen | Historical prototype | VC/AI target notes |
|---|---|---|---|
| PR-001 | Provider overview | Interactive | Flagship task-oriented workspace/readiness. |
| PR-002 | Onboarding checklist | Interactive | Next actions and blockers; AI guidance may explain requirements. |
| PR-003 | Provider type/pathway | Interactive | Plain-language registered/qualified/experienced paths. |
| PR-004 | Representative details | Checklist representation | Dedicated final form/summary. |
| PR-005 | Business/professional details | Pathway representation | Dedicated final form/summary. |
| PR-006 | Category/services | Checklist representation | Human taxonomy selection; AI suggestions are confirmable proposals. |
| PR-007 | Operating model | Interactive | Fixed/mobile/hybrid with clear privacy implications. |
| PR-008 | Service areas | Interactive | Map/list/manual area controls; no raw WKT. |
| PR-009 | Public premises consent | Explained | Explicit public-location consent and precision. |
| PR-010 | Evidence requirements | Interactive | Requirement cards with why/acceptable evidence. |
| PR-011 | Evidence capture/upload | Interactive simulation | Real upload/resume/retry/quality guidance; AI/OCR gated. |
| PR-012 | Review and declaration | Deferred | Dedicated confirmation/declaration before submission. |
| PR-013 | Verification timeline | Interactive | Calm timeline, expiry/current/action-required states. |
| PR-014 | Action-required correction | Interactive | Exact safe reason and next steps; AI simplification only within reason semantics. |
| PR-015 | Availability | Overview representation | Dedicated editing and calendar/slot UX as approved. |
| PR-016 | Enquiry inbox | Interactive | Fast task triage. |
| PR-017 | Enquiry response | Dialog representation | Clear response/contact state. |
| PR-018 | Portfolio | Deferred | Public work imagery only, separate from evidence. |
| PR-019 | Provider reviews/response | Deferred | Reputation and response/appeal flow. |
| PR-020 | Subscription/receipts | Deferred to Phase 9 | Commercial visual family distinct from trust. |
| PR-021 | Provider members | Deferred | Only when role/team scope authorized. |
| PR-022 | Publication status | Overview representation | Explain exactly what blocks/governs discoverability. |

## Operations portal

| ID | Screen | Historical prototype | VC/AI target notes |
|---|---|---|---|
| OP-001 | Operations dashboard | Interactive | Mission-control overview. |
| OP-002 | Verification queue | Interactive | Desktop-grade filtering/SLA/ownership/priority. |
| OP-003 | Verification case | Interactive | Case facts/history/check context. |
| OP-004 | Secure evidence viewer | Interactive synthetic evidence | Central desktop evidence workspace; short-lived/revocable access. |
| OP-005 | Decision/reason form | Interactive simulation | Human-authorized checklist/reason/decision controls. |
| OP-006 | Field assignment | Queue representation | Assignment/status/safety. |
| OP-007 | Field visit record | Deferred | Structured visit workflow. |
| OP-008 | Provider operations profile | Case representation | Provider trust/publication/operations summary. |
| OP-009 | Complaint queue | Navigation representation | Severity/SLA/ownership. |
| OP-010 | Incident case | Deferred | Dedicated high-severity case workspace. |
| OP-011 | Appeal review | Deferred | Independent history/decision review. |
| OP-012 | Subscription exception | Deferred to Phase 9 | Commercial exception controls. |
| OP-013 | Reconciliation | Deferred to Phase 9 | Ledger/provider reconciliation shell within activation gates. |
| OP-014 | Taxonomy configuration | Deferred | Governed configuration, not AI-autonomous mutation. |
| OP-015 | Evidence-rule configuration | Deferred | Versioned requirements/rules. |
| OP-016 | Audit search/history | Interactive | Search/filter/detail with immutable history. |
| OP-017 | User/role management | Deferred | Privileged and separately authorized. |
| OP-018 | System health/queues | Deferred | Runtime/queue/integration health. |

## AI reusable surfaces

| ID | Surface | Primary contexts | Authority rule |
|---|---|---|---|
| AI-001 | Describe-your-need composer | CU-001/CU-004 | Suggests intent/category; user may edit/bypass. |
| AI-002 | Clarifying-question prompt | Discovery/onboarding | Bounded questions only; no hidden requirement changes. |
| AI-003 | Why-this-result explanation | CU-005/CU-008 | Public-safe approved relevance facts only. |
| AI-004 | Provider comparison summary | CU-005/CU-008 | Synthesis separated from canonical trust facts. |
| AI-005 | Provider onboarding copilot | PR-002/PR-003/PR-006 | Advice/drafts only; provider confirms public data. |
| AI-006 | Evidence quality/extraction assist | PR-011/OP-004 | Restricted-data approval required; never decides trust. |
| AI-007 | Operations case copilot | OP-002–OP-005 | Summary/checklist/draft only; human final decision. |
| AI-008 | Support assistant | SH-009 | Approved documentation/account-safe context; human escalation. |
| AI-009 | Moderation/risk signal panel | OP-009–OP-011 | Advisory signal with false-positive monitoring. |
| AI-010 | AI unavailable/manual fallback | All AI contexts | Core task remains usable without AI. |

## Cross-screen states

Every final applicable screen must define:

- initial loading/skeleton;
- empty/no-results;
- recoverable error;
- offline/stale-cache timestamp;
- retry/conflict where writes can be interrupted;
- permission denied/manual fallback;
- AI unavailable/low-confidence/manual fallback where AI applies;
- accessibility at large text/keyboard/screen reader;
- low-bandwidth imagery fallback.

Provider evidence upload separately covers interrupted upload, local draft and retry.

## Implementation handoff rule

Historical prototype coverage is evidence of design intent only. Final Android/PWA/operations implementation must define data contracts, authorization, analytics, accessibility, AI authority/data boundaries where applicable, exact-head tests and synthetic-safe visual-reference evidence per screen.

VC2 owner approval governs the final visual direction; VC8 governs world-class visual/product/AI quality.