# Phase 11 Findings and Canonical Corrections Register

**State:** READY / NO PRIMARY-PILOT FINDINGS RECORDED  
**Governing issue:** #112

## Purpose

Provide one accountable path from actual pilot evidence to production-compatible correction. This register must not contain raw participant evidence or create pilot-only business logic.

## Finding classes

- **DEFECT:** behavior violates the approved product/security/privacy contract.
- **ASSUMPTION:** a product, operational, trust, geography, pricing or capacity hypothesis is contradicted or remains unsupported.
- **REQUEST:** a participant or operator asks for capability outside the approved contract.
- **INCIDENT:** safety, privacy, security, fraud, abuse, provider or availability event requiring incident handling.

A request is not automatically a defect. An assumption is not automatically a feature requirement.

## Severity

| Severity | Meaning | Default action |
|---|---|---|
| Critical | participant safety, unlawful processing, authorization bypass, secret exposure, unsupported trust claim, real-money error or unrecoverable material data loss | immediate stop; incident response; no resumption without owner approval |
| High | material privacy/security/reliability/operations failure affecting the approved pilot outcome | pause affected flow or wave; canonical fix and revalidation required |
| Medium | meaningful task failure or repeated misunderstanding with bounded workaround | triage before next wave; fix or explicitly narrow/accept |
| Low | minor usability, wording or operational friction | backlog with evidence and owner decision |
| Observation | no current defect; useful input or emerging pattern | monitor and aggregate |

## Register template

| Finding ID | Evidence IDs | Stage | Class | Severity | Summary | Contract/assumption affected | Root cause | Decision | Canonical change reference | Regression evidence | Pilot revalidation | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| _EMPTY_ | _NO PRIMARY-PILOT FINDINGS RECORDED_ | | | | | | | | | | | |

## Required workflow

```text
approved minimized evidence
→ finding classification
→ severity and stop/pause decision
→ root-cause analysis
→ product/operations/legal decision
→ canonical backend/domain contract first where required
→ forward-only migration if required
→ OpenAPI and clients
→ Android/PWA/portal implementation
→ unit/integration/security/privacy regression
→ protected deployment
→ bounded pilot revalidation
→ finding closure or accepted limitation
```

## Canonical-correction rules

A valid 11I correction must:

- preserve backend authorization and audit authority;
- use existing provider, verification, discovery, interaction, review, complaint and commercial domains;
- use forward-only checksummed migrations;
- update OpenAPI and generated clients where the contract changes;
- keep private evidence and exact private coordinates private;
- preserve consent, withdrawal, deletion and retention behavior;
- preserve payment/trust separation;
- preserve AI non-authority;
- include negative authorization and regression tests;
- be deployable outside the pilot without participant-specific hardcoding.

## Prohibited corrections

- direct database status edits as the product fix;
- hardcoded participant accounts or research IDs;
- duplicate pilot-only tables/endpoints when a canonical domain exists;
- client-only permission, verification or payment decisions;
- fake review, evidence, inspection or trust states;
- weakening privacy/security gates to reduce support effort;
- enabling production provider modes merely to reproduce a pilot issue;
- silently changing approved notice/consent scope;
- closing a finding using synthetic evidence when real revalidation is required.

## Accepted limitations

An unresolved medium/low limitation may be accepted only when the 11J record states:

- exact scope and affected participants/tasks;
- workaround and residual risk;
- why the issue does not invalidate the decision;
- owner and expiry/revisit date;
- whether Phase 12 release scope must be narrowed.

Critical or high privacy, security, authorization, participant-safety or unsupported-trust issues cannot be accepted for `PROCEED`.
