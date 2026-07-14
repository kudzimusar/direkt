# DIREKT Risk Register

Scores use probability (P) and impact (I) from 1–5. Priority is `P × I`.

| ID | Risk | P | I | Priority | Controls | Owner/state |
|---|---|---:|---:|---:|---|---|
| R-001 | False or forged provider evidence | 4 | 5 | 20 | issuing-body matrix, manual review, field checks, expiry, fraud flags | Trust lead / open |
| R-002 | Blanket “verified” wording misleads customers | 3 | 5 | 15 | check-specific claims, copy rules, legal review | Product / controlled |
| R-003 | Exact home location exposes provider safety risk | 3 | 5 | 15 | location types, precision minimization, consent, private evidence | Security / controlled |
| R-004 | Field agent collusion or bribery | 3 | 5 | 15 | assignment controls, GPS/time evidence, audits, random rechecks, four-eyes decisions | Operations / open |
| R-005 | Stale business pins and expired certificates | 4 | 4 | 16 | renewal, customer reports, periodic checks, automatic claim degradation | Trust / open |
| R-006 | Low bandwidth causes failed onboarding/uploads | 4 | 4 | 16 | compression, resumable/recoverable uploads, local drafts, WorkManager | Android / planned |
| R-007 | Provider data or documents leak from public repository/storage | 2 | 5 | 10 | private buckets, signed access, secret scanning, synthetic fixtures | Security / controlled |
| R-008 | Customers and providers bypass platform, reducing review eligibility | 4 | 3 | 12 | tracked enquiry before handoff, value-added history, simple follow-up | Product / open |
| R-009 | Mobile-money integration creates reconciliation errors | 3 | 5 | 15 | adapter, webhook idempotency, ledger, reconciliation, manual exception queue | Finance / planned |
| R-010 | Verification operations cost exceeds subscription revenue | 4 | 4 | 16 | pilot measurement, tier design, category-specific checks, recheck pricing | Business / open |
| R-011 | Search has too few providers to be useful | 4 | 4 | 16 | narrow pilot geography/categories, supply onboarding before demand launch | Growth / open |
| R-012 | Fake or retaliatory reviews | 3 | 4 | 12 | tracked interaction eligibility, moderation, anomaly rules, appeals | Trust / planned |
| R-013 | Regulatory/legal interpretation is wrong | 3 | 5 | 15 | qualified Zambian counsel, compliance checklist, policy versioning | Owner/legal / open |
| R-014 | Map/geocoding costs or coverage are unsuitable | 3 | 4 | 12 | provider evaluation, abstraction, quotas, field tests | Architecture / open |
| R-015 | Android device fragmentation harms usability | 4 | 3 | 12 | device research, min SDK decision, matrix tests, performance budgets | Android / open |
| R-016 | Single-lane workflow stalls on one agent | 3 | 3 | 9 | bounded tasks, handoff template, clean commits, explicit lock state | Programme / controlled |
| R-017 | Public Pages accidentally exposes real test data | 2 | 5 | 10 | synthetic-only policy, CI scans, review checklist | Security / controlled |
| R-018 | Trust score becomes opaque or discriminatory | 3 | 5 | 15 | interpretable inputs, no protected-class proxies, appeals, periodic review | Trust/legal / open |
| R-019 | Account takeover permits fraudulent profile changes | 3 | 5 | 15 | MFA for privileged roles, session controls, re-verification of sensitive changes | Security / planned |
| R-020 | Backup exists but cannot be restored | 2 | 5 | 10 | scheduled restore exercises, recovery runbook and evidence | Operations / planned |
| R-021 | Phase 1A sample is biased toward friends, affluent central users or confident smartphone users | 4 | 4 | 16 | recruitment quotas, multiple channels, lower-confidence/accessibility participants, evidence-gap review | Research lead / active |
| R-022 | Official registries exist but cannot legally, reliably or economically support platform verification | 3 | 5 | 15 | authority interviews, terms review, written agreements, manual fallback, no premature integration | Trust/legal / active |
| R-023 | Research notes expose participant identity, allegations or private location in the public repository | 3 | 5 | 15 | coded IDs, minimization, private raw-data store, publication checklist, no real documents/coordinates | Research/privacy / active |
| R-024 | Team begins Android scaffolding before field evidence resolves critical assumptions | 3 | 4 | 12 | workstream lock, `NOT READY` exit gate, project-status stop rule, agent contract | Programme / controlled |
| R-025 | Desk research is mistaken for validated Zambia market evidence | 4 | 4 | 16 | evidence classifications, separate desk register, field-evidence IDs, owner exit review | Product/research / active |
| R-026 | High-risk categories create safety or liability beyond pilot capacity | 3 | 5 | 15 | category scorecard, legal review, exclusions, limited claims, incident tabletop | Product/trust / active |
| R-027 | Field-research recruitment or authority access delays the single build lane | 4 | 3 | 12 | exploratory wave, local coordinator, staged synthesis, explicit blocker reporting | Programme/research / active |

## Phase 1A treatment priorities

Before Phase 1A exit:

- R-021 must have documented sample-diversity evidence;
- R-022 must identify confirmed and unconfirmed authority routes by shortlisted category;
- R-023 must pass a repository privacy inspection;
- R-025 must be controlled through evidence-linked decisions;
- R-026 must be accepted, reduced or excluded per category;
- R-027 must have an owner-approved fieldwork execution plan.

## Review cadence

- Phase review: update all affected risks.
- Active Phase 1A: review research risks weekly and after any privacy/safety incident.
- Pilot: daily operational review, weekly formal risk review.
- Production: monthly risk review plus immediate review after a material incident.
- Any score ≥15 requires a named owner and treatment before launch.