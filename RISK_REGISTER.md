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

## Current treatment priorities

Before Phase 3 exit:

- R-019 and R-031 require Android secure-storage and account-recovery designs before real contacts are used;
- R-032 requires provider-object authorization tests on every Phase 3 mutation;
- no Phase 3 profile may become publicly discoverable without later evidence-derived claims.

Before the controlled pilot:

- R-004, R-010, R-013, R-015, R-021, R-022, R-023 and R-025 require real operational or legal evidence;
- R-030 requires approved providers, distributed rate limiting and monitored abuse controls;
- R-033 requires deployment, cookie/session, CSP and private-data review;
- R-034 requires production configuration and secret-management validation.

## Review cadence

- Phase review: update affected risks.
- Pilot: daily operational review and weekly formal risk review.
- Production: monthly review plus immediate review after a material incident.
- Any priority of 15 or more requires a named owner and treatment before public launch.
