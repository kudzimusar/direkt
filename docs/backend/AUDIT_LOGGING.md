# DIREKT Audit Logging

## Audit events

Mandatory for:

- sign-in/security changes;
- role/provider membership;
- evidence access;
- verification assignment/decision/override;
- field visit submission;
- public location consent/change;
- publication/suspension/reinstatement;
- complaint/enforcement/appeal;
- subscription/ledger adjustment;
- export;
- configuration change;
- account deletion/retention action.

## Event shape

- event ID/type/version;
- actor and actor role;
- subject/resource;
- provider/tenant scope;
- timestamp;
- correlation/request ID;
- action outcome;
- reason code;
- safe changed-field summary;
- source/IP/device metadata only where justified;
- previous/new state references, not raw sensitive payload.

## Integrity

Append-only application interface, restricted database permissions, retention and monitoring for gaps. Audit records are not edited to “fix” history; corrective event is appended.

## Access

Role- and purpose-controlled. Viewing/exporting audit logs is itself audited.

## Privacy

Do not log document content, OTPs, tokens, full identity numbers or exact coordinates unless a narrowly approved audit requirement exists.
