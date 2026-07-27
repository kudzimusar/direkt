#!/usr/bin/env bash
set -euo pipefail

project_id="${GCP_PROJECT_ID:-direkt-dev-502701}"
deployer_sa="${GCP_DEPLOYER_SERVICE_ACCOUNT:-direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com}"
runtime_sa="${GCP_RUNTIME_SERVICE_ACCOUNT:-direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com}"

secret_names=(
  direkt-mtn-momo-collections-subscription-key
  direkt-mtn-momo-api-user
  direkt-mtn-momo-api-key
  direkt-stripe-sandbox-secret-key
  direkt-paypal-sandbox-client-id
  direkt-paypal-sandbox-client-secret
)

[[ "${project_id}" == "direkt-dev-502701" ]]
[[ "${deployer_sa}" == "direkt-github-deployer@${project_id}.iam.gserviceaccount.com" ]]
[[ "${runtime_sa}" == "direkt-api-runtime@${project_id}.iam.gserviceaccount.com" ]]

gcloud projects describe "${project_id}" --format='value(projectId)' | grep -Fxq "${project_id}"
gcloud iam service-accounts describe "${deployer_sa}" --project "${project_id}" >/dev/null
gcloud iam service-accounts describe "${runtime_sa}" --project "${project_id}" >/dev/null

for secret_name in "${secret_names[@]}"; do
  gcloud secrets describe "${secret_name}" --project "${project_id}" >/dev/null

  gcloud secrets add-iam-policy-binding "${secret_name}" \
    --project "${project_id}" \
    --member "serviceAccount:${deployer_sa}" \
    --role roles/secretmanager.viewer \
    --quiet >/dev/null

  gcloud secrets add-iam-policy-binding "${secret_name}" \
    --project "${project_id}" \
    --member "serviceAccount:${runtime_sa}" \
    --role roles/secretmanager.secretAccessor \
    --quiet >/dev/null

  policy="$(gcloud secrets get-iam-policy "${secret_name}" --project "${project_id}" --format=json)"
  test "$(jq -r --arg member "serviceAccount:${deployer_sa}" '[.bindings[]? | select(.role == "roles/secretmanager.viewer") | .members[]? | select(. == $member)] | length' <<< "${policy}")" = "1"
  test "$(jq -r --arg member "serviceAccount:${runtime_sa}" '[.bindings[]? | select(.role == "roles/secretmanager.secretAccessor") | .members[]? | select(. == $member)] | length' <<< "${policy}")" = "1"
  if jq -e '.bindings[]? | select(.role == "roles/secretmanager.admin")' <<< "${policy}" >/dev/null; then
    echo "Broad roles/secretmanager.admin is prohibited on ${secret_name}." >&2
    exit 1
  fi

done

version_of() {
  local secret_name="$1"
  gcloud secrets versions list "${secret_name}" \
    --project "${project_id}" \
    --filter='state=ENABLED' \
    --sort-by='~name' \
    --limit=1 \
    --format='value(name)' | awk -F/ '{print $NF}'
}

mtn_subscription_version="$(version_of direkt-mtn-momo-collections-subscription-key)"
mtn_user_version="$(version_of direkt-mtn-momo-api-user)"
mtn_key_version="$(version_of direkt-mtn-momo-api-key)"
stripe_version="$(version_of direkt-stripe-sandbox-secret-key)"
paypal_client_id_version="$(version_of direkt-paypal-sandbox-client-id)"
paypal_client_secret_version="$(version_of direkt-paypal-sandbox-client-secret)"

for version in \
  "${mtn_subscription_version}" \
  "${mtn_user_version}" \
  "${mtn_key_version}" \
  "${stripe_version}" \
  "${paypal_client_id_version}" \
  "${paypal_client_secret_version}"; do
  [[ "${version}" =~ ^[1-9][0-9]*$ ]]
done

test "${mtn_subscription_version}" = "1"
test "${mtn_user_version}" = "1"
test "${mtn_key_version}" = "1"
test "${stripe_version}" = "2"

printf 'RC8_PAYMENTS_BOOTSTRAP|PASS\n'
printf 'project=%s\n' "${project_id}"
printf 'deployer=%s\n' "${deployer_sa}"
printf 'runtime=%s\n' "${runtime_sa}"
printf 'mtn_subscription_version=%s\n' "${mtn_subscription_version}"
printf 'mtn_user_version=%s\n' "${mtn_user_version}"
printf 'mtn_key_version=%s\n' "${mtn_key_version}"
printf 'stripe_version=%s\n' "${stripe_version}"
printf 'paypal_client_id_version=%s\n' "${paypal_client_id_version}"
printf 'paypal_client_secret_version=%s\n' "${paypal_client_secret_version}"
printf 'dpo_runtime_bound=false\n'
printf 'airtel_runtime_bound=false\n'
printf 'flutterwave_included=false\n'
printf 'secret_values_read=false\n'
printf 'production_authorization=false\n'
printf 'participant_data=false\n'
