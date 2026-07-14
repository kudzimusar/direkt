# DIREKT Subscription Model

## Entities

Plan → plan version → entitlements → provider subscription → billing period → payment attempts/events → invoice/receipt → ledger.

## States

`TRIALING`, `ACTIVE`, `PAST_DUE`, `GRACE`, `PAUSED`, `CANCELLED`, `EXPIRED`.

Verification state is never stored in subscription.

## Entitlements

Examples:

- public eligible profile;
- number of provider members;
- analytics depth;
- portfolio limits;
- institutional features;
- support tier.

Safety, evidence correction, complaint response and data access rights cannot be unfairly blocked by plan.

## Lifecycle

Start, renew, upgrade/downgrade, failed payment, grace, cancel, resume and refund each have effective-time rules and audit.

## Payment processing

Vendor adapter, signed webhook, idempotent event, internal ledger and reconciliation. Provider-facing state does not rely solely on redirect success.

## Pricing versions

Existing subscription references accepted plan version; changes require effective date and notice.
