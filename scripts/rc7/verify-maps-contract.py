#!/usr/bin/env python3
"""Permanent fail-closed verifier for DIREKT RC7 Google Maps runtime."""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]


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
    canary = read("backend/direkt-api/src/location/maps-canary.ts")
    manifest = read("android/direkt-app/app/src/main/AndroidManifest.xml")
    build = read("android/direkt-app/app/build.gradle.kts")
    versions = read("android/direkt-app/gradle/libs.versions.toml")
    models = read("android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/DiscoveryModels.kt")
    discovery = read("android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/DiscoveryExperience.kt")
    map_card = read("android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/PrivacySafeMapCard.kt")

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
        "GOOGLE_MAPS_SERVER_API_KEY",
        "GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED",
        "Production Google Maps backend mode must remain disabled",
        "Google Maps backend activation currently permits synthetic-only data mode",
        "explicit synthetic Maps approval latch",
    ):
        require(environment, needle, "fail-closed backend Maps environment")
    require(env_example, "GOOGLE_MAPS_BACKEND_MODE=disabled", "default-disabled Maps backend")
    require(module, "DisabledGeocodingProviderAdapter", "disabled provider adapter")
    require(module, "GoogleMapsGeocodingProviderAdapter", "Google provider adapter")
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
        "components', 'country:ZM'",
        "ZAMBIA_BOUNDS",
        "privateLocationPublished: false",
        "persistedByAdapter: false",
        "AbortController",
        "OVER_QUERY_LIMIT",
        "REQUEST_DENIED",
    ):
        require(adapter, needle, "bounded server Geocoding behavior")
    prohibit(adapter, r"console\.(log|error|warn)", "raw Geocoding response logging")
    for needle in (
        "RC7_MAPS_CANARY|PASS",
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
    require(models, "provider.operatingModel == PublicOperatingModel.Mobile -> null", "mobile base-marker prohibition")
    require(status, "IMPLEMENTED_GATED / MANAGED PROOF IN PROGRESS", "current Maps integration state")
    require(ledger, "IMPLEMENTED_GATED / MANAGED PROOF IN PROGRESS", "live Maps ledger state")

    for client_root in ("android", "web", "admin"):
        for path in (ROOT / client_root).rglob("*"):
            if not path.is_file() or any(part in {"build", ".next", "node_modules", "test", "androidTest"} for part in path.parts):
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            if "GOOGLE_MAPS_SERVER_API_KEY" in text:
                raise AssertionError(f"Server Maps credential reference entered client tree: {path.relative_to(ROOT)}")

    combined = environment + env_example + build + versions + module + adapter + map_card
    prohibit(combined, r"places[_-]backend\.googleapis\.com", "Places API activation")
    prohibit(combined, r"routes[_-]backend\.googleapis\.com", "Routes API activation")

    print("RC7 Google Maps source and privacy contract verification passed.")
    print("android_maps=fail_closed_restricted_key")
    print("backend_geocoding=synthetic_only_server_controlled")
    print("manual_list_fallback=preserved")
    print("private_coordinates_public=false")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
