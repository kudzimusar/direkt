# DIREKT Bug Severity Model

## Critical

Active security/privacy breach, false trust approval at scale, payment corruption, unrecoverable data loss, widespread outage or immediate safety harm. Stop rollout and incident process.

## High

Authorization bypass, private location/evidence exposure, major critical-flow failure, incorrect expiry/suspension, high crash/ANR or inaccessible core flow. Blocks phase/release.

## Medium

Material feature defect with workaround, partial incorrect information not creating immediate safety risk, performance/accessibility regression outside critical path.

## Low

Cosmetic, minor copy/layout or low-impact edge case.

## Priority

Severity is impact; priority considers urgency, frequency, exposure and dependencies. Trust/privacy defects are not downgraded because few users reported them.

## Closure

Reproduction, root cause, fix, regression test, affected-version review and documentation/risk update where needed.
