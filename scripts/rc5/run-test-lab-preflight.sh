#!/usr/bin/env bash
set -uo pipefail

project_id="${GCP_PROJECT_ID:-direkt-dev-502701}"
project_number="${GCP_PROJECT_NUMBER:-264358173369}"
deployer_sa="${GCP_DEPLOYER_SERVICE_ACCOUNT:-direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com}"
runner_role_id="${GCP_TEST_LAB_RUNNER_ROLE_ID:-direktTestLabRunner}"
results_role_id="${GCP_TEST_LAB_RESULTS_ROLE_ID:-direktTestLabResultsWriter}"
input_role_id="${GCP_TEST_LAB_INPUT_ROLE_ID:-direktTestLabInputStager}"
results_bucket="${GCP_TEST_LAB_RESULTS_BUCKET:-gs://direkt-test-lab-results-264358173369}"
input_bucket="${GCP_TEST_LAB_INPUT_BUCKET:-gs://direkt-test-lab-inputs-264358173369}"
bucket_location="${GCP_TEST_LAB_RESULTS_LOCATION:-asia-northeast1}"
results_retention_days="${GCP_TEST_LAB_RESULTS_RETENTION_DAYS:-30}"
input_retention_days="${GCP_TEST_LAB_INPUT_RETENTION_DAYS:-1}"
source_sha="${SOURCE_SHA:-}"
correlation_id="${RC5_PREFLIGHT_CORRELATION:-}"
receipt="${RC5_PREFLIGHT_RECEIPT:-}"
matrix_output="${RC5_PREFLIGHT_MATRIX:-}"

[[ "${project_id}" == "direkt-dev-502701" ]]
[[ "${project_number}" == "264358173369" ]]
[[ "${deployer_sa}" == "direkt-github-deployer@${project_id}.iam.gserviceaccount.com" ]]
[[ "${runner_role_id}" == "direktTestLabRunner" ]]
[[ "${results_role_id}" == "direktTestLabResultsWriter" ]]
[[ "${input_role_id}" == "direktTestLabInputStager" ]]
[[ "${results_bucket}" == "gs://direkt-test-lab-results-${project_number}" ]]
[[ "${input_bucket}" == "gs://direkt-test-lab-inputs-${project_number}" ]]
[[ "${bucket_location}" == "asia-northeast1" ]]
[[ "${results_retention_days}" == "30" ]]
[[ "${input_retention_days}" == "1" ]]
[[ "${source_sha}" =~ ^[0-9a-f]{40}$ ]]
[[ "${correlation_id}" =~ ^rc5-[0-9]+-[1-9][0-9]*$ ]]
[[ -n "${receipt}" ]]
[[ -n "${matrix_output}" ]]

mkdir -p "$(dirname "${receipt}")" "$(dirname "${matrix_output}")"
cat > "${receipt}" <<EOF
SOURCE|${source_sha}
CORRELATION|${correlation_id}
MODE|metadata_iam_catalog_only
RESOURCE_MUTATION|false
MATRIX_EXECUTED|false
SECRET_VALUES_ACCESSED|false
PRODUCTION_AUTHORIZATION|false
EOF
cat > "${matrix_output}" <<'EOF'
{
  "schema": "direkt.rc5.test-lab-preflight-matrix.v1",
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

if python3 - "scripts/rc5/bootstrap-test-lab.sh" "${workdir}" <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path

bootstrap = Path(sys.argv[1]).read_text(encoding="utf-8")
workdir = Path(sys.argv[2])
for source_name, output_name in (
    ("test-lab-runner-permissions.txt", "expected-runner.txt"),
    ("test-lab-results-permissions.txt", "expected-results.txt"),
    ("test-lab-input-permissions.txt", "expected-input.txt"),
):
    match = re.search(
        rf'cat > "\$\{{workdir\}}/{re.escape(source_name)}" <<\'EOF\'\n(.*?)\nEOF',
        bootstrap,
        flags=re.DOTALL,
    )
    if match is None:
        raise SystemExit(f"Missing bootstrap permission source: {source_name}")
    permissions = sorted({line for line in match.group(1).splitlines() if line})
    (workdir / output_name).write_text("\n".join(permissions) + "\n", encoding="utf-8")
PY
then
  mark_pass "source-controlled expected custom-role permissions extracted"
else
  mark_fail "source-controlled expected custom-role permissions unavailable"
fi

access_token="$(gcloud auth print-access-token 2>/dev/null || true)"
for service in testing.googleapis.com toolresults.googleapis.com; do
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
unset access_token

runner_role="projects/${project_id}/roles/${runner_role_id}"
results_role="projects/${project_id}/roles/${results_role_id}"
input_role="projects/${project_id}/roles/${input_role_id}"
deployer_member="serviceAccount:${deployer_sa}"

inspect_role() {
  local role_id="$1"
  local expected_file="$2"
  local actual_file="$3"
  local label="$4"
  local record

  if record="$(gcloud iam roles describe "${role_id}" --project "${project_id}" --format=json 2>/dev/null)"; then
    jq -r '.includedPermissions[]?' <<< "${record}" | LC_ALL=C sort -u > "${actual_file}"
    if [[ -f "${expected_file}" ]] && diff -u "${expected_file}" "${actual_file}" >/dev/null; then
      mark_pass "${label} custom role has exact source-controlled permission set"
    else
      mark_fail "${label} custom role permission set drifted"
    fi
    if [[ "$(jq -r '.deleted // false' <<< "${record}")" == "false" ]]; then
      mark_pass "${label} custom role is not deleted"
    else
      mark_fail "${label} custom role is deleted"
    fi
  else
    mark_fail "${label} custom role is not inspectable"
  fi
}

inspect_role "${runner_role_id}" "${workdir}/expected-runner.txt" "${workdir}/actual-runner.txt" "runner"
inspect_role "${results_role_id}" "${workdir}/expected-results.txt" "${workdir}/actual-results.txt" "results"
inspect_role "${input_role_id}" "${workdir}/expected-input.txt" "${workdir}/actual-input.txt" "input"

if project_policy="$(gcloud projects get-iam-policy "${project_id}" --format=json 2>/dev/null)"; then
  if [[ "$(jq -r --arg member "${deployer_member}" --arg role "${runner_role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" == "1" ]]; then
    mark_pass "project has exact deployer runner-role binding"
  else
    mark_fail "project deployer runner-role binding missing or duplicated"
  fi
  for pair in "${results_role}|results writer" "${input_role}|input stager"; do
    role="${pair%%|*}"
    label="${pair#*|}"
    if [[ "$(jq -r --arg member "${deployer_member}" --arg role "${role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" == "0" ]]; then
      mark_pass "${label} role is absent from project IAM"
    else
      mark_fail "${label} role escaped to project IAM"
    fi
  done

  broad_role_found=false
  for prohibited_role in roles/owner roles/editor roles/cloudtestservice.testAdmin roles/firebase.analyticsViewer roles/storage.admin roles/storage.objectAdmin roles/storage.objectUser roles/storage.objectViewer; do
    if jq -e --arg member "${deployer_member}" --arg role "${prohibited_role}" '.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)' <<< "${project_policy}" >/dev/null; then
      broad_role_found=true
    fi
  done
  if [[ "${broad_role_found}" == "false" ]]; then
    mark_pass "deployer has no prohibited broad project role"
  else
    mark_fail "deployer has a prohibited broad project role"
  fi
else
  mark_fail "project IAM policy is not inspectable"
fi

if bash scripts/rc5/verify-no-project-storage-roles.sh "${project_id}" "${deployer_member}" > "${workdir}/storage-boundary.log" 2>&1; then
  mark_pass "deployer has no project-scoped Cloud Storage permission"
else
  mark_fail "deployer project-scoped Cloud Storage boundary failed"
fi

inspect_bucket() {
  local bucket_uri="$1"
  local expected_role="$2"
  local retention="$3"
  local label="$4"
  local record lifecycle_rules policy actual_members expected_members actual_roles expected_roles

  if record="$(gcloud storage buckets describe "${bucket_uri}" --project "${project_id}" --format='json(location,uniform_bucket_level_access,lifecycle_config)' 2>/dev/null)"; then
    if [[ "$(jq -r '.location' <<< "${record}" | tr '[:upper:]' '[:lower:]')" == "${bucket_location}" ]]; then
      mark_pass "${label} bucket location is ${bucket_location}"
    else
      mark_fail "${label} bucket location drifted"
    fi
    if [[ "$(jq -r '.uniform_bucket_level_access // false' <<< "${record}")" == "true" ]]; then
      mark_pass "${label} bucket uses uniform access"
    else
      mark_fail "${label} bucket uniform access is disabled"
    fi
    lifecycle_rules="$(jq -c '.lifecycle_config.rule // []' <<< "${record}")"
    if jq -e --argjson age "${retention}" 'length == 1 and .[0].action.type == "Delete" and .[0].condition.age == $age' <<< "${lifecycle_rules}" >/dev/null; then
      mark_pass "${label} bucket has exactly one ${retention}-day delete lifecycle rule"
    else
      mark_fail "${label} bucket lifecycle drifted"
    fi
  else
    mark_fail "${label} bucket is not inspectable"
  fi

  if policy="$(gcloud storage buckets get-iam-policy "${bucket_uri}" --format=json 2>/dev/null)"; then
    actual_members="$(jq -c --arg role "${expected_role}" '[.bindings[]? | select(.role == $role) | .members[]?] | unique | sort' <<< "${policy}")"
    expected_members="$(jq -nc --arg member "${deployer_member}" '[$member] | sort')"
    actual_roles="$(jq -c --arg member "${deployer_member}" '[.bindings[]? | select([.members[]? | select(. == $member)] | length > 0) | .role] | unique | sort' <<< "${policy}")"
    expected_roles="$(jq -nc --arg role "${expected_role}" '[$role] | sort')"
    if [[ "${actual_members}" == "${expected_members}" && "${actual_roles}" == "${expected_roles}" ]]; then
      mark_pass "${label} bucket has exact deployer-only role allowlist"
    else
      mark_fail "${label} bucket deployer role or role-member allowlist drifted"
    fi
  else
    mark_fail "${label} bucket IAM policy is not inspectable"
  fi
}

inspect_bucket "${results_bucket}" "${results_role}" "${results_retention_days}" "results"
inspect_bucket "${input_bucket}" "${input_role}" "${input_retention_days}" "input"

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
  notification_count="$(jq -r '[.targets[] | select(.version == "33")] | length' "${selected_tmp}")"
  current_count="$(jq -r '[.targets[] | (.version | tonumber) | select(. >= 35 and . <= 36)] | length' "${selected_tmp}")"
  if [[ "${device_count}" =~ ^[23]$ && "${notification_count}" == "1" && "${current_count}" == "1" ]]; then
    jq '. + {selected: true, preflightOnly: true, matrixExecuted: false}' "${selected_tmp}" > "${matrix_output}"
    mark_pass "live catalog supports bounded 2-3 device matrix with API 33 and current baseline"
  else
    mark_fail "selected live matrix escaped RC5 coverage or cost boundary"
  fi
else
  mark_fail "live catalog matrix selection failed"
fi

if (( failures > 0 )); then
  printf 'RESULT|not_ready\n' >> "${receipt}"
  printf 'FAILURE_COUNT|%s\n' "${failures}" >> "${receipt}"
  exit 1
fi

mark_pass "RC5 Test Lab metadata IAM input/results buckets and catalog boundary is ready"
printf 'RESULT|ready\n' >> "${receipt}"
printf 'FAILURE_COUNT|0\n' >> "${receipt}"
