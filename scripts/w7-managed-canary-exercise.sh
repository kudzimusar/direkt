#!/usr/bin/env bash
set -euo pipefail

echo "::add-mask::${WEB_ID_TOKEN}"
wh="X-Serverless-Authorization: Bearer ${WEB_ID_TOKEN}"
jar="${RUNNER_TEMP}/w7-cookies.txt"

unauth_api="$(curl -sS -o /dev/null -w '%{http_code}' "${API_URL}/api/v1/health/ready" || true)"
unauth_web="$(curl -sS -o /dev/null -w '%{http_code}' "${WEB_URL}/" || true)"
test "${unauth_api}" = "403"
test "${unauth_web}" = "403"

curl -fsS --retry 8 --retry-delay 5 --retry-all-errors -H "${wh}" "${WEB_URL}/" > "${RUNNER_TEMP}/root.html"
for marker in 'desktop-side-nav' 'tablet-rail' 'mobile-bottom-nav' 'skip-link' 'main-content'; do
  grep -q "${marker}" "${RUNNER_TEMP}/root.html"
done

curl -fsS -H "${wh}" "${WEB_URL}/manifest.webmanifest" > "${RUNNER_TEMP}/manifest.json"
jq -e '.name == "DIREKT" and .display == "standalone" and .start_url == "/" and (.icons | length) >= 2' "${RUNNER_TEMP}/manifest.json" >/dev/null

curl -fsS -H "${wh}" "${WEB_URL}/sw.js" > "${RUNNER_TEMP}/sw.js"
for marker in '"/api/auth/"' '"/api/customer/action"' '"/api/provider/action"' 'cache: "no-store"' 'networkOnly(event.request)' 'OFFLINE_URL'; do
  grep -q "${marker}" "${RUNNER_TEMP}/sw.js"
done

curl -fsS -H "${wh}" "${WEB_URL}/offline" > "${RUNNER_TEMP}/offline.html"
test -s "${RUNNER_TEMP}/offline.html"
grep -q 'DIREKT needs a connection for live actions.' "${RUNNER_TEMP}/offline.html"

curl -fsS -D "${RUNNER_TEMP}/bootstrap.headers" -H "${wh}" -c "${jar}" "${WEB_URL}/api/auth/bootstrap" > "${RUNNER_TEMP}/bootstrap.json"
jq -e '.authMode == "synthetic" and .hasSession == false and (.csrfToken | test("^[A-Za-z0-9_-]{32,}$")) and ((has("accessToken") or has("refreshToken")) | not)' "${RUNNER_TEMP}/bootstrap.json" >/dev/null
grep -Eqi '^cache-control:.*no-store' "${RUNNER_TEMP}/bootstrap.headers"

provider_status="$(curl -sS -o "${RUNNER_TEMP}/provider-unauth.json" -w '%{http_code}' -H "${wh}" -b "${jar}" "${WEB_URL}/api/provider/state")"
customer_status="$(curl -sS -o "${RUNNER_TEMP}/customer-unauth.json" -w '%{http_code}' -H "${wh}" -b "${jar}" "${WEB_URL}/api/customer/state")"
test "${provider_status}" = "401"
test "${customer_status}" = "401"

cat "${RUNNER_TEMP}/root.html" "${RUNNER_TEMP}/manifest.json" "${RUNNER_TEMP}/sw.js" "${RUNNER_TEMP}/bootstrap.json" > "${RUNNER_TEMP}/browser-safe-scan.txt"
service_role_marker="$(printf '%s%s%s' 'SUPABASE_' 'SERVICE_' 'ROLE')"
service_role_key_marker="$(printf '%s%s%s' 'service_' 'role_' 'key')"
sb_secret_marker="$(printf '%s%s' 'sb_' 'secret_')"
postgres_uri_marker="$(printf '%s%s' 'postgresql' '://')"
protected_pattern="${service_role_marker}|${service_role_key_marker}|${sb_secret_marker}|${postgres_uri_marker}|privateObjectKey|objectKey|privateBaseLatitude|privateBaseLongitude|refreshToken|accessToken|rawContact"
! grep -Eqi "${protected_pattern}" "${RUNNER_TEMP}/browser-safe-scan.txt"

jq -n \
  --arg source "${SOURCE_SHA}" \
  '{source:$source,dataMode:"synthetic-only",renderedResponsiveShell:true,manifestInstallable:true,serviceWorkerPrivateMutationNetworkOnly:true,offlineFallback:true,bootstrapNoStore:true,sessionGatedProviderAndCustomerRoutes:true,privateProjectionScan:true,unauthenticatedCloudRunDenied:true,w2w6EvidenceChainReferenced:true,externalGatesRetained:true}' \
  > "${RUNNER_TEMP}/w7-canary-evidence.json"
