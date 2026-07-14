# DIREKT Verification Test Cases

## State transitions

- submit complete/incomplete evidence;
- invalid direct transition to approved;
- action required and resubmission;
- reject/appeal;
- approve/current;
- expiry;
- renewal before/after expiry;
- revoke/suspend/reinstate;
- requirement version change.

## Identity matching

Name variation, mismatched person, expired document, duplicate identity, unreadable image and unauthorized submitter.

## Location

Mobile provider private base, fixed premises public consent, spoofed/mismatched pin, changed premises, service-area claim distinct from check and no private serialization.

## Roles

Provider cannot approve; reviewer cannot review own related provider; field agent only assigned case; finance cannot change trust; support sees limited evidence.

## Public claims

Correct scope/date/limitation; removed on expiry/revocation; no claim from payment; no original evidence URL.

## Audit

Every access, decision, override, public change and appeal emits required event.

## Concurrency

Two reviewers, stale provider resubmission, expiry job during renewal and duplicate finalization.
