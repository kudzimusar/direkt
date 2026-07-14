# DIREKT Architecture Decisions

Architecture decisions are recorded as ADRs in this document until individual ADR files become useful.

## ADR-001 Native Android

**Decision:** Kotlin/Jetpack Compose.  
**Why:** Android-first requirement, platform fidelity, durable background work and future Android-specific optimization.  
**Rejected:** Flutter/React Native for Version 1 because they dilute the strict native constraint.

## ADR-002 Modular monolith

**Decision:** NestJS modular monolith.  
**Why:** Coherent transactions, simpler operations and enough boundaries for early scale.  
**Review trigger:** measured deployment/scaling isolation need.

## ADR-003 PostgreSQL/PostGIS

**Decision:** relational and geospatial system of record.  
**Why:** verification integrity, audit, search and transactions.

## ADR-004 API-owned domain

**Decision:** clients/admin use backend API, not direct database access for business operations.  
**Why:** consistent authorization, audit and portability.

## ADR-005 Check-specific verification

**Decision:** public claims derive from individual approved checks.  
**Why:** prevents misleading universal badge.

## ADR-006 Private evidence

**Decision:** evidence objects are private with short-lived audited access.  
**Why:** identity/location/certificate sensitivity.

## ADR-007 Pages for static collaboration only

**Decision:** MkDocs and synthetic prototypes on GitHub Pages.  
**Why:** free public sharing; unsuitable for secrets/dynamic backend.

## ADR-008 Sequential implementation lane

**Decision:** one `build/android-v1` branch and phase checkpoints.  
**Why:** user requires coherent agent execution.  
**Safeguards:** workstream lock, atomic commits, CI, no force push.
