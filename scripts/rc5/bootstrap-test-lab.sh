#!/usr/bin/env bash
set -euo pipefail

project_id="${GCP_PROJECT_ID:-direkt-dev-502701}"
deployer_sa="${GCP_DEPLOYER_SERVICE_ACCOUNT:-direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com}"
runner_role_id="${GCP_TEST_LAB_RUNNER_ROLE_ID:-direktTestLabRunner}"
results_role_id="${GCP_TEST_LAB_RESULTS_ROLE_ID:-direktTestLabResultsWriter}"
input_role_id="${GCP_TEST_LAB_INPUT_ROLE_ID:-direktTestLabInputStager}"
bucket_location="${GCP_TEST_LAB_RESULTS_LOCATION:-asia-northeast1}"
results_retention_days="${GCP_TEST_LAB_RESULTS_RETENTION_DAYS:-30}"
input_retention_days="${GCP_TEST_LAB_INPUT_RETENTION_DAYS:-1}"

[[ "${project_id}" == "direkt-dev-502701" ]]
[[ "${deployer_sa}" == "direkt-github-deployer@${project_id}.iam.gserviceaccount.com" ]]
[[ "${runner_role_id}" == "direktTestLabRunner" ]]
[[ "${results_role_id}" == "direktTestLabResultsWriter" ]]
[[ "${input_role_id}" == "direktTestLabInputStager" ]]
[[ "${bucket_location}" == "asia-northeast1" ]]
[[ "${results_retention_days}" == "30" ]]
[[ "${input_retention_days}" == "1" ]]

active_account="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n 1)"
test -n "${active_account}"
project_number="$(gcloud projects describe "${project_id}" --format='value(projectNumber)')"
[[ "${project_number}" =~ ^[0-9]+$ ]]
results_bucket_name="direkt-test-lab-results-${project_number}"
results_bucket_uri="gs://${results_bucket_name}"
input_bucket_name="direkt-test-lab-inputs-${project_number}"
input_bucket_uri="gs://${input_bucket_name}"
runner_role="projects/${project_id}/roles/${runner_role_id}"
results_role="projects/${project_id}/roles/${results_role_id}"
input_role="projects/${project_id}/roles/${input_role_id}"
deployer_member="serviceAccount:${deployer_sa}"

gcloud services enable \
  testing.googleapis.com \
  toolresults.googleapis.com \
  --project "${project_id}" \
  --quiet

workdir="$(mktemp -d)"
trap 'rm -rf "${workdir}"' EXIT

# Exact current project-applicable non-Storage Firebase Test Lab Admin + Firebase
# Analytics Viewer execution permissions, plus only the two read permissions used
# by managed preflight: iam.roles.get and serviceusage.services.get.
cat > "${workdir}/test-lab-runner-permissions.txt" <<'EOF'
cloudnotifications.activities.list
cloudtestservice.environmentcatalog.get
cloudtestservice.matrices.create
cloudtestservice.matrices.get
cloudtestservice.matrices.update
cloudtoolresults.executions.create
cloudtoolresults.executions.get
cloudtoolresults.executions.list
cloudtoolresults.executions.update
cloudtoolresults.histories.create
cloudtoolresults.histories.get
cloudtoolresults.histories.list
cloudtoolresults.settings.create
cloudtoolresults.settings.get
cloudtoolresults.settings.update
cloudtoolresults.steps.create
cloudtoolresults.steps.get
cloudtoolresults.steps.list
cloudtoolresults.steps.update
firebase.billingPlans.get
firebase.clients.get
firebase.clients.list
firebase.links.list
firebase.playLinks.get
firebase.playLinks.list
firebase.projects.get
firebaseanalytics.resources.googleAnalyticsReadAndAnalyze
firebaseextensions.configs.list
iam.roles.get
resourcemanager.projects.get
resourcemanager.projects.getIamPolicy
serviceusage.services.get
EOF

# This role is bound only on the dedicated RC5 results bucket. It can read the
# bucket metadata/IAM boundary and create new result objects, but cannot change
# lifecycle/IAM, read prior results, overwrite them, or delete evidence.
cat > "${workdir}/test-lab-results-permissions.txt" <<'EOF'
storage.buckets.get
storage.buckets.getIamPolicy
storage.objects.create
EOF

# This role is bound only on the dedicated synthetic APK input bucket. It can
# create immutable run-scoped APK inputs and read only those bucket objects so
# Test Lab can validate explicit gs:// app/test references. It cannot list,
# overwrite, update or delete objects; one-day cleanup remains owner-controlled.
cat > "${workdir}/test-lab-input-permissions.txt" <<'EOF'
storage.buckets.get
storage.buckets.getIamPolicy
storage.objects.create
storage.objects.get
EOF

project_resource="//cloudresourcemanager.googleapis.com/projects/${project_id}"
gcloud iam list-testable-permissions "${project_resource}" \
  --filter="customRolesSupportLevel!=NOT_SUPPORTED" \
  --format='value(name)' \
  | LC_ALL=C sort -u > "${workdir}/project-testable-permissions.txt"

assert_project_role_permissions_testable() {
  local expected_file="$1"
  local label="$2"
  local unsupported_file="${workdir}/${label}-unsupported.txt"
  comm -23 \
    <(LC_ALL=C sort -u "${expected_file}") \
    "${workdir}/project-testable-permissions.txt" > "${unsupported_file}"
  if [[ -s "${unsupported_file}" ]]; then
    echo "${label} contains permissions that Google does not currently allow in this project-level custom role:" >&2
    cat "${unsupported_file}" >&2
    exit 1
  fi
}

assert_project_role_permissions_testable "${workdir}/test-lab-runner-permissions.txt" "direktTestLabRunner"
assert_project_role_permissions_testable "${workdir}/test-lab-results-permissions.txt" "direktTestLabResultsWriter"
assert_project_role_permissions_testable "${workdir}/test-lab-input-permissions.txt" "direktTestLabInputStager"

normalize_permissions() {
  LC_ALL=C sort -u "$1" | paste -sd, -
}

runner_permissions="$(normalize_permissions "${workdir}/test-lab-runner-permissions.txt")"
results_permissions="$(normalize_permissions "${workdir}/test-lab-results-permissions.txt")"
input_permissions="$(normalize_permissions "${workdir}/test-lab-input-permissions.txt")"

upsert_role() {
  local role_id="$1"
  local title="$2"
  local description="$3"
  local permissions="$4"

  if gcloud iam roles describe "${role_id}" --project "${project_id}" >/dev/null 2>&1; then
    gcloud iam roles update "${role_id}" \
      --project "${project_id}" \
      --title "${title}" \
      --description "${description}" \
      --stage GA \
      --permissions "${permissions}" \
      --quiet >/dev/null
  else
    gcloud iam roles create "${role_id}" \
      --project "${project_id}" \
      --title "${title}" \
      --description "${description}" \
      --stage GA \
      --permissions "${permissions}" \
      --quiet >/dev/null
  fi
}

upsert_role \
  "${runner_role_id}" \
  "DIREKT Firebase Test Lab Runner" \
  "Run bounded Firebase Test Lab matrices and verify only required API/custom-role state without project-wide Cloud Storage permissions." \
  "${runner_permissions}"

upsert_role \
  "${results_role_id}" \
  "DIREKT Firebase Test Lab Results Writer" \
  "Read dedicated results-bucket metadata/IAM and append new Test Lab result objects; no lifecycle mutation, object read, overwrite or delete." \
  "${results_permissions}"

upsert_role \
  "${input_role_id}" \
  "DIREKT Firebase Test Lab Input Stager" \
  "Create and read immutable synthetic APK inputs in the dedicated one-day input bucket; no list, overwrite, update or delete." \
  "${input_permissions}"

ensure_bucket() {
  local bucket_uri="$1"
  if ! gcloud storage buckets describe "${bucket_uri}" --project "${project_id}" >/dev/null 2>&1; then
    gcloud storage buckets create "${bucket_uri}" \
      --project "${project_id}" \
      --location "${bucket_location}" \
      --uniform-bucket-level-access \
      --quiet >/dev/null
  fi
  gcloud storage buckets update "${bucket_uri}" \
    --project "${project_id}" \
    --uniform-bucket-level-access \
    --quiet >/dev/null
}

ensure_bucket "${results_bucket_uri}"
ensure_bucket "${input_bucket_uri}"

cat > "${workdir}/results-lifecycle.json" <<EOF
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {"age": ${results_retention_days}}
    }
  ]
}
EOF
cat > "${workdir}/input-lifecycle.json" <<EOF
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {"age": ${input_retention_days}}
    }
  ]
}
EOF

gcloud storage buckets update "${results_bucket_uri}" \
  --project "${project_id}" \
  --lifecycle-file "${workdir}/results-lifecycle.json" \
  --quiet >/dev/null
gcloud storage buckets update "${input_bucket_uri}" \
  --project "${project_id}" \
  --lifecycle-file "${workdir}/input-lifecycle.json" \
  --quiet >/dev/null

gcloud projects add-iam-policy-binding "${project_id}" \
  --member "${deployer_member}" \
  --role "${runner_role}" \
  --condition=None \
  --quiet >/dev/null

gcloud storage buckets add-iam-policy-binding "${results_bucket_uri}" \
  --member "${deployer_member}" \
  --role "${results_role}" \
  --quiet >/dev/null
gcloud storage buckets add-iam-policy-binding "${input_bucket_uri}" \
  --member "${deployer_member}" \
  --role "${input_role}" \
  --quiet >/dev/null

enabled_services="$(gcloud services list --enabled --project "${project_id}" --format='value(config.name)')"
for service in testing.googleapis.com toolresults.googleapis.com; do
  grep -Fxq "${service}" <<< "${enabled_services}"
done

assert_role_permissions() {
  local role_id="$1"
  local expected_file="$2"
  local actual_file="${workdir}/${role_id}-actual.txt"
  gcloud iam roles describe "${role_id}" \
    --project "${project_id}" \
    --format='value(includedPermissions)' \
    | tr ';' '\n' \
    | sed '/^$/d' \
    | LC_ALL=C sort -u > "${actual_file}"
  diff -u <(LC_ALL=C sort -u "${expected_file}") "${actual_file}"
}

assert_role_permissions "${runner_role_id}" "${workdir}/test-lab-runner-permissions.txt"
assert_role_permissions "${results_role_id}" "${workdir}/test-lab-results-permissions.txt"
assert_role_permissions "${input_role_id}" "${workdir}/test-lab-input-permissions.txt"

project_policy="$(gcloud projects get-iam-policy "${project_id}" --format=json)"
test "$(jq -r --arg member "${deployer_member}" --arg role "${runner_role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" = "1"
test "$(jq -r --arg member "${deployer_member}" --arg role "${results_role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" = "0"
test "$(jq -r --arg member "${deployer_member}" --arg role "${input_role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" = "0"

for prohibited_role in roles/owner roles/editor roles/cloudtestservice.testAdmin roles/firebase.analyticsViewer roles/storage.admin roles/storage.objectAdmin; do
  if jq -e --arg member "${deployer_member}" --arg role "${prohibited_role}" '.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)' <<< "${project_policy}" >/dev/null; then
    echo "Prohibited broad project-level role ${prohibited_role} is bound to ${deployer_sa}." >&2
    exit 1
  fi
done

bash scripts/rc5/verify-no-project-storage-roles.sh "${project_id}" "${deployer_member}"

verify_bucket() {
  local bucket_uri="$1"
  local role="$2"
  local retention="$3"
  local label="$4"
  local record policy actual_members expected_members actual_roles expected_roles lifecycle

  record="$(gcloud storage buckets describe "${bucket_uri}" --project "${project_id}" --format='json(location,uniform_bucket_level_access,lifecycle_config)')"
  test "$(jq -r '.location' <<< "${record}" | tr '[:upper:]' '[:lower:]')" = "${bucket_location}"
  test "$(jq -r '.uniform_bucket_level_access' <<< "${record}")" = "true"
  lifecycle="$(jq -c '.lifecycle_config.rule // []' <<< "${record}")"
  test "$(jq -r --argjson age "${retention}" 'length == 1 and .[0].action.type == "Delete" and .[0].condition.age == $age' <<< "${lifecycle}")" = "true"

  policy="$(gcloud storage buckets get-iam-policy "${bucket_uri}" --format=json)"
  actual_members="$(jq -c --arg role "${role}" '[.bindings[]? | select(.role == $role) | .members[]?] | unique | sort' <<< "${policy}")"
  expected_members="$(jq -nc --arg member "${deployer_member}" '[$member] | sort')"
  actual_roles="$(jq -c --arg member "${deployer_member}" '[.bindings[]? | select([.members[]? | select(. == $member)] | length > 0) | .role] | unique | sort' <<< "${policy}")"
  expected_roles="$(jq -nc --arg role "${role}" '[$role] | sort')"
  test "${actual_members}" = "${expected_members}"
  test "${actual_roles}" = "${expected_roles}"
  printf '%s bucket verified: %s\n' "${label}" "${bucket_uri}"
}

verify_bucket "${results_bucket_uri}" "${results_role}" "${results_retention_days}" "Results"
verify_bucket "${input_bucket_uri}" "${input_role}" "${input_retention_days}" "Input"

printf 'RC5 Firebase Test Lab bootstrap verified.\n'
printf 'Project: %s\n' "${project_id}"
printf 'Testing APIs: testing.googleapis.com and toolresults.googleapis.com enabled.\n'
printf 'Runner role: %s (project-applicable Test Lab/Analytics non-Storage execution set plus iam.roles.get and serviceusage.services.get only).\n' "${runner_role}"
printf 'Results bucket: %s (uniform access, %s-day delete lifecycle).\n' "${results_bucket_uri}" "${results_retention_days}"
printf 'Results role: %s is bucket-only and append-only for result objects.\n' "${results_role}"
printf 'Input bucket: %s (uniform access, %s-day delete lifecycle).\n' "${input_bucket_uri}" "${input_retention_days}"
printf 'Input role: %s is bucket-only with create/get and no list/delete/update.\n' "${input_role}"
printf 'GitHub identity: %s via existing Workload Identity Federation; no service-account key created.\n' "${deployer_sa}"
printf 'No secret, credential, participant data, or production authorization was created by this bootstrap.\n'
