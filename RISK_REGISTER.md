# DIREKT Risk Register

Scores use probability (P) and impact (I) from 1–5. Priority is `P × I`.

| ID | Risk | P | I | Priority | Controls | Owner/state |
|---|---|---:|---:|---:|---|---|
| R-001 | False or forged provider evidence | 4 | 5 | 20 | issuing-body matrix, manual review, private evidence, expiry, fraud flags | Trust lead / open |
| R-002 | Blanket verification wording misleads customers | 3 | 5 | 15 | separate claim cards, limitation copy, legal review | Product / controlled |
| R-003 | Exact home location exposes provider safety risk | 3 | 5 | 15 | service areas, reduced public precision, consent, private evidence | Security / controlled |
| R-004 | Field-agent collusion or bribery | 3 | 5 | 15 | assignment controls, structured evidence, audit, random rechecks, four-eyes approval | Operations / pilot gate |
| R-005 | Stale business pins and expired evidence | 4 | 4 | 16 | renewal, customer reports, periodic checks, automatic claim degradation | Trust / open |
| R-006 | Low bandwidth causes failed onboarding/uploads | 4 | 4 | 16 | compression, recoverable uploads, local drafts, WorkManager | Android / planned |
| R-007 | Provider documents leak from public repository or storage | 2 | 5 | 10 | private buckets, signed access, secret scan, synthetic fixtures | Security / controlled |
| R-008 | Contact moves off-platform and reduces accountability | 4 | 3 | 12 | tracked enquiry before handoff, follow-up and review eligibility | Product / open |
| R-009 | Mobile-money integration creates reconciliation errors | 3 | 5 | 15 | adapter, idempotent webhooks, ledger, reconciliation, exception queue | Finance / Phase 9 gate |
| R-010 | Verification cost exceeds subscription revenue | 4 | 4 | 16 | narrow pilot, category-specific checks, cost measurement, tier design | Business / pilot gate |
| R-011 | Too few nearby providers make search useless | 4 | 4 | 16 | Lusaka-first, limited categories, supply onboarding before demand launch | Growth / open |
| R-012 | Fake or retaliatory reviews | 3 | 4 | 12 | tracked-interaction eligibility, moderation, anomaly rules, appeals | Trust / planned |
| R-013 | Legal interpretation is wrong | 3 | 5 | 15 | qualified Zambia counsel, legal register, policy versioning | Owner/legal / Phase 10 gate |
| R-014 | Map costs or coverage are unsuitable | 3 | 4 | 12 | provider abstraction, manual area fallback, Plus Codes, quotas, pilot tests | Architecture / open |
| R-015 | Android fragmentation harms usability | 4 | 3 | 12 | conservative design, later device matrix, performance budgets | Android / open |
| R-016 | Single-lane workflow stalls | 3 | 3 | 9 | bounded tasks, automated PR steward, handoffs and explicit lock | Programme / controlled |
| R-017 | Pages exposes real test data | 2 | 5 | 10 | synthetic-only policy, CI scan, review checklist | Security / controlled |
| R-018 | Trust score becomes opaque or discriminatory | 3 | 5 | 15 | interpretable inputs, no protected-class proxies, appeals, periodic review | Trust/legal / open |
| R-019 | Account takeover permits fraudulent profile changes | 3 | 5 | 15 | short access tokens, hashed rotating refresh sessions, reuse-family revocation, MFA before pilot, re-verification of sensitive changes | Security / active |
| R-020 | Backups exist but cannot be restored | 2 | 5 | 10 | scheduled restore exercises and recovery evidence | Operations / planned |
| R-021 | Secondary research reflects urban or online bias | 4 | 4 | 16 | mark provisional, design low-bandwidth fallbacks, validate during controlled pilot | Product/research / accepted limitation |
| R-022 | Official registries cannot legally or economically support verification | 3 | 5 | 15 | no premature integration, manual fallback, written approval before launch | Trust/legal / Phase 10 gate |
| R-023 | Future field research exposes participant data | 3 | 5 | 15 | coded IDs, minimization, private raw-data store, publication checklist | Research/privacy / pilot gate |
| R-024 | Team treats provisional baseline as validated market truth | 4 | 4 | 16 | evidence labels, prototype disclaimers, exit-review limitations, pilot contradiction rule | Product/programme / active |
| R-025 | High-risk categories exceed pilot safety capacity | 3 | 5 | 15 | excluded-category list, category scorecard, legal review, limited claims | Product/trust / controlled |
| R-026 | Delayed manual fieldwork blocks design indefinitely | 1 | 4 | 4 | secondary-research gate; primary validation moved to later phases | Programme / mitigated |
| R-027 | Synthetic prototype is mistaken for implemented functionality | 3 | 4 | 12 | explicit prototype labelling, fictional data, no real submissions | Design/programme / active |
| R-028 | Call/WhatsApp handoff causes privacy leakage or bypass | 3 | 4 | 12 | consent step, minimum disclosed data, tracked enquiry, warnings and follow-up | Product/privacy / open |
| R-029 | Informal-provider pathway is perceived as lower quality or misleading | 3 | 4 | 12 | equal layout, explicit evidence states, no hidden ranking penalty | Product/trust / open |
| R-030 | OTP/challenge endpoint enables enumeration, spam or cost abuse | 4 | 5 | 20 | enumeration-safe response, expiry, attempt limit, hashed fingerprint, synthetic-only adapter; distributed throttling and vendor controls required before production | Security / Phase 10 gate |
| R-031 | Refresh-token theft allows persistent account access | 3 | 5 | 15 | raw token never stored, short access token, rotation, family reuse detection, device/session revocation, secure client storage later | Security / active |
| R-032 | Incorrect global/provider role scope causes cross-provider access | 3 | 5 | 15 | database role-scope trigger, non-overlap constraint, provider-aware repository, deny tests, server-side permission resolution | Security/backend / controlled |
| R-033 | Operations portal leaks privileged data through indexing, browser bundles or direct connectors | 3 | 5 | 15 | noindex/security headers, API-only boundary, CI import scan, synthetic fixtures, no deployment, CSP review before real data | Security/admin / controlled |
| R-034 | Synthetic authentication is mistakenly enabled in production | 2 | 5 | 10 | production configuration permits only disabled mode and requires external secrets; deployment gate and runtime checks still required | Security/operations / controlled |
| R-035 | Profile completion or an operator action accidentally publishes an unverified provider | 3 | 5 | 15 | policy-controlled publication function, live provider/category/claim eligibility and public-route regressions | Trust/backend / controlled |
| R-036 | Category requirements change and invalidate historical evidence meaning | 3 | 5 | 15 | immutable activated versions, provider selections pin a version, new versions required for changes | Trust/data / controlled |
| R-037 | Provider pathways become a proxy for quality or unfair ranking | 3 | 4 | 12 | pathways describe evidence context only, equal presentation, no pathway-derived trust score, pilot fairness review | Product/trust / open |
| R-038 | A provider representative gains access to another provider or retains access after revocation | 3 | 5 | 15 | provider-scoped role assignments, active-time checks, immediate server resolution, cross-provider and revocation tests | Security/backend / controlled |
| R-039 | Private-storage adapter or bucket policy exposes original evidence | 3 | 5 | 15 | adapter-only backend access, opaque object keys, private buckets, short-lived signed access, access audit, no public URL, infrastructure review before real data | Security/storage / production gate |
| R-040 | A shared requirement key is linked to the wrong provider category | 2 | 5 | 10 | category-scoped resolution, pinned requirement versions, ambiguity rejection and regression tests | Trust/backend / controlled |
| R-041 | Repeat or contradictory verification decisions create misleading claims | 2 | 5 | 10 | in-review lifecycle gate, immutable decisions, reason/result semantics trigger and regression tests | Trust/data / controlled |
| R-042 | Expiry processing is not scheduled or fails silently in production | 3 | 5 | 15 | deterministic database function, audited batch result, monitored scheduler, retry and stale-claim alert before public discovery | Trust/operations / deployment gate |
| R-043 | Synthetic private storage is mistaken for production-ready document handling | 3 | 4 | 12 | synthetic labelling, production adapter contract, malware/MIME/checksum controls required before real evidence, deployment checklist | Programme/security / active |
| R-044 | Safe claim projection accidentally includes private evidence or reviewer data | 2 | 5 | 10 | dedicated safe view/types, allowlisted fields, OpenAPI/public-route tests and no object references in clients | Trust/privacy / controlled |
| R-045 | A stale published row remains visible after provider suspension or category removal | 3 | 5 | 15 | live provider/category/version joins on every public read, current-claim checks and removal regressions | Trust/backend / controlled |
| R-046 | Search distance or map output reveals a mobile provider private base | 2 | 5 | 10 | separate private/public geometry, service-area matching for mobile providers, public DTO allowlists and privacy regressions | Privacy/location / controlled |
| R-047 | Saved-provider lists retain ineligible or withdrawn providers | 3 | 4 | 12 | re-evaluate publication, organization, category/version and claim eligibility on save and every saved-list read | Product/backend / controlled |
| R-048 | Map/vendor outage, cost or permission denial makes discovery unusable | 3 | 4 | 12 | manual area path, list mode, adapter boundary, no background location and production vendor gate | Android/architecture / open |
| R-049 | Sparse supply or aggressive filters produce empty results that mislead customers | 4 | 3 | 12 | bounded no-results recovery, transparent filters, sparse/empty synthetic states and no fabricated providers | Product/growth / open |

## Current treatment priorities

Phase 5 exit controls are complete:

- R-003 and R-046 are controlled by separate private/public/service-area geometry and public serialization regressions;
- R-005, R-042 and R-045 are controlled by current-claim and live eligibility checks;
- R-011 and R-049 have explicit empty/sparse/no-results states without fabricated supply;
- R-027 remains controlled through synthetic fixtures and build labelling;
- R-035, R-044 and R-047 have database/API/Android tests for safe publication and saves.

Before Phase 6 or production integration:

- R-006 requires durable local drafts, retry and upload recovery in the provider workspace;
- R-014 and R-048 require an approved map/location provider, quotas, cost controls and manual fallback validation;
- R-039, R-042 and R-043 require production storage, scheduler, scanning, alerting and recovery validation;
- R-045 requires production monitoring for stale or policy-invalid publication rows.

Before the controlled pilot:

- R-004, R-010, R-013, R-015, R-021, R-022, R-023 and R-025 require real operational or legal evidence;
- R-030 requires approved providers, distributed rate limiting and monitored abuse controls;
- R-033 requires deployment, cookie/session, CSP and private-data review;
- R-034 requires production configuration and secret-management validation;
- R-037 requires representative provider and customer fairness testing.

## Review cadence

- Phase review: update affected risks.
- Pilot: daily operational review and weekly formal risk review.
- Production: monthly review plus immediate review after a material incident.
- Any priority of 15 or more requires a named owner and treatment before public launch.