# Phase 11 Real-Entry Blocker Register

**As of:** 2026-07-28 (Asia/Tokyo)  
**State:** REAL ENTRY BLOCKED  
**Governing issue:** #112  
**`PILOT_ENTRY_APPROVED`:** false
**Wave 0 terminal decision:** `ENTRY_BLOCKED_EXTERNAL`
**Machine-readable register:** `PHASE11_WAVE0_EVIDENCE_MANIFEST.json`
**Official-source refresh:** `PHASE11_WAVE0_OFFICIAL_SOURCE_EVIDENCE_2026-07-28.md`

## Decision rule

Every applicable hard gate must be supported by actual evidence and an accountable owner decision. Repository implementation, secondary research, synthetic data and managed canaries cannot close an external legal, regulator, provider or participant gate.

## Hard blockers

| ID | Gate | Current state | Required closure evidence | Accountable owner | Blocks |
|---|---|---|---|---|---|
| P11-G01 | Zambia DPC controller-registration outcome | OPEN | official outcome/receipt/reference applicable to the exact controller and pilot activity | privacy owner | all participant processing |
| P11-G02 | Overseas storage/transfer authorization | OPEN | official/qualified determination and required authorization for the exact Supabase/Google/Firebase topology | privacy owner | real identity, evidence, contact and location data |
| P11-G03 | Qualified Zambia privacy review | OPEN | signed review of exact data flow, controller/processor roles, rights, retention, withdrawal and deletion | privacy owner | recruitment and processing |
| P11-G04 | Qualified consumer/marketplace review | OPEN | signed review of participant/provider terms, trust limitations, complaints and redress | product/legal owner | recruitment and public claims |
| P11-G05 | Final participant/provider notice | OPEN | approved notice text, immutable version identifier and effective date | privacy/product owner | invitation admission |
| P11-G06 | Consent/retention/deletion/withdrawal schedule | OPEN pending qualified confirmation | approved operating schedule linked to the final notice and canonical rights process | privacy owner | participant data lifecycle |
| P11-G07 | Wave 1 authorization | OPEN | signed owner record with exact counts, categories, geography, pathway mix, dates and roles | pilot owner | invitations |
| P11-G08 | Firebase Zambia real configuration | OPEN | approved project/app/package/SHA, region policy, quota/abuse controls, disclosure and fallback settings | security/product owner | real phone authentication |
| P11-G09 | Real invitation/auth/consent canary | OPEN | managed evidence from the authorized pilot environment with no participant production traffic | security/product owner | invitations |
| P11-G10 | Private storage/access canary | OPEN | authorized upload/read/revoke/delete proof with private buckets and least privilege | security/privacy owner | provider evidence |
| P11-G11 | Withdrawal/deletion canary | OPEN | canonical consent revocation, access block, deletion/retention and audit proof | privacy owner | participant processing |
| P11-G12 | Deployment/source approval | OPEN | immutable source SHA, image/revision, migration checksums and configuration receipt for Wave 1 | product/security owner | wave start |
| P11-G13 | Support and incident readiness | OPEN for real wave | named Zambia-operating contacts, support hours, escalation path and rehearsal evidence | support/incident owner | wave start |
| P11-G14 | Critical/high repository entry defects | CLOSED for `1befa902def70d2c997aaba260e0d8e2a5d4b12d` | exact-head matrix passed; evidence SHA-256 `7480a398c6ed7a612ce1c2e44706221f1722e626a2841fe0598662d62471bdf9` | DIREKT repository owner | no longer blocks repository readiness; P11-G12 still blocks wave start |

## Conditional blockers

| ID | Gate | Current state | Applies when | Required evidence |
|---|---|---|---|---|
| P11-C01 | Zambia field lead | NOT APPLICABLE to initial no-field-claim wave | any real field-visit or equivalent claim is enabled | named trained field lead, safety protocol, assignment/audit process and owner approval |
| P11-C02 | Participant Maps/geocoding | DISABLED | Google Maps is used with real participant/location data | privacy/provider approval, restricted credentials, real canary, quotas, fallback and incident plan |
| P11-C03 | Participant Sentry/Crashlytics | DISABLED | participant telemetry is enabled | privacy approval, PII scrub proof, consent/notice decision, DSN/project boundary and real canary |
| P11-C04 | Participant email/push/WhatsApp | DISABLED | an external communication channel is used | provider/legal/privacy approval, consent semantics, templates, opt-out, real canary and support ownership |
| P11-C05 | Production AI | DISABLED | model output is used in the real pilot | approved use case, data classification, DPA/transfer, evaluation, non-authority controls, monitoring and fallback |
| P11-C06 | Payment provider or real money | DISABLED | any real collection, subscription or processing fee is proposed | legal/commercial/provider approval, runtime proof, refund/dispute controls and release authorization |
| P11-C07 | Automated registry access | NOT APPLICABLE to initial wave | an automated authority/registry lookup is proposed | formal lawful API/access agreement and evidence-handling approval |

## Already-decided Wave 1 exclusions

These exclusions reduce the critical path and must not be reversed implicitly:

- Google Maps is not required; manual area/list fallback remains authoritative.
- Sentry and participant Crashlytics are not required.
- production call/WhatsApp/push/email delivery is not required unless separately approved;
- automated registry access is not required;
- payment provider and real money are not required;
- a no-field-claim wave may run without a field lead if every enabled claim is accurate.

## Owner closure entry template

For each closed gate record:

```text
Gate ID:
Decision: CLOSED / NOT APPLICABLE / REMAINS OPEN
Evidence authority:
Evidence reference:
Exact scope/topology/version:
Decision owner:
Decision date/time:
Conditions/expiry:
Independent review where required:
```

No gate may be changed to `CLOSED` using an agent-generated assertion alone. The permanent evaluator requires authority, reference, SHA-256, exact scope, accountable owner and decision time for every closed gate; P11-G03 through P11-G06 additionally require independent review. Until those fields are supported by actual evidence, the terminal decision remains `ENTRY_BLOCKED_EXTERNAL`.
