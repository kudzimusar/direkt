#!/usr/bin/env bash
set -euo pipefail

phase="${1:-}"
root_html="${RUNNER_TEMP}/w8-root.html"
root_headers="${RUNNER_TEMP}/w8-root.headers"
manifest_json="${RUNNER_TEMP}/w8-manifest.json"
sw_js="${RUNNER_TEMP}/w8-sw.js"
offline_html="${RUNNER_TEMP}/w8-offline.html"
categories_json="${RUNNER_TEMP}/w8-categories.json"
bootstrap_json="${RUNNER_TEMP}/w8-bootstrap.json"
bootstrap_headers="${RUNNER_TEMP}/w8-bootstrap.headers"
jar="${RUNNER_TEMP}/w8-cookies.txt"

api_denial() {
  # The canonical API must still reject unauthenticated direct browser traffic.
  api_status="$(curl -sS -o /dev/null -w '%{http_code}' "${API_URL}/api/v1/health/ready" || true)"
  test "${api_status}" = "403"
}

public_shell() {
  # The browser/BFF entry point is intentionally public for synthetic remote UI review.
  curl -fsS --retry 12 --retry-delay 5 --retry-all-errors -D "${root_headers}" "${WEB_URL}/" > "${root_html}"
  for marker in 'desktop-side-nav' 'tablet-rail' 'mobile-bottom-nav' 'skip-link' 'main-content'; do
    grep -q "${marker}" "${root_html}"
  done
  grep -Eqi '^content-type:.*text/html' "${root_headers}"
}

pwa_assets() {
  curl -fsS --retry 6 --retry-delay 3 --retry-all-errors "${WEB_URL}/manifest.webmanifest" > "${manifest_json}"
  jq -e '.name == "DIREKT" and .display == "standalone" and .start_url == "/" and (.icons | length) >= 2' "${manifest_json}" >/dev/null

  curl -fsS --retry 6 --retry-delay 3 --retry-all-errors "${WEB_URL}/sw.js" > "${sw_js}"
  for marker in '"/api/auth/"' '"/api/customer/action"' '"/api/provider/action"' 'cache: "no-store"' 'networkOnly(event.request)' 'OFFLINE_URL'; do
    grep -q "${marker}" "${sw_js}"
  done

  curl -fsS --retry 6 --retry-delay 3 --retry-all-errors "${WEB_URL}/offline" > "${offline_html}"
  grep -q 'DIREKT needs a connection for live actions.' "${offline_html}"
}

discovery() {
  # Prove the public browser route can traverse the dedicated BFF identity into the IAM-private API.
  curl -fsS --retry 6 --retry-delay 3 --retry-all-errors -D "${RUNNER_TEMP}/w8-categories.headers" "${WEB_URL}/api/discovery/categories" > "${categories_json}"
  jq -e 'type == "array" and length > 0 and all(.[]; (.key | type == "string") and (.name | type == "string"))' "${categories_json}" >/dev/null
  grep -Eqi '^cache-control:.*no-store' "${RUNNER_TEMP}/w8-categories.headers"
}

session_boundary() {
  # Browser session bootstrap remains synthetic-only, server-controlled and non-cacheable.
  curl -fsS --retry 6 --retry-delay 3 --retry-all-errors -D "${bootstrap_headers}" -c "${jar}" "${WEB_URL}/api/auth/bootstrap" > "${bootstrap_json}"
  jq -e '.authMode == "synthetic" and .hasSession == false and (.csrfToken | test("^[A-Za-z0-9_-]{32,}$")) and ((has("accessToken") or has("refreshToken")) | not)' "${bootstrap_json}" >/dev/null
  grep -Eqi '^cache-control:.*no-store' "${bootstrap_headers}"

  provider_status="$(curl -sS -o "${RUNNER_TEMP}/w8-provider-unauth.json" -w '%{http_code}' -b "${jar}" "${WEB_URL}/api/provider/state")"
  customer_status="$(curl -sS -o "${RUNNER_TEMP}/w8-customer-unauth.json" -w '%{http_code}' -b "${jar}" "${WEB_URL}/api/customer/state")"
  test "${provider_status}" = "401"
  test "${customer_status}" = "401"
}

privacy_evidence() {
  for required in "${root_html}" "${manifest_json}" "${sw_js}" "${offline_html}" "${categories_json}" "${bootstrap_json}"; do
    test -s "${required}"
  done

  # Scan only browser-observable/public responses. Build protected markers dynamically so the
  # repository's own secret scanners do not self-trigger on this verification harness.
  cat "${root_html}" "${manifest_json}" "${sw_js}" "${offline_html}" "${categories_json}" "${bootstrap_json}" > "${RUNNER_TEMP}/w8-browser-safe-scan.txt"
  service_role_marker="$(printf '%s%s%s' 'SUPABASE_' 'SERVICE_' 'ROLE')"
  service_role_key_marker="$(printf '%s%s%s' 'service_' 'role_' 'key')"
  sb_secret_marker="$(printf '%s%s' 'sb_' 'secret_')"
  postgres_uri_marker="$(printf '%s%s' 'postgresql' '://')"
  protected_pattern="${service_role_marker}|${service_role_key_marker}|${sb_secret_marker}|${postgres_uri_marker}|privateObjectKey|objectKey|privateBaseLatitude|privateBaseLongitude|refreshToken|accessToken|rawContact"
  ! grep -Eqi "${protected_pattern}" "${RUNNER_TEMP}/w8-browser-safe-scan.txt"

  jq -n \
    --arg source "${SOURCE_SHA}" \
    --arg web_url "${WEB_URL}" \
    --arg preview_route "https://direkt.forum/preview/" \
    --arg runtime_identity "${GCP_WEB_RUNTIME_SERVICE_ACCOUNT}" \
    --argjson category_count "$(jq 'length' "${categories_json}")" \
    '{
      source:$source,
      dataMode:"synthetic-only",
      publicWebUrl:$web_url,
      publicFunctionalWebReachable:true,
      canonicalApiRemainsIamPrivate:true,
      dedicatedRuntimeIdentity:$runtime_identity,
      canonicalDiscoveryThroughPrivateApi:true,
      categoryCount:$category_count,
      responsiveShell:true,
      installableManifest:true,
      serviceWorkerPrivateTrafficNetworkOnly:true,
      offlineFallback:true,
      syntheticSessionBootstrapNoStore:true,
      unauthenticatedPrivateStateDenied:true,
      browserPrivacyScan:true,
      syntheticPreviewPackagedRoute:$preview_route,
      canonicalCustomDomainVerified:false,
      realParticipantActivation:false,
      externalPaymentActivation:false,
      formalProductionRelease:false
    }' > "${RUNNER_TEMP}/w8-cutover-evidence.json"
}

case "${phase}" in
  api-denial) api_denial ;;
  public-shell) public_shell ;;
  pwa-assets) pwa_assets ;;
  discovery) discovery ;;
  session) session_boundary ;;
  privacy-evidence) privacy_evidence ;;
  *)
    echo "::error::Unknown W8 exercise phase. Expected one of: api-denial, public-shell, pwa-assets, discovery, session, privacy-evidence." >&2
    exit 64
    ;;
esac
