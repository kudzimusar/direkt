#!/usr/bin/env python3
"""Permanent fail-closed verifier for DIREKT RC7 Google Maps runtime."""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
OAUTH_SCOPE = "https://www.googleapis.com/auth/maps-platform.geocode.address"
V4_ENDPOINT = "https://geocode.googleapis.com/v4/geocode/address"


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise AssertionError(f"Missing required RC7 file: {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE):
        raise AssertionError(f"Prohibited {label}: {pattern}")


def main() -> int:
    lock = read("WORKSTREAM_LOCK.md")
    environment = read("backend/direkt-api/src/config/environment.ts")
    env_example = read("backend/direkt-api/.env.example")
    module = read("backend/direkt-api/src/location/location.module.ts")
    service = read("backend/direkt-api/src/location/location.service.ts")
    discovery_module = read("backend/direkt-api/src/discovery/discovery.module.ts")
    discovery_controller = read("backend/direkt-api/src/discovery/discovery.controller.ts")
    discovery_dto = read("backend/direkt-api/src/discovery/discovery.dto.ts")
    status = read("docs/integrations/CURRENT_INTEGRATION_STATUS.md")
    ledger = read("docs/integrations/LIVE_INTEGRATION_LEDGER.md")
    adapter = read("backend/direkt-api/src/location/google-maps-geocoding-provider.adapter.ts")
    adapter_test = read(
        "backend/direkt-api/test/unit/location/google-maps-geocoding-provider.adapter.spec.ts"
    )
    canary = read("backend/direkt-api/src/location/maps-canary.ts")
    manifest = read("android/direkt-app/app/src/main/AndroidManifest.xml")
    build = read("android/direkt-app/app/build.gradle.kts")
    versions = read("android/direkt-app/gradle/libs.versions.toml")
    models = read(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/DiscoveryModels.kt"
    )
    discovery = read(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/DiscoveryExperience.kt"
    )
    map_card = read(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/PrivacySafeMapCard.kt"
    )
    managed_test = read(
        "android/direkt-app/app/src/androidTest/java/com/kudzimusar/direkt/Rc7MapsRuntimeTest.kt"
    )
    managed_workflow = read(".github/workflows/rc7-maps-managed.yml")
    managed_script = read("scripts/rc7/run-maps-managed.sh")
    owner_bootstrap = read("scripts/rc7/bootstrap-maps-managed.sh")
    owner_bootstrap_doc = read("docs/integrations/RC7_MAPS_OWNER_BOOTSTRAP.md")
    managed_trigger = read("docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md")

    for needle in (
        "CLAIMED — RC7 Google Maps runtime integration",
        "RC7 implementation contract — CLAIMED",
        "Places and Routes remain disabled",
        "Exact private provider bases never become public markers",
        "RC7 is the sole active repository write lane",
    ):
        require(lock, needle, "RC7 workstream contract")

    for needle in (
        "GOOGLE_MAPS_BACKEND_MODE",
        "GOOGLE_MAPS_OAUTH_SCOPE",
        OAUTH_SCOPE,
        V4_ENDPOINT,
        "GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED",
        "Production Google Maps backend mode must remain disabled",
        "Google Maps backend activation currently permits synthetic-only data mode",
        "explicit synthetic Maps approval latch",
    ):
        require(environment, needle, "fail-closed backend Maps environment")
    prohibit(environment, r"GOOGLE_MAPS_SERVER_API_KEY", "backend Maps API-key environment")
    require(env_example, "GOOGLE_MAPS_BACKEND_MODE=disabled", "default-disabled Maps backend")
    require(env_example, f"GOOGLE_MAPS_OAUTH_SCOPE={OAUTH_SCOPE}", "narrow Maps OAuth scope")
    prohibit(env_example, r"GOOGLE_MAPS_SERVER_API_KEY", "backend Maps API-key example")

    require(module, "DisabledGeocodingProviderAdapter", "disabled provider adapter")
    require(module, "GoogleCloudServiceIdentityAccessTokenProvider", "service identity token provider")
    require(module, "GoogleMapsGeocodingProviderAdapter", "Google provider adapter")
    prohibit(module, r"GOOGLE_MAPS_SERVER_API_KEY", "backend API-key injection")
    for needle in (
        "LocationModule",
        "LocationService",
        "public/discovery/search-area/normalize",
        "NormalizeSearchAreaDto",
        "manualFallbackAvailable: true",
        "privateLocationPublished: false",
    ):
        require(
            discovery_module + discovery_controller + discovery_dto + service,
            needle,
            "reachable sanitized discovery-normalization boundary",
        )

    for needle in (
        "metadata.google.internal",
        "Metadata-Flavor",
        "enforce_scopes",
        OAUTH_SCOPE,
        V4_ENDPOINT,
        "Authorization: `Bearer ${accessToken}`",
        "X-Goog-FieldMask",
        "regionCode",
        "addressComponents",
        "for (const result of results)",
        "component.types?.includes('country')",
        "sawStructurallyValidCandidate",
        "ZAMBIA_BOUNDS",
        "privateLocationPublished: false",
        "persistedByAdapter: false",
        "AbortController",
        "response.status === 429",
        "response.status === 401 || response.status === 403",
    ):
        require(adapter, needle, "bounded OAuth Geocoding v4 behavior")
    prohibit(adapter, r"maps\.googleapis\.com/maps/api/geocode", "legacy Geocoding v3 endpoint")
    prohibit(adapter, r"searchParams\.set\(['\"]key", "backend API key query parameter")
    prohibit(adapter, r"console\.(log|error|warn)", "raw Geocoding response logging")
    for needle in (
        "selects the first independently bounded Zambian candidate",
        "uses the country address component",
        "rejects provider candidates outside Zambia",
        "rejects a successful response containing only malformed candidates",
    ):
        require(adapter_test, needle, "bounded ranked-candidate regression coverage")

    for needle in (
        "RC7_MAPS_CANARY|PASS",
        "authentication: 'service_identity_oauth'",
        "apiKeyUsed: false",
        "coordinateValuesLogged: false",
        "formattedAddressLogged: false",
        "productionAuthorization: false",
    ):
        require(canary, needle, "sanitized managed canary receipt")

    for needle in (
        "DIREKT_MAPS_BUILD_ENABLED",
        "DIREKT_MAPS_SYNTHETIC_CANARY_APPROVED",
        "RC7 Maps activation is allowed only in preauthorization builds",
        "DIREKT_ANDROID_MAPS_API_KEY",
        "DIREKT_MAPS_ENABLED",
        "direktMapsApiKey",
    ):
        require(build, needle, "Android Maps build switch and protected injection")
    require(versions, "com.google.maps.android:maps-compose", "pinned Maps Compose dependency")
    require(manifest, "com.google.android.geo.API_KEY", "Maps SDK manifest metadata")
    prohibit(manifest, r"ACCESS_(FINE|COARSE|BACKGROUND)_LOCATION", "new Android location permission")

    require(discovery, "PrivacySafeMapCard(providers = providers)", "discovery map integration")
    for needle in (
        "BuildConfig.DIREKT_MAPS_ENABLED",
        "MapRuntimeState.Failed",
        "runtimeState == MapRuntimeState.Ready",
        "discovery-map-fallback",
        "publicMapMarker(provider)",
        "serviceAreaPreview",
        "isMyLocationEnabled = false",
        "Private provider bases never become markers",
    ):
        require(map_card + models, needle, "privacy-safe Android map behavior")
    require(
        models,
        "provider.operatingModel == PublicOperatingModel.Mobile -> null",
        "mobile base-marker prohibition",
    )
    for needle in (
        "discovery-map-ready",
        "waitUntil(timeoutMillis = 25_000)",
        "discovery-map-fallback",
        "discovery-map-loading",
        "RC7 Maps runtime did not reach Ready",
        "fetchSemanticsNodes()",
        "assertTrue(",
        ".isEmpty()",
    ):
        require(managed_test, needle, "managed Android map-load assertion")

    require(status, "IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS", "current Maps state")
    require(ledger, "IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS", "live Maps ledger state")

    for needle in (
        "workflow_dispatch:",
        "RUN-DIREKT-RC7-MAPS-MANAGED",
        "branches:\n      - main",
        'test "$(git rev-parse origin/main)" = "${SOURCE_SHA}"',
        "google-github-actions/auth@v3",
        "direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com",
        "direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com",
        "direkt-testlab-502701-20260726",
        "scripts/rc7/run-maps-managed.sh",
        "Backend API key / secret / Cloud NAT: not used",
    ):
        require(managed_workflow, needle, "exact-main managed Maps workflow")

    for needle in (
        "direkt-rc7-android-maps",
        "--allowed-application",
        "package_name=${ANDROID_PACKAGE}",
        "maps-android-backend.googleapis.com",
        "geocoding-backend.googleapis.com",
        "owner_bootstrap_verified=true",
        "DIREKT RC7 Maps synthetic",
        "budget_attestation=project_labels",
        "direkt-rc7-budget-checked-at",
        "RC7 owner budget attestation is missing or stale.",
        "geocoding_quota_per_minute=60",
        "geocoding_quota_preprovisioned=true",
        f'OAUTH_SCOPE="{OAUTH_SCOPE}"',
        "backend_authentication=service_identity_oauth",
        "backend_api_key_present=false",
        "backend_secret_value_present=false",
        "backend_cloud_nat_used=false",
        '--service-account "${GCP_RUNTIME_SERVICE_ACCOUNT}"',
        "RC7_MAPS_CANARY|PASS",
        "MediumPhone.arm,version=36",
        "--num-flaky-test-attempts 0",
        "apksigner",
        "android_apk_certificate_matches_key=true",
        "collect-testlab-failure.py",
        "android_test_lab_failure_evidence_present=true",
        "cleanup.cloud_run_job_deleted",
        "cleanup_failed=${cleanup_failed}",
        "production_authorization=false",
        "private_provider_coordinates_published=false",
    ):
        require(managed_script, needle, "least-privilege managed Maps proof")

    for pattern, label in (
        (r"direkt-rc7-backend", "backend API-key resource"),
        (r"--allowed-ips", "backend API-key IP restriction"),
        (r"GOOGLE_MAPS_SERVER_API_KEY", "backend API-key injection"),
        (r"direkt-google-maps-geocoding-api-key", "backend Maps secret"),
        (r"gcloud\s+secrets", "backend Maps Secret Manager mutation"),
        (r"gcloud\s+compute\s+routers", "Cloud Router mutation"),
        (r"gcloud\s+compute\s+addresses", "static egress IP mutation"),
        (r"--vpc-egress", "forced VPC egress"),
        (r"--nat-external-ip-pool", "Cloud NAT configuration"),
        (r"--set-secrets", "backend credential secret binding"),
        (r"set\s+-[^\n]*x", "shell trace that could expose credentials"),
        (r"gcloud\s+services\s+enable", "runtime API enablement"),
        (r"services\s+quota\s+(create|update)", "runtime quota mutation"),
        (r"gcloud\s+billing\s+budgets", "managed billing-account budget access"),
    ):
        prohibit(managed_script, pattern, label)

    prohibit(managed_workflow, r"rc7-(android|backend)-key\.txt", "API key value artifact upload")
    prohibit(managed_workflow, r"rc7-backend-key-metadata", "backend key metadata artifact")
    prohibit(managed_workflow, r"backend secret version", "backend secret receipt")

    for needle in (
        "RC7_MAPS_BOOTSTRAP|PASS",
        "roles/serviceusage.apiKeysAdmin",
        "roles/serviceusage.serviceUsageViewer",
        "roles/serviceusage.serviceUsageConsumer",
        "roles/logging.viewer",
        "temporary_authority_expires_at",
        "budget_amount=1",
        "budget_currency",
        "budget_attestation=project_labels",
        "budget_checked_at",
        "gcloud projects update",
        "direkt-rc7-budget-checked-at",
        "geocoding_quota_per_minute=60",
        "backend_api_key_created=false",
        "backend_secret_value_created=false",
        "backend_cloud_nat_created=false",
        "places_routes_enabled_by_rc7=false",
    ):
        require(owner_bootstrap, needle, "owner-scoped Maps bootstrap")
    for pattern, label in (
        (r"roles/compute\.networkAdmin", "network administrator grant"),
        (r"roles/secretmanager", "Secret Manager grant"),
        (r"gcloud\s+compute", "RC7 network resource mutation"),
        (r"gcloud\s+secrets", "RC7 backend secret mutation"),
        (r"api-keys\s+get-key-string", "owner bootstrap API key value read"),
        (r"roles/billing\.(viewer|admin|costsManager)", "billing-account role grant"),
    ):
        prohibit(owner_bootstrap, pattern, label)
    require(owner_bootstrap_doc, "one serious owner-scoped Cloud Shell action", "owner bootstrap docs")

    require(
        managed_trigger,
        "CONFIRMATION=RUN-DIREKT-RC7-MAPS-MANAGED",
        "managed proof confirmation",
    )
    if not any(state in managed_trigger for state in ("STATUS=ARMED", "STATUS=CONSUMED")):
        raise AssertionError("Managed RC7 trigger must be ARMED before proof or CONSUMED after closure.")

    for client_root in ("android", "web", "admin"):
        for path in (ROOT / client_root).rglob("*"):
            if not path.is_file() or any(
                part in {"build", ".next", "node_modules", "test", "androidTest"}
                for part in path.parts
            ):
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            if "GOOGLE_MAPS_SERVER_API_KEY" in text or OAUTH_SCOPE in text:
                raise AssertionError(
                    f"Server Maps credential/auth reference entered client tree: {path.relative_to(ROOT)}"
                )

    combined = environment + env_example + build + versions + module + adapter + map_card
    prohibit(combined, r"places[_-]backend\.googleapis\.com", "Places API activation")
    prohibit(combined, r"routes[_-]backend\.googleapis\.com", "Routes API activation")

    print("RC7 Google Maps source, privacy and managed-proof contract verification passed.")
    print("android_maps=fail_closed_restricted_key")
    print("backend_geocoding=service_identity_oauth_v4")
    print("backend_oauth_scope=geocode_address_only")
    print("backend_api_key=false")
    print("backend_cloud_nat=false")
    print("owner_bootstrap=no_secret_value_time_limited_authority")
    print("managed_proof=exact_main_wif_cost_bounded")
    print("manual_list_fallback=preserved")
    print("private_coordinates_public=false")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
