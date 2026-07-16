# Phase 7 Operations Architecture

**Status:** Implemented synthetic checkpoint  
**Scope:** Internal operations portal, PostgreSQL/PostGIS trust boundaries and versioned NestJS API  
**Public deployment:** Not authorized

## Purpose

Phase 7 adds a bounded internal workflow for verification operations without changing the public trust model established in Phases 3–6. Authorized staff can triage cases, review assigned private evidence, coordinate structured field work, manage escalations and high-risk overrides, and inspect privacy-safe incident, expiry and aggregate reporting projections.

## Component boundaries

| Component | Responsibility | Prohibited behavior |
|---|---|---|
| `admin/direkt-operations-portal` | Accessible permission-aware operator workspaces | Direct database, object-storage or backend-module imports |
| `backend/direkt-api/src/operations` | Versioned HTTP contracts, server-side authorization and workflow orchestration | Client-selected authority or public evidence delivery |
| `backend/direkt-api/src/verification-evidence` | Assigned short-lived evidence access and review-safe metadata | Persistent URLs, object keys or unassigned review access |
| `database/migrations/2026071622*–2026071624*` | Immutable records, lifecycle constraints, scope checks and privacy-safe projections | Trust decisions from field work, commercial state or direct row edits |

## Workspaces

The operations portal exposes seven API-aligned workspaces:

1. mission control;
2. triage queues;
3. secure evidence review;
4. field assignments and structured inspections;
5. escalations and four-eyes overrides;
6. bounded incidents and complaints;
7. expiry, renewal and aggregate reporting.

Navigation visibility is derived from the session permission snapshot, but every action remains independently authorized by the backend and database boundaries.

## Core invariants

- Queue scope is deterministic and role-specific.
- Private evidence access requires one active matching reviewer assignment and a short-lived audited grant.
- Revoked, expired and unassigned evidence access fails immediately.
- Field work is provider, category, requirement, case and assignment scoped.
- Field observations are advisory and cannot create decisions, claims or publication.
- High-risk overrides require two distinct eligible approvers and cannot bypass mandatory evidence or publication policy.
- Incident resolution is owner-scoped, with explicit trust-supervisor or administrator override authority.
- Expiry and reporting outputs use allowlisted fields and expose no private evidence, coordinates, object keys or reviewer notes.
- The portal remains API-only.

## State and concurrency controls

- Triage ordering includes priority, age, service-level state and stable identifiers.
- Evidence grants are time-bounded and revocable.
- Field reassignment is atomic and uses a deferred self-reference for the replacement work item.
- Escalation and incident terminal resolution data is immutable.
- High-risk approval insertion is serialized and rejects requester, self and duplicate approvals.
- Forward-only checksummed migrations preserve the Phase 3–6 trust and publication boundaries.

## Deferred integrations

Real provider/customer records, production storage, maps, messaging, payments, deployment and public pilot operation remain prohibited. Phase 8 retains enquiries, interaction history, reviews, moderation, appeals and tracked complaint linkage. Phase 9 retains products, entitlements, subscriptions, invoices, payments and webhooks.
