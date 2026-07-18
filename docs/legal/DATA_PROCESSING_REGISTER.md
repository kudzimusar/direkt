# DIREKT Data Processing Register

**Baseline:** Phase 10 synthetic system — 2026-07-17  
**Status:** Technical processing inventory. Lawful bases, registration and retention periods require qualified Zambia review before real data processing.

## Control rules

- Every processing activity requires an owner, purpose, data classification, source, recipients, candidate lawful basis, retention state, deletion/rights implementation and policy version.
- A candidate lawful basis in this register is not legal approval.
- Real identity, evidence, precise location, communications or payment processing remains prohibited until the DPC/counsel/provider stop gates are satisfied.
- Public output uses explicit allowlists; private source data is not made public by default.
- Commercial state does not create verification, publication, ranking or accountability outcomes.
- New vendors require data-processing, location, sub-processor, retention, incident and cross-border review.

## Processing activities

| ID | Activity | Subjects and data | Purpose | Candidate basis requiring review | Recipients | Retention state | Technical controls | Owner/status |
|---|---|---|---|---|---|---|---|---|
| P-001 | Authentication challenge | contact channel/value hash, masked hint, challenge hash, attempt/expiry metadata, IP/user-agent hashes | verify possession and prevent abuse | service request, legitimate security interest and/or consent | approved OTP provider only after contract | challenge expiry plus bounded security/audit history | normalized/hash-only contact, one-time code hash, attempt limit, production delivery disabled | Security/backend — synthetic only |
| P-002 | Account and session | identity ID, verified contact reference, session family, refresh-token hash, device label, IP/user-agent hashes | account access, device/session management and compromise response | contract/service and security/legal obligation | DIREKT support/security; no public recipient | active session plus bounded security history | short access token, rotating hashed refresh token, family reuse revocation, live identity status | Security/support — synthetic only |
| P-003 | Customer profile | display name, profile status | personalize customer account | contract/service | customer and authorized support | account life plus rights/legal schedule | own-account permission and safe projection | Product/support — synthetic only |
| P-004 | Provider organization/profile | representative assignments, pathway, operating model, business/qualification/experience summaries, locality/service summary | create/manage provider workspace | provider contract and legitimate marketplace purpose | provider representatives; safe public allowlist after publication | active provider plus bounded accountability/legal history | identity/provider separation, actor-resolved scope, revisions and public allowlist | Provider operations — synthetic only |
| P-005 | Provider private/public location | private base coordinates, consented public premises, service area and public locality | eligibility, service-area matching and lawful public premises display | contract, explicit consent for public premises and legitimate service delivery | assigned operations; map provider only after approval; public locality/consented premises only | active need plus bounded audit/deletion schedule | separate location classes, precise-coordinate exclusion, mobile-provider ranking ban | Privacy/provider operations — real data blocked |
| P-006 | Verification evidence | identity/business/qualification/location/experience evidence bytes, opaque object reference, MIME/size/checksum, requirement scope | evidence-backed provider verification | contract, legal obligation or explicit consent depending evidence; counsel required | assigned reviewers and approved authority/source | validity, appeal/fraud/legal period; rejected/abandoned cleanup | private storage, logical upload intent, short grants, checksum/MIME/size, immutable version | Trust/privacy — real evidence blocked |
| P-007 | Verification cases/decisions/claims | case assignment, recommendations, reason codes, decisions, limitations, validity and safe public claim | issue scoped evidence-backed trust claims | marketplace contract, legitimate interest and category law; counsel required | provider, assigned operations, public claim allowlist | decision/claim history plus appeal/legal schedule | controlled state machines, immutable decisions/events, no blanket verification | Trust operations — synthetic only |
| P-008 | Discovery and saves | public provider/category/claim/availability data, coarse/manual search area, saved-provider reference | match customers and providers | service request/legitimate interest | customer; map provider only after approval | search telemetry minimal; saves until removal/account closure | live claim enforcement, private-coordinate exclusion, deterministic non-paid ranking | Product/privacy — synthetic only |
| P-009 | Enquiry and tracked interaction | bounded service summary, timing, locality summary, provider/category/publication references, status/history | request and track a service interaction | pre-contract/service request | customer/provider and authorized support | support/review eligibility/complaint window plus legal schedule | idempotency, owner/provider scope, revisioned immutable events | Interaction operations — synthetic only |
| P-010 | Contact handoff | verified contact reference, masked hint, channel, purpose, consent/expiry/revocation | temporary call/WhatsApp handoff after accepted enquiry | explicit channel-specific consent | accepted provider; communications vendor after approval | 24-hour active grant plus minimized consent/audit history | no raw value in interaction table, masked projection, immediate revocation, external delivery disabled | Privacy/interaction — real delivery blocked |
| P-011 | Reviews and provider response | rating, bounded title/body, moderation status, response, report/appeal reasons | marketplace accountability and fair response | contract/legitimate interest; public publication and moderation basis require counsel | customer/provider, moderators; published public allowlist | publication plus moderation/appeal/legal schedule | qualifying tracked interaction, one review/response, moderation, appeal and public allowlist | Trust/support — synthetic only |
| P-012 | Customer complaint | complaint type/summary, owned interaction reference, status/events and reason | customer redress and provider conduct handling | contract, legal obligation and legitimate interest; counsel required | customer, affected provider as policy permits, complaint operations | severity/legal/consumer schedule | separate from reviews and internal incidents, owner scope, revisions, immutable events | Support/legal — synthetic only |
| P-013 | Internal incident | bounded internal operational/security details, owner, severity/status/events | detect, contain and resolve internal operational/security events | legal obligation and legitimate security interest; counsel required | authorized incident/security staff only | severity/legal/insurance schedule | separate private domain, owner-scoped transitions, immutable terminal history | Security/operations — synthetic only |
| P-014 | Product/subscription | product/price/entitlement definition, provider subscription state/events | provide/manage commercial workspace access | provider contract | provider and finance operations | contract/accounting/support schedule | separate commercial schema, actor-resolved scope, no trust/ranking effect | Finance/product — synthetic only |
| P-015 | Invoice/payment/receipt | provider/subscription/invoice references, integer minor-unit totals, payment status/reference, safe provider event metadata | bill and reconcile subscriptions | contract, accounting/tax/legal obligation; qualified review required | provider, finance/accounting and approved payment provider | statutory/accounting schedule after review | immutable invoice lines, disabled/synthetic adapter, no credential/raw webhook storage | Finance/legal — real payments disabled |
| P-016 | Ledger/reconciliation/adjustment | balanced debit/credit entries, mismatch codes, approvals, reason/policy history | financial audit, exception resolution and controlled correction | accounting/legal obligation and legitimate fraud control | finance/audit and approved professional advisers | statutory/audit/legal schedule | append-only balanced ledger, reconciliation, consistent references and two approvers | Finance/audit — synthetic only |
| P-017 | Operations assignments/access | role assignments, case/evidence grants, field work, escalations, overrides, queue ownership | administer verification, support, trust and finance work | contract/employment, legal obligation and legitimate security interest | authorized staff/contractors only | assignment plus audit/legal schedule | live permissions, purpose/assignment, short grants, four-eyes controls and audit | Operations/security — synthetic only |
| P-018 | Audit and security telemetry | actor/resource IDs, action, request/correlation ID, bounded metadata, timestamps and safe error codes | accountability, abuse detection, incident response and compliance evidence | legal obligation and legitimate security interest; counsel required | security/audit/operations | bounded operational/legal schedule | append-only events, redaction rules, no secrets/raw protected values | Security/audit — synthetic only |
| P-019 | Product analytics | synthetic/app events, coarse context, performance/error state | reliability, accessibility and product improvement | consent and/or legitimate interest; review required | approved analytics processor only after DPA | aggregate/de-identify early and delete raw identifiers quickly | no evidence/private coordinates/contact/payment credentials; disabled until approved | Product/privacy — unselected/blocked |
| P-020 | Research/pilot | interview/observation/consent notes and separately approved private examples | Phase 11 usability, comprehension, operations and willingness-to-pay validation | informed consent and research ethics/legal review | approved research team only | consented research schedule and deletion commitment | separate private system, pseudonymization, consent withdrawal and no public repo | Research/privacy — Phase 11 only |

## Data-subject rights implementation matrix

| Right/control | Current synthetic support | Required before real data |
|---|---|---|
| Notice/transparency | policy-version fields and documentation structure | approved layered privacy notice, provider/customer/worker notices and vendor list |
| Access | account/session and bounded own-workspace APIs | authenticated rights-request workflow, identity proofing, response package and deadlines |
| Correction | profile/location/service updates and appeal/correction lifecycles | formal rights intake, authority-source correction and downstream propagation |
| Deletion | session revocation and bounded lifecycle deletion protections | classification-based deletion/anonymization, legal holds, storage/vendor propagation and backup expiry |
| Restriction/objection | suspension, revocation, consent withdrawal and publication controls | formal processing restriction/objection workflow and legal-basis handling |
| Portability/export | no production export | scoped machine-readable export with redaction, identity proofing and audit |
| Consent withdrawal | handoff revocation and public-premises consent removal | approved consent registry, downstream stop, historical proof and vendor propagation |
| Complaint | customer complaint and appeal state machines | DPC/CCPC/authority escalation procedure and service levels |
| Breach notice | incident architecture and audit | approved notification thresholds, contacts, timelines and exercise evidence |

## Cross-border and vendor controls

Before a vendor receives real personal data, record:

- provider/legal entity and service;
- controller/processor/sub-processor role;
- hosting and support locations;
- Zambia storage/transfer authorization requirement and evidence;
- DPA/security annex and audit rights;
- encryption, access, retention, deletion and backup behavior;
- breach notice and cooperation;
- government/authority request policy;
- termination/export/deletion evidence;
- cost, quota and operational owner.

## Change control

A new table, field, event, public projection, storage bucket, external adapter, analytics event or export must update this register, the threat model, retention schedule, privacy model, test strategy, decision/risk records and—where applicable—the DPC/counsel approval package before activation.
