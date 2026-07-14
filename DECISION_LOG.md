# DIREKT Decision Log

This log records product and technical decisions with long-term impact.

| ID | Date | Decision | Rationale | Status |
|---|---|---|---|---|
| D-001 | 2026-07-14 | Version 1 customer/provider client is native Android | Android-first delivery matches the stated strategy and avoids premature cross-platform compromise | Accepted |
| D-002 | 2026-07-14 | iOS is deferred, but API/domain contracts remain client-neutral | Preserves future expansion without introducing iOS scope now | Accepted |
| D-003 | 2026-07-14 | One Android app supports customer and provider modes | Shared identity and interaction history reduce duplication; role switching remains controlled | Provisional; validate in Phase 1 |
| D-004 | 2026-07-14 | Operations portal is an internal web application | Evidence review and queue operations require desktop-friendly workflows | Accepted |
| D-005 | 2026-07-14 | Backend begins as a NestJS modular monolith | Strong module boundaries with lower operational complexity than microservices | Accepted |
| D-006 | 2026-07-14 | PostgreSQL/PostGIS is the system of record | Required for relational integrity and geospatial search | Accepted |
| D-007 | 2026-07-14 | Supabase is an initial managed-infrastructure candidate, not the domain layer | Provides managed data/storage options while preserving API ownership | Provisional |
| D-008 | 2026-07-14 | Verification is check-specific and evidence-backed | Prevents misleading blanket trust claims | Accepted |
| D-009 | 2026-07-14 | Commercial status cannot alter verification status or trust scoring | Protects marketplace integrity | Accepted |
| D-010 | 2026-07-14 | Exact private locations are hidden by default | Reduces safety and privacy risk for home/mobile providers | Accepted |
| D-011 | 2026-07-14 | Reviews require a platform-tracked interaction | Reduces fake and unrelated reviews | Accepted |
| D-012 | 2026-07-14 | GitHub Pages hosts only static, synthetic, non-sensitive content | Pages is suitable for documentation/testing but not secure backend operations | Accepted |
| D-013 | 2026-07-14 | Initial implementation uses one sequential branch rather than feature PRs | User requires coherent agent execution from start to finish | Accepted |
| D-014 | 2026-07-14 | No production code starts before Phase 1A exits | Real Zambia field constraints must shape product and technology choices | Accepted |
| D-015 | 2026-07-14 | Remote testing is split across Pages, Actions and Firebase App Distribution | Pages supports static review, Actions verifies and packages Android builds, and Firebase provides controlled installation and update delivery to named device testers | Accepted |
| D-016 | 2026-07-14 | The permanent Android package name must be approved before Firebase registration | Firebase's Android package registration is case-sensitive and effectively permanent for the registered app; premature registration creates avoidable migration risk | Accepted |
| D-017 | 2026-07-14 | Phase 1A uses explicit evidence classifications and an assumptions register | Separating field observations, participant reports, inspected documents, official sources and provisional assumptions prevents desk research or founder preference from becoming untested product truth | Accepted |
| D-018 | 2026-07-14 | Raw Phase 1A participant data and real evidence must remain outside the public repository | The repository and Pages are public; only coded, minimized and anonymized findings may be committed | Accepted |
| D-019 | 2026-07-14 | Pilot geography and categories remain open until scorecards link to real evidence | Lusaka and the proposed trades are plausible starting points but must not be approved through assumption alone | Accepted |
| D-020 | 2026-07-14 | Official registries are candidate evidence sources, not automatic verification integrations | PACRA, NCC and TEVETA confirm relevant systems exist, but access rights, category coverage, accuracy, legal use and operational reliability remain to be validated | Accepted |
| D-021 | 2026-07-14 | Phase 1A begins with a bounded exploratory wave before full fieldwork | Four customers, four providers across distinct categories and two verification/operations stakeholders will expose instrument and terminology defects before the larger sample | Accepted |

## How to add a decision

Use the next ID and include:

- context and problem;
- chosen option;
- alternatives considered;
- security/privacy/cost/migration impact;
- approval status;
- reversal conditions.