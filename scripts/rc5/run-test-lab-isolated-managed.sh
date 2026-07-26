#!/usr/bin/env bash
set -euo pipefail

required_env=(
  SOURCE_SHA
  GCP_PROJECT_ID
  GCP_PROJECT_NUMBER
  GCP_DEPLOYER_SERVICE_ACCOUNT
  DIREKT_GRADLE_VERSION
  DIREKT_TEST_CLASS
  DIREKT_TEST_PACKAGE
  DIREKT_TEST_RUNNER
  GITHUB_RUN_ID
  GITHUB_RUN_ATTEMPT
  RUNNER_TEMP
  GITHUB_OUTPUT
  GITHUB_STEP_SUMMARY
)
for name in "${required_env[@]}"; do
  test -n "${!name:-}"
done

[[ "${SOURCE_SHA}" =~ ^[0-9a-f]{40}$ ]]
[[ "${GITHUB_RUN_ID}" =~ ^[1-9][0-9]*$ ]]
[[ "${GITHUB_RUN_ATTEMPT}" =~ ^[1-9][0-9]*$ ]]
test "${GCP_PROJECT_ID}" = "direkt-testlab-502701-20260726"
test "${GCP_PROJECT_NUMBER}" = "482116157386"
test "${GCP_DEPLOYER_SERVICE_ACCOUNT}" = "direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com"
test "${DIREKT_TEST_CLASS}" = "com.kudzimusar.direkt.DirektAppSmokeTest"
test "${DIREKT_TEST_PACKAGE}" = "com.kudzimusar.direkt.debug.test"
test "${DIREKT_TEST_RUNNER}" = "androidx.test.runner.AndroidJUnitRunner"

repo_root="$(pwd)"
android_root="${repo_root}/android/direkt-app"
test -d "${android_root}"
test ! -e "${android_root}/app/google-services.json"

pushd "${android_root}" >/dev/null
if [[ ! -f gradle/wrapper/gradle-wrapper.jar ]]; then
  wrapper_checksum="$(sed -n 's/^distributionSha256Sum=//p' gradle/wrapper/gradle-wrapper.properties)"
  [[ "${wrapper_checksum}" =~ ^[0-9a-f]{64}$ ]]
  gradle wrapper \
    --gradle-version "${DIREKT_GRADLE_VERSION}" \
    --distribution-type bin \
    --gradle-distribution-sha256-sum "${wrapper_checksum}"
fi
chmod +x gradlew
./gradlew --no-daemon --stacktrace testDebugUnitTest lintDebug assembleDebug assembleDebugAndroidTest

app_apk="$(find app/build/outputs/apk/debug -maxdepth 1 -type f -name '*-debug.apk' | head -n 1)"
test_apk="$(find app/build/outputs/apk/androidTest/debug -maxdepth 1 -type f -name '*-debug-androidTest.apk' | head -n 1)"
test -n "${app_apk}"
test -s "${app_apk}"
test -n "${test_apk}"
test -s "${test_apk}"
test ! -e app/google-services.json
app_apk="$(realpath "${app_apk}")"
test_apk="$(realpath "${test_apk}")"
app_apk_sha256="$(sha256sum "${app_apk}" | awk '{print $1}')"
test_apk_sha256="$(sha256sum "${test_apk}" | awk '{print $1}')"
[[ "${app_apk_sha256}" =~ ^[0-9a-f]{64}$ ]]
[[ "${test_apk_sha256}" =~ ^[0-9a-f]{64}$ ]]
popd >/dev/null

project_record="$(gcloud projects describe "${GCP_PROJECT_ID}" --format=json)"
test "$(jq -r '.projectId' <<< "${project_record}")" = "${GCP_PROJECT_ID}"
test "$(jq -r '.projectNumber' <<< "${project_record}")" = "${GCP_PROJECT_NUMBER}"
test "$(jq -r '.lifecycleState' <<< "${project_record}")" = "ACTIVE"

access_token="$(gcloud auth print-access-token)"
for service in firebase.googleapis.com testing.googleapis.com toolresults.googleapis.com; do
  service_state="$(
    curl --fail --silent --show-error \
      --header "Authorization: Bearer ${access_token}" \
      "https://serviceusage.googleapis.com/v1/projects/${GCP_PROJECT_NUMBER}/services/${service}" \
      | jq -r '.state'
  )"
  test "${service_state}" = "ENABLED"
done
firebase_project="$(
  curl --fail --silent --show-error \
    --header "Authorization: Bearer ${access_token}" \
    "https://firebase.googleapis.com/v1beta1/projects/${GCP_PROJECT_ID}"
)"
test "$(jq -r '.projectId' <<< "${firebase_project}")" = "${GCP_PROJECT_ID}"
unset access_token

member="serviceAccount:${GCP_DEPLOYER_SERVICE_ACCOUNT}"
project_policy="$(gcloud projects get-iam-policy "${GCP_PROJECT_ID}" --format=json)"
test "$(jq -r --arg member "${member}" '[.bindings[]? | select(.role == "roles/editor") | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" = "1"
test "$(jq -c --arg member "${member}" '[.bindings[]? | select(any(.members[]?; . == $member)) | .role] | unique | sort' <<< "${project_policy}")" = '["roles/editor"]'
if jq -e --arg member "${member}" '.bindings[]? | select(.role == "roles/owner") | .members[]? | select(. == $member)' <<< "${project_policy}" >/dev/null; then
  echo "The deployer has prohibited owner authority in the isolated Test Lab project." >&2
  exit 1
fi

python3 scripts/rc5/select-test-lab-matrix.py --self-test
gcloud firebase test android models list \
  --project "${GCP_PROJECT_ID}" \
  --filter=virtual \
  --format=json > "${RUNNER_TEMP}/rc5-test-lab-models.json"
gcloud firebase test android versions list \
  --project "${GCP_PROJECT_ID}" \
  --format=json > "${RUNNER_TEMP}/rc5-test-lab-versions.json"
test "$(jq 'length' "${RUNNER_TEMP}/rc5-test-lab-models.json")" -gt 0
test "$(jq 'length' "${RUNNER_TEMP}/rc5-test-lab-versions.json")" -gt 0
python3 scripts/rc5/select-test-lab-matrix.py \
  --models "${RUNNER_TEMP}/rc5-test-lab-models.json" \
  --output "${RUNNER_TEMP}/rc5-test-lab-matrix.json"
device_count="$(jq -r '.deviceCount' "${RUNNER_TEMP}/rc5-test-lab-matrix.json")"
test "${device_count}" = "3"
test "$(jq -r '[.targets[] | select(.version == "26")] | length' "${RUNNER_TEMP}/rc5-test-lab-matrix.json")" = "1"
test "$(jq -r '[.targets[] | select(.version == "33")] | length' "${RUNNER_TEMP}/rc5-test-lab-matrix.json")" = "1"
test "$(jq -r '[.targets[] | (.version | tonumber) | select(. >= 35 and . <= 36)] | length' "${RUNNER_TEMP}/rc5-test-lab-matrix.json")" = "1"
mapfile -t devices < <(jq -r '.targets[] | "--device=model=\(.model),version=\(.version),locale=\(.locale),orientation=\(.orientation)"' "${RUNNER_TEMP}/rc5-test-lab-matrix.json")
test "${#devices[@]}" = "3"

command_log="${RUNNER_TEMP}/rc5-test-lab-command.log"
receipt_file="${RUNNER_TEMP}/rc5-test-lab-receipt.json"
set +e
gcloud firebase test android run \
  --project "${GCP_PROJECT_ID}" \
  --type instrumentation \
  --app "${app_apk}" \
  --test "${test_apk}" \
  --test-targets "class ${DIREKT_TEST_CLASS}" \
  "${devices[@]}" \
  --timeout 5m \
  --num-flaky-test-attempts 0 \
  --no-use-orchestrator \
  --no-record-video \
  --no-performance-metrics \
  --no-auto-google-login \
  --results-history-name "direkt-rc5-isolated-android" \
  --client-details "matrixLabel=DIREKT RC5 isolated ${SOURCE_SHA:0:12} attempt ${GITHUB_RUN_ATTEMPT}" \
  2>&1 | tee "${command_log}"
exit_code="${PIPESTATUS[0]}"
set -e

echo "exit_code=${exit_code}" >> "${GITHUB_OUTPUT}"
if [[ "${exit_code}" -eq 0 ]]; then
  result="passed"
  category="PASSED"
else
  result="failed"
  case "${exit_code}" in
    10) category="TEST_CASE_FAILED" ;;
    15) category="INDETERMINATE" ;;
    18) category="UNSUPPORTED_DIMENSION" ;;
    19) category="CANCELED" ;;
    20) category="INFRASTRUCTURE_ERROR" ;;
    *) category="GENERAL_ERROR_${exit_code}" ;;
  esac
fi

jq -n \
  --arg sourceSha "${SOURCE_SHA}" \
  --arg runId "${GITHUB_RUN_ID}" \
  --arg runAttempt "${GITHUB_RUN_ATTEMPT}" \
  --arg appSha256 "${app_apk_sha256}" \
  --arg testSha256 "${test_apk_sha256}" \
  --arg project "${GCP_PROJECT_ID}" \
  --arg projectNumber "${GCP_PROJECT_NUMBER}" \
  --arg testClass "${DIREKT_TEST_CLASS}" \
  --arg result "${result}" \
  --arg category "${category}" \
  --argjson exitCode "${exit_code}" \
  --argjson matrix "$(cat "${RUNNER_TEMP}/rc5-test-lab-matrix.json")" \
  '{
    schema: "direkt.rc5.isolated-test-lab-receipt.v1",
    sourceSha: $sourceSha,
    githubRunId: $runId,
    githubRunAttempt: ($runAttempt | tonumber),
    appApkSha256: $appSha256,
    testApkSha256: $testSha256,
    project: $project,
    projectNumber: $projectNumber,
    resultsStorage: "firebase-managed-default-bucket",
    firebasePlan: "Spark-owner-verified",
    deployerRole: "roles/editor-isolated-project-only",
    testClass: $testClass,
    flakyRetries: 0,
    orchestrator: false,
    video: false,
    performanceMetrics: false,
    automaticGoogleLogin: false,
    exitCode: $exitCode,
    category: $category,
    result: $result,
    dataMode: "synthetic-public-safe-only",
    participantData: false,
    productionAuthorization: false,
    matrix: $matrix
  }' > "${receipt_file}"

{
  echo "### DIREKT RC5 isolated Firebase Test Lab"
  echo "- Source: \`${SOURCE_SHA}\`"
  echo "- GitHub run/attempt: \`${GITHUB_RUN_ID}/${GITHUB_RUN_ATTEMPT}\`"
  echo "- Project: \`${GCP_PROJECT_ID}\` (Spark, isolated)"
  echo "- App APK SHA-256: \`${app_apk_sha256}\`"
  echo "- Test APK SHA-256: \`${test_apk_sha256}\`"
  echo "- Test: \`${DIREKT_TEST_CLASS}\`"
  echo "- Device count: \`${device_count}\`"
  jq -r '.targets[] | "- Matrix: `\(.purpose)` → `\(.model)` / API `\(.version)`"' "${RUNNER_TEMP}/rc5-test-lab-matrix.json"
  echo "- Results storage: Firebase-managed default bucket"
  echo "- Exit/category: \`${exit_code}\` / \`${category}\`"
  echo "- Flaky retries: \`0\`"
  echo "- Participant/production authorization: \`false\`"
} >> "${GITHUB_STEP_SUMMARY}"

if [[ "${exit_code}" -ne 0 ]]; then
  echo "Firebase Test Lab failed with ${category}." >&2
  exit "${exit_code}"
fi
