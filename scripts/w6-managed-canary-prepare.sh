#!/usr/bin/env bash
set -euo pipefail

API_URL="$(gcloud run services describe "${GCP_API_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format='value(status.url)')"
test -n "${API_URL}"
echo "API_URL=${API_URL}" >> "${GITHUB_ENV}"

gcloud run services get-iam-policy "${GCP_API_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format=json > "${RUNNER_TEMP}/api-iam.json"
jq -e '[.bindings[]?.members[]? | select(. == "allUsers" or . == "allAuthenticatedUsers")] | length == 0' "${RUNNER_TEMP}/api-iam.json" >/dev/null

gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev" --quiet
docker build -f web/direkt-app/Dockerfile -t "${WEB_IMAGE_URI}" web/direkt-app
docker push "${WEB_IMAGE_URI}"

gcloud run deploy "${GCP_WEB_SERVICE}" \
  --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --platform managed \
  --image "${WEB_IMAGE_URI}" --service-account "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" \
  --port 8080 --cpu 1 --memory 512Mi --min-instances 0 --max-instances 1 \
  --concurrency 20 --timeout 60 --ingress all \
  --labels "direkt-environment=staging,direkt-data-mode=synthetic-only,direkt-workstream=w6-canary" \
  --set-env-vars "NODE_ENV=production,HOSTNAME=0.0.0.0,DIREKT_WEB_API_MODE=authenticated-bff,DIREKT_API_BASE_URL=${API_URL},DIREKT_WEB_AUTH_MODE=synthetic,DIREKT_WEB_ALLOW_SYNTHETIC_AUTH=true,DIREKT_WEB_PILOT_NOTICE_VERSION=synthetic-canary-v1,DIREKT_WEB_INTERACTION_POLICY_VERSION=synthetic-demo-v1,DIREKT_WEB_COMMERCIAL_POLICY_VERSION=synthetic-commercial-v1" \
  --no-allow-unauthenticated --quiet

WEB_URL="$(gcloud run services describe "${GCP_WEB_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format='value(status.url)')"
test -n "${WEB_URL}"
echo "WEB_URL=${WEB_URL}" >> "${GITHUB_ENV}"

gcloud run services get-iam-policy "${GCP_WEB_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format=json > "${RUNNER_TEMP}/web-iam.json"
jq -e '[.bindings[]?.members[]? | select(. == "allUsers" or . == "allAuthenticatedUsers")] | length == 0' "${RUNNER_TEMP}/web-iam.json" >/dev/null

for service in "${GCP_API_SERVICE}" "${GCP_WEB_SERVICE}"; do
  gcloud run services add-iam-policy-binding "${service}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --member "serviceAccount:${GCP_DEPLOYER_SERVICE_ACCOUNT}" --role roles/run.invoker --quiet
done
