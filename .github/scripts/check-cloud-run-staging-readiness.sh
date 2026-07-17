#!/usr/bin/env bash
set -euo pipefail

workflow=".github/workflows/cloud-run-staging-deploy.yml"
api_dockerfile="backend/direkt-api/Dockerfile"
portal_dockerfile="admin/direkt-operations-portal/Dockerfile"

required_files=(
  "${api_dockerfile}"
  "backend/direkt-api/.dockerignore"
  "${portal_dockerfile}"
  "admin/direkt-operations-portal/.dockerignore"
  "admin/direkt-operations-portal/src/lib/cloud-run-identity.ts"
  "admin/direkt-operations-portal/src/lib/server-operations-api.ts"
  "${workflow}"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${file}" ]]; then
    echo "Missing staging artifact: ${file}" >&2
    exit 1
  fi
done

grep -q "npm ci --ignore-scripts" "${api_dockerfile}"
grep -q "USER node" "${api_dockerfile}"
grep -q 'CMD \["node", "dist/main.js"\]' "${api_dockerfile}"

grep -q "npm ci --ignore-scripts" "${portal_dockerfile}"
grep -q "USER node" "${portal_dockerfile}"
grep -q 'CMD \["node", "server.js"\]' "${portal_dockerfile}"
grep -q "output: 'standalone'" admin/direkt-operations-portal/next.config.ts

grep -q "workflow_dispatch:" "${workflow}"
if grep -Eq '^  (push|pull_request):' "${workflow}"; then
  echo "The staging deployment workflow must remain manual-only." >&2
  exit 1
fi

grep -q "contents: read" "${workflow}"
grep -q "id-token: write" "${workflow}"
grep -q '\${{ vars.GCP_WORKLOAD_IDENTITY_PROVIDER }}' "${workflow}"
grep -q '\${{ vars.GCP_SERVICE_ACCOUNT }}' "${workflow}"
grep -q -- "--no-allow-unauthenticated" "${workflow}"
grep -q -- "--min-instances 0" "${workflow}"
grep -q -- "--max-instances 1" "${workflow}"
grep -q "direkt-operations-portal-staging" docs/phase10/INFRASTRUCTURE_ACTIVATION_CONTRACT.md

if grep -q -- "--allow-unauthenticated" "${workflow}"; then
  echo "Public Cloud Run invocation is prohibited in Phase 10 staging." >&2
  exit 1
fi
if grep -q "direkt-direct-database-url" "${workflow}"; then
  echo "The administrative database secret must not enter a runtime service." >&2
  exit 1
fi
if grep -qE ':[[:space:]]*latest([,\"]|$)' "${workflow}"; then
  echo "Secret Manager environment references must use pinned versions." >&2
  exit 1
fi
if grep -Eq 'direkt-(api|portal)-runtime@|direkt-github-deployer@|projects/[0-9]+/locations/global/workloadIdentityPools' "${workflow}"; then
  echo "Deployment identities must come from repository variables." >&2
  exit 1
fi
if grep -Eq '^[[:space:]]+PORT:[[:space:]]*' "${workflow}" || grep -q 'PORT=8080' "${workflow}"; then
  echo "Cloud Run must inject its reserved PORT variable from --port." >&2
  exit 1
fi
if grep -q 'gcloud auth print-identity-token' "${workflow}"; then
  echo "Federated Cloud Run smoke tokens must be minted through google-github-actions/auth." >&2
  exit 1
fi
if grep -q -- '--header "Authorization: Bearer' "${workflow}"; then
  echo "Cloud Run infrastructure tokens must not replace DIREKT application authorization." >&2
  exit 1
fi

token_format_count="$(grep -c 'token_format: id_token' "${workflow}" || true)"
token_audience_count="$(grep -c 'id_token_audience:' "${workflow}" || true)"
serverless_header_count="$(grep -c 'X-Serverless-Authorization: Bearer' "${workflow}" || true)"
if [[ "${token_format_count}" -ne 2 || "${token_audience_count}" -ne 2 || "${serverless_header_count}" -ne 2 ]]; then
  echo "Both private staging services require separate audience-bound OIDC smoke tokens." >&2
  exit 1
fi

grep -q "x-serverless-authorization" admin/direkt-operations-portal/src/lib/operations-api.ts
grep -q "Metadata-Flavor" admin/direkt-operations-portal/src/lib/cloud-run-identity.ts

node .github/scripts/check-protected-literals.mjs

echo "Controlled synthetic-only Cloud Run staging readiness checks passed."
