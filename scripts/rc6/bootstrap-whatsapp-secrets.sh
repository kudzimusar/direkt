#!/usr/bin/env bash
set -euo pipefail

project_id="${GCP_PROJECT_ID:-direkt-dev-502701}"
deployer_sa="${GCP_DEPLOYER_SERVICE_ACCOUNT:-direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com}"
send_runtime_sa="${GCP_RUNTIME_SERVICE_ACCOUNT:-direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com}"
webhook_runtime_sa="${GCP_WHATSAPP_WEBHOOK_SERVICE_ACCOUNT:-direkt-whatsapp-webhook@direkt-dev-502701.iam.gserviceaccount.com}"
webhook_runtime_id="${webhook_runtime_sa%%@*}"

database_secret="direkt-database-url"
access_token_secret="direkt-whatsapp-access-token"
app_secret="direkt-whatsapp-app-secret"
verify_token_secret="direkt-whatsapp-webhook-verify-token"
recipient_secret="direkt-whatsapp-synthetic-recipient"
secret_names=(
  "${access_token_secret}"
  "${app_secret}"
  "${verify_token_secret}"
  "${recipient_secret}"
)

[[ "${project_id}" == "direkt-dev-502701" ]]
[[ "${deployer_sa}" == "direkt-github-deployer@${project_id}.iam.gserviceaccount.com" ]]
[[ "${send_runtime_sa}" == "direkt-api-runtime@${project_id}.iam.gserviceaccount.com" ]]
[[ "${webhook_runtime_sa}" == "direkt-whatsapp-webhook@${project_id}.iam.gserviceaccount.com" ]]

active_account="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n 1)"
test -n "${active_account}"
gcloud projects describe "${project_id}" --format='value(projectId)' | grep -Fxq "${project_id}"
gcloud secrets describe "${database_secret}" --project "${project_id}" >/dev/null

if ! gcloud iam service-accounts describe "${webhook_runtime_sa}" --project "${project_id}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${webhook_runtime_id}" \
    --project "${project_id}" \
    --display-name "DIREKT WhatsApp webhook canary" \
    --description "Isolated public webhook-only identity; no WhatsApp send token or recipient access." \
    --quiet
fi

project_policy="$(gcloud projects get-iam-policy "${project_id}" --format=json)"
if jq -e --arg member "serviceAccount:${webhook_runtime_sa}" '.bindings[]? | .members[]? | select(. == $member)' <<< "${project_policy}" >/dev/null; then
  echo "Public webhook identity must not hold any project-level IAM role." >&2
  exit 1
fi

gcloud iam service-accounts add-iam-policy-binding "${webhook_runtime_sa}" \
  --project "${project_id}" \
  --member "serviceAccount:${deployer_sa}" \
  --role roles/iam.serviceAccountUser \
  --quiet >/dev/null

gcloud iam service-accounts add-iam-policy-binding "${webhook_runtime_sa}" \
  --project "${project_id}" \
  --member "serviceAccount:${deployer_sa}" \
  --role roles/iam.serviceAccountViewer \
  --quiet >/dev/null

service_account_policy="$(gcloud iam service-accounts get-iam-policy "${webhook_runtime_sa}" --project "${project_id}" --format=json)"
test "$(jq -r '[.bindings[]? | select(.role == "roles/iam.serviceAccountUser") | .members[]?] | unique | length' <<< "${service_account_policy}")" = "1"
test "$(jq -r --arg member "serviceAccount:${deployer_sa}" '[.bindings[]? | select(.role == "roles/iam.serviceAccountUser") | .members[]? | select(. == $member)] | length' <<< "${service_account_policy}")" = "1"
test "$(jq -r '[.bindings[]? | select(.role == "roles/iam.serviceAccountViewer") | .members[]?] | unique | length' <<< "${service_account_policy}")" = "1"
test "$(jq -r --arg member "serviceAccount:${deployer_sa}" '[.bindings[]? | select(.role == "roles/iam.serviceAccountViewer") | .members[]? | select(. == $member)] | length' <<< "${service_account_policy}")" = "1"

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
    --member "serviceAccount:${send_runtime_sa}" \
    --role roles/secretmanager.secretAccessor \
    --quiet >/dev/null
done

for secret_name in "${database_secret}" "${app_secret}" "${verify_token_secret}"; do
  gcloud secrets add-iam-policy-binding "${secret_name}" \
    --project "${project_id}" \
    --member "serviceAccount:${webhook_runtime_sa}" \
    --role roles/secretmanager.secretAccessor \
    --quiet >/dev/null
done

for secret_name in "${access_token_secret}" "${recipient_secret}"; do
  policy="$(gcloud secrets get-iam-policy "${secret_name}" --project "${project_id}" --format=json)"
  if jq -e --arg member "serviceAccount:${webhook_runtime_sa}" '.bindings[]? | select(.role == "roles/secretmanager.secretAccessor") | .members[]? | select(. == $member)' <<< "${policy}" >/dev/null; then
    echo "Public webhook identity must not access send-only secret ${secret_name}." >&2
    exit 1
  fi
done

for secret_name in "${secret_names[@]}"; do
  policy="$(gcloud secrets get-iam-policy "${secret_name}" --project "${project_id}" --format=json)"
  test "$(jq -r --arg member "serviceAccount:${deployer_sa}" '[.bindings[]? | select(.role == "roles/secretmanager.secretVersionManager") | .members[]? | select(. == $member)] | length' <<< "${policy}")" = "1"
  test "$(jq -r --arg member "serviceAccount:${send_runtime_sa}" '[.bindings[]? | select(.role == "roles/secretmanager.secretAccessor") | .members[]? | select(. == $member)] | length' <<< "${policy}")" = "1"
  if jq -e '.bindings[]? | select(.role == "roles/secretmanager.admin")' <<< "${policy}" >/dev/null; then
    echo "Broad roles/secretmanager.admin is prohibited on ${secret_name}." >&2
    exit 1
  fi
done

for secret_name in "${database_secret}" "${app_secret}" "${verify_token_secret}"; do
  policy="$(gcloud secrets get-iam-policy "${secret_name}" --project "${project_id}" --format=json)"
  test "$(jq -r --arg member "serviceAccount:${webhook_runtime_sa}" '[.bindings[]? | select(.role == "roles/secretmanager.secretAccessor") | .members[]? | select(. == $member)] | length' <<< "${policy}")" = "1"
done

printf 'RC6 WhatsApp secret bootstrap verified.\n'
printf 'Project: %s\n' "${project_id}"
printf 'Secret containers: %s\n' "${secret_names[*]}"
printf 'Send runtime: %s — send secrets available only through secret-level accessor grants.\n' "${send_runtime_sa}"
printf 'Webhook runtime: %s — zero project-level roles; database/app-secret/verify-token only; no access-token or recipient-secret access.\n' "${webhook_runtime_sa}"
printf 'Deployer scope: secretVersionManager on each RC6 secret plus serviceAccountUser and serviceAccountViewer only on the isolated webhook identity.\n'
printf 'No secret value was created, read, or printed by this bootstrap.\n'
