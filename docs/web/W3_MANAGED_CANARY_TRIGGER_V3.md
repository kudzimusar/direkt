# W3 Managed Auth/Session Canary V3 Trigger

**Purpose:** Request the corrected trusted dispatcher to execute the W3 managed canary from `main` against this pull request's exact merged base SHA.

**Scope:** Evidence only. This file contains no executable application, Android, backend, workflow or infrastructure change.

The dispatcher must reject any additional changed file, dispatch only the reviewed `main` workflow, wait for completion, report PASS or FAIL to the trigger pull request, and preserve all Firebase Web, real-participant, public-cutover and Phase 12 gates.
