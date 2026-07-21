# RC3 Crashlytics server-receipt checkpoint

RC3 remains `IMPLEMENTED_GATED / SYNTHETIC CANARY PENDING`.

The managed canary has already proven that the synthetic fatal crash is captured, persisted across restart, Crashlytics configuration is activated, and the report is handed to Google DataTransport. The previous proof gate was stale because it required legacy device-log strings (`Crashlytics report upload complete` / HTTP `204`) that are not emitted by the current Crashlytics Android SDK 20.0.6 DataTransport upload path.

This checkpoint strengthens, rather than weakens, managed proof:

1. fatal crash / ANR must still be generated only through the debug + synthetic-only canary path;
2. the process/OS signal must still be observed;
3. a device-side Crashlytics/DataTransport handoff signal must still be observed;
4. the Firebase Crashlytics Events API must return a newly received, server-processed event after the canary start time;
5. that event must carry the exact `direkt_source_sha` and matching `direkt_canary_kind` custom keys;
6. only a sanitized receipt (event identifier/timestamps, SDK version and bounded DIREKT canary keys) may be retained as CI evidence;
7. both fatal crash and ANR receipts must pass before RC3 status may be promoted or the workstream lane released.

No participant/production telemetry, Firebase Analytics, FCM, Test Lab, real communications, real payments, Phase 11 exit or Phase 12 production release is authorized by this checkpoint.

The official Crashlytics Events API is read-only for this proof and requires only Crashlytics data-read authority. No model/provider, participant, payment or database credential enters the Android client.
