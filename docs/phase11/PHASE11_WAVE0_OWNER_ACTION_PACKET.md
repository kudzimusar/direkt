# Phase 11 Wave 0 Owner Action Packet

**Current decision:** ENTRY_BLOCKED_EXTERNAL  
**Repository state:** technical preparation in progress; participant entry disabled  
**Governing issue:** #112

## Purpose

This packet contains only the serious actions that require the owner, a regulator, qualified Zambia counsel or protected provider consoles. Routine repository implementation and verification remain agent-owned.

## 1. Zambia DPC controller/processor registration

Submit the actual DIREKT entity/application through the DPC process and preserve:

- applicant/entity legal name and registration number;
- controller, processor or combined classification requested;
- DPC application/reference identifier;
- submitted data-flow/topology version;
- official invoice and proof of payment where applicable;
- official certificate, rejection, clarification request or other outcome;
- validity/renewal date and conditions.

Official starting points:

- https://www.dataprotection.gov.zm/registration/
- https://registration.dataprotection.gov.zm/

**Closes:** P11-G01 only after the actual official outcome is supplied and reviewed.

## 2. Overseas storage and transfer authorization

The DPC portal states that separate authorization is required when personal data is transferred or stored outside Zambia. Submit the exact approved topology, including:

- Supabase project and hosting region;
- Google Cloud services and regions;
- Firebase Authentication and related data flows;
- subprocessors and contractual roles;
- categories of data and data subjects;
- retention, deletion, encryption and access controls;
- data-flow diagram/version.

Preserve the official application/reference, determination, authorization, conditions and expiry.

**Closes:** P11-G02 only after entity/topology-specific evidence is supplied.

## 3. Qualified Zambia legal review

Give qualified Zambia counsel the exact repository packet and request a signed, scoped review covering:

- controller/processor and joint-controller roles;
- lawful bases and consent design;
- sensitive data and evidence handling;
- cross-border storage/transfer requirements;
- participant rights, access, correction, withdrawal and deletion;
- retention schedule and legal holds;
- provider/customer terms;
- verification and trust-claim limitations;
- complaints, moderation, redress and consumer-protection obligations;
- field activity and safety only if later enabled;
- whether the initial no-payment, no-external-communications, no-Maps, no-participant-telemetry design is acceptable.

The review must identify the exact document versions reviewed, unresolved questions and conditions.

**Closes:** P11-G03 and P11-G04 only after the signed review is supplied.

## 4. Approve the final participation notice and lifecycle schedule

After counsel review, approve an immutable `pilot_participation_notice` version with:

- effective date;
- controller identity and contacts;
- purposes, data categories and recipients;
- overseas storage/transfer disclosure;
- retention and deletion rules;
- withdrawal and complaint process;
- verification/trust limitations;
- communication, telemetry, Maps, AI and payment exclusions;
- version checksum.

Also approve the linked consent, retention, deletion and withdrawal operating schedule.

**Closes:** P11-G05 and P11-G06 after the exact approved artifacts are supplied and registered through the protected pilot process.

## 5. Sign the Wave 1 authorization

Record the exact operating decision:

- wave ID and dates;
- maximum and actual provider/customer counts, never above 8 and 20;
- Lusaka geography and exact neighbourhood boundary;
- allowed service categories;
- provider pathway allocation;
- recruitment method and invitation expiry;
- named pilot, privacy/security, support, incident and verification owners;
- support hours, escalation path and daily review time;
- numeric pause thresholds;
- confirmation that field claims, Maps, participant telemetry, external messaging, AI, payments and automated registry access remain disabled unless separately approved.

**Closes:** P11-G07 and supports P11-G13.

## 6. Configure Firebase Zambia phone authentication

In the protected Firebase console for the approved Android app:

- confirm project/app/package identifiers;
- register the exact approved SHA-256 and SHA-1 fingerprints;
- enable Phone Authentication only for the approved pilot project;
- allow Zambia in the SMS region policy and keep other regions denied unless justified;
- configure quotas, abuse monitoring and billing controls;
- confirm Play Integrity behavior;
- confirm reCAPTCHA fallback behavior for non-Play-distributed or unsupported devices;
- verify approved phone-number disclosure/notice language;
- preserve sanitized screenshots/exported settings and accountable-owner attestation.

Do not use real participant numbers for the first configuration proof.

**Closes:** P11-G08 after configuration evidence is supplied. P11-G09 still requires the separately authorized managed real-environment canary.

## 7. Supply protected environment and operations evidence

After P11-G01 through P11-G08 are closed, authorize a managed pre-participant canary lane for:

- invitation/auth/consent;
- private upload/read/revoke/delete;
- withdrawal/re-entry block/deletion/retention/audit;
- exact deployment revision, image digest, configuration receipt and migration checksums;
- support and incident rehearsal.

No real participant recruitment begins merely because these canaries pass.

**Closes:** P11-G09 through P11-G13 only through the later managed evidence lane.

## Evidence submission format

For each gate, provide:

```text
Gate ID:
Decision: CLOSED / NOT APPLICABLE / REMAINS OPEN
Evidence authority:
Evidence reference:
Evidence file SHA-256:
Exact scope/topology/document version:
Decision owner:
Decision date/time with timezone:
Conditions and expiry:
Independent reviewer where required:
```

Do not send regulator certificates, legal opinions, IDs, phone numbers, credentials or private participant material in public GitHub comments. Use the approved private evidence channel and record only sanitized references/hashes in the repository.

## Current stopping point

Until the required evidence above exists, the only truthful terminal decision is:

**ENTRY_BLOCKED_EXTERNAL**

`PILOT_ENTRY_APPROVED` stays false, PRIMARY-PILOT evidence stays empty and Phase 12 stays unauthorized.
