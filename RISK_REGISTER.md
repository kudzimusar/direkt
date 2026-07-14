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
| R-019 | Account takeover permits fraudulent profile changes | 3 | 5 | 15 | MFA for privileged roles, session controls, re-verification of sensitive changes | Security / planned |
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

## Current treatment priorities

Before Phase 1B exit:

- R-002 must be tested through separate claim states and limitation copy;
- R-006 must appear in offline, retry and upload-error prototype states;
- R-017 and R-027 must pass a synthetic-data and prototype-labelling review;
- R-024 must remain visible in design documentation;
- R-028 must have a consent-aware handoff flow;
- R-029 must be represented honestly in profile designs.

Before the controlled pilot:

- R-004, R-010, R-013, R-015, R-021, R-022, R-023 and R-025 require real operational or legal evidence.

## Review cadence

- Phase review: update affected risks.
- Phase 1B: review after each prototype checkpoint.
- Pilot: daily operational review and weekly formal risk review.
- Production: monthly review plus immediate review after a material incident.
- Any priority of 15 or more requires a named owner and treatment before public launch.
