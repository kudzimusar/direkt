# DIREKT Screen Inventory

IDs are stable references for design, analytics and tests. `Prototype` identifies interactive Phase 1B coverage, not completed native implementation.

## Shared and authentication

| ID | Screen | Prototype | Notes |
|---|---|---|---|
| SH-001 | Splash/session restore | Deferred | No marketing delay |
| SH-002 | Welcome/value explanation | Interactive | Trust limitations included |
| SH-003 | Sign in/register | Deferred | Phone/email method; Phase 2+ |
| SH-004 | OTP/verification | Deferred | Retry and accessibility; Phase 2+ |
| SH-005 | Terms/privacy consent | Represented in copy | Versioned production flow later |
| SH-006 | Notification permission education | Deferred | Context before system prompt |
| SH-007 | Mode selector/switcher | Interactive review control | Authorization remains Phase 2+ |
| SH-008 | Notification centre | Deferred | In-app source of truth |
| SH-009 | Support/help | Partial | Safety and support entry points |
| SH-010 | Account/security | Deferred | Sessions and deletion request |

## Customer

| ID | Screen | Prototype |
|---|---|---|
| CU-001 | Discover home | Interactive |
| CU-002 | Area selector | Interactive dialog/fallback |
| CU-003 | Category browser | Interactive |
| CU-004 | Search suggestions | Visual placeholder |
| CU-005 | Result list | Interactive |
| CU-006 | Result map | Interactive synthetic map |
| CU-007 | Filters | Visual controls |
| CU-008 | Provider profile | Interactive |
| CU-009 | Trust details | Interactive |
| CU-010 | Service details | Embedded in profile/enquiry |
| CU-011 | Create enquiry | Interactive; no submission |
| CU-012 | Contact-sharing consent | Interactive; no external handoff |
| CU-013 | Enquiry detail | Confirmation state |
| CU-014 | Saved providers | Navigation placeholder |
| CU-015 | Review eligibility | Explained in profile |
| CU-016 | Submit review | Deferred |
| CU-017 | Report provider/interaction | Interactive safety dialog |
| CU-018 | Complaint detail | Deferred |
| CU-019 | No-results recovery | State simulator |
| CU-020 | Location-permission fallback | State simulator |

## Provider

| ID | Screen | Prototype |
|---|---|---|
| PR-001 | Provider overview | Interactive |
| PR-002 | Onboarding checklist | Interactive |
| PR-003 | Provider type/pathway | Interactive |
| PR-004 | Representative details | Checklist representation |
| PR-005 | Business/professional details | Pathway representation |
| PR-006 | Category/services | Checklist representation |
| PR-007 | Operating model | Interactive |
| PR-008 | Service areas | Interactive within operating model |
| PR-009 | Public premises consent | Explained in operating model |
| PR-010 | Evidence requirements | Interactive |
| PR-011 | Evidence capture/upload | Interactive simulation |
| PR-012 | Review and declaration | Deferred |
| PR-013 | Verification timeline | Interactive |
| PR-014 | Action-required correction | Interactive |
| PR-015 | Availability | Overview representation |
| PR-016 | Enquiry inbox | Interactive |
| PR-017 | Enquiry response | Dialog representation |
| PR-018 | Portfolio | Deferred |
| PR-019 | Provider reviews/response | Deferred |
| PR-020 | Subscription/receipts | Deferred to Phase 9 |
| PR-021 | Provider members | Deferred |
| PR-022 | Publication status | Overview representation |

## Operations portal

| ID | Screen | Prototype |
|---|---|---|
| OP-001 | Operations dashboard | Interactive |
| OP-002 | Verification queue | Interactive |
| OP-003 | Verification case | Interactive |
| OP-004 | Secure evidence viewer | Interactive synthetic evidence |
| OP-005 | Decision/reason form | Interactive simulation |
| OP-006 | Field assignment | Queue representation |
| OP-007 | Field visit record | Deferred |
| OP-008 | Provider operations profile | Case representation |
| OP-009 | Complaint queue | Navigation representation |
| OP-010 | Incident case | Deferred |
| OP-011 | Appeal review | Deferred |
| OP-012 | Subscription exception | Deferred to Phase 9 |
| OP-013 | Reconciliation | Deferred to Phase 9 |
| OP-014 | Taxonomy configuration | Deferred |
| OP-015 | Evidence-rule configuration | Deferred |
| OP-016 | Audit search/history | Interactive |
| OP-017 | User/role management | Deferred |
| OP-018 | System health/queues | Deferred |

## Cross-screen Phase 1B states

The prototype state simulator covers:

- slow network;
- offline mode;
- loading skeletons;
- empty/no-results recovery;
- location permission denial;
- recoverable refresh error.

The provider upload screen separately covers interrupted upload, local draft and retry.

## Implementation handoff rule

Interactive prototype coverage is evidence of design intent only. Native Android, backend and operations implementation must still define data contracts, authorization, analytics, accessibility tests and acceptance tests per screen.
