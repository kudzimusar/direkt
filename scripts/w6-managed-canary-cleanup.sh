#!/usr/bin/env bash
set -euo pipefail

deployer="serviceAccount:${GCP_DEPLOYER_SERVICE_ACCOUNT}"
for service in "${GCP_API_SERVICE}" "${GCP_WEB_SERVICE}"; do
  if ! gcloud run services describe "${service}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format='value(metadata.name)' >/dev/null 2>&1; then
    continue
  fi
  gcloud run services remove-iam-policy-binding "${service}" \
    --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" \
    --member "${deployer}" --role roles/run.invoker --quiet >/dev/null 2>&1 || true
  policy="${RUNNER_TEMP}/${service}-w6-final-iam.json"
  gcloud run services get-iam-policy "${service}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format=json > "${policy}"
  jq -e --arg deployer "${deployer}" '[.bindings[]?.members[]? | select(. == $deployer or . == "allUsers" or . == "allAuthenticatedUsers")] | length == 0' "${policy}" >/dev/null
done
