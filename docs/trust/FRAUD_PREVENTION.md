# DIREKT Fraud Prevention

## Threats

- forged/edited documents;
- stolen identity;
- duplicate provider profiles;
- fake premises;
- location spoofing;
- reviewer/field-agent collusion;
- purchased/fake reviews;
- account takeover;
- payment/webhook manipulation;
- enforcement evasion;
- customer scam enquiries.

## Controls by stage

### Account
Contact verification, rate limits, session/device monitoring, recovery controls and privileged MFA.

### Provider
Duplicate matching on normalized contacts/business identity/location/evidence hashes; manual review for ambiguous matches.

### Evidence
File signature/metadata checks, immutable versions, issuing-body verification where authorized, visual/manual review, expiry and random rechecks.

### Field
Assignment binding, check-in/out, structured capture, supervisor sampling and conflict disclosure.

### Marketplace
Tracked review eligibility, anomaly detection, report/appeal and restrictions.

### Payments
Signed webhooks, idempotency, ledger and reconciliation.

## Fraud flags

Flags are internal indicators, not guilt. Each includes source, confidence, status, owner and resolution. High-impact action requires human review unless immediate protection is necessary.

## Response

Preserve relevant evidence, restrict access, stop public harm, investigate proportionately, record decision, notify affected users where required and review systemic gaps.

## Metrics

Duplicate rate, forged-evidence rate, reviewer disagreement, re-verification failure, review anomaly, account-takeover reports and loss/complaint impact.
