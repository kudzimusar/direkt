# Phase 10 External Provider, Authority and Legal Approval Register

**Verified:** 2026-07-17  
**Status:** Research and approval register only. No provider integration, credential, deployment or pilot is authorized.  
**Governing issue:** #41

## Purpose

This register separates current official evidence from assumptions and records the written approvals DIREKT still needs before processing real Zambia data, activating external communications/maps/payments or beginning a controlled pilot.

A public product page or developer sandbox is not an approved production contract. Each activation requires the named owner, current provider/legal terms, security review, data-processing terms, operational ownership and permanent integration tests.

## Data protection and cross-border processing

### Current official evidence

- Zambia's Data Protection Commission identifies the Data Protection Act No. 3 of 2021 and registration/licensing regulations as the governing framework.
- The DPC operates registration for data controllers and processors and publishes registration, records-of-processing, security-breach, training and code-of-conduct guidance.
- The official registration workflow asks controllers to declare databases, data subjects, information processed, purposes, lawful basis, sensitive processing, recipients, identified risks and mitigations.
- The official workflow states that separate authorization is needed where personal data is stored or transferred outside Zambia.

### DIREKT status

**Blocked before real processing.** DIREKT has not recorded a DPC registration certificate, cross-border storage/transfer authorization, approved data-protection officer arrangement or counsel-confirmed controller/processor allocation.

### Required evidence

- legal entity and operating address;
- controller and processor registration determination;
- completed records of processing activities;
- database/application inventory and data-flow diagram;
- documented lawful basis per processing purpose;
- sensitive-data assessment for identity/evidence/location;
- cross-border storage and transfer determination for Japan/global cloud services;
- vendor data-processing agreements;
- data-subject rights, retention, deletion, correction and export procedure;
- breach notification and incident ownership;
- counsel and DPC sign-off record.

### Official sources

- https://www.dataprotection.gov.zm/
- https://www.dataprotection.gov.zm/registration/
- https://registration.dataprotection.gov.zm/
- https://www.dataprotection.gov.zm/resources/
- https://www.zicta.zm/resources/legislation

## Electronic transactions, ICT and cybersecurity

### Current official evidence

ZICTA identifies the Electronic Communications and Transactions Act No. 4 of 2021 and Cyber Security and Cyber Crimes Act No. 2 of 2021 among the laws informing Zambia's digital environment.

### DIREKT status

**Legal review required.** Electronic terms acceptance, records, notices, signatures, communications consent, cyber-incident duties and marketplace obligations have not received qualified Zambia sign-off.

### Required evidence

- enforceable customer/provider electronic terms and acceptance evidence;
- electronic notice, record and signature requirements;
- consent and sender-identity requirements for OTP, SMS, email, WhatsApp and push;
- cyber-incident, preservation and authority-contact obligations;
- age/capacity and representative-authority requirements;
- DPA/ZICTA responsibility matrix.

### Official source

- https://www.zicta.zm/resources/legislation

## Consumer and marketplace protection

### Current official evidence

The Competition and Consumer Protection Commission has publicly warned online businesses and consumers about non-delivery, false claims, hidden or increasing costs, unrelated personal-information requests, unfair terms and missing seller contact/address information.

### DIREKT status

**Blocked before public marketplace use.** Pricing, recurring subscription disclosure, cancellation, provider independence, verified-claim wording, complaint handling, refund boundaries, sponsored placement and limitation-of-liability wording require counsel and consumer-compliance review.

### Required evidence

- total price, tax/fee and recurring-renewal disclosure;
- cancellation and cooling-off determination;
- complaints, redress, refund and provider-dispute procedure;
- verified-claim and directory/intermediary wording review;
- sponsored/non-ranking commercial feature disclosure;
- provider identity/contact and electronic receipt requirements;
- unfair-term and disclaimer review;
- complaint records and CCPC escalation ownership.

### Official source

- https://www.ccpc.org.zm/

## Payment regulation and Bank of Zambia

### Current official evidence

- Bank of Zambia states that a person intending to conduct payment business requires designation under the National Payment Systems Act framework.
- Bank of Zambia maintains designation requirements and a current registered-financial-institutions/payment-systems directory.
- The directory should be checked at contracting time; DIREKT must not infer designation from a provider brand or developer portal.

### DIREKT status

**Production payment mode remains disabled.** DIREKT has not determined whether its intended model is only a merchant receiving payment through a designated provider or constitutes payment-system business requiring its own designation/participation approval.

### Required evidence

- counsel and Bank of Zambia classification of DIREKT's exact money flow;
- proof that the contracted provider and product are currently designated/licensed for the proposed service;
- merchant/KYC/account onboarding requirements;
- funds flow, safeguarding and settlement ownership;
- currency, limits, fees, taxes and reconciliation files;
- webhook signing, retries, idempotency and event-retention terms;
- refund, reversal, failed-payment and dispute procedures;
- outage, support, incident and termination obligations;
- AML/KYC/sanctions responsibility matrix;
- production data-processing and security terms.

### Official sources

- https://www.boz.zm/payment-systems/designation-of-payment-systems
- https://www.boz.zm/financial-stability/registered-financial-institutions

## MTN MoMo

### Current public evidence

- MTN's MoMo developer portal documents collection/request-payment, refund, notification, subscription, status, balance and disbursement product concepts in a test environment.
- MTN Zambia publishes MoMo terms with merchant/corporate KYC, due-diligence and contract requirements and identifies MTN Business contact channels.

### DIREKT status

**Candidate only; not approved.** The public developer portal does not establish Zambia production availability, DIREKT merchant acceptance, pricing, settlement, webhook profile or data-processing terms.

### Required written confirmation

- Zambia product/API availability and production onboarding path;
- contracting entity and current Bank of Zambia status;
- sandbox/production endpoint and credential management;
- merchant KYC, enhanced due diligence and permitted use;
- collections, refunds/reversals and settlement support;
- signing/key-rotation and replay semantics;
- fees, limits, settlement timing and reconciliation reports;
- privacy, retention, sub-processors and incident notice;
- support, SLA, outage and termination terms.

### Public sources

- https://momoapi.mtn.com/
- https://www.mtn.zm/terms-conditions/
- https://www.mtn.zm/business-home/

## Airtel Money

### Current public evidence

Airtel Zambia publicly offers business cash collection/paybill and bulk-payment capabilities and describes merchant collection into Airtel Money accounts with transfer to bank accounts. Public customer/agent terms show KYC and contractual requirements.

### DIREKT status

**Candidate only; not approved.** No current public Zambia API contract, production signing specification, DIREKT merchant approval or settlement/reconciliation agreement has been recorded.

### Required written confirmation

The same production, designation, KYC, collections/refund, signing, settlement, fee/limit, reconciliation, privacy, incident and support evidence required for MTN must be obtained directly from Airtel Money.

### Public sources

- https://www.airtel.co.zm/airte_money_busines
- https://enterprise.airtel.co.zm/
- https://www.airtel.co.zm/airtelmoney/about_airtelmoney
- https://www.airtel.co.zm/airtelmoney/howItWork

## OTP and communications provider

### Current status

**Unselected and blocked.** Airtel and MTN offer business communications channels, but DIREKT has no approved OTP/SMS/CPaaS/WhatsApp provider, sender identity, template approval, delivery contract or consent/opt-out implementation.

### Required evidence

- Zambia destination coverage and sender-ID rules;
- OTP and transactional-message permitted use;
- pricing, quotas, retries, delivery receipts and anti-fraud controls;
- data location, retention, sub-processors and DPA;
- consent-at-send, opt-out/suppression and prohibited-content terms;
- credential rotation, IP allowlist/signing and kill switch;
- incident/SLA/support ownership;
- low-connectivity and device validation.

## Map and location provider

### Current status

**Unselected and blocked.** The product retains manual area/landmark/Plus Code inputs and a synthetic map abstraction. No map credential, production geocoder, exact-price/quota agreement or location-processing DPA is approved.

### Required evidence

- Zambia map/geocoding coverage and attribution terms;
- licence for storage/caching/display of coordinates and derived addresses;
- cost, quota, abuse and outage limits;
- private-location and service-area minimization;
- cross-border data-processing terms;
- manual/offline fallback;
- no mobile-provider ranking from private base coordinates.

## Registry and verification authorities

### Current status

PACRA, NCC, TEVETA and category-specific authorities remain candidate evidence sources only. Public lookup availability does not establish lawful automated access, matching reliability, display rights or permission to reproduce certificates, logos or status.

### Required evidence per source

- authority and dataset owner;
- lawful access method and current terms;
- API, manual lookup or written verification channel;
- fields, update frequency, expiry and revocation behavior;
- identity/entity matching reliability and correction process;
- display/reproduction restrictions;
- fees, quotas, attribution and audit requirements;
- privacy and retention limits;
- outage and dispute procedure.

## Tax, invoices and accounting

### Current status

**Qualified Zambia tax/accounting review required.** Phase 9 invoices and receipts are synthetic accounting contracts, not tax invoices or evidence of VAT compliance.

### Required evidence

- DIREKT legal entity, tax registration and TPIN;
- VAT/turnover-tax determination;
- subscription/service supply and place-of-supply treatment;
- invoice/receipt content and numbering requirements;
- fees versus pass-through collections;
- withholding and provider payout treatment;
- record retention and audit requirements;
- refund/credit-note treatment;
- cross-border company/hosting/payment implications.

## Approval status summary

| Area | Technical contract | Current external evidence | Activation status |
|---|---|---|---|
| Data protection | data inventory, minimization and private boundaries exist | DPC framework and registration process verified | Blocked pending registration/cross-border/legal evidence |
| Electronic transactions | policy versions/audit exist | governing ZICTA legislation identified | Blocked pending counsel and terms review |
| Consumer protection | bounded pricing/accountability architecture exists | CCPC online-marketplace risks identified | Blocked pending compliance review |
| Payment regulation | synthetic adapter, ledger and reconciliation exist | BoZ designation framework verified | Disabled pending classification/provider approval |
| MTN MoMo | provider port compatible in principle | public API concepts and Zambia merchant terms found | Candidate only |
| Airtel Money | provider port compatible in principle | business collection/paybill capability found | Candidate only |
| OTP/communications | synthetic/disabled delivery boundaries exist | business channels exist | Unselected/blocked |
| Maps/location | synthetic/manual fallback exists | no provider selected | Unselected/blocked |
| Authorities | evidence-source model exists | candidate authorities identified | Access unapproved |
| Tax/accounting | immutable synthetic invoice/ledger exists | no qualified determination | Blocked |

## Owner follow-up package

Before any production-provider decision, the DIREKT owner must provide or authorize:

1. legal entity and Zambia operating model;
2. qualified Zambia counsel and tax/accounting contacts;
3. DPC registration/cross-border-storage engagement;
4. written MTN/Airtel or alternative-provider commercial/API proposals;
5. proposed money flow and whether DIREKT ever receives, holds or pays out funds;
6. proposed map and OTP/communications vendors;
7. authority contacts or lawful-access documents for each launch category;
8. operations owners for privacy, security, verification, complaints, finance, reconciliation and incident response.

Until this package is reviewed and recorded, external adapters remain disabled and Phase 11 may use synthetic or separately consented/private validation only under its own entry criteria.
