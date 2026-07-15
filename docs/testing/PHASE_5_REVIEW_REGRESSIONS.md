# Phase 5 Review Regressions

## Purpose

This record documents the release-blocking findings raised during review of the Phase 5 customer-discovery checkpoint and the regression evidence required before merge.

## Resolved findings

### Live category eligibility

Every public discovery read path now joins the provider's current category selection using provider, category and immutable requirement-version scope. The selection must remain `selected` when returning:

- search cards;
- provider profiles;
- scoped public claims;
- save eligibility;
- the post-save response; and
- saved-provider lists.

The end-to-end suite removes a published provider's selected category and proves that the provider immediately disappears from search, profile, claims, new saves and existing saved lists.

### Saved-provider organization scope

The saved-provider list now explicitly joins `provider.organizations` before applying the provider-status predicate. This prevents the missing `FROM`-clause failure found after the previously uncollected discovery suite was renamed into the repository's `*.e2e.spec.ts` convention.

### Time-stable stale-claim fixture

The stale-claim fixture now derives its claim expiry and degradation as-of timestamps from the test clock. It no longer depends on a fixed July 2026 date and remains reproducible on future runners.

## Additional coverage

Phase 5 includes dedicated unit coverage for the discovery service and repository, plus the full HTTP/PostGIS discovery suite. Coverage thresholds remain unchanged.

## Merge gate

The checkpoint may merge only when backend/PostGIS, Android, operations portal and documentation workflows all pass on one exact reviewed head and the review threads are resolved with this regression evidence.