#!/usr/bin/env bash
set -euo pipefail

API_URL="$(gcloud run services describe "${GCP_API_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format='value(status.url)')"
test -n "${API_URL}"
echo "API_URL=${API_URL}" >> "${GITHUB_ENV}"

# The canonical API must remain IAM-private before any browser runtime is exposed.
gcloud run services get-iam-policy "${GCP_API_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format=json > "${RUNNER_TEMP}/w8-api-iam-before.json"
jq -e '[.bindings[]?.members[]? | select(. == "allUsers" or . == "allAuthenticatedUsers")] | length == 0' "${RUNNER_TEMP}/w8-api-iam-before.json" >/dev/null

# Identity provisioning is intentionally outside the deployment identity boundary. The approved
# GitHub deployer may deploy/attach service accounts, but W8 must not silently grant itself IAM
# administration in order to create or rewrite a runtime identity during a release workflow.
if ! gcloud iam service-accounts describe "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" --project "${GCP_PROJECT_ID}" >/dev/null 2>&1; then
  echo "::error::Missing dedicated W8 runtime identity ${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}. Provision this one service account in project ${GCP_PROJECT_ID} before rerunning the trusted W8 cutover; do not reuse the operations or API runtime identity." >&2
  exit 72
fi

gcloud iam service-accounts describe "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" --project "${GCP_PROJECT_ID}" --format='value(email)' | grep -Fx "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}"

# Grant only service-level invocation of the private DIREKT API to the pre-provisioned dedicated
# web runtime. The deployment workflow does not create the identity or mutate its IAM policy.
gcloud run services add-iam-policy-binding "${GCP_API_SERVICE}" \
  --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" \
  --member "serviceAccount:${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" \
  --role roles/run.invoker --quiet >/dev/null

gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev" --quiet
docker build -f web/direkt-app/Dockerfile -t "${WEB_IMAGE_URI}" web/direkt-app
docker push "${WEB_IMAGE_URI}"

# Expose only the browser/BFF service. Participant auth remains synthetic-only and clearly gated;
# the canonical API itself is never made unauthenticated/public.
gcloud run deploy "${GCP_WEB_SERVICE}" \
  --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --platform managed \
  --image "${WEB_IMAGE_URI}" --service-account "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" \
  --port 8080 --cpu 1 --memory 512Mi --min-instances 0 --max-instances 2 \
  --concurrency 40 --timeout 60 --ingress all \
  --labels "direkt-environment=staging,direkt-data-mode=synthetic-only,direkt-workstream=w8-functional-web" \
  --set-env-vars "NODE_ENV=production,HOSTNAME=0.0.0.0,DIREKT_WEB_API_MODE=authenticated-bff,DIREKT_API_BASE_URL=${API_URL},DIREKT_WEB_AUTH_MODE=synthetic,DIREKT_WEB_ALLOW_SYNTHETIC_AUTH=true,DIREKT_WEB_PILOT_NOTICE_VERSION=synthetic-public-review-v1,DIREKT_WEB_INTERACTION_POLICY_VERSION=synthetic-demo-v1,DIREKT_WEB_COMMERCIAL_POLICY_VERSION=synthetic-commercial-v1" \
  --allow-unauthenticated --quiet

WEB_URL="$(gcloud run services describe "${GCP_WEB_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format='value(status.url)')"
test -n "${WEB_URL}"
echo "WEB_URL=${WEB_URL}" >> "${GITHUB_ENV}"

# Pin mutation-origin checks to the exact managed service origin after Cloud Run assigns it.
gcloud run services update "${GCP_WEB_SERVICE}" \
  --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" \
  --update-env-vars "DIREKT_WEB_ORIGIN=${WEB_URL}" --quiet >/dev/null

attached_runtime="$(gcloud run services describe "${GCP_WEB_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format='value(spec.template.spec.serviceAccountName)')"
test "${attached_runtime}" = "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}"

# Public browser entry point is allowed; the API remains private.
gcloud run services get-iam-policy "${GCP_WEB_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format=json > "${RUNNER_TEMP}/w8-web-iam.json"
jq -e '[.bindings[]? | select(.role == "roles/run.invoker") | .members[]? | select(. == "allUsers")] | length >= 1' "${RUNNER_TEMP}/w8-web-iam.json" >/dev/null

gcloud run services get-iam-policy "${GCP_API_SERVICE}" --project "${GCP_PROJECT_ID}" --region "${GCP_REGION}" --format=json > "${RUNNER_TEMP}/w8-api-iam-after.json"
jq -e '[.bindings[]?.members[]? | select(. == "allUsers" or . == "allAuthenticatedUsers")] | length == 0' "${RUNNER_TEMP}/w8-api-iam-after.json" >/dev/null
jq -e --arg member "serviceAccount:${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" '[.bindings[]? | select(.role == "roles/run.invoker") | .members[]? | select(. == $member)] | length >= 1' "${RUNNER_TEMP}/w8-api-iam-after.json" >/dev/null
