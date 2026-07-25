#!/usr/bin/env bash
set -euo pipefail

required_env=(
  SOURCE_SHA
  GCP_PROJECT_ID
  GCP_PROJECT_NUMBER
  GCP_TEST_LAB_RUNNER_ROLE
  GCP_TEST_LAB_RESULTS_ROLE
  GCP_TEST_LAB_INPUT_ROLE
  GCP_TEST_LAB_RESULTS_BUCKET
  GCP_TEST_LAB_INPUT_BUCKET
  GCP_TEST_LAB_RESULTS_LOCATION
  GCP_TEST_LAB_RESULTS_RETENTION_DAYS
  GCP_TEST_LAB_INPUT_RETENTION_DAYS
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
test "${GCP_PROJECT_ID}" = "direkt-dev-502701"
test "${GCP_PROJECT_NUMBER}" = "264358173369"
test "${GCP_TEST_LAB_RESULTS_BUCKET}" = "gs://direkt-test-lab-results-${GCP_PROJECT_NUMBER}"
test "${GCP_TEST_LAB_INPUT_BUCKET}" = "gs://direkt-test-lab-inputs-${GCP_PROJECT_NUMBER}"
test "${GCP_TEST_LAB_RESULTS_LOCATION}" = "asia-northeast1"
test "${GCP_TEST_LAB_RESULTS_RETENTION_DAYS}" = "30"
test "${GCP_TEST_LAB_INPUT_RETENTION_DAYS}" = "1"
test "${DIREKT_TEST_CLASS}" = "com.kudzimusar.direkt.DirektAppSmokeTest"
test "${DIREKT_TEST_PACKAGE}" = "com.kudzimusar.direkt.debug.test"
test "${DIREKT_TEST_RUNNER}" = "androidx.test.runner.AndroidJUnitRunner"

repo_root="$(pwd)"
android_root="${repo_root}/android/direkt-app"
permission_manifest="${repo_root}/scripts/rc5/test-lab-runner-permissions.txt"
append_only_uploader="${repo_root}/scripts/rc5/append-only-storage-upload.sh"
test -d "${android_root}"
test -s "${permission_manifest}"
test -s "${append_only_uploader}"
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

access_token="$(gcloud auth print-access-token)"
for service in testing.googleapis.com toolresults.googleapis.com; do
  service_state="$(
    curl --fail --silent --show-error \
      --header "Authorization: Bearer ${access_token}" \
      "https://serviceusage.googleapis.com/v1/projects/${GCP_PROJECT_NUMBER}/services/${service}" \
      | jq -r '.state'
  )"
  test "${service_state}" = "ENABLED"
done
unset access_token

member="serviceAccount:${GCP_DEPLOYER_SERVICE_ACCOUNT}"
project_policy="$(gcloud projects get-iam-policy "${GCP_PROJECT_ID}" --format=json)"
test "$(jq -r --arg member "${member}" --arg role "${GCP_TEST_LAB_RUNNER_ROLE}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" = "1"
test "$(jq -r --arg member "${member}" --arg role "${GCP_TEST_LAB_RESULTS_ROLE}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" = "0"
test "$(jq -r --arg member "${member}" --arg role "${GCP_TEST_LAB_INPUT_ROLE}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" = "0"
for prohibited_role in roles/owner roles/editor roles/cloudtestservice.testAdmin roles/firebase.analyticsViewer roles/storage.admin roles/storage.objectAdmin roles/storage.objectUser roles/storage.objectViewer; do
  if jq -e --arg member "${member}" --arg role "${prohibited_role}" '.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)' <<< "${project_policy}" >/dev/null; then
    echo "Prohibited broad project-level role ${prohibited_role} is bound to the GitHub deployer." >&2
    exit 1
  fi
done
bash scripts/rc5/verify-no-project-storage-roles.sh "${GCP_PROJECT_ID}" "${member}"

runner_permissions="$(gcloud iam roles describe direktTestLabRunner --project "${GCP_PROJECT_ID}" --format='value(includedPermissions)' | tr ';' '\n' | sed '/^$/d' | sort -u)"
expected_runner_permissions="$(sed '/^$/d' "${permission_manifest}" | sort -u)"
test "${runner_permissions}" = "${expected_runner_permissions}"
if grep -Eq '^storage\.' <<< "${runner_permissions}"; then
  echo "The project-scoped Test Lab runner role contains prohibited Cloud Storage permissions." >&2
  exit 1
fi

results_permissions="$(gcloud iam roles describe direktTestLabResultsWriter --project "${GCP_PROJECT_ID}" --format='value(includedPermissions)' | tr ';' '\n' | sed '/^$/d' | sort -u)"
expected_results_permissions=$'storage.buckets.get\nstorage.buckets.getIamPolicy\nstorage.objects.create'
test "${results_permissions}" = "${expected_results_permissions}"
input_permissions="$(gcloud iam roles describe direktTestLabInputStager --project "${GCP_PROJECT_ID}" --format='value(includedPermissions)' | tr ';' '\n' | sed '/^$/d' | sort -u)"
expected_input_permissions=$'storage.buckets.get\nstorage.buckets.getIamPolicy\nstorage.objects.create\nstorage.objects.get'
test "${input_permissions}" = "${expected_input_permissions}"
if grep -Eq '^storage\.objects\.(delete|list|update)$' <<< "${input_permissions}"; then
  echo "The input-stager role contains prohibited object list/delete/update authority." >&2
  exit 1
fi

verify_bucket_boundary() {
  local bucket_uri="$1"
  local expected_role="$2"
  local retention_days="$3"
  local record policy

  record="$(gcloud storage buckets describe "${bucket_uri}" --project "${GCP_PROJECT_ID}" --format='json(location,uniform_bucket_level_access,lifecycle_config)')"
  test "$(jq -r '.location' <<< "${record}" | tr '[:upper:]' '[:lower:]')" = "${GCP_TEST_LAB_RESULTS_LOCATION}"
  test "$(jq -r '.uniform_bucket_level_access // false' <<< "${record}")" = "true"
  test "$(jq -r --argjson age "${retention_days}" '(.lifecycle_config.rule // []) | length == 1 and .[0].action.type == "Delete" and .[0].condition.age == $age' <<< "${record}")" = "true"

  policy="$(gcloud storage buckets get-iam-policy "${bucket_uri}" --format=json)"
  test "$(jq -r --arg role "${expected_role}" '[.bindings[]? | select(.role == $role)] | length' <<< "${policy}")" = "1"
  test "$(jq -r --arg member "${member}" --arg role "${expected_role}" '[.bindings[]? | select(.role == $role) | .members] | length == 1 and .[0] == [$member]' <<< "${policy}")" = "true"
  test "$(jq -r --arg member "${member}" '[.bindings[]? | select(any(.members[]?; . == $member)) | .role] | sort | join("\n")' <<< "${policy}")" = "${expected_role}"
}

verify_bucket_boundary "${GCP_TEST_LAB_RESULTS_BUCKET}" "${GCP_TEST_LAB_RESULTS_ROLE}" "${GCP_TEST_LAB_RESULTS_RETENTION_DAYS}"
verify_bucket_boundary "${GCP_TEST_LAB_INPUT_BUCKET}" "${GCP_TEST_LAB_INPUT_ROLE}" "${GCP_TEST_LAB_INPUT_RETENTION_DAYS}"

printf '{"kind":"direkt_rc5_storage_preflight","sourceSha":"%s","runAttempt":"%s"}\n' "${SOURCE_SHA}" "${GITHUB_RUN_ATTEMPT}" > "${RUNNER_TEMP}/rc5-storage-preflight.json"
results_bucket_name="${GCP_TEST_LAB_RESULTS_BUCKET#gs://}"
preflight_object="rc5/preflight/${GITHUB_RUN_ID}/${GITHUB_RUN_ATTEMPT}.json"
bash "${append_only_uploader}" \
  "${GCP_PROJECT_NUMBER}" \
  "${results_bucket_name}" \
  "${preflight_object}" \
  "${RUNNER_TEMP}/rc5-storage-preflight.json"

input_bucket_name="${GCP_TEST_LAB_INPUT_BUCKET#gs://}"
input_prefix="rc5/inputs/${SOURCE_SHA}/${GITHUB_RUN_ID}/attempt-${GITHUB_RUN_ATTEMPT}"
app_input_object="${input_prefix}/app-${app_apk_sha256}.apk"
test_input_object="${input_prefix}/test-${test_apk_sha256}.apk"
bash "${append_only_uploader}" \
  "${GCP_PROJECT_NUMBER}" \
  "${input_bucket_name}" \
  "${app_input_object}" \
  "${app_apk}"
bash "${append_only_uploader}" \
  "${GCP_PROJECT_NUMBER}" \
  "${input_bucket_name}" \
  "${test_input_object}" \
  "${test_apk}"
app_input_uri="gs://${input_bucket_name}/${app_input_object}"
test_input_uri="gs://${input_bucket_name}/${test_input_object}"

python scripts/rc5/select-test-lab-matrix.py --self-test
gcloud firebase test android models list \
  --project "${GCP_PROJECT_ID}" \
  --filter=virtual \
  --format=json > "${RUNNER_TEMP}/rc5-test-lab-models.json"
gcloud firebase test android versions list \
  --project "${GCP_PROJECT_ID}" \
  --format=json > "${RUNNER_TEMP}/rc5-test-lab-versions.json"
test "$(jq 'length' "${RUNNER_TEMP}/rc5-test-lab-models.json")" -gt 0
test "$(jq 'length' "${RUNNER_TEMP}/rc5-test-lab-versions.json")" -gt 0
python scripts/rc5/select-test-lab-matrix.py \
  --models "${RUNNER_TEMP}/rc5-test-lab-models.json" \
  --output "${RUNNER_TEMP}/rc5-test-lab-matrix.json"

device_count="$(jq -r '.deviceCount' "${RUNNER_TEMP}/rc5-test-lab-matrix.json")"
[[ "${device_count}" =~ ^[23]$ ]]
test "$(jq -r '[.targets[] | select(.version == "33")] | length' "${RUNNER_TEMP}/rc5-test-lab-matrix.json")" = "1"
test "$(jq -r '[.targets[] | (.version | tonumber) | select(. >= 35 and . <= 36)] | length' "${RUNNER_TEMP}/rc5-test-lab-matrix.json")" = "1"
mapfile -t devices < <(jq -r '.targets[] | "--device=model=\(.model),version=\(.version),locale=\(.locale),orientation=\(.orientation)"' "${RUNNER_TEMP}/rc5-test-lab-matrix.json")
test "${#devices[@]}" -ge 2
test "${#devices[@]}" -le 3

results_dir="rc5/${SOURCE_SHA}/${GITHUB_RUN_ID}/attempt-${GITHUB_RUN_ATTEMPT}"
set +e
gcloud firebase test android run \
  --project "${GCP_PROJECT_ID}" \
  --type instrumentation \
  --app "${app_input_uri}" \
  --test "${test_input_uri}" \
  --test-targets "class ${DIREKT_TEST_CLASS}" \
  "${devices[@]}" \
  --timeout 5m \
  --num-flaky-test-attempts 0 \
  --no-use-orchestrator \
  --no-record-video \
  --no-performance-metrics \
  --no-auto-google-login \
  --results-bucket "${GCP_TEST_LAB_RESULTS_BUCKET}" \
  --results-dir "${results_dir}" \
  --results-history-name "direkt-rc5-android" \
  --client-details "matrixLabel=DIREKT RC5 ${SOURCE_SHA:0:12} attempt ${GITHUB_RUN_ATTEMPT}" \
  2>&1 | tee "${RUNNER_TEMP}/rc5-test-lab-command.log"
exit_code="${PIPESTATUS[0]}"
set -e
echo "exit_code=${exit_code}" >> "${GITHUB_OUTPUT}"
echo "results_dir=${results_dir}" >> "${GITHUB_OUTPUT}"
if [[ "${exit_code}" -ne 0 ]]; then
  case "${exit_code}" in
    10) category="TEST_CASE_FAILED" ;;
    15) category="INDETERMINATE" ;;
    18) category="UNSUPPORTED_DIMENSION" ;;
    19) category="CANCELED" ;;
    20) category="INFRASTRUCTURE_ERROR" ;;
    *) category="GENERAL_ERROR_${exit_code}" ;;
  esac
  echo "Firebase Test Lab failed with ${category}." >&2
  exit "${exit_code}"
fi

jq -n \
  --arg sourceSha "${SOURCE_SHA}" \
  --arg runId "${GITHUB_RUN_ID}" \
  --arg runAttempt "${GITHUB_RUN_ATTEMPT}" \
  --arg appSha256 "${app_apk_sha256}" \
  --arg testSha256 "${test_apk_sha256}" \
  --arg project "${GCP_PROJECT_ID}" \
  --arg resultsBucket "${GCP_TEST_LAB_RESULTS_BUCKET}" \
  --arg resultsDir "${results_dir}" \
  --arg inputBucket "${GCP_TEST_LAB_INPUT_BUCKET}" \
  --arg inputPrefix "${input_prefix}" \
  --arg testClass "${DIREKT_TEST_CLASS}" \
  --argjson matrix "$(cat "${RUNNER_TEMP}/rc5-test-lab-matrix.json")" \
  '{
    schema: "direkt.rc5.test-lab-receipt.v1",
    sourceSha: $sourceSha,
    githubRunId: $runId,
    githubRunAttempt: ($runAttempt | tonumber),
    appApkSha256: $appSha256,
    testApkSha256: $testSha256,
    project: $project,
    resultsBucket: $resultsBucket,
    resultsDir: $resultsDir,
    inputBucket: $inputBucket,
    inputPrefix: $inputPrefix,
    inputRetentionDays: 1,
    inputObjectAccess: "create-get-no-list-delete-update",
    testClass: $testClass,
    flakyRetries: 0,
    orchestrator: false,
    video: false,
    performanceMetrics: false,
    automaticGoogleLogin: false,
    result: "passed",
    dataMode: "synthetic-public-safe-only",
    productionAuthorization: false,
    matrix: $matrix
  }' > "${RUNNER_TEMP}/rc5-test-lab-receipt.json"

{
  echo "### DIREKT RC5 Firebase Test Lab"
  echo "- Source: \`${SOURCE_SHA}\`"
  echo "- GitHub run/attempt: \`${GITHUB_RUN_ID}/${GITHUB_RUN_ATTEMPT}\`"
  echo "- App APK SHA-256: \`${app_apk_sha256}\`"
  echo "- Test APK SHA-256: \`${test_apk_sha256}\`"
  echo "- Test: \`${DIREKT_TEST_CLASS}\`"
  echo "- Device count: \`${device_count}\`"
  jq -r '.targets[] | "- Matrix: `\(.purpose)` → `\(.model)` / API `\(.version)`"' "${RUNNER_TEMP}/rc5-test-lab-matrix.json"
  echo "- Inputs: \`${GCP_TEST_LAB_INPUT_BUCKET}/${input_prefix}\` (1-day lifecycle, create/get only)"
  echo "- Results: \`${GCP_TEST_LAB_RESULTS_BUCKET}/${results_dir}\` (30-day lifecycle)"
  echo "- Flaky retries: \`0\`"
  echo "- Automatic Google login: \`false\`"
  echo "- Participant/production authorization: \`false\`"
} >> "${GITHUB_STEP_SUMMARY}"
