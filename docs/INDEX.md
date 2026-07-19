# DIREKT Documentation Index

This index points to the current authoritative control set and the main product/architecture/operations documents. Agents must follow the reading order in `AGENTS.md`, the active truth in `PROJECT_STATUS.md` and the integration evidence taxonomy in `docs/integrations/CURRENT_INTEGRATION_STATUS.md`.

## Mandatory control set

1. [`README.md`](../README.md)
2. [`AGENTS.md`](../AGENTS.md)
3. [`MASTER_BUILD_PLAN.md`](../MASTER_BUILD_PLAN.md)
4. [`PROJECT_STATUS.md`](../PROJECT_STATUS.md)
5. [`WORKSTREAM_LOCK.md`](../WORKSTREAM_LOCK.md)
6. [`DECISION_LOG.md`](../DECISION_LOG.md)
7. [`DEFINITION_OF_DONE.md`](../DEFINITION_OF_DONE.md)
8. [`design.md`](../design.md)

## Current integration and remote-UI truth

- [Current Integration Status Register](integrations/CURRENT_INTEGRATION_STATUS.md) — authoritative provider/runtime status classification.
- [Integration and Secrets Plan](integrations/INTEGRATION_AND_SECRETS_PLAN.md) — current provider, secret-placement and activation architecture.
- [Supabase Development Integration](integrations/SUPABASE_DEVELOPMENT_INTEGRATION.md) — exact managed data/storage integration.
- [Customer/Provider PWA Architecture](architecture/PWA_ARCHITECTURE.md) — Android-first companion-client boundary.
- [PWA UI Specification](design/PWA_UI_SPECIFICATION.md) — responsive desktop/tablet/mobile UI contract.
- [PWA Test Plan](testing/PWA_TEST_PLAN.md) — public synthetic and future live-mode gates.
- [Remote UI Testing](operations/REMOTE_UI_TESTING.md) — owner-facing Android/PWA/operations testing entry points.
- [Public Web / GitHub Pages Usage](operations/PAGES_USAGE.md) — `direkt.forum` static publication and safety boundary.

## Product

- [Product Requirements](product/PRODUCT_REQUIREMENTS.md)
- [Product Vision](product/PRODUCT_VISION.md)
- [MVP Scope](product/MVP_SCOPE.md)
- [Feature Catalog](product/FEATURE_CATALOG.md)
- [Roadmap](product/ROADMAP.md)
- [User Journeys](product/USER_JOURNEYS.md)
- [User Personas](product/USER_PERSONAS.md)
- [User Roles and Permissions](product/USER_ROLES_AND_PERMISSIONS.md)
- [Marketplace Rules](product/MARKETPLACE_RULES.md)
- [Business Model](product/BUSINESS_MODEL.md)
- [Monetization and Pricing](product/MONETIZATION_AND_PRICING.md)
- [Zambia Localization](product/ZAMBIA_LOCALIZATION.md)

## Design and clients

- [Design System](design/DESIGN_SYSTEM.md)
- [Information Architecture](design/INFORMATION_ARCHITECTURE.md)
- [Screen Inventory](design/SCREEN_INVENTORY.md)
- [User Flow Diagrams](design/USER_FLOW_DIAGRAMS.md)
- [Android UI Specification](design/ANDROID_UI_SPECIFICATION.md)
- [PWA UI Specification](design/PWA_UI_SPECIFICATION.md)
- [Responsive Admin Design](design/RESPONSIVE_ADMIN_DESIGN.md)
- [Accessibility](design/ACCESSIBILITY.md)
- [Content and Microcopy](design/CONTENT_AND_MICROCOPY.md)
- [Prototype Testing](design/PROTOTYPE_TESTING.md)

Android-specific planning remains under `docs/android/`, including product, navigation, state, offline/storage, permissions, performance, compatibility and Play release documents.

## API and architecture

- [Backend/Frontend API Plan](api/BACKEND_FRONTEND_API_PLAN.md)
- [System Architecture](architecture/SYSTEM_ARCHITECTURE.md)
- [Android Architecture](architecture/ANDROID_ARCHITECTURE.md)
- [PWA Architecture](architecture/PWA_ARCHITECTURE.md)
- [Admin Portal Architecture](architecture/ADMIN_PORTAL_ARCHITECTURE.md)
- [Backend Architecture](architecture/BACKEND_ARCHITECTURE.md)
- [API Contract](architecture/API_CONTRACT.md)
- [Database Design](architecture/DATABASE_DESIGN.md)
- [File Storage Architecture](architecture/FILE_STORAGE_ARCHITECTURE.md)
- [Location Architecture](architecture/LOCATION_ARCHITECTURE.md)
- [Notification Architecture](architecture/NOTIFICATION_ARCHITECTURE.md)
- [Integration Architecture](architecture/INTEGRATION_ARCHITECTURE.md)
- [Environment and Configuration](architecture/ENVIRONMENT_AND_CONFIGURATION.md)
- [Observability](architecture/OBSERVABILITY.md)
- [Offline and Sync](architecture/OFFLINE_AND_SYNC.md)

## Backend and trust

Backend domain documents live under `docs/backend/`, covering authentication/authorization, verification/evidence, search/discovery, booking/contact, subscriptions, payments, audit, retention, jobs and recovery.

Trust documents live under `docs/trust/`, including verification model/levels, evidence requirements, document lifecycle, field workflow, fraud prevention, trust scoring, disputes, safety and review/reputation.

## Security, privacy and legal

- `docs/security/` — threat model, security model, public-repository policy, secure evidence handling, location privacy, abuse/moderation, incident response and compliance.
- `docs/legal/` — consent/policy versioning, processing register and Zambia legal-review checklist.

Real participant/legal/provider evidence must never be inferred from synthetic readiness.

## Testing

- [Test Strategy](testing/TEST_STRATEGY.md)
- [Quality Gates](testing/QUALITY_GATES.md)
- [Acceptance Tests](testing/ACCEPTANCE_TESTS.md)
- [Android Test Plan](testing/ANDROID_TEST_PLAN.md)
- [PWA Test Plan](testing/PWA_TEST_PLAN.md)
- [Backend Test Plan](testing/BACKEND_TEST_PLAN.md)
- [Security Test Plan](testing/SECURITY_TEST_PLAN.md)
- [Performance Test Plan](testing/PERFORMANCE_TEST_PLAN.md)
- [Pilot Test Plan](testing/PILOT_TEST_PLAN.md)
- [Device Test Matrix](testing/DEVICE_TEST_MATRIX.md)
- [Bug Severity Model](testing/BUG_SEVERITY_MODEL.md)

## Operations

- [Agent Workflow](operations/AGENT_WORKFLOW.md)
- [Agent Handoff Template](operations/AGENT_HANDOFF_TEMPLATE.md)
- [CI/CD](operations/CI_CD.md)
- [Deployment Runbook](operations/DEPLOYMENT_RUNBOOK.md)
- [Environment Strategy](operations/ENVIRONMENT_STRATEGY.md)
- [Remote Android Testing](operations/REMOTE_ANDROID_TESTING.md)
- [Remote UI Testing](operations/REMOTE_UI_TESTING.md)
- [Public Web / Pages Usage](operations/PAGES_USAGE.md)
- [Android Release Runbook](operations/ANDROID_RELEASE_RUNBOOK.md)
- [Monitoring and Alerting](operations/MONITORING_AND_ALERTING.md)
- [Disaster Recovery](operations/DISASTER_RECOVERY.md)
- [Launch Checklist](operations/LAUNCH_CHECKLIST.md)
- [Support Operations](operations/SUPPORT_OPERATIONS.md)
- [Verification Operations](operations/VERIFICATION_OPERATIONS.md)

## Phase checkpoints

### Phase 8–10

- `docs/phase8/` — interaction trust contract and validation plan.
- `docs/phase9/` — commercial trust contract, validation and handoff.
- `docs/phase10/` — infrastructure activation contract, closeout and Phase 10 handoff.

### Phase 11

- [Handoff from Phase 10](phase11/HANDOFF_FROM_PHASE10.md)
- [Phase 11 Execution and Entry Control](phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md)
- [Pilot Validation Evidence Register](phase11/PILOT_VALIDATION_EVIDENCE_REGISTER.md)
- [Maps and Sentry Reconciliation](phase11/MAPS_SENTRY_RECONCILIATION_2026-07-19.md)

Phase 11 internal/synthetic readiness is not a substitute for 11C–11H primary evidence or 11J.

### Phase 12

Phase 12 documents live under `docs/phase12/` and include Android release contracts, Play-readiness inventories, the clearable release-readiness matrix, production-readiness preparations, monitoring/rollback/staged-rollout controls and the release execution runbook.

These are preauthorization controls until Phase 11 exit and the global release gates authorize production.

## Research and analytics

- `docs/research/` contains the Zambia secondary baseline, assumptions/evidence registers, research ethics/instruments and retained primary-validation plans.
- `docs/analytics/` contains success metrics and event taxonomy.

## Public-site rule

Current canonical public domain is `https://direkt.forum/`. Public `/app/` is a synthetic customer/provider PWA. Privileged operations, real evidence, protected participant data and secrets are never public-site content.
