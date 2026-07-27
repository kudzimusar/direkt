# Phase 11 Primary-Pilot Evidence Register

**State:** NO PRIMARY-PILOT EVIDENCE RECORDED  
**Governing issue:** #112  
**Real-pilot entry:** blocked  
**Production authorization:** false

## Authority rule

A register entry may be labelled `PRIMARY-PILOT` only when it comes from an approved real participant in the authorized pilot environment after:

- current notice presentation;
- explicit version-bound consent;
- invite-only admission;
- applicable legal/privacy/provider entry gates;
- recorded owner authorization for the wave.

Synthetic fixtures, automated tests, managed canaries, Firebase Test Lab, payment sandboxes, secondary research and agent analysis must use another evidence class and may not be inserted as participant outcomes.

## Current evidence inventory

| Evidence class | Count | Status |
|---|---:|---|
| `PRIMARY-PILOT` | 0 | NOT STARTED — external entry blocked |
| `SYNTHETIC` | documented elsewhere | readiness only |
| `SYSTEM-METRIC` | documented elsewhere | readiness/operations only |
| `SECONDARY-RESEARCH` | documented elsewhere | scope/input only |
| `MANAGED-CANARY` | documented in integration index | runtime proof only |

## Required entry fields

Each future row must include:

| Field | Rule |
|---|---|
| Evidence ID | non-identifying research identifier; never a phone number, raw Firebase UID or contact detail |
| Stage | one of `11C`, `11D`, `11E`, `11F`, `11G`, `11H`, `11I`, `11J` |
| Wave | approved wave identifier |
| Participant type | provider, customer, reviewer, operator or field operator |
| Participant pathway | registered business, qualified individual, experienced informal provider, customer or operations role where applicable |
| Geography/category | approved bounded value only |
| Notice version | exact active policy/notice version |
| Consent evidence | canonical consent record reference; no consent body or contact detail copied here |
| Observation time | UTC timestamp plus local operating date where useful |
| Evidence source | approved interview, observed task, system metric, support case or incident record |
| Metric/observation | minimized factual result |
| Severity | none, low, medium, high or critical |
| Privacy class | public-safe, internal, confidential or restricted |
| Linked finding | findings-register identifier where action is required |
| Verification | recorder and independent reviewer where required |
| Retention/deletion | applicable schedule and deletion/withdrawal status |

## Future row template

No rows may be added before real entry approval.

| Evidence ID | Stage | Wave | Participant type | Pathway | Geography/category | Notice version | Observation | Severity | Privacy class | Linked finding | Verification |
|---|---|---|---|---|---|---|---|---|---|---|---|
| _EMPTY_ | _NO PRIMARY-PILOT EVIDENCE RECORDED_ | | | | | | | | | | |

## Prohibited contents

Never copy into this register:

- phone numbers, email addresses or raw contact handles;
- raw Firebase UIDs, tokens, cookies or session identifiers;
- evidence files or unrestricted evidence text;
- exact private provider base coordinates;
- private reviewer notes beyond the minimized finding;
- payment credentials or provider payloads;
- participant free text that is not necessary for the documented finding.

## Withdrawal and deletion

When a participant withdraws or invokes deletion rights:

1. record the canonical request reference;
2. apply the approved retention/deletion schedule;
3. remove or anonymize research-linked data where required;
4. mark affected evidence rows as withdrawn/deleted without preserving prohibited identifiers;
5. reassess any metric or 11J conclusion that depended materially on the removed evidence.
