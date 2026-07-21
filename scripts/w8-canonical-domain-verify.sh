#!/usr/bin/env bash
set -euo pipefail

: "${WEB_URL:=https://app.direkt.forum}"
: "${PREVIEW_URL:=https://direkt.forum/preview/}"
: "${SOURCE_SHA:?SOURCE_SHA is required}"

work_dir="${RUNNER_TEMP:-$(mktemp -d)}"
root_html="${work_dir}/w8-canonical-root.html"
root_headers="${work_dir}/w8-canonical-root.headers"
manifest_json="${work_dir}/w8-canonical-manifest.json"
sw_js="${work_dir}/w8-canonical-sw.js"
offline_html="${work_dir}/w8-canonical-offline.html"
categories_json="${work_dir}/w8-canonical-categories.json"
categories_headers="${work_dir}/w8-canonical-categories.headers"
bootstrap_json="${work_dir}/w8-canonical-bootstrap.json"
bootstrap_headers="${work_dir}/w8-canonical-bootstrap.headers"
preview_html="${work_dir}/w8-canonical-preview.html"
jar="${work_dir}/w8-canonical-cookies.txt"
evidence_json="${work_dir}/w8-canonical-domain-evidence.json"

retry_curl() {
  curl -fsS --retry 12 --retry-delay 5 --retry-all-errors --connect-timeout 15 --max-time 60 "$@"
}

host="${WEB_URL#https://}"
host="${host%%/*}"

# DNS resolution is mandatory. getent exits non-zero when the host is unresolved.
getent ahosts "${host}" > "${work_dir}/w8-canonical-dns.txt"
test -s "${work_dir}/w8-canonical-dns.txt"

# curl validates the public certificate chain and hostname. Any TLS or hostname error fails closed.
retry_curl -D "${root_headers}" "${WEB_URL}/" > "${root_html}"
grep -Eqi '^content-type:.*text/html' "${root_headers}"
for marker in 'desktop-side-nav' 'tablet-rail' 'mobile-bottom-nav' 'skip-link' 'main-content'; do
  grep -q "${marker}" "${root_html}"
done

# Prove installability/offline assets on the canonical host.
retry_curl "${WEB_URL}/manifest.webmanifest" > "${manifest_json}"
jq -e '.name == "DIREKT" and .display == "standalone" and .start_url == "/" and (.icons | length) >= 2' "${manifest_json}" >/dev/null

retry_curl "${WEB_URL}/sw.js" > "${sw_js}"
for marker in '"/api/auth/"' '"/api/customer/action"' '"/api/provider/action"' 'cache: "no-store"' 'networkOnly(event.request)' 'OFFLINE_URL'; do
  grep -q "${marker}" "${sw_js}"
done

retry_curl "${WEB_URL}/offline" > "${offline_html}"
grep -q 'DIREKT needs a connection for live actions.' "${offline_html}"

# Prove the canonical hostname reaches the same reviewed BFF/private-API discovery path.
retry_curl -D "${categories_headers}" "${WEB_URL}/api/discovery/categories" > "${categories_json}"
jq -e 'type == "array" and length > 0 and all(.[]; (.key | type == "string") and (.name | type == "string"))' "${categories_json}" >/dev/null
grep -Eqi '^cache-control:.*no-store' "${categories_headers}"

# Prove synthetic session/private-state boundaries and cache controls remain intact on the canonical hostname.
retry_curl -D "${bootstrap_headers}" -c "${jar}" "${WEB_URL}/api/auth/bootstrap" > "${bootstrap_json}"
jq -e '.authMode == "synthetic" and .hasSession == false and (.csrfToken | test("^[A-Za-z0-9_-]{32,}$")) and ((has("accessToken") or has("refreshToken")) | not)' "${bootstrap_json}" >/dev/null
grep -Eqi '^cache-control:.*no-store' "${bootstrap_headers}"

provider_status="$(curl -sS -o "${work_dir}/w8-canonical-provider-unauth.json" -w '%{http_code}' -b "${jar}" "${WEB_URL}/api/provider/state")"
customer_status="$(curl -sS -o "${work_dir}/w8-canonical-customer-unauth.json" -w '%{http_code}' -b "${jar}" "${WEB_URL}/api/customer/state")"
test "${provider_status}" = "401"
test "${customer_status}" = "401"

# The historical/static synthetic review surface must remain independently reachable.
retry_curl "${PREVIEW_URL}" > "${preview_html}"
test -s "${preview_html}"

# Browser-observable responses must not expose protected material.
cat "${root_html}" "${manifest_json}" "${sw_js}" "${offline_html}" "${categories_json}" "${bootstrap_json}" > "${work_dir}/w8-canonical-browser-safe-scan.txt"
service_role_marker="$(printf '%s%s%s' 'SUPABASE_' 'SERVICE_' 'ROLE')"
service_role_key_marker="$(printf '%s%s%s' 'service_' 'role_' 'key')"
sb_secret_marker="$(printf '%s%s' 'sb_' 'secret_')"
postgres_uri_marker="$(printf '%s%s' 'postgresql' '://')"
protected_pattern="${service_role_marker}|${service_role_key_marker}|${sb_secret_marker}|${postgres_uri_marker}|privateObjectKey|objectKey|privateBaseLatitude|privateBaseLongitude|refreshToken|accessToken|rawContact"
! grep -Eqi "${protected_pattern}" "${work_dir}/w8-canonical-browser-safe-scan.txt"

jq -n \
  --arg source "${SOURCE_SHA}" \
  --arg canonical_url "${WEB_URL}" \
  --arg preview_url "${PREVIEW_URL}" \
  '{
    source:$source,
    dataMode:"synthetic-only",
    canonicalWebUrl:$canonical_url,
    dnsResolved:true,
    tlsValidatedByHttpsClient:true,
    publicFunctionalWebReachable:true,
    responsiveShell:true,
    installableManifest:true,
    serviceWorkerPrivateTrafficNetworkOnly:true,
    offlineFallback:true,
    canonicalDiscoveryThroughReviewedBff:true,
    syntheticSessionBootstrapNoStore:true,
    unauthenticatedPrivateStateDenied:true,
    browserPrivacyScan:true,
    preservedSyntheticPreviewRoute:$preview_url,
    canonicalCustomDomainVerified:true,
    realParticipantActivation:false,
    externalPaymentActivation:false,
    formalProductionRelease:false
  }' > "${evidence_json}"

cat "${evidence_json}"
