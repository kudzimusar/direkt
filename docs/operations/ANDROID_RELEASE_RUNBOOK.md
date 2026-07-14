# DIREKT Android Release Runbook

## Prepare

- select approved commit;
- update version code/name and release notes;
- verify API compatibility;
- run full test/device/accessibility gates;
- confirm current Play policy/target API;
- build signed AAB through protected process;
- verify signature and artifact hash.

## Internal/closed test

Upload, configure testers, validate install/update/deep links/notifications, review pre-launch report, monitor crashes and collect structured feedback.

## Production

Staged rollout with percentage and observation window. Confirm backend capacity/support. Pause on stop criteria.

## Hotfix

Branch/process follows owner authorization but never force rewrites history. Minimal change, full relevant regression, new version code and documented incident/defect.

## Record

Commit, artifact hash, track, rollout, approval, known issues and final status.
