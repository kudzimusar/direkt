#!/usr/bin/env bash
set -euo pipefail

workflow=".github/workflows/cloud-run-staging-deploy-v2.yml"
inspection_workflow=".github/workflows/cloud-run-staging-inspect.yml"
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
  "${inspection_workflow}"
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

for checked_workflow in "${workflow}" "${inspection_workflow}"; do
  grep -q "workflow_dispatch:" "${checked_workflow}"
  if grep -Eq '^  (push|pull_request):' "${checked_workflow}"; then
    echo "Managed staging workflows must remain manual-only." >&2
    exit 1
  fi
  grep -q "contents: read" "${checked_workflow}"
  grep -q "id-token: write" "${checked_workflow}"
done

grep -q "projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main" "${workflow}"
grep -q "direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com" "${workflow}"
grep -q "direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com" "${workflow}"
grep -q "direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com" "${workflow}"
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
  echo "Secret Manager environment references must use numeric versions." >&2
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

for secret in \
  direkt-database-url \
  direkt-supabase-url \
  direkt-supabase-secret-key \
  direkt-access-token-secret \
  direkt-contact-hash-pepper \
  direkt-challenge-hash-pepper \
  direkt-rate-limit-hash-pepper \
  direkt-portal-cookie-secret; do
  grep -q "${secret}" "${workflow}"
done

grep -q "x-serverless-authorization" admin/direkt-operations-portal/src/lib/operations-api.ts
grep -q "Metadata-Flavor" admin/direkt-operations-portal/src/lib/cloud-run-identity.ts

node .github/scripts/check-protected-literals.mjs

echo "Controlled synthetic-only Cloud Run staging readiness checks passed."
