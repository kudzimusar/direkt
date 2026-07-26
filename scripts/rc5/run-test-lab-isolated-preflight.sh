#!/usr/bin/env bash
set -uo pipefail

project_id="${GCP_PROJECT_ID:-direkt-testlab-502701-20260726}"
project_number="${GCP_PROJECT_NUMBER:-482116157386}"
deployer_sa="${GCP_DEPLOYER_SERVICE_ACCOUNT:-direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com}"
source_sha="${SOURCE_SHA:-}"
correlation_id="${RC5_PREFLIGHT_CORRELATION:-}"
receipt="${RC5_PREFLIGHT_RECEIPT:-}"
matrix_output="${RC5_PREFLIGHT_MATRIX:-}"

[[ "${project_id}" == "direkt-testlab-502701-20260726" ]]
[[ "${project_number}" == "482116157386" ]]
[[ "${deployer_sa}" == "direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com" ]]
[[ "${source_sha}" =~ ^[0-9a-f]{40}$ ]]
[[ "${correlation_id}" =~ ^rc5-isolated-[0-9]+-[1-9][0-9]*$ ]]
[[ -n "${receipt}" ]]
[[ -n "${matrix_output}" ]]

mkdir -p "$(dirname "${receipt}")" "$(dirname "${matrix_output}")"
cat > "${receipt}" <<EOF
SOURCE|${source_sha}
CORRELATION|${correlation_id}
MODE|isolated_spark_metadata_iam_catalog_only
RESOURCE_MUTATION|false
MATRIX_EXECUTED|false
SECRET_VALUES_ACCESSED|false
PARTICIPANT_DATA_ACCESSED|false
PRODUCTION_AUTHORIZATION|false
RESULTS_STORAGE|firebase_managed_default_bucket
EOF
cat > "${matrix_output}" <<'EOF'
{
  "schema": "direkt.rc5.isolated-test-lab-preflight-matrix.v1",
  "selected": false
}
EOF

failures=0
mark_pass() {
  printf 'PASS|%s\n' "$1" >> "${receipt}"
}
mark_fail() {
  printf 'FAIL|%s\n' "$1" >> "${receipt}"
  failures=$((failures + 1))
}

workdir="$(mktemp -d)"
trap 'rm -rf "${workdir}"' EXIT

project_record="$(gcloud projects describe "${project_id}" --format=json 2>/dev/null || true)"
if [[ "$(jq -r '.projectId // empty' <<< "${project_record}")" == "${project_id}" && "$(jq -r '.projectNumber // empty' <<< "${project_record}")" == "${project_number}" && "$(jq -r '.lifecycleState // empty' <<< "${project_record}")" == "ACTIVE" ]]; then
  mark_pass "isolated Test Lab project identity and lifecycle are exact"
else
  mark_fail "isolated Test Lab project identity or lifecycle drifted"
fi

access_token="$(gcloud auth print-access-token 2>/dev/null || true)"
for service in firebase.googleapis.com testing.googleapis.com toolresults.googleapis.com; do
  service_state=""
  if [[ -n "${access_token}" ]]; then
    service_state="$(
      curl --fail --silent --show-error \
        --header "Authorization: Bearer ${access_token}" \
        "https://serviceusage.googleapis.com/v1/projects/${project_number}/services/${service}" 2>/dev/null \
        | jq -r '.state // empty' 2>/dev/null \
        || true
    )"
  fi
  if [[ "${service_state}" == "ENABLED" ]]; then
    mark_pass "service ${service} enabled"
  else
    mark_fail "service ${service} unavailable or disabled"
  fi
done

firebase_project=""
if [[ -n "${access_token}" ]]; then
  firebase_project="$(
    curl --fail --silent --show-error \
      --header "Authorization: Bearer ${access_token}" \
      "https://firebase.googleapis.com/v1beta1/projects/${project_id}" 2>/dev/null \
      || true
  )"
fi
if [[ "$(jq -r '.projectId // empty' <<< "${firebase_project:-{}}")" == "${project_id}" ]]; then
  mark_pass "Firebase registration matches isolated project"
else
  mark_fail "Firebase registration is unavailable or mismatched"
fi
unset access_token

deployer_member="serviceAccount:${deployer_sa}"
project_policy="$(gcloud projects get-iam-policy "${project_id}" --format=json 2>/dev/null || true)"
editor_count="$(jq -r --arg member "${deployer_member}" '[.bindings[]? | select(.role == "roles/editor") | .members[]? | select(. == $member)] | length' <<< "${project_policy:-{}}")"
deployer_roles="$(jq -c --arg member "${deployer_member}" '[.bindings[]? | select(any(.members[]?; . == $member)) | .role] | unique | sort' <<< "${project_policy:-{}}")"
if [[ "${editor_count}" == "1" && "${deployer_roles}" == '["roles/editor"]' ]]; then
  mark_pass "deployer has exactly roles/editor in isolated project"
else
  mark_fail "deployer isolated-project role binding drifted"
fi

if jq -e --arg member "${deployer_member}" '.bindings[]? | select(.role == "roles/owner") | .members[]? | select(. == $member)' <<< "${project_policy:-{}}" >/dev/null; then
  mark_fail "deployer has prohibited owner role in isolated project"
else
  mark_pass "deployer has no owner role in isolated project"
fi

models_file="${workdir}/models.json"
versions_file="${workdir}/versions.json"
if gcloud firebase test android models list --project "${project_id}" --filter=virtual --format=json > "${models_file}" 2>/dev/null && [[ "$(jq 'length' "${models_file}")" -gt 0 ]]; then
  mark_pass "live virtual Android model catalog is available"
else
  mark_fail "live virtual Android model catalog is unavailable"
fi
if gcloud firebase test android versions list --project "${project_id}" --format=json > "${versions_file}" 2>/dev/null && [[ "$(jq 'length' "${versions_file}")" -gt 0 ]]; then
  mark_pass "live Android version catalog is available"
else
  mark_fail "live Android version catalog is unavailable"
fi

selected_tmp="${workdir}/selected-matrix.json"
if [[ -s "${models_file}" ]] && python3 scripts/rc5/select-test-lab-matrix.py --models "${models_file}" --output "${selected_tmp}" > "${workdir}/selector.log" 2>&1; then
  device_count="$(jq -r '.deviceCount' "${selected_tmp}")"
  api26_count="$(jq -r '[.targets[] | select(.version == "26")] | length' "${selected_tmp}")"
  api33_count="$(jq -r '[.targets[] | select(.version == "33")] | length' "${selected_tmp}")"
  current_count="$(jq -r '[.targets[] | (.version | tonumber) | select(. >= 35 and . <= 36)] | length' "${selected_tmp}")"
  if [[ "${device_count}" =~ ^3$ && "${api26_count}" == "1" && "${api33_count}" == "1" && "${current_count}" == "1" ]]; then
    jq '. + {selected: true, preflightOnly: true, matrixExecuted: false, projectId: "direkt-testlab-502701-20260726", resultsStorage: "firebase-managed-default-bucket"}' "${selected_tmp}" > "${matrix_output}"
    mark_pass "live catalog supports exact API 26 33 and current three-device matrix"
  else
    mark_fail "selected live matrix escaped exact RC5 API 26 33 and current boundary"
  fi
else
  mark_fail "live catalog matrix selection failed"
fi

if (( failures > 0 )); then
  printf 'RESULT|not_ready\n' >> "${receipt}"
  printf 'FAILURE_COUNT|%s\n' "${failures}" >> "${receipt}"
  exit 1
fi

mark_pass "isolated Spark Test Lab metadata IAM and catalog boundary is ready"
printf 'RESULT|ready\n' >> "${receipt}"
printf 'FAILURE_COUNT|0\n' >> "${receipt}"
