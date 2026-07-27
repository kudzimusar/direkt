# Phase 11 Wave 0 Official-Source Evidence

**As of:** 2026-07-28 (Asia/Tokyo)  
**Authority level:** OFFICIAL-SOURCE RESEARCH ONLY  
**Decision effect:** does not close regulator, counsel, owner or participant gates

## Purpose

This record refreshes the current official-source position needed to prepare DIREKT's Zambia controlled pilot. It is evidence of what the cited public authorities currently publish; it is not an entity-specific registration outcome, transfer/storage authorization, legal opinion or permission to process participant data.

## Zambia Data Protection Commission

### Registration is a live mandatory process

The DPC registration page provides online and manual controller/processor registration, forms, guidance, compliance self-assessment and registration-fee information:

- https://www.dataprotection.gov.zm/registration/
- https://registration.dataprotection.gov.zm/
- https://www.dataprotection.gov.zm/resources/

The DPC FAQ states that registration is mandatory for controllers and processors that process personal data, including entities not established in Zambia when they process personal data of people in Zambia. It describes electronic application, payment, a registration certificate and renewal:

- https://www.dataprotection.gov.zm/faq/

**Wave 0 conclusion:** P11-G01 remains OPEN until DIREKT supplies the actual application reference and the official controller/processor registration outcome applicable to the exact entity and pilot activity.

### Overseas transfer and storage need separate authorization

The current DPC registration portal asks whether personal data will be transferred outside Zambia and whether it will be stored outside Zambia. For each affirmative answer, the portal states that a separate authorization is required:

- https://registration.dataprotection.gov.zm/

DIREKT's proposed topology includes services outside Zambia unless a separately approved in-country topology replaces them. A generic DPC web statement does not establish that authorization has been granted to DIREKT.

**Wave 0 conclusion:** P11-G02 remains OPEN until an official or qualified determination and any required transfer and storage authorization are supplied for the exact Supabase, Google Cloud and Firebase topology.

### Governing legislation

The National Assembly publishes the Data Protection Act, 2021, Act No. 3 of 2021, describing regulation of collection, use, transmission, storage and processing of personal data, controller registration, controller/processor duties and data-subject rights:

- https://www.parliament.gov.zm/node/8853

DPC resources include registration/licensing regulations, registration guidance, terms and conditions, breach guidance, records-of-processing guidance, forms and a controller/processor code of conduct:

- https://www.dataprotection.gov.zm/resources/

**Wave 0 conclusion:** P11-G03, P11-G05 and P11-G06 remain OPEN. The official materials define the compliance domain but do not approve DIREKT's exact notice, legal basis, retention, rights, withdrawal, deletion or processor/controller allocations.

### Published fee discrepancy requires direct confirmation

The DPC registration page and DPC FAQ currently display different registration-fee figures. DIREKT must not select or pay a fee based on an agent's interpretation. The authoritative fee for the actual applicant category must come from the DPC application/invoice or direct written confirmation.

**Wave 0 conclusion:** fee ambiguity does not affect the technical design, but the owner must preserve the official invoice/reference as part of P11-G01 evidence.

## Zambia consumer and marketplace protection

The Competition and Consumer Protection Commission identifies consumer protection, complaint handling, unfair-trading investigations and consumer education as part of its statutory mandate. It publishes its legal framework and complaint channels:

- https://www.ccpc.org.zm/
- https://www.ccpc.org.zm/legalframework
- https://ccpc.org.zm/public/condetails

These sources do not approve DIREKT's marketplace terms, trust-language limitations, provider obligations, complaint handling or redress design.

**Wave 0 conclusion:** P11-G04 remains OPEN until qualified Zambia consumer/marketplace review signs off the exact participant/provider terms, trust limitations, complaints and redress process.

## Firebase phone authentication

Firebase's current Android phone-authentication documentation requires the Phone provider to be enabled, an SMS region allow/deny policy to be configured, and app verification to be supported. New projects default to allowing no SMS regions. Android phone auth uses Play Integrity where available and reCAPTCHA fallback where required; the relevant SHA fingerprints and fallback behavior must be configured and tested:

- https://firebase.google.com/docs/auth/android/phone-auth
- https://firebase.google.com/docs/android/play-data-disclosure

DIREKT's source remains fail-closed and does not itself prove console settings, Zambia SMS enablement, quota/abuse controls, app fingerprints or a real authorized canary.

**Wave 0 conclusion:** P11-G08 and P11-G09 remain OPEN until the approved Firebase console configuration and managed real-environment canary evidence are supplied.

## Authority boundary

This file may support counsel, regulator and owner submissions. It may not be used to:

- set `PILOT_ENTRY_APPROVED=true`;
- invite or process participants;
- mark P11-G01 through P11-G11 closed;
- claim that DIREKT has received a certificate, authorization or legal opinion;
- relabel synthetic, sandbox or managed-canary evidence as PRIMARY-PILOT evidence.
