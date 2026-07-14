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

## How to add a decision

Use the next ID and include:

- context and problem;
- chosen option;
- alternatives considered;
- security/privacy/cost/migration impact;
- approval status;
- reversal conditions.
