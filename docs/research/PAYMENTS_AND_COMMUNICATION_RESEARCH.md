# DIREKT Payments and Communication Research

**Status:** Open; no payment, SMS, OTP or messaging provider approved.

## Objective

Understand how customers and providers prefer to communicate, authenticate, request work and make payments, while preserving accountability and avoiding unnecessary financial or communications complexity in MVP.

## Decisions controlled

- structured enquiry versus immediate direct contact;
- phone, SMS, WhatsApp and in-app messaging roles;
- phone OTP requirements and recovery;
- notification channels;
- whether DIREKT handles customer-to-provider payments in Version 1;
- provider subscription payment methods;
- mobile-money/provider evaluation criteria;
- receipt, refund, reconciliation and complaint expectations;
- consent and privacy rules for sharing phone numbers.

## Communication research questions

### Customer

- Which channel is used first for local services?
- Is calling preferred for urgent work?
- Is WhatsApp used for photos, directions and price negotiation?
- Are SMS messages read reliably?
- Would a structured enquiry be completed before receiving a provider phone number?
- What information should remain hidden before the provider accepts?
- Is an in-app inbox necessary, or would it duplicate familiar channels?
- How should spam, harassment and repeated calls be controlled?
- What record is needed to support a review or complaint?

### Provider

- Which channel produces usable enquiries?
- What information is needed before calling back?
- How are multiple phones, SIMs, staff or WhatsApp Business handled?
- How quickly can the provider respond?
- Would the provider update accepted/declined/completed states?
- What creates notification overload?
- What happens when a business phone changes?
- How should after-hours and emergency availability be represented?

## Candidate MVP enquiry model

Research this sequence:

1. customer selects provider;
2. customer enters structured need, broad location, preferred time and contact channel;
3. DIREKT creates a tracked enquiry;
4. provider receives notification;
5. provider accepts, declines or requests clarification;
6. phone number/external messaging handoff occurs with consent;
7. DIREKT retains only necessary state and timestamps;
8. interaction can later support review or complaint eligibility.

Compare against:

- immediate public phone number;
- click-to-call with a platform event;
- click-to-WhatsApp;
- full in-app chat;
- provider-only callback request.

## Authentication and OTP research

Investigate:

- shared and recycled phone numbers;
- dual-SIM use;
- number changes;
- SMS delivery delay;
- data-off/SMS-on situations;
- phone theft or loss;
- provider staff sharing one business number;
- inability to receive short codes;
- accessibility of numeric codes;
- recovery without insecure support overrides.

Do not select a vendor until current ZICTA, pricing, delivery, privacy and security considerations are reviewed.

## Payment scope options

### Option A — No customer-service payment through DIREKT in MVP

DIREKT tracks enquiries and verification but customers/providers settle externally. This reduces regulated money-flow complexity but limits payment accountability.

### Option B — Provider subscriptions only

DIREKT integrates approved payment methods only for provider plans/verification operations, not customer job payments.

### Option C — Customer booking/deposit payments

Higher accountability but materially increases regulatory, refund, fraud, dispute and reconciliation requirements.

### Option D — Full marketplace payment/escrow

Explicitly out of initial scope unless later legal, operational and economic evidence supports it.

Phase 1A should not assume Option C or D.

## Payment research questions

### Customers

- How are call-out fees and deposits paid now?
- Which methods are trusted?
- What evidence or receipt is expected?
- What scams occur around deposits or payment requests?
- Would platform payment increase confidence?
- Who should handle refunds after a dispute?
- Would users pay before meeting a provider?

### Providers

- Which payment methods are accepted?
- How are receipts and reconciliation handled?
- How often do customer names/numbers differ from payer details?
- What fees and settlement delays are acceptable?
- Would providers pay subscriptions monthly, annually or per lead?
- What happens when mobile-money service is unavailable?
- Is cash still necessary?

## Provider evaluation criteria

For each approved candidate collect current official/commercial evidence for:

- Bank of Zambia authorization/status;
- supported mobile-money networks and banks;
- collections and disbursements;
- webhooks and transaction verification;
- idempotency support;
- settlement schedule;
- refund/reversal process;
- fees and taxes;
- KYC/business onboarding;
- sandbox availability;
- reconciliation reports;
- uptime/support;
- data protection and cross-border processing;
- prohibited business models;
- dispute and chargeback rules.

## Commercial separation rule

Research copy must repeatedly test:

- paying for a plan does not produce verification;
- promoted listings are labelled;
- payment status does not alter trust score;
- failed subscription may affect commercial visibility/entitlements, not historical verification facts;
- verification fees cover the process, not a guaranteed approval.

## Data-minimization rules

- do not store mobile-money PINs or credentials;
- tokenize/provider-host payment data where possible;
- do not expose payer details to unrelated parties;
- record transaction references only when operationally necessary;
- avoid copying payment screenshots into support cases;
- separate billing records from trust decisions;
- audit refunds and manual overrides.

## Phase 1A outputs

- preferred contact-channel findings by segment;
- structured-enquiry acceptance;
- MVP messaging recommendation;
- OTP and account-recovery constraints;
- provider subscription payment preferences;
- customer-payment scope recommendation;
- payment-provider selection criteria;
- official regulatory questions;
- fraud and dispute scenarios;
- decisions explicitly deferred to later phases.