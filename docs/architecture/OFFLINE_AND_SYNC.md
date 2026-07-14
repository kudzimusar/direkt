# DIREKT Offline and Sync

## Principles

- distinguish cached, pending and confirmed state;
- never show trust/payment approval before server confirmation;
- preserve user work;
- retry safely;
- minimize data stored on device;
- expire sensitive temporary files.

## Read data

Cache:

- taxonomy;
- selected area;
- recent public profiles/results;
- own provider draft/status;
- own enquiries/notifications.

Show last-updated markers where stale data can affect a decision.

## Write data

Local queue items contain:

- client operation ID;
- entity/local draft ID;
- payload reference;
- created time;
- retry count;
- dependency state;
- user-visible state.

Server uses idempotency key. Conflict resolution is explicit, not last-write-wins for trust-sensitive data.

## Evidence upload

- local app-private file;
- preprocessing/validation;
- authorized upload session;
- progress;
- retry/resume if supported;
- checksum/finalization;
- cleanup only after durable acknowledgment or user cancellation;
- failure guidance.

## Authentication

Offline cache is inaccessible after logout and protected according to sensitivity. Expired session allows limited cached view but no claimed successful mutation.

## Testing

Airplane-mode transitions, process death, low storage, duplicate retries, expired upload authorization, server conflict and account switch.
