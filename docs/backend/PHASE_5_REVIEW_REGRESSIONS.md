# Phase 5 Review Regressions

The pre-merge Phase 5 review identified and closed three discovery regressions:

1. Public discovery, profiles, claims and saves now re-check the current provider/category selection and require `status = 'selected'`. Removing a category immediately excludes the existing publication without exposing stale profile or saved-provider data.
2. Saved-provider reads now join the provider organization before applying the live provider-status gate, preventing the missing `FROM`-clause failure and retaining suspension enforcement.
3. The stale-claim end-to-end fixture derives expiry and degradation timestamps from the test clock, so the regression remains reproducible after July 2026.

Database-backed HTTP regressions cover category removal across search, profile, claims and saved-provider endpoints. Discovery repository and service unit suites provide permanent branch coverage without weakening the project-wide coverage thresholds.
