# DIREKT Phase 1A Research Index

**Phase:** 1A — Zambia discovery and assumptions validation  
**Status:** Active  
**Implementation branch:** `build/android-v1`  
**Product-code gate:** Closed until `PHASE_1A_EXIT_REVIEW.md` is approved

## Purpose

This directory is the authoritative evidence workspace for decisions that must be validated in Zambia before DIREKT commits to Android implementation details, verification operations, pilot scope, provider categories, payments, communications or permanent package identifiers.

Desk research can identify questions and candidate authorities. It cannot replace interviews, observation, document inspection, legal review or field testing.

## Mandatory reading order

1. [`RESEARCH_PLAN.md`](RESEARCH_PLAN.md)
2. [`RESEARCH_ETHICS_AND_CONSENT.md`](RESEARCH_ETHICS_AND_CONSENT.md)
3. [`ASSUMPTIONS_REGISTER.md`](ASSUMPTIONS_REGISTER.md)
4. [`FIELDWORK_EXECUTION_CHECKLIST.md`](FIELDWORK_EXECUTION_CHECKLIST.md)
5. the relevant interview or observation guide
6. [`RESEARCH_LOG.md`](RESEARCH_LOG.md)
7. the topic-specific findings documents
8. [`PHASE_1A_EXIT_REVIEW.md`](PHASE_1A_EXIT_REVIEW.md)

## Research instruments

| Document | Use |
|---|---|
| [`CUSTOMER_INTERVIEW_GUIDE.md`](CUSTOMER_INTERVIEW_GUIDE.md) | Understand how customers find, assess, contact and complain about providers |
| [`PROVIDER_INTERVIEW_GUIDE.md`](PROVIDER_INTERVIEW_GUIDE.md) | Understand provider operating models, evidence, devices, costs and incentives |
| [`VERIFICATION_OPERATIONS_INTERVIEW_GUIDE.md`](VERIFICATION_OPERATIONS_INTERVIEW_GUIDE.md) | Test whether identity, qualification, premises and field checks are operationally feasible |
| [`FIELD_OBSERVATION_GUIDE.md`](FIELD_OBSERVATION_GUIDE.md) | Observe location description, connectivity, provider discovery and evidence handling in context |
| [`INTERVIEW_NOTE_TEMPLATE.md`](INTERVIEW_NOTE_TEMPLATE.md) | Record coded, non-identifying research notes consistently |

## Decision and evidence documents

| Document | Decision controlled |
|---|---|
| [`ASSUMPTIONS_REGISTER.md`](ASSUMPTIONS_REGISTER.md) | Which assumptions are untested, supported, rejected or deferred |
| [`PILOT_AREA_DECISION.md`](PILOT_AREA_DECISION.md) | Where the controlled pilot should operate |
| [`PILOT_CATEGORY_DECISION.md`](PILOT_CATEGORY_DECISION.md) | Which service categories enter the first pilot |
| [`CATEGORY_EVIDENCE_MATRIX.md`](CATEGORY_EVIDENCE_MATRIX.md) | What DIREKT may request and verify by category |
| [`TECHNOLOGY_AND_CONNECTIVITY_RESEARCH.md`](TECHNOLOGY_AND_CONNECTIVITY_RESEARCH.md) | Device, Android SDK, data, offline and performance constraints |
| [`LOCATION_AND_ADDRESSING_RESEARCH.md`](LOCATION_AND_ADDRESSING_RESEARCH.md) | Public service areas, landmarks, pins, premises evidence and privacy |
| [`PAYMENTS_AND_COMMUNICATION_RESEARCH.md`](PAYMENTS_AND_COMMUNICATION_RESEARCH.md) | Contact, OTP, WhatsApp/SMS/call and mobile-money requirements |
| [`LEGAL_AND_REGULATORY_RESEARCH.md`](LEGAL_AND_REGULATORY_RESEARCH.md) | Legal questions requiring current official sources and qualified Zambian review |
| [`DESK_RESEARCH_REGISTER.md`](DESK_RESEARCH_REGISTER.md) | Source-level record of preliminary official desk research |
| [`RESEARCH_LOG.md`](RESEARCH_LOG.md) | Chronological evidence and activity record |
| [`PHASE_1A_EXIT_REVIEW.md`](PHASE_1A_EXIT_REVIEW.md) | Formal gate into Phase 1B and later Android scaffolding |

## Evidence classification

Every claim must use one of these labels:

- **FIELD-OBSERVED** — directly observed in the target operating context;
- **PARTICIPANT-REPORTED** — reported by a coded participant;
- **DOCUMENT-INSPECTED** — based on an inspected example document;
- **OFFICIAL-SOURCE** — supported by a current official authority source;
- **LEGAL-REVIEWED** — confirmed by qualified Zambian legal counsel;
- **PROVISIONAL** — plausible but not yet validated;
- **REJECTED** — contradicted by evidence;
- **DEFERRED** — intentionally unresolved for a later phase.

Do not convert `PROVISIONAL` into an approved product rule merely because several web sources repeat it.

## Privacy rules

- Use participant IDs such as `CUS-LSK-001`; do not commit participant names, phone numbers or exact addresses.
- Do not commit real identity documents, certificates, licence numbers, private coordinates, recordings or consent forms.
- Store sensitive source material only in an approved private research system.
- Public repository notes must be anonymized, minimized and synthetic where examples are needed.
- Any evidence involving children or vulnerable participants requires a separate approved protocol and is out of scope for Phase 1A.

## Exit condition

Phase 1A is not complete merely because these documents exist. Completion requires real evidence, resolved critical assumptions, approved pilot boundaries, a workable verification model and a signed exit review.