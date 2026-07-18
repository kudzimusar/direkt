# Zambia Legal and Privacy Entry Research — 2026-07-19

**Status:** OFFICIAL-SOURCE RESEARCH REFRESH — NOT QUALIFIED LEGAL ADVICE OR SIGN-OFF  
**Purpose:** Convert current official-source findings into explicit Phase 11 entry questions and stop gates.

## Determination

The repository is technically ready for Phase 11 entry preparation, but current official-source research does not authorize real participant processing.

DIREKT still requires qualified Zambia advice and applicant-specific approvals before a real controlled pilot. This document records research questions and technical consequences only.

## Data protection and registration

The Zambia Data Protection Commission publishes registration processes for data controllers and processors. Its current registration portal requests, among other things:

- categories of data subjects and personal data;
- purpose and basis of processing;
- sensitive-data processing;
- recipients within Zambia;
- whether data will be transferred outside Zambia;
- risks and mitigations;
- processing/data-flow documentation;
- joint-controller details;
- Data Protection Officer information;
- whether personal data will be stored outside Zambia.

The portal states that separate authorization is required when personal data is transferred or stored outside Zambia.

Official sources:

- https://www.dataprotection.gov.zm/registration/
- https://registration.dataprotection.gov.zm/

### DIREKT consequence

The current protected development topology records Supabase in `ap-northeast-1` and Google Cloud in `asia-northeast1`, outside Zambia. Therefore real participant processing cannot begin merely by changing `DIREKT_DATA_MODE` to `controlled-pilot`.

Before real data:

- [ ] identify the legal applicant/controller and any processors/joint controllers;
- [ ] obtain qualified advice on controller/processor registration requirements;
- [ ] resolve required authorization for overseas storage and transfer for the exact services used;
- [ ] document vendor/sub-processor locations and authority-access terms;
- [ ] approve the lawful basis for each processing activity;
- [ ] approve Data Protection Officer responsibility where applicable;
- [ ] approve data-subject rights intake, deletion, objection/restriction and complaint procedures;
- [ ] record the approval evidence privately and reference only non-sensitive decision metadata in GitHub.

**Stop gate:** no real identity, evidence, contact, precise-location, complaint or participant-linkage data until the applicable registration/transfer/storage/legal approvals are evidenced.

## Pilot privacy notice and consent

Existing repository consent controls are implementation scaffolding, not counsel-approved pilot terms.

Before recruitment:

- [ ] approve a participant-facing privacy notice with controller identity/contact details;
- [ ] define specific consent activities rather than one blanket consent;
- [ ] define the versioning rule for notices and consent language;
- [ ] define withdrawal channels and identity/research-code verification;
- [ ] define what withdrawal can delete immediately and what may remain under an approved legal/safety/fraud hold;
- [ ] define processor/vendor propagation and backup expiry behavior;
- [ ] define permitted research quotations/aggregate reporting and re-identification review;
- [ ] define whether participant compensation is used and ensure it is not conditional on positive feedback or provider approval.

The Phase 1 research protocol remains a useful safety baseline but is not a substitute for the Phase 11 participant agreement and legal review.

## Consumer and marketplace protection

The Competition and Consumer Protection Commission is the relevant public consumer-protection authority. DIREKT’s marketplace positioning creates specific review questions around:

- provider-independence and trust wording;
- misleading or blanket verification claims;
- subscription price/cancellation disclosures;
- sponsored/ranking transparency if introduced;
- complaint/redress paths;
- refunds and service limitations where applicable;
- collection of unnecessary personal information;
- unfair terms or pressure during recruitment.

Official source:

- https://www.ccpc.org.zm/

### DIREKT consequence

Before a public or paid pilot:

- [ ] qualified review of trust/limitation wording;
- [ ] participant/provider terms and complaint process approved;
- [ ] commercial pricing/cancellation/refund wording approved where applicable;
- [ ] public copy remains limited to evidence-backed check-specific claims.

**Stop gate:** no unrestricted public marketplace or commercial launch while these terms remain unresolved.

## Payments

The Bank of Zambia states that persons intending to conduct payment business require designation under the National Payment Systems framework and that payment-system services should be offered by duly licensed institutions.

Official source:

- https://www.boz.zm/payment-systems/designation-of-payment-systems

### DIREKT consequence

Phase 11 may research willingness to pay without moving real money. Before payment activation:

- [ ] classify DIREKT’s exact proposed funds flow with qualified advice;
- [ ] select an approved/licensed payment provider and product;
- [ ] complete merchant/KYC/onboarding and production access;
- [ ] define settlement, refunds, reversals, reconciliation and safeguarding responsibilities;
- [ ] define AML/KYC/sanctions responsibilities where applicable;
- [ ] approve tax/invoicing treatment.

**Technical gate:** keep `PAYMENT_PROVIDER_MODE=disabled` for real pilot/production paths until approval. Payment must never alter trust or verification state.

## Tax, entity and invoicing

The repository still has no approved launch entity, TPIN/tax determination, VAT/turnover-tax determination or Smart Invoice decision for production billing.

Official sources for qualified follow-up:

- https://www.pacra.org.zm/
- https://www.zra.org.zm/

**Stop gate:** synthetic invoice/receipt artifacts remain non-tax artifacts; no production billing until the entity/tax/invoicing position is approved.

## External processors and provider approvals

For every external service that will receive real pilot data, record before activation:

- legal entity and service/product;
- controller/processor/sub-processor role;
- data categories and purposes;
- hosting/support locations;
- Zambia transfer/storage authorization evidence where applicable;
- DPA/security terms and incident notification;
- retention/deletion/backup behavior;
- government/authority request handling;
- quota/cost/abuse controls;
- operational owner and kill switch.

This applies to Supabase, Google Cloud, Maps/location services, Sentry/error monitoring, OTP/communications, registry/authority integrations and payment providers according to the data they actually receive.

## Required qualified decisions before real Phase 11 entry

| Decision | Current state | Entry consequence |
|---|---|---|
| Legal controller/applicant | unresolved | BLOCK |
| DPC controller/processor registration applicability/evidence | unresolved | BLOCK |
| Overseas storage/transfer authorization | unresolved for exact topology | BLOCK |
| Pilot privacy notice/participant terms | not approved | BLOCK |
| Consent/withdrawal/retention periods | technical baseline only | BLOCK |
| Consumer/marketplace terms | not signed off | BLOCK for public/paid pilot |
| Maps real-data/provider terms | runtime integration not proven in current source | BLOCK until reconciled/approved |
| Error-monitoring processor/privacy controls | runtime integration not present in current source | BLOCK until reconciled/approved |
| OTP/communications | unapproved/disabled | BLOCK real delivery |
| Registry automation | manual/unapproved | BLOCK automated access |
| Payment classification/provider | unresolved/disabled | BLOCK real money |
| Entity/tax/invoicing | unresolved | BLOCK production billing |

## Engineering rule

Do not convert an official-source research finding into a legal conclusion in code or product copy. The code may enforce a conservative stop gate; removing that gate requires recorded approval evidence and normal change control.
