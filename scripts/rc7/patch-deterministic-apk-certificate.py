#!/usr/bin/env python3
from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    text = target.read_text(encoding="utf-8")
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"missing expected source in {path}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


managed = "scripts/rc7/run-maps-managed.sh"
old_android = '''pushd android/direkt-app >/dev/null
DIREKT_MAPS_BUILD_ENABLED=true \\
DIREKT_MAPS_SYNTHETIC_CANARY_APPROVED=true \\
DIREKT_ANDROID_MAPS_API_KEY="$(cat "${RUNNER_TEMP}/rc7-android-key.txt")" \\
gradle --no-daemon --stacktrace \\
  :app:assembleDebug \\
  :app:assembleDebugAndroidTest
popd >/dev/null
rm -f "${RUNNER_TEMP}/rc7-android-key.txt"

app_apk="android/direkt-app/app/build/outputs/apk/debug/app-debug.apk"
test_apk="android/direkt-app/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk"
test -f "${app_apk}"
test -f "${test_apk}"
apksigner_bin="$(find "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}/build-tools" -type f -name apksigner | sort -V | tail -n 1)"
test -x "${apksigner_bin}"
apk_certificate_sha1="$("${apksigner_bin}" verify --print-certs "${app_apk}" \\
  | awk -F': ' '/Signer #1 certificate SHA-1 digest:/{print $2; exit}' \\
  | tr -d ':' \\
  | tr '[:lower:]' '[:upper:]')"
[[ "${apk_certificate_sha1}" =~ ^[0-9A-F]{40}$ ]]
test "${apk_certificate_sha1}" = "${android_sha1^^}"
jq -n \\
  --arg packageName "${ANDROID_PACKAGE}" \\
  --arg certificateSha1 "${apk_certificate_sha1}" \\
  '{packageName: $packageName, certificateSha1: $certificateSha1, matchesRestrictedKey: true}' \\
  > "${RUNNER_TEMP}/rc7-android-apk-certificate.json"
receipt "android_apk_certificate_sha1=${apk_certificate_sha1}"
receipt "android_apk_certificate_matches_key=true"
'''
new_android = '''pushd android/direkt-app >/dev/null
DIREKT_MAPS_BUILD_ENABLED=true \\
DIREKT_MAPS_SYNTHETIC_CANARY_APPROVED=true \\
DIREKT_ANDROID_MAPS_API_KEY="$(cat "${RUNNER_TEMP}/rc7-android-key.txt")" \\
gradle --no-daemon --stacktrace --no-build-cache clean \\
  :app:assembleDebug \\
  :app:assembleDebugAndroidTest
popd >/dev/null
rm -f "${RUNNER_TEMP}/rc7-android-key.txt"
receipt "android_clean_build=true"
receipt "android_build_cache_enabled=false"

app_apk="android/direkt-app/app/build/outputs/apk/debug/app-debug.apk"
test_apk="android/direkt-app/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk"
test -f "${app_apk}"
test -f "${test_apk}"
android_sdk_root="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
test -n "${android_sdk_root}"
apksigner_bin="$(find "${android_sdk_root}/build-tools" -type f -name apksigner -perm -u+x | sort -V | tail -n 1)"
test -x "${apksigner_bin}"
apksigner_stderr="${RUNNER_TEMP}/rc7-apksigner.stderr"
set +e
apksigner_output="$("${apksigner_bin}" verify --print-certs "${app_apk}" 2> "${apksigner_stderr}")"
apksigner_code=$?
set -e
apk_certificate_sha1="$(awk -F': ' '/Signer #1 certificate SHA-1 digest:/{print $2; exit}' <<< "${apksigner_output}" \\
  | tr -d ':' \\
  | tr '[:lower:]' '[:upper:]')"
apk_certificate_format_valid=false
if [[ "${apk_certificate_sha1}" =~ ^[0-9A-F]{40}$ ]]; then
  apk_certificate_format_valid=true
fi
certificate_matches=false
if ${apk_certificate_format_valid} && [[ "${apk_certificate_sha1}" = "${android_sha1^^}" ]]; then
  certificate_matches=true
fi
jq -n \\
  --arg packageName "${ANDROID_PACKAGE}" \\
  --arg expectedCertificateSha1 "${android_sha1^^}" \\
  --arg actualCertificateSha1 "${apk_certificate_sha1}" \\
  --argjson apksignerExitCode "${apksigner_code}" \\
  --argjson certificateFormatValid "${apk_certificate_format_valid}" \\
  --argjson matchesRestrictedKey "${certificate_matches}" \\
  '{schema: "direkt.rc7.android-apk-certificate.v2", packageName: $packageName, expectedCertificateSha1: $expectedCertificateSha1, actualCertificateSha1: (if $actualCertificateSha1 == "" then null else $actualCertificateSha1 end), apksignerExitCode: $apksignerExitCode, certificateFormatValid: $certificateFormatValid, matchesRestrictedKey: $matchesRestrictedKey, cleanBuild: true, buildCacheEnabled: false, rawStderrIncluded: false}' \\
  > "${RUNNER_TEMP}/rc7-android-apk-certificate.json"
receipt "android_apk_certificate_sha1=${apk_certificate_sha1:-unavailable}"
receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"
receipt "android_apk_certificate_matches_key=${certificate_matches}"
if [[ "${apksigner_code}" -ne 0 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then
  cat "${RUNNER_TEMP}/rc7-android-apk-certificate.json" >&2
  exit 1
fi
rm -f "${apksigner_stderr}"
'''
replace_once(managed, old_android, new_android)

path = Path(managed)
text = path.read_text(encoding="utf-8")
if "*/\x01/p'" in text:
    text = text.replace("*/\x01/p'", "*/\\1/p'", 1)
elif "*/\\1/p'" not in text:
    raise SystemExit("missing Test Lab matrix backreference")
path.write_text(text, encoding="utf-8")

replace_once(
    "scripts/rc7/verify-maps-contract.py",
    '''        "--num-flaky-test-attempts 0",
        "apksigner",
        "android_apk_certificate_matches_key=true",
        "collect-testlab-failure.py",''',
    '''        "--num-flaky-test-attempts 0",
        "--no-build-cache",
        "android_clean_build=true",
        "android_build_cache_enabled=false",
        "apksigner",
        "certificateFormatValid",
        "rawStderrIncluded",
        'receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"',
        'receipt "android_apk_certificate_matches_key=${certificate_matches}"',
        'if [[ "${apksigner_code}" -ne 0 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then',
        "collect-testlab-failure.py",''',
)
replace_once(
    "scripts/rc7/verify-maps-contract.py",
    '''    prohibit(managed_workflow, r"rc7-(android|backend)-key\\.txt", "API key value artifact upload")''',
    '''    prohibit(managed_script, r'cat "\\$\\{apksigner_stderr\\}"', "Raw apksigner stderr must not be printed.")
    require(managed_script, "*/\\\\1/p'", "Test Lab matrix backreference")
    prohibit(managed_workflow, r"rc7-(android|backend)-key\\.txt", "API key value artifact upload")''',
)

replace_once(
    "scripts/rc7/verify-managed-workflow-context.py",
    '''    if "rc7-maps-canary-logs.json" in workflow or "rc7-maps-execution-details.json" in workflow:
        raise AssertionError("RC7 must never upload raw canary logs or raw execution details.")
''',
    '''    if "rc7-maps-canary-logs.json" in workflow or "rc7-maps-execution-details.json" in workflow:
        raise AssertionError("RC7 must never upload raw canary logs or raw execution details.")

    for marker in (
        "--no-build-cache",
        'receipt "android_clean_build=true"',
        'receipt "android_build_cache_enabled=false"',
        '"certificateFormatValid"',
        '"rawStderrIncluded"',
        'receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"',
        'receipt "android_apk_certificate_matches_key=${certificate_matches}"',
        'if [[ "${apksigner_code}" -ne 0 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then',
        "*/\\\\1/p'",
    ):
        require_present(managed_script, marker, "Deterministic APK certificate evidence drifted.")
    certificate_artifact_write = managed_script.find(
        '> "${RUNNER_TEMP}/rc7-android-apk-certificate.json"'
    )
    certificate_failure_check = managed_script.find(
        'if [[ "${apksigner_code}" -ne 0 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then'
    )
    if not (0 <= certificate_artifact_write < certificate_failure_check):
        raise AssertionError("APK certificate evidence must be written before fail-closed validation.")
    prohibit(managed_script, r'cat "\\$\\{apksigner_stderr\\}"', "Raw apksigner stderr must not be printed.")
''',
)
replace_once(
    "scripts/rc7/verify-managed-workflow-context.py",
    '''    print("final_apk_certificate_verified=true")''',
    '''    print("final_apk_certificate_verified=true")
    print("clean_no_cache_apk_build=true")
    print("certificate_evidence_written_before_failure=true")''',
)

status_path = "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
old_status = '| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** | RC7 preserves the restricted Android key and privacy-safe native rendering; backend Geocoding uses v4 through the assigned Cloud Run service identity with a downscoped address-only OAuth token. Run `30210742617/1` exposed the billing-account boundary and was corrected without granting CI billing IAM. Exact-main run `30225624823/1` proved the infrastructure path but exposed ranked-result selection, which is corrected. Exact-main run `30226241329/1` then proved the backend Geocoding v4 OAuth canary, budget, quota, Android key restriction, immutable image and cleanup; the remaining failure is one API 36 instrumentation test in matrix `matrix-3gndt2ks91n33`. The next proof verifies the certificate embedded in the final APK and captures bounded Tool Results test-case evidence while continuing to require actual map Ready state. |'
new_status = '| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** | RC7 preserves the restricted Android key and privacy-safe native rendering; backend Geocoding uses v4 through the assigned Cloud Run service identity with a downscoped address-only OAuth token. Earlier corrections removed billing-account IAM, backend keys/NAT and result-zero authority. Exact-main run `30226241329/1` reached API 36 Test Lab and exposed a map-ready failure. Exact-main run `30228282694/1` then proved the backend, budget, quota, key metadata and cleanup but failed after a successful Android build and before Test Lab because final APK certificate evidence was not written. The next proof uses a clean no-build-cache APK build, writes expected/actual certificate evidence before fail-closed comparison, and retains the real map-ready requirement. |'
replace_once(status_path, old_status, new_status)

ledger_path = "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
old_ledger = '| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` | RC7 keeps the restricted Android key, Maps Compose latch, bounded Zambia normalization, privacy-safe rendering and manual/list fallback. Backend Geocoding uses v4 service-identity OAuth; backend keys, Maps secrets, Direct VPC egress and Cloud NAT are prohibited. Run `30210742617/1` exposed the billing-account boundary and was corrected without granting CI billing IAM. Exact-main run `30225624823/1` proved WIF, fresh owner budget attestation, quota, key restriction, immutable image, OAuth execution and cleanup, then failed before Test Lab because result zero was outside Zambia. The corrective adapter iterates ranked results and accepts only a structurally valid candidate with an independent `ZM` country signal and coordinates inside the unchanged Zambia bounds. Artifact `8638498996`, digest `sha256:55c3b9f581ee899b5f1cac7e2a99e5d7851faedb00def2ba887e760e22a8a56a`; Cloud Run Job cleanup passed. |'
new_ledger = '| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` | RC7 keeps the restricted Android key, Maps Compose latch, bounded Zambia normalization, privacy-safe rendering and manual/list fallback. Backend Geocoding uses v4 service-identity OAuth; backend keys, Maps secrets, Direct VPC egress and Cloud NAT are prohibited. Run `30226241329/1` reached Test Lab and preserved its API 36 map-ready failure. Run `30228282694/1` on `40faf2e8e708994f448a3877cc9475739a0957a4` passed WIF, fresh owner budget attestation, quota, key restriction, immutable backend image, OAuth canary and cleanup, then failed after a successful Android build before certificate evidence/Test Lab. Artifact `8639272798`, digest `sha256:ddc1101960be5ca7d6daaea263a10bad5e25b697886bcf23cb5e2bb79c028323`. The correction forces a clean no-build-cache APK build and writes expected/actual certificate evidence before fail-closed comparison. |'
replace_once(ledger_path, old_ledger, new_ledger)

notes = "docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md"
replace_once(notes, '**Corrective baseline:** `main@6378be60199ce567671a4a307dedf5288b8be1ca`', '**Corrective baseline:** `main@40faf2e8e708994f448a3877cc9475739a0957a4`')
anchor = 'The managed proof now verifies the SHA-1 certificate embedded in the final debug APK and requires it to equal the certificate restriction applied to the synthetic Android key. When Test Lab fails, the authenticated exact-main job queries the Testing and Tool Results APIs and writes a whitelisted receipt containing matrix state, step outcome, test-case identity and bounded stack traces. Raw logs, opaque tool outputs, credentials, API-key values, coordinates and participant data remain excluded. The instrumentation assertion still requires `discovery-map-ready`; a privacy-safe fallback is diagnostic evidence, not a pass.\n'
insert = anchor + '\n## Deterministic APK certificate correction\n\nExact-main run `30228282694/1` on `40faf2e8e708994f448a3877cc9475739a0957a4` passed exact-source controls, WIF, the fresh one-JPY budget attestation, quota verification, Android key restriction, immutable backend execution, Geocoding v4 OAuth and Cloud Run cleanup. The Android build then completed successfully with 70 actionable tasks, including 34 restored from Gradle cache, but the script exited before writing the final APK certificate artifact or starting Test Lab. Artifact `8639272798` has digest `sha256:ddc1101960be5ca7d6daaea263a10bad5e25b697886bcf23cb5e2bb79c028323`; `cleanup.cloud_run_job_deleted=true` and `cleanup_failed=false`.\n\nThe next proof runs `clean` with `--no-build-cache`, extracts the certificate from the newly packaged APK, writes a sanitized expected/actual certificate receipt before validation, and fails closed on an `apksigner` error, malformed fingerprint or mismatch. Raw `apksigner` stderr is neither printed nor uploaded. The unexecuted Test Lab failure parser is also corrected to retain the real matrix ID through a literal `\\1` backreference.\n'
replace_once(notes, anchor, insert)
