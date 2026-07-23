#!/usr/bin/env bash
set -euo pipefail

project_id="${GCP_PROJECT_ID:-direkt-dev-502701}"
deployer_sa="${GCP_DEPLOYER_SERVICE_ACCOUNT:-direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com}"
runtime_sa="${GCP_RUNTIME_SERVICE_ACCOUNT:-direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com}"

secret_names=(
  direkt-whatsapp-access-token
  direkt-whatsapp-app-secret
  direkt-whatsapp-webhook-verify-token
  direkt-whatsapp-synthetic-recipient
)

[[ "${project_id}" == "direkt-dev-502701" ]]
[[ "${deployer_sa}" == "direkt-github-deployer@${project_id}.iam.gserviceaccount.com" ]]
[[ "${runtime_sa}" == "direkt-api-runtime@${project_id}.iam.gserviceaccount.com" ]]

active_account="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n 1)"
test -n "${active_account}"
gcloud projects describe "${project_id}" --format='value(projectId)' | grep -Fxq "${project_id}"

for secret_name in "${secret_names[@]}"; do
  if ! gcloud secrets describe "${secret_name}" --project "${project_id}" >/dev/null 2>&1; then
    gcloud secrets create "${secret_name}" \
      --project "${project_id}" \
      --replication-policy automatic \
      --quiet
  fi

  gcloud secrets add-iam-policy-binding "${secret_name}" \
    --project "${project_id}" \
    --member "serviceAccount:${deployer_sa}" \
    --role roles/secretmanager.secretVersionManager \
    --quiet >/dev/null

  gcloud secrets add-iam-policy-binding "${secret_name}" \
    --project "${project_id}" \
    --member "serviceAccount:${runtime_sa}" \
    --role roles/secretmanager.secretAccessor \
    --quiet >/dev/null

  policy="$(gcloud secrets get-iam-policy "${secret_name}" --project "${project_id}" --format=json)"
  test "$(jq -r --arg member "serviceAccount:${deployer_sa}" '[.bindings[]? | select(.role == "roles/secretmanager.secretVersionManager") | .members[]? | select(. == $member)] | length' <<< "${policy}")" = "1"
  test "$(jq -r --arg member "serviceAccount:${runtime_sa}" '[.bindings[]? | select(.role == "roles/secretmanager.secretAccessor") | .members[]? | select(. == $member)] | length' <<< "${policy}")" = "1"
  if jq -e '.bindings[]? | select(.role == "roles/secretmanager.admin")' <<< "${policy}" >/dev/null; then
    echo "Broad roles/secretmanager.admin is prohibited on ${secret_name}." >&2
    exit 1
  fi

done

printf 'RC6 WhatsApp secret bootstrap verified.\n'
printf 'Project: %s\n' "${project_id}"
printf 'Secret containers: %s\n' "${secret_names[*]}"
printf 'Deployer scope: roles/secretmanager.secretVersionManager on each RC6 secret only.\n'
printf 'Runtime scope: roles/secretmanager.secretAccessor on each RC6 secret only.\n'
printf 'No secret value was created, read, or printed by this bootstrap.\n'
