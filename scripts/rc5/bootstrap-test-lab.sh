#!/usr/bin/env bash
set -euo pipefail

project_id="${GCP_PROJECT_ID:-direkt-dev-502701}"
deployer_sa="${GCP_DEPLOYER_SERVICE_ACCOUNT:-direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com}"
runner_role_id="${GCP_TEST_LAB_RUNNER_ROLE_ID:-direktTestLabRunner}"
results_role_id="${GCP_TEST_LAB_RESULTS_ROLE_ID:-direktTestLabResultsWriter}"
bucket_location="${GCP_TEST_LAB_RESULTS_LOCATION:-asia-northeast1}"
retention_days="${GCP_TEST_LAB_RESULTS_RETENTION_DAYS:-30}"

[[ "${project_id}" == "direkt-dev-502701" ]]
[[ "${deployer_sa}" == "direkt-github-deployer@${project_id}.iam.gserviceaccount.com" ]]
[[ "${runner_role_id}" == "direktTestLabRunner" ]]
[[ "${results_role_id}" == "direktTestLabResultsWriter" ]]
[[ "${bucket_location}" == "asia-northeast1" ]]
[[ "${retention_days}" == "30" ]]

active_account="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n 1)"
test -n "${active_account}"
project_number="$(gcloud projects describe "${project_id}" --format='value(projectNumber)')"
[[ "${project_number}" =~ ^[0-9]+$ ]]
bucket_name="direkt-test-lab-results-${project_number}"
bucket_uri="gs://${bucket_name}"
runner_role="projects/${project_id}/roles/${runner_role_id}"
results_role="projects/${project_id}/roles/${results_role_id}"
deployer_member="serviceAccount:${deployer_sa}"

gcloud services enable \
  testing.googleapis.com \
  toolresults.googleapis.com \
  --project "${project_id}" \
  --quiet

workdir="$(mktemp -d)"
trap 'rm -rf "${workdir}"' EXIT

# Exact current non-Storage Firebase Test Lab Admin + Firebase Analytics Viewer
# execution permissions, plus only the two read permissions used by managed
# preflight: iam.roles.get and serviceusage.services.get.
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
resourcemanager.projects.list
serviceusage.services.get
EOF

# This role is bound only on the dedicated RC5 results bucket. The IAM-policy
# read is required only to verify that exact bucket-scoped binding during proof.
cat > "${workdir}/test-lab-results-permissions.txt" <<'EOF'
storage.buckets.get
storage.buckets.getIamPolicy
storage.buckets.update
storage.objects.create
storage.objects.delete
storage.objects.get
storage.objects.list
EOF

normalize_permissions() {
  LC_ALL=C sort -u "$1" | paste -sd, -
}

runner_permissions="$(normalize_permissions "${workdir}/test-lab-runner-permissions.txt")"
results_permissions="$(normalize_permissions "${workdir}/test-lab-results-permissions.txt")"

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
  "Read/write and verify IAM only on the dedicated DIREKT Test Lab results bucket when bound at bucket scope." \
  "${results_permissions}"

if ! gcloud storage buckets describe "${bucket_uri}" --project "${project_id}" >/dev/null 2>&1; then
  gcloud storage buckets create "${bucket_uri}" \
    --project "${project_id}" \
    --location "${bucket_location}" \
    --uniform-bucket-level-access \
    --quiet >/dev/null
fi

bucket_record="$(gcloud storage buckets describe "${bucket_uri}" --project "${project_id}" --format=json)"
test "$(jq -r '.location' <<< "${bucket_record}" | tr '[:upper:]' '[:lower:]')" = "${bucket_location}"
test "$(jq -r '.iamConfiguration.uniformBucketLevelAccess.enabled' <<< "${bucket_record}")" = "true"

cat > "${workdir}/lifecycle.json" <<EOF
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {"age": ${retention_days}}
    }
  ]
}
EOF

gcloud storage buckets update "${bucket_uri}" \
  --project "${project_id}" \
  --lifecycle-file "${workdir}/lifecycle.json" \
  --quiet >/dev/null

gcloud projects add-iam-policy-binding "${project_id}" \
  --member "${deployer_member}" \
  --role "${runner_role}" \
  --condition=None \
  --quiet >/dev/null

gcloud storage buckets add-iam-policy-binding "${bucket_uri}" \
  --member "${deployer_member}" \
  --role "${results_role}" \
  --quiet >/dev/null

for service in testing.googleapis.com toolresults.googleapis.com; do
  state="$(gcloud services describe "${service}" --project "${project_id}" --format='value(state)')"
  test "${state}" = "ENABLED"
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

project_policy="$(gcloud projects get-iam-policy "${project_id}" --format=json)"
test "$(jq -r --arg member "${deployer_member}" --arg role "${runner_role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" = "1"
test "$(jq -r --arg member "${deployer_member}" --arg role "${results_role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${project_policy}")" = "0"

for prohibited_role in roles/owner roles/editor roles/cloudtestservice.testAdmin roles/firebase.analyticsViewer roles/storage.admin roles/storage.objectAdmin; do
  if jq -e --arg member "${deployer_member}" --arg role "${prohibited_role}" '.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)' <<< "${project_policy}" >/dev/null; then
    echo "Prohibited broad project-level role ${prohibited_role} is bound to ${deployer_sa}." >&2
    exit 1
  fi
done

bash scripts/rc5/verify-no-project-storage-roles.sh "${project_id}" "${deployer_member}"

bucket_policy="$(gcloud storage buckets get-iam-policy "${bucket_uri}" --format=json)"
test "$(jq -r --arg member "${deployer_member}" --arg role "${results_role}" '[.bindings[]? | select(.role == $role) | .members[]? | select(. == $member)] | length' <<< "${bucket_policy}")" = "1"

lifecycle="$(gcloud storage buckets describe "${bucket_uri}" --project "${project_id}" --format=json | jq -c '.lifecycle.rule // []')"
test "$(jq -r --argjson age "${retention_days}" '[.[] | select(.action.type == "Delete" and .condition.age == $age)] | length' <<< "${lifecycle}")" = "1"

printf 'RC5 Firebase Test Lab bootstrap verified.\n'
printf 'Project: %s\n' "${project_id}"
printf 'Testing APIs: testing.googleapis.com and toolresults.googleapis.com enabled.\n'
printf 'Runner role: %s (current Test Lab/Analytics non-Storage execution set plus iam.roles.get and serviceusage.services.get only).\n' "${runner_role}"
printf 'Results bucket: %s (uniform access, %s-day delete lifecycle).\n' "${bucket_uri}" "${retention_days}"
printf 'Results role: %s bound only on the dedicated results bucket; includes bucket IAM read only for binding verification.\n' "${results_role}"
printf 'GitHub identity: %s via existing Workload Identity Federation; no service-account key created.\n' "${deployer_sa}"
printf 'No secret, credential, participant data, or production authorization was created by this bootstrap.\n'
