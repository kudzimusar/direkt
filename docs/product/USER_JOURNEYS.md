# DIREKT User Journeys

## Journey 1 — Customer finds a plumber

1. Customer opens Discover.
2. Customer chooses current area or selects an area manually.
3. Customer selects “Plumber” or searches a service phrase.
4. Results display list/map with distance/service-area compatibility and trust summaries.
5. Customer opens a provider profile.
6. Customer reviews services, operating model, check details, review history and limitations.
7. Customer creates an enquiry with service type, area and preferred timing.
8. Customer explicitly chooses which contact details to share.
9. Provider responds or the enquiry expires.
10. After a qualifying interaction, the customer may review or report.

**Failure paths**
- no results: expand area or show adjacent categories without fabricating matches;
- location denied: manual area remains available;
- provider suspended after save: show unavailable reason category and alternatives;
- poor network: preserve filters and show cached profile with timestamp.

## Journey 2 — Mobile provider becomes discoverable

1. Provider signs in and selects “Offer services”.
2. Provider identifies as sole trader/mobile.
3. Provider chooses services and service area.
4. Provider supplies private identity/base information.
5. Category checklist requests qualification evidence where applicable.
6. Provider captures/uploads evidence and submits declarations.
7. Backend validates completeness and opens verification cases.
8. Reviewer approves, requests action or rejects each check.
9. Provider corrects action-required items.
10. Approved, current checks derive public claims.
11. Publication rules confirm enough required checks are current.
12. Provider becomes discoverable without exposing the private home address.

## Journey 3 — Fixed-premises business verification

1. Owner creates organization profile.
2. Owner submits registration and representative identity.
3. Owner selects fixed-premises or hybrid.
4. Owner proposes public address/pin and consents to publication.
5. Premises evidence and field visit are scheduled if required.
6. Field agent verifies assigned facts using structured checklist.
7. Reviewer compares visit, registration and profile.
8. Approved premises claim publishes exact or approved-precision pin.
9. Future customer reports or expiry can reopen the case.

## Journey 4 — Evidence correction

1. Provider receives “Action required”.
2. Notification contains check name and safe reason, not internal reviewer notes.
3. Provider opens the case timeline.
4. UI explains acceptable replacement evidence.
5. Provider replaces or supplements evidence.
6. Resubmission creates a new evidence version.
7. Reviewer sees prior decision and current changes.
8. Public claim remains absent or degraded until approval.

## Journey 5 — Serious customer complaint

1. Customer opens interaction/provider and selects Report.
2. UI distinguishes immediate danger from platform complaint.
3. Customer selects reason and supplies minimum necessary information.
4. System creates severity and SLA.
5. Trust team triages, may temporarily restrict profile/contact.
6. Provider is notified when safe and appropriate.
7. Evidence, response and prior history are reviewed.
8. Decision and appeal route are recorded.
9. Public state changes only according to policy.
10. Retention and access are restricted.

## Journey 6 — Certificate expiry

1. System detects approaching expiry.
2. Provider receives staged reminders.
3. Provider submits renewed evidence.
4. New evidence is reviewed independently.
5. If approved before expiry, continuity is maintained.
6. If not, the claim changes to expired and affected discovery filters update.
7. Expiry never deletes historical decisions.

## Journey 7 — Subscription failure

1. Payment attempt/webhook is recorded idempotently.
2. Provider sees payment status and grace period.
3. Trust claims remain factual and unchanged.
4. Commercial features reduce only according to published entitlements.
5. Safety, complaint and evidence-expiry access remains available.
6. Reconciliation or support can resolve an exception with audit history.
