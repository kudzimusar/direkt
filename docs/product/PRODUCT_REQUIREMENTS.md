# DIREKT Product Requirements

**Document type:** Product requirements document (PRD)  
**Release:** Android Version 1 / Zambia pilot and launch

## 1. Product objective

Deliver a native Android marketplace and supporting operational platform through which customers can discover providers by service and location, understand check-specific trust information, send trackable enquiries and participate in accountable reviews and complaints.

## 2. Roles

- unauthenticated visitor;
- customer;
- provider owner;
- provider manager/member;
- field agent;
- verification reviewer;
- support agent;
- trust and safety supervisor;
- finance operator;
- platform administrator;
- auditor/read-only institutional user where approved.

Permissions are defined in `USER_ROLES_AND_PERMISSIONS.md`.

## 3. Functional requirements

### FR-001 Account and session

- Support phone-number and/or email-based account identity through approved verification providers.
- Maintain secure sessions and device revocation.
- Require stronger authentication for privileged operations roles.
- Allow one person to be a customer and an authorized provider member.
- Preserve audit history when role relationships change.

### FR-002 Customer area selection

- Permit current-location search only after contextual permission.
- Permit manual area selection without location permission.
- Persist a preferred search area.
- Avoid storing continuous/background customer location.
- Clearly show the active search area.

### FR-003 Categories and services

- Use an administrator-controlled category taxonomy.
- Associate category-specific evidence requirements.
- Allow providers to select only approved services.
- Support synonyms for search without creating duplicate public categories.
- Version material requirement changes.

### FR-004 Provider profile

A provider profile must support:

- legal/display name;
- provider type;
- authorized representatives;
- description;
- categories/services;
- operating model;
- service areas;
- public premises details where consented;
- contact channels;
- hours/availability;
- portfolio imagery;
- verification-check summary;
- subscription state;
- moderation/publication state.

### FR-005 Verification

- Create independent checks for contact, identity, business, qualification/licence, location, premises and good standing as applicable.
- Define required evidence by provider type and category.
- Store evidence privately.
- Support review, action required, rejection, resubmission, approval, expiry, revocation and suspension.
- Derive public claims from approved checks.
- Record every decision and override.
- Notify providers of actionable outcomes without exposing reviewer-private notes.
- Prevent commercial entitlement from changing outcomes.

### FR-006 Field verification

- Assign authorized field agents.
- Capture appointment, arrival/departure, structured checklist, permitted photos and notes.
- Separate private visit coordinates from any public pin.
- Detect obvious stale/replayed submissions through time/device controls where lawful.
- Require supervisor review for defined risk cases.

### FR-007 Search and discovery

Search must support:

- category/service text;
- chosen search origin;
- distance or area;
- fixed/mobile/hybrid operating model;
- current verification checks;
- availability indicators;
- list and map;
- stable pagination;
- no-location fallback;
- explainable sponsored placement if introduced.

Ranking must consider relevance, service-area compatibility, distance, current trust signals, response quality and data freshness. It must not imply an unverified provider is verified.

### FR-008 Provider detail

Display:

- provider identity and service summary;
- current public location/service area;
- check-specific trust details;
- expiry/currentness;
- services and availability;
- portfolio content;
- eligible-interaction reviews;
- enquiry/contact action;
- save/share/report controls.

Sensitive documents, private coordinates, personal identity numbers and reviewer notes must never appear.

### FR-009 Enquiries

- Customer selects service, location/area, preferred timing and safe description.
- Customer consents before sharing contact information.
- Provider receives an inbox item and can respond.
- State changes are tracked.
- Direct call or external messaging handoff remains associated with the enquiry where feasible.
- Abuse rate limits and block/report controls apply.

### FR-010 Reviews

- Only eligible platform-tracked interactions may create standard reviews.
- Reviews include rating dimensions, optional text and moderation state.
- Providers may respond.
- Users may report reviews.
- Removed reviews retain audit history.
- Review summaries require a minimum sample before strong aggregate claims.

### FR-011 Complaints and safety reports

- Support inaccurate-profile, fraud, harassment, non-delivery, unsafe conduct and other controlled report types.
- Provide emergency guidance without representing DIREKT as emergency response.
- Triage by severity.
- Link reports to provider, interaction and evidence where authorized.
- Support restriction, suspension, remediation and appeal.

### FR-012 Subscription

- Define plans, entitlements, billing period, grace period and cancellation.
- Use payment-provider adapters.
- Process webhooks idempotently.
- Maintain a financial ledger and reconciliation state.
- Degrade commercial features predictably without rewriting trust history.
- Allow mandatory safety/expiry communication regardless of marketing consent.

### FR-013 Notifications

- In-app notification centre is authoritative.
- Push notifications use FCM.
- SMS/email are reserved for approved authentication, critical and operational cases.
- Users control optional notifications.
- Sensitive evidence content is not placed in lock-screen notification text.

### FR-014 Administration

The portal must provide:

- role-scoped dashboards;
- verification queues;
- evidence access and audit;
- field assignment;
- decision/reason-code controls;
- provider/customer/support search;
- complaints and incidents;
- subscription/reconciliation views;
- configuration for categories and evidence rules;
- exports restricted by purpose;
- immutable activity history.

### FR-015 Analytics

Measure product health without storing unnecessary sensitive data:

- search success;
- result-to-profile;
- profile-to-enquiry;
- provider response;
- verification conversion and turnaround;
- expiry/remediation;
- review completion;
- complaint and enforcement rates;
- retention;
- subscription performance;
- reliability and crash metrics.

## 4. Non-functional requirements

### Availability and resilience

- Define service-level objectives before pilot.
- Gracefully handle map, notification and payment dependency failures.
- Use durable queues for asynchronous actions.
- Provide backup and tested restore.

### Performance

Initial targets, subject to measurement:

- cached Android app usable start under 2 seconds on pilot median device;
- common API reads p95 under 500 ms excluding third-party latency;
- initial search p95 under 1.5 seconds under planned pilot load;
- image/evidence uploads show progress and recoverability;
- Pages documentation build remains reproducible.

### Security

- least privilege;
- server-side authorization;
- private evidence objects and short-lived access;
- encryption in transit and at rest through approved infrastructure;
- secret management;
- rate limits and abuse detection;
- auditable privileged actions;
- dependency and secret scanning.

### Privacy

- data minimization;
- purpose and consent recording;
- location precision controls;
- retention/deletion rules;
- policy versioning;
- access/correction/deletion request operations;
- no advertising use of sensitive verification evidence.

### Accessibility

- Android TalkBack and dynamic type/font scale;
- non-map alternatives;
- sufficient contrast;
- 48dp targets;
- clear errors and status text;
- web portal keyboard access.

### Maintainability

- modular boundaries;
- OpenAPI contract;
- typed clients;
- forward migrations;
- architecture decision records;
- automated tests;
- observable jobs and integrations.

## 5. MVP exclusions

- native iOS app;
- open marketplace chat unless validated as essential;
- escrow;
- loans, insurance and financial advice;
- emergency dispatch;
- employee background checks beyond approved provider verification;
- continuous/background location tracking;
- public evidence documents;
- bidding/auction marketplace;
- cross-country launch;
- AI-generated verification decisions without human accountability.

## 6. Acceptance scenario

The MVP passes when a category-appropriate provider can submit evidence, receive independent reviewed outcomes, become discoverable with accurate scoped claims, receive a tracked customer enquiry, respond, and participate in a review/complaint lifecycle that operations staff can audit end to end.
