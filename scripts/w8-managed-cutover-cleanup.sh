#!/usr/bin/env bash
set -euo pipefail

success="${W8_CUTOVER_SUCCEEDED:-false}"

# A failed cutover must fail closed: remove public entry, runtime-to-API invocation and the
# deployer's resource-scoped act-as permission. A successful cutover retains only the reviewed
# bindings required for future controlled deployments and runtime API invocation.
if [[ "${success}" != "true" ]]; then
  gcloud run services remove-iam-policy-binding "${GCP_WEB_SERVICE}" \
    --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" \
    --member allUsers --role roles/run.invoker --quiet >/dev/null 2>&1 || true

  gcloud run services remove-iam-policy-binding "${GCP_API_SERVICE}" \
    --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" \
    --member "serviceAccount:${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" \
    --role roles/run.invoker --quiet >/dev/null 2>&1 || true

  gcloud iam service-accounts remove-iam-policy-binding "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" \
    --project "${GCP_PROJECT_ID}" \
    --member "serviceAccount:${GCP_DEPLOYER_SERVICE_ACCOUNT}" \
    --role roles/iam.serviceAccountUser --quiet >/dev/null 2>&1 || true
fi

# The API is never allowed to become publicly invokable, regardless of run outcome.
gcloud run services get-iam-policy "${GCP_API_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format=json > "${RUNNER_TEMP}/w8-api-iam-final.json"
jq -e '[.bindings[]?.members[]? | select(. == "allUsers" or . == "allAuthenticatedUsers")] | length == 0' "${RUNNER_TEMP}/w8-api-iam-final.json" >/dev/null

if [[ "${success}" == "true" ]]; then
  jq -e --arg member "serviceAccount:${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" '[.bindings[]? | select(.role == "roles/run.invoker") | .members[]? | select(. == $member)] | length >= 1' "${RUNNER_TEMP}/w8-api-iam-final.json" >/dev/null

  gcloud run services get-iam-policy "${GCP_WEB_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format=json > "${RUNNER_TEMP}/w8-web-iam-final.json"
  jq -e '[.bindings[]? | select(.role == "roles/run.invoker") | .members[]? | select(. == "allUsers")] | length >= 1' "${RUNNER_TEMP}/w8-web-iam-final.json" >/dev/null

  attached_runtime="$(gcloud run services describe "${GCP_WEB_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format='value(spec.template.spec.serviceAccountName)')"
  test "${attached_runtime}" = "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}"
fi
