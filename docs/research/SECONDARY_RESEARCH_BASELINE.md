# DIREKT Zambia Secondary Research Baseline

**Status:** Approved provisional baseline for Phase 1B design  
**Prepared:** 2026-07-14  
**Evidence type:** `OFFICIAL-SOURCE`, `CREDIBLE-SECONDARY`, and explicitly marked `PROVISIONAL` inference  
**Restriction:** This document authorizes design and technical planning. It does not claim that real customers or providers have validated the product.

## 1. Why this baseline exists

Primary field interviews are not currently practical for the project owner. Waiting indefinitely would make research process a programme blocker without improving the product. DIREKT will therefore proceed using current public evidence, authoritative institutional sources, conservative product assumptions and synthetic usability testing.

The evidence hierarchy is:

1. current Zambian authority or regulator source;
2. official provider or platform source;
3. census or recognized public dataset;
4. peer-reviewed or clearly identified secondary research;
5. reasoned product inference marked `PROVISIONAL`.

Primary Zambia interviews and real operational observation remain required before a controlled public pilot, but they are no longer prerequisites for Phase 1B design or Phase 2 technical scaffolding.

## 2. Evidence-backed context

### 2.1 Pilot geography

The 2022 census reports Zambia's population at approximately 19.6 million. Lusaka Province is the country's most populous province, and Lusaka District has the highest population concentration. This provides the strongest publicly evidenced starting point for a marketplace that needs enough nearby provider supply and customer demand within a bounded service area.

**Provisional decision:**

- Phase 1B and technical seed data will use **Lusaka District** as the default market context.
- The eventual controlled pilot will launch in selected Lusaka neighbourhoods rather than the whole district at once.
- The exact neighbourhood boundary remains a pilot-readiness decision based on provider recruitment, support capacity and map testing.

### 2.2 Business identity evidence

PACRA describes itself as Zambia's official registry for business entities, intellectual property and securities and provides a public business-search tool.

**Product implication:**

- DIREKT may check a submitted business name or registration record against PACRA when the provider claims to be a registered entity.
- PACRA registration proves legal registration status only. It does not prove skill, safety, current location or workmanship.
- Informal individual providers are not automatically excluded. Their profiles must clearly state that no registered-business claim was verified.

### 2.3 Construction and trade evidence

The National Council for Construction states that it regulates the construction industry and registers contractors, suppliers and manufacturers. TEVETA states that it regulates technical, vocational and entrepreneurship training and exposes certification and accreditation systems.

**Product implication:**

- NCC can be treated as a candidate source for relevant contractor or construction-enterprise claims.
- TEVETA can be treated as a candidate source for training, qualification or institution-related claims.
- Neither source should be queried or integrated automatically until legal access, data reliability, commercial terms and matching rules are confirmed.
- A provider may have valid experience without a registry record. DIREKT must distinguish `qualification verified`, `business registration verified`, `experience evidence reviewed` and `not checked`.

### 2.4 Mobile-first delivery

ZICTA is the national ICT-sector regulator. Public research on Zambia identifies mobile phones as a central channel for communication and financial transactions while also warning that published coverage does not always match real rural access. Android remains the dominant global smartphone operating system and is the owner's explicit Version 1 strategy.

**Product implication:**

- Native Android remains the correct primary client.
- The application must be usable under intermittent connectivity and constrained data budgets.
- All critical forms require local draft persistence.
- Uploads require compression, retry and recoverable failure states.
- Discovery must work without granting precise-location permission.
- Pages prototypes must test compact screens and low-bandwidth states rather than idealized premium-device layouts.

### 2.5 Location and addressing

Google's Plus Codes are free, open-source digital addresses based on latitude and longitude. They are designed for places without conventional street addresses and can be used offline.

**Provisional location model:**

- Search input supports area, neighbourhood, landmark, map pin and Plus Code.
- Providers declare an operating model: `fixed premises`, `mobile`, or `hybrid`.
- Public profiles expose service area and an intentionally reduced location precision.
- Exact home or private operating coordinates remain private evidence.
- A premises pin may be public only when the provider explicitly operates a customer-facing location and consents to publication.
- Manual area selection is always available.

### 2.6 Mobile money and communication

MTN Zambia publicly offers MoMo for transfers and purchases by phone and states that it is available across Zambia cellphone numbers. Airtel Zambia also operates Airtel Money. These services establish that mobile-money adapters are commercially relevant, but do not by themselves establish which integration should be selected.

**Provisional MVP payment decision:**

- No customer-to-provider service payment or escrow is required for the first functional MVP.
- Phase 9 will implement provider subscriptions through a payment-adapter boundary.
- MTN MoMo and Airtel Money are candidate adapters; neither is approved for integration until current API, merchant, settlement, reconciliation, support and legal terms are reviewed.
- Payment status can never create or improve a verification claim.

**Provisional communication decision:**

- A customer first creates a tracked enquiry in DIREKT.
- After consent, the app may hand off to phone call or WhatsApp.
- Full in-app chat is deferred unless prototype or pilot evidence shows it is essential.
- Sensitive evidence is never sent through ordinary messaging channels by the platform.

### 2.7 Fraud and safety context

Published Zambian research describes mobile-phone social-engineering risks including phishing, smishing and vishing. Public reporting has also documented large cyber-fraud operations in Lusaka.

**Product implication:**

- Verification status must be explained at claim level rather than through a blanket badge.
- Contact changes, phone changes and ownership changes require re-verification.
- Staff overrides and evidence decisions require an audit trail.
- Users receive warnings that verification does not guarantee future conduct or quality.
- The platform must not expose identity documents or exact private locations.

## 3. Provisional pilot baseline

### 3.1 Area

**Default:** Lusaka District, with a later narrow neighbourhood launch boundary.

Rationale:

- strongest population concentration;
- largest likely pool of customers and providers;
- proximity to PACRA, NCC, TEVETA and other national institutions;
- lower initial field-operation cost than a dispersed multi-city pilot;
- practical environment for testing fixed, mobile and hybrid providers.

### 3.2 Initial provider categories

The initial design and seed-data categories are:

1. **Plumbing and water repairs**
2. **Electrical installation and repairs**
3. **Motor-vehicle mechanics**
4. **Appliance and electronics repair**

These categories are selected because they represent frequent local discovery needs, include urgent and planned work, cover fixed/mobile/hybrid operations and allow the trust model to be tested across both formal and informal evidence patterns.

Excluded from Version 1 pilot until stronger governance exists:

- medical and health treatment;
- legal representation;
- private security and weapons-related services;
- lending and financial advice;
- childcare and unsupervised vulnerable-person care;
- structural engineering sign-off;
- passenger transport;
- any service requiring a regulator integration that has not been approved.

### 3.3 Provider participation pathway

A provider can participate through one of three evidence pathways:

- **Registered business:** identity + contact + PACRA claim + location/operating model + category evidence.
- **Qualified individual:** identity + contact + qualification/certification claim + location/operating model + category evidence.
- **Experienced informal provider:** identity + contact + location/operating model + work evidence/references; the profile clearly shows that no business-registration or formal-qualification claim was verified.

A provider is never represented as generally `safe` or `fully verified`.

## 4. Provisional trust claims for the prototype

The Phase 1B prototype must display separate cards for:

- Identity checked
- Phone number checked
- Business registration checked / not supplied / not applicable
- Qualification checked / not supplied / not applicable
- Operating location checked
- Customer-facing premises confirmed
- Field visit completed / not completed
- Evidence expiry date
- Reviews from tracked interactions
- Items DIREKT did not check

Each card must expose:

- status;
- scope;
- date checked;
- expiry or recheck date when applicable;
- concise explanation;
- limitations.

## 5. Provisional Android constraints

Phase 1B and Phase 2 must assume:

- portrait-first phones with small and medium screens;
- one-handed use and large touch targets;
- English-first content with localization-ready strings;
- future Nyanja and Bemba support without embedding copy in domain logic;
- low-memory and intermittent-network behaviour;
- compressed images and explicit upload sizes;
- cached provider summaries;
- no-location-permission fallback;
- background retry through WorkManager;
- accessible contrast and scalable text;
- no requirement for an always-on map.

The final minimum Android SDK and current Google Play target API will be confirmed during Phase 2 using current official Android and Play requirements. They do not block Phase 1B.

## 6. Assumptions accepted for design

The following assumptions are sufficiently supported to design against, while remaining revisable:

- Lusaka is the default initial market context.
- Android is the Version 1 client.
- Provider discovery requires list and map presentations.
- Area, landmark, pin and Plus Code location inputs are needed.
- Fixed, mobile and hybrid provider models must coexist.
- Formal registration cannot be mandatory for every provider.
- Trust must be check-specific.
- Phone/WhatsApp handoff after a tracked enquiry is adequate for the first MVP.
- Customer service payment and escrow are deferred.
- Provider subscriptions require a later mobile-money adapter.
- Offline drafts, retry and image compression are mandatory.

## 7. Assumptions deferred to prototype or pilot validation

- exact willingness to pay;
- preferred subscription amount and billing cycle;
- final mobile-money provider;
- final map SDK;
- final SMS/OTP provider;
- final minimum Android SDK;
- whether full chat is necessary;
- provider willingness to complete each evidence step;
- true cost and turnaround of field visits;
- public understanding of each trust phrase;
- category-specific authority access and document-verification rules;
- exact neighbourhood launch boundary.

These items do not prevent design or scaffolding. They prevent production claims, live integrations or pilot launch where applicable.

## 8. Validation moved to later gates

### Phase 1B

- synthetic usability testing of trust language and flows;
- remote colleague review through GitHub Pages;
- structured feedback that can be collected without real identity evidence.

### Phase 10

- legal, privacy and security review;
- current authority-access and data-use confirmation;
- payment and map-provider approval.

### Phase 11

- consenting Zambia pilot participants;
- real device and connectivity matrix;
- real provider evidence samples in private storage;
- field-verification timing and cost;
- customer trust comprehension;
- pricing and willingness-to-pay evidence.

No production launch can occur without those later validations.

## 9. Sources consulted

- Zambia Statistics Agency, 2022 Census of Population and Housing materials: `https://www.zamstats.gov.zm/`
- PACRA official site and business search: `https://www.pacra.org.zm/`
- National Council for Construction: `https://www.ncc.org.zm/`
- TEVETA Zambia: `https://www.teveta.org.zm/`
- ZICTA: `https://www.zicta.zm/`
- MTN Zambia MoMo: `https://www.mtn.zm/momo/`
- Airtel Money Zambia: `https://www.airtel.co.zm/airtelmoney/`
- Google Plus Codes: `https://maps.google.com/pluscodes/`
- van Stam, *Access to Digital Platforms: Can Mobile Network Coverage Reports be Relied Upon? Observations from Rural Zambia and Zimbabwe* (2021): `https://arxiv.org/abs/2108.10086`
- Zimba, Mukupa and Chama, *Emerging Mobile Phone-based Social Engineering Cyberattacks in the Zambian ICT Sector* (2022): `https://arxiv.org/abs/2212.13721`

## 10. Approval effect

This baseline authorizes:

- Phase 1B interaction design and synthetic prototype;
- provisional product and data modelling;
- preparation for Phase 2 technical scaffolding after the Phase 1B checkpoint.

It does not authorize:

- public provider onboarding;
- collection of real identity or qualification evidence;
- production regulator integrations;
- customer payments or escrow;
- live field-verification claims;
- public pilot or Play Store production release.
