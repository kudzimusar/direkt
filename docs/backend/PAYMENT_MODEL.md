# DIREKT Payment Model

## Scope

Initial payments are provider subscriptions/verification processing. Customer-to-provider service payments are out of MVP unless separately approved.

## Architecture

- payment provider adapter;
- payment intent/request;
- external reference;
- signed webhook ingestion;
- immutable provider events;
- internal ledger;
- invoice/receipt;
- reconciliation queue;
- refund/adjustment.

## Integrity

- integer minor units;
- explicit ZMW;
- idempotency;
- no client-authoritative success;
- webhook signature/replay protection;
- balanced ledger;
- manual adjustment requires reason/role/audit;
- separate commercial and trust domains.

## Provider selection criteria

Zambia availability, mobile-money/card methods, settlement, fees, API/webhook quality, sandbox, refunds, dispute handling, security, privacy, support and regulatory fit.

## Failure

Pending/unknown remains pending until reconciliation. Do not grant permanent entitlement from an unverifiable client callback.

## Compliance

Qualified financial/legal/accounting review required before production.
