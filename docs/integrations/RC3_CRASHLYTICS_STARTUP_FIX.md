# RC3 Crashlytics Canary Startup Fix

The managed Crashlytics workflow reached GitHub Actions `startup_failure` before any job or runner started.

The workflow used the runner-only `runner.temp` context at job-level environment scope. That value is now resolved only at the emulator provisioning step, where the runner context exists.

The temporary pull-request trigger workaround is removed. The reviewed manual `workflow_dispatch` contract remains authoritative.

This fix does not change Android application behavior, Crashlytics data policy, participant telemetry, FCM, Test Lab, production communications/payments, Phase 11 exit or Phase 12 production release.
