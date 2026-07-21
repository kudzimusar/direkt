# DIREKT User Journeys

These journeys define the human task flow. AI may assist where documented, but core journeys remain usable without AI. Canonical trust, authorization, payment and legal decisions remain server-side/human-accountable.

## Journey 1 — Customer finds a plumber

1. Customer opens Discover.
2. Customer chooses current area or selects an area manually.
3. Customer may select “Plumber”, search a service phrase, or describe the problem in natural language.
4. If AI intent assistance is active, DIREKT suggests likely service/category matches and may ask a small number of clarifying questions; customer can edit or bypass suggestions.
5. Deterministic eligibility and location/privacy rules create the candidate set.
6. Results display list/map with distance/service-area compatibility and trust summaries.
7. Customer opens a provider profile or compares shortlisted providers.
8. Customer reviews services, operating model, check details, review history and limitations.
9. AI may summarize why providers appear relevant using only public-safe facts; canonical trust facts remain visibly separate.
10. Customer creates an enquiry with service type, area and preferred timing.
11. Customer explicitly chooses which contact details to share.
12. Provider responds or the enquiry expires.
13. After a qualifying interaction, the customer may review or report.

**Failure paths**
- no results: expand area or show adjacent categories without fabricating matches;
- AI unavailable/low confidence: fall back to normal search/category selection;
- location denied: manual area remains available;
- provider suspended after save: show unavailable reason category and alternatives;
- poor network: preserve filters and show cached profile with timestamp;
- map unavailable: list remains fully usable.

## Journey 2 — Customer does not know what service category is needed

1. Customer enters a plain-language description such as “water is leaking under my sink”.
2. Where activated, AI classifies probable service intent and returns one or more candidate categories with plain-language rationale.
3. Customer may answer a bounded clarifying question.
4. Customer confirms or changes the suggested category.
5. DIREKT performs normal deterministic discovery.
6. Results explain service fit and trust information without claiming AI certainty.
7. Customer continues through the normal provider/enquiry flow.

**Rules**
- AI does not diagnose emergencies or professional/legal matters beyond approved scope;
- manual category/search path is always available;
- no provider is fabricated;
- ranking eligibility remains deterministic and policy-controlled.

## Journey 3 — Mobile provider becomes discoverable

1. Provider signs in and selects “Offer services”.
2. Provider identifies as sole trader/mobile.
3. Provider chooses services and service area.
4. AI onboarding assistance, if active, may explain requirements, suggest category/service matches and draft profile text from provider-supplied facts.
5. Provider confirms any AI-generated public copy before publication.
6. Provider supplies private identity/base information.
7. Category checklist requests qualification evidence where applicable.
8. Provider captures/uploads evidence and submits declarations.
9. Local/deterministic quality checks immediately identify obvious incomplete/corrupt uploads; approved AI/OCR may later provide candidate extraction/quality assistance.
10. Backend validates completeness and opens verification cases.
11. Reviewer approves, requests action or rejects each check.
12. Provider corrects action-required items.
13. Approved, current checks derive public claims.
14. Publication rules confirm enough required checks are current.
15. Provider becomes discoverable without exposing the private home address.

## Journey 4 — Fixed-premises business verification

1. Owner creates organization profile.
2. Owner submits registration and representative identity.
3. Owner selects fixed-premises or hybrid.
4. Owner proposes public address/pin and consents to publication.
5. Premises evidence and field visit are scheduled if required.
6. Field agent verifies assigned facts using structured checklist.
7. Reviewer compares visit, registration and profile.
8. Approved premises claim publishes exact or approved-precision pin.
9. Future customer reports or expiry can reopen the case.

AI may summarize or highlight inconsistencies for authorized staff but cannot approve the premises claim.

## Journey 5 — Evidence correction

1. Provider receives “Action required”.
2. Notification contains check name and safe reason, not internal reviewer notes.
3. Provider opens the case timeline.
4. UI explains acceptable replacement evidence.
5. AI may restate the requirement in simpler language or highlight likely upload-quality problems, but cannot invent a requirement or change the reason code.
6. Provider replaces or supplements evidence.
7. Resubmission creates a new evidence version.
8. Reviewer sees prior decision and current changes.
9. Public claim remains absent or degraded until approval.

## Journey 6 — Operations reviewer handles a verification case

1. Reviewer opens the prioritized verification queue.
2. Reviewer selects a case and sees provider/check context, policy/checklist and audit history.
3. Secure evidence viewer opens only evidence authorized for the reviewer.
4. Where AI operations assistance is approved, a clearly labelled summary may surface canonical facts, prior decisions, missing checklist items or conflicts.
5. Reviewer compares the summary against source evidence and canonical data.
6. Reviewer records a reasoned decision or requests action using allowed reason codes.
7. High-risk overrides follow four-eyes/supervisor rules where required.
8. Provider-safe communication is generated from canonical outcome/reason state; AI may draft wording for human editing where activated.
9. Audit history records human actor, decision, source state and any AI assistance metadata required by policy.

**Rules**
- AI cannot approve/reject/revoke/suspend or finalize an appeal;
- untrusted document text cannot instruct the AI/tool layer;
- private evidence is never sent to an unapproved model provider.

## Journey 7 — Serious customer complaint

1. Customer opens interaction/provider and selects Report.
2. UI distinguishes immediate danger from platform complaint.
3. Customer selects reason and supplies minimum necessary information.
4. System creates severity and SLA using deterministic policy.
5. AI may assist content classification/summarization only within approved privacy boundaries.
6. Trust team triages and may temporarily restrict profile/contact according to policy.
7. Provider is notified when safe and appropriate.
8. Evidence, response and prior history are reviewed.
9. Human-authorized decision and appeal route are recorded.
10. Public state changes only according to policy.
11. Retention and access are restricted.

## Journey 8 — Certificate expiry

1. System detects approaching expiry.
2. Provider receives staged reminders.
3. Provider submits renewed evidence.
4. New evidence is reviewed independently.
5. If approved before expiry, continuity is maintained.
6. If not, the claim changes to expired and affected discovery filters update.
7. Expiry never deletes historical decisions.

## Journey 9 — Subscription failure

1. Payment attempt/webhook is recorded idempotently.
2. Provider sees payment status and grace period.
3. Trust claims remain factual and unchanged.
4. Commercial features reduce only according to published entitlements.
5. Safety, complaint and evidence-expiry access remains available.
6. Reconciliation or support can resolve an exception with audit history.

AI may explain the commercial state in plain language but cannot alter ledger/reconciliation truth.

## Journey 10 — User asks DIREKT for help

1. User opens Help/Support.
2. User can search normal help content or use the documentation-grounded AI assistant where activated.
3. Assistant answers from approved help/product/trust documentation and identifies when it is providing AI-generated wording.
4. For account-specific help, only purpose-scoped data the authenticated user may access is used.
5. Assistant routes unresolved, sensitive or consequential cases to a human/support workflow.

**The assistant must not**
- expose restricted evidence or staff notes;
- provide legal conclusions or emergency dispatch;
- promise a verification outcome;
- perform privileged actions without normal authorization/confirmation;
- block access to a normal human/manual support path.

## Journey 11 — Product team improves discovery using AI insights

1. Aggregated/minimized search and support events identify demand or taxonomy friction.
2. AI may cluster themes or propose synonyms/category improvements.
3. Product/operations staff review suggestions against actual data and Zambia market context.
4. Taxonomy/ranking/trust policy changes follow normal source-controlled governance and tests.
5. No model output directly mutates production taxonomy or policy.