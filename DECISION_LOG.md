# DIREKT Decision Log

This log records product and technical decisions with long-term impact.

| ID | Date | Decision | Rationale | Status |
|---|---|---|---|---|
| D-001 | 2026-07-14 | Version 1 customer/provider client is native Android | Android-first delivery matches the stated strategy and avoids premature cross-platform compromise | Accepted |
| D-002 | 2026-07-14 | iOS is deferred, but API/domain contracts remain client-neutral | Preserves future expansion without introducing iOS scope now | Accepted |
| D-003 | 2026-07-14 | One Android app supports customer and provider modes | Shared identity and interaction history reduce duplication; role switching remains controlled | Provisional; validate in Phase 1B/pilot |
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
| D-014 | 2026-07-14 | Production claims and pilot launch require later Zambia validation | Real operating constraints must be tested before public use, even though design may start from a provisional baseline | Accepted; supersedes fieldwork-as-scaffolding-blocker interpretation |
| D-015 | 2026-07-14 | Remote testing is split across Pages, Actions and Firebase App Distribution | Pages supports static review, Actions verifies/packages Android builds, Firebase distributes controlled installations | Accepted |
| D-016 | 2026-07-14 | The permanent Android package name must be approved before Firebase registration | Firebase Android registration is tied to an exact package name; premature registration creates migration risk | Accepted |
| D-017 | 2026-07-14 | Research uses explicit evidence classifications and an assumptions register | Prevents sources and founder preference from becoming unlabelled product truth | Accepted |
| D-018 | 2026-07-14 | Raw participant data and real evidence remain outside the public repository | The repository and Pages are public | Accepted |
| D-019 | 2026-07-14 | Lusaka District is the provisional design and pilot-market context | It has Zambia's strongest population concentration and the lowest initial operational dispersion | Accepted for design; exact neighbourhood boundary deferred |
| D-020 | 2026-07-14 | PACRA, NCC and TEVETA are candidate evidence sources, not automatic integrations | Their official systems support relevant claims, but access, coverage, legal use and matching reliability remain unconfirmed | Accepted |
| D-021 | 2026-07-14 | Primary field research is retained for later pilot validation | Real interviews and observations remain valuable but cannot be completed under current circumstances | Deferred to Phases 1B, 10 and 11 |
| D-022 | 2026-07-14 | The active AI agent manages routine PR merging and eligible issue closure | The owner does not want manual GitHub administration | Accepted |
| D-023 | 2026-07-14 | Phase 1A may exit on current official and credible secondary research with accepted limitations | Waiting indefinitely for manual recruitment would block progress without producing evidence; explicit provisional status preserves honesty | Accepted |
| D-024 | 2026-07-14 | Initial design categories are plumbing, electrical repair, motor-vehicle mechanics and appliance/electronics repair | They cover urgent and planned local services plus fixed/mobile/hybrid operating models | Provisional; final pilot supply and legal screening deferred |
| D-025 | 2026-07-14 | MVP customer payment and escrow are deferred | DIREKT's first proof is trusted discovery and tracked enquiry; payments add regulatory, reconciliation and support complexity | Accepted |
| D-026 | 2026-07-14 | MVP communication is tracked enquiry followed by consent-aware call or WhatsApp handoff | Preserves platform accountability without prematurely building full chat | Provisional; validate in prototype/pilot |
| D-027 | 2026-07-14 | Area, landmark, map pin and optional Plus Code are supported location inputs | They provide resilience where conventional street addressing is incomplete | Accepted for design |
| D-028 | 2026-07-14 | Phase 1B synthetic prototype is the next authorized workstream | It can validate interaction coherence remotely through Pages before native implementation | Accepted |

## How to add a decision

Use the next ID and include:

- context and problem;
- chosen option;
- alternatives considered;
- security, privacy, migration and compatibility impact;
- approval status;
- reversal conditions.
