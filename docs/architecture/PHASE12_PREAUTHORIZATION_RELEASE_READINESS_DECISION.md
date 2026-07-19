# Phase 12 Preauthorization Release-Readiness Decision

**Decision date:** 2026-07-19  
**Status:** Accepted for protected preauthorization engineering only  
**Formal Phase 12 authorization:** Not granted

## Context

DIREKT has completed Phase 11 synthetic functional readiness and managed synthetic activation, but the real Zambia controlled pilot, 11C–11H `PRIMARY-PILOT` evidence and the 11J exit decision are still pending.

The Android production-release plan requires a reproducible Android App Bundle, release lint, current Play-policy checks, protected signing, internal/closed testing, production operations readiness and staged rollout controls. Before the real pilot is authorized, the repository can safely test release-variant buildability without signing, publishing or enabling production traffic.

## Decision

Add a permanent **preauthorization release-readiness CI gate** that may:

- run `lintRelease` and `bundleRelease`;
- build an unsigned Android App Bundle;
- verify the production application ID and target/compile SDK baseline;
- reject committed signing-key material and premature signing configuration;
- calculate a SHA-256 checksum;
- retain a short-lived CI artifact clearly marked `PREAUTHORIZATION / NOT FOR DISTRIBUTION`.

The workflow must not:

- sign with a production/upload key;
- upload to Google Play or any production distribution channel;
- enable public backend traffic;
- activate real Firebase participant entry;
- alter Phase 11 evidence classification;
- set release or pilot approval latches;
- authorize formal Phase 12.

## Alternatives considered

### Wait until Phase 11 is fully complete before testing the release variant

Rejected because release-variant build failures are engineering risks that can be detected safely now without touching real participant data or production systems. Deferring them would create avoidable release debt.

### Configure production signing and Play publishing now but keep rollout at zero

Rejected. Production signing credentials, Play publishing actions and production-track configuration create a materially stronger release capability than the current authorization permits and increase secret, policy and accidental-release risk.

### Reuse the existing debug Android CI as the release gate

Rejected. Debug APK success does not prove the release variant, release lint or Android App Bundle packaging succeeds.

## Security and privacy impact

- No signing secrets or service-account files are added.
- The workflow has read-only repository permissions.
- No real participant configuration or data is required.
- No deployment or external publishing action is present.
- Short artifact retention limits confusion and stale distribution risk.
- The artifact label explicitly prohibits distribution.

## Migration and compatibility impact

No database migration, API contract or runtime behavior changes are introduced. The gate validates the existing Android release variant only.

## Reversal conditions

Remove or redesign the gate if it begins requiring production credentials, external publishing permissions, real participant data, or a different release architecture. Formal signing/publishing must be introduced only under the approved Phase 12 release process after the Phase 11 and global release gates authorize it.

## Evidence

Promoted implementation: PR #125, merge `7b23d812b751345a740a34b77ad1b7890ed15cd1`.

The exact PR head passed:

- documentation quality;
- Phase 10 supply-chain/security;
- Phase 12 preauthorization release-readiness CI;
- `lintRelease`;
- `bundleRelease`;
- non-publishable artifact packaging and checksum generation.

This evidence proves release-variant buildability only. It is not production-release evidence and is not `PRIMARY-PILOT` evidence.
