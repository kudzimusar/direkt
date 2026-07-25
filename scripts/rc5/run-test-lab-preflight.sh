#!/usr/bin/env bash
set -uo pipefail

project_id="${GCP_PROJECT_ID:-direkt-dev-502701}"
project_number="${GCP_PROJECT_NUMBER:-264358173369}"
deployer_sa="${GCP_DEPLOYER_SERVICE_ACCOUNT:-direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com}"
runner_role_id="${GCP_TEST_LAB_RUNNER_ROLE_ID:-direktTestLabRunner}"
results_role_id="${GCP_TEST_LAB_RESULTS_ROLE_ID:-direktTestLabResultsWriter}"
results_bucket="${GCP_TEST_LAB_RESULTS_BUCKET:-gs://direkt-test-lab-results-264358173369}"
results_location="${GCP_TEST_LAB_RESULTS_LOCATION:-asia-northeast1}"
retention_days="${GCP_TEST_LAB_RESULTS_RETENTION_DAYS:-30}"
source_sha="${SOURCE_SHA:-}"
correlation_id="${RC5_PREFLIGHT_CORRELATION:-}"
receipt="${RC5_PREFLIGHT_RECEIPT:-}"
matrix_output="${RC5_PREFLIGHT_MATRIX:-}"

[[ "${project_id}" == "direkt-dev-502701" ]]
[[ "${project_number}" == "264358173369" ]]
[[ "${deployer_sa}" == "direkt-github-deployer@${project_id}.iam.gserviceaccount.com" ]]
[[ "${runner_role_id}" == "direktTestLabRunner" ]]
[[ "${results_role_id}" == "direktTestLabResultsWriter" ]]
[[ "${results_bucket}" == "gs://direkt-test-lab-results-${project_number}" ]]
[[ "${results_location}" == "asia-northeast1" ]]
[[ "${retention_days}" == "30" ]]
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

enabled_services="$(gcloud services list --enabled --project "${project_id}" --format='value(config.name)' 2>/dev/null || true)"
for service in testing.googleapis.com toolresults.googleapis.com; do
  if grep -Fxq "${service}" <<< "${enabled_services}"; then
    mark_pass "service ${service} enabled"
  else
    mark_fail "service ${service} unavailable or disabled"
  fi
done

runner_role="projects/${project_id}/roles/${runner_role_id}"
results_role="projects/${project_id}/roles/${results_role_id}"
deployer_member="serviceAccount:${deployer_sa}"

if runner_record="$(gcloud iam roles describe "${runner_role_id}" --project "${project_id}" --format=json 2>/dev/null)"; then
  jq -r '.includedPermissions[]?' <<< "${runner_record}" | LC_ALL=C sort -u > "${workdir}/actual-runner.txt"
  if [[ -f "${workdir}/expected-runner.txt" ]] && diff -u "${workdir}/expected-runner.txt" "${workdir}/actual-runner.txt" >/dev/null; then
    mark_pass "runner custom role has exact source-controlled permission set"
  else
    mark_fail "runner custom role permission set drifted"
  fi
  if [[ "$(jq -r '.deleted // false' <<< "${runner_record}")" == "false" ]]; then
    mark_pass "runner custom role is not deleted"
  else
    mark_fail "runner custom role is deleted"
  fi
else
  mark_fail "runner custom role is not inspectable"
fi

if results_record="$(gcloud iam roles describe "${results_role_id}" --project "${project_id}" --format=json 2>/dev/null)"; then
  jq -r '.includedPermissions[]?' <<< "${results_record}" | LC_ALL=C sort -u > "${workdir}/actual-results.txt"
  if [[ -f "${workdir}/expected-results.txt" ]] && diff -u "${workdir}/expected-results.txt" "${workdir}/actual-results.txt" >/dev/null; then
    mark_pass "results custom role has exact append-only permission set"
  else
    mark_fail "results custom role permission set drifted"
  fi
  if [[ "$(jq -r '.deleted // false' <<< "${results_record}")" == "false" ]]; then
    mark_pass "results custom role is not deleted"
  else
    mark_fail "results custom role is deleted"
  fi
else
  mark_fail "results custom role is not inspectable"
fi

if project_policy="$(gcloud projects get-iam-policy "${project_id}" --format=json 2>/dev/null)"; then
  if [[ "$(jq -r --arg member "${deployer_member}" --arg role "${runner_role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" == "1" ]]; then
    mark_pass "project has exact deployer runner-role binding"
  else
    mark_fail "project deployer runner-role binding missing or duplicated"
  fi
  if [[ "$(jq -r --arg member "${deployer_member}" --arg role "${results_role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" == "0" ]]; then
    mark_pass "results writer role is absent from project IAM"
  else
    mark_fail "results writer role escaped to project IAM"
  fi

  broad_role_found=false
  for prohibited_role in roles/owner roles/editor roles/cloudtestservice.testAdmin roles/firebase.analyticsViewer roles/storage.admin roles/storage.objectAdmin; do
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

if bucket_record="$(gcloud storage buckets describe "${results_bucket}" --project "${project_id}" --format=json 2>/dev/null)"; then
  if [[ "$(jq -r '.location' <<< "${bucket_record}" | tr '[:upper:]' '[:lower:]')" == "${results_location}" ]]; then
    mark_pass "results bucket location is ${results_location}"
  else
    mark_fail "results bucket location drifted"
  fi
  if [[ "$(jq -r '.iamConfiguration.uniformBucketLevelAccess.enabled' <<< "${bucket_record}")" == "true" ]]; then
    mark_pass "results bucket uses uniform access"
  else
    mark_fail "results bucket uniform access is disabled"
  fi
  lifecycle_rules="$(jq -c '.lifecycle.rule // []' <<< "${bucket_record}")"
  if jq -e --argjson age "${retention_days}" 'length == 1 and .[0].action.type == "Delete" and .[0].condition.age == $age' <<< "${lifecycle_rules}" >/dev/null; then
    mark_pass "results bucket has exactly one ${retention_days}-day delete lifecycle rule"
  else
    mark_fail "results bucket lifecycle has an additional or earlier deletion rule"
  fi
else
  mark_fail "results bucket is not inspectable"
fi

if bucket_policy="$(gcloud storage buckets get-iam-policy "${results_bucket}" --format=json 2>/dev/null)"; then
  actual_results_members="$(jq -c --arg role "${results_role}" '[.bindings[]? | select(.role == $role) | .members[]?] | unique | sort' <<< "${bucket_policy}")"
  expected_results_members="$(jq -nc --arg member "${deployer_member}" '[$member] | sort')"
  actual_deployer_bucket_roles="$(jq -c --arg member "${deployer_member}" '[.bindings[]? | select([.members[]? | select(. == $member)] | length > 0) | .role] | unique | sort' <<< "${bucket_policy}")"
  expected_deployer_bucket_roles="$(jq -nc --arg role "${results_role}" '[$role] | sort')"
  if [[ "${actual_results_members}" == "${expected_results_members}" && "${actual_deployer_bucket_roles}" == "${expected_deployer_bucket_roles}" ]]; then
    mark_pass "results bucket has exact deployer-only writer-role allowlist and no additional deployer role"
  else
    mark_fail "results bucket deployer role or writer-role allowlist drifted"
  fi
else
  mark_fail "results bucket IAM policy is not inspectable"
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

mark_pass "RC5 Test Lab metadata IAM bucket and catalog boundary is ready"
printf 'RESULT|ready\n' >> "${receipt}"
printf 'FAILURE_COUNT|0\n' >> "${receipt}"
