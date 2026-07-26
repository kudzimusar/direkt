#!/usr/bin/env python3
"""One-shot exact patcher for RC7 existing source files; removed by its workflow commit."""

from __future__ import annotations

import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"Expected exactly one match in {path}, found {count}: {old[:80]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


def append_before_final_brace(path: str, addition: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    stripped = text.rstrip()
    if not stripped.endswith("}"):
        raise AssertionError(f"Expected final class brace in {path}")
    target.write_text(stripped[:-1] + addition + "\n}\n", encoding="utf-8")


def main() -> None:
    replace_once(
        "android/direkt-app/gradle/libs.versions.toml",
        'firebaseBom = "34.16.0"\n',
        'firebaseBom = "34.16.0"\nmapsCompose = "8.3.0"\n',
    )
    replace_once(
        "android/direkt-app/gradle/libs.versions.toml",
        'firebase-messaging = { module = "com.google.firebase:firebase-messaging" }\n',
        'firebase-messaging = { module = "com.google.firebase:firebase-messaging" }\n'
        'google-maps-compose = { module = "com.google.maps.android:maps-compose", version.ref = "mapsCompose" }\n',
    )

    replace_once(
        "android/direkt-app/app/build.gradle.kts",
        'val crashlyticsCanaryEnabled = strictBooleanProvider("DIREKT_CRASHLYTICS_CANARY_ENABLED").get()\n',
        'val crashlyticsCanaryEnabled = strictBooleanProvider("DIREKT_CRASHLYTICS_CANARY_ENABLED").get()\n'
        'val mapsBuildEnabled = strictBooleanProvider("DIREKT_MAPS_BUILD_ENABLED").get()\n'
        'val androidMapsApiKey = providers.gradleProperty("DIREKT_ANDROID_MAPS_API_KEY")\n'
        '    .orElse(providers.environmentVariable("DIREKT_ANDROID_MAPS_API_KEY"))\n'
        '    .orElse("")\n'
        '    .get()\n\n'
        'if (mapsBuildEnabled) {\n'
        '    require(androidMapsApiKey.length in 20..512) {\n'
        '        "DIREKT_MAPS_BUILD_ENABLED=true requires a protected DIREKT_ANDROID_MAPS_API_KEY"\n'
        '    }\n'
        '}\n',
    )
    replace_once(
        "android/direkt-app/app/build.gradle.kts",
        '        buildConfigField("String", "DIREKT_CRASHLYTICS_DATA_MODE", quotedBuildConfig(crashlyticsDataMode))\n',
        '        buildConfigField("String", "DIREKT_CRASHLYTICS_DATA_MODE", quotedBuildConfig(crashlyticsDataMode))\n'
        '        buildConfigField("boolean", "DIREKT_MAPS_ENABLED", mapsBuildEnabled.toString())\n'
        '        manifestPlaceholders["direktMapsApiKey"] =\n'
        '            if (mapsBuildEnabled) androidMapsApiKey else "DIREKT_MAPS_DISABLED"\n',
    )
    replace_once(
        "android/direkt-app/app/build.gradle.kts",
        '    implementation(libs.firebase.messaging)\n',
        '    implementation(libs.firebase.messaging)\n    implementation(libs.google.maps.compose)\n',
    )

    replace_once(
        "android/direkt-app/app/src/main/AndroidManifest.xml",
        '        <meta-data\n            android:name="firebase_crashlytics_collection_enabled"\n            android:value="false" />\n',
        '        <meta-data\n            android:name="com.google.android.geo.API_KEY"\n            android:value="${direktMapsApiKey}" />\n        <meta-data\n            android:name="firebase_crashlytics_collection_enabled"\n            android:value="false" />\n',
    )

    models = "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/DiscoveryModels.kt"
    replace_once(
        models,
        'enum class DiscoveryViewMode(val label: String) {\n    List("List"),\n    Map("Map"),\n}\n',
        'enum class DiscoveryViewMode(val label: String) {\n    List("List"),\n    Map("Map"),\n}\n\n'
        'enum class MapRuntimeState {\n    Disabled,\n    Loading,\n    Ready,\n    Failed,\n}\n',
    )
    replace_once(
        models,
        'data class PublicPremisesPoint(\n    val latitude: Double,\n    val longitude: Double,\n)\n',
        'data class PublicPremisesPoint(\n    val latitude: Double,\n    val longitude: Double,\n)\n\n'
        'data class PublicServiceAreaPreview(\n    val center: PublicPremisesPoint,\n    val radiusKm: Double,\n)\n',
    )
    replace_once(
        models,
        '    val serviceAreaLabel: String,\n    val publicPremises: PublicPremisesPoint?,\n',
        '    val serviceAreaLabel: String,\n    val serviceAreaPreview: PublicServiceAreaPreview,\n    val publicPremises: PublicPremisesPoint?,\n',
    )
    replace_once(
        models,
        '}\n\ndata class DiscoveryUiState(',
        '}\n\nfun publicMapMarker(provider: SyntheticPublicProvider): PublicPremisesPoint? = when {\n'
        '    provider.operatingModel == PublicOperatingModel.Mobile -> null\n'
        '    else -> provider.publicPremises\n'
        '}\n\n'
        'fun mapFallbackMessage(runtimeState: MapRuntimeState): String = when (runtimeState) {\n'
        '    MapRuntimeState.Disabled -> "Map display is off. Public area details are shown below."\n'
        '    MapRuntimeState.Failed -> "Map provider unavailable. Public area details remain available below."\n'
        '    MapRuntimeState.Loading -> "Loading the privacy-safe map."\n'
        '    MapRuntimeState.Ready -> "Privacy-safe map loaded."\n'
        '}\n\n'
        'data class DiscoveryUiState(',
    )
    replacements = (
        (
            '        serviceAreaLabel = "Woodlands and nearby Lusaka neighbourhoods",\n        publicPremises = PublicPremisesPoint(latitude = -15.421, longitude = 28.335),\n',
            '        serviceAreaLabel = "Woodlands and nearby Lusaka neighbourhoods",\n'
            '        serviceAreaPreview = PublicServiceAreaPreview(\n'
            '            center = PublicPremisesPoint(latitude = -15.421, longitude = 28.335),\n'
            '            radiusKm = 4.5,\n'
            '        ),\n'
            '        publicPremises = PublicPremisesPoint(latitude = -15.421, longitude = 28.335),\n',
        ),
        (
            '        serviceAreaLabel = "Serves central and southern Lusaka",\n        publicPremises = null,\n',
            '        serviceAreaLabel = "Serves central and southern Lusaka",\n'
            '        serviceAreaPreview = PublicServiceAreaPreview(\n'
            '            center = PublicPremisesPoint(latitude = -15.4167, longitude = 28.3000),\n'
            '            radiusKm = 9.0,\n'
            '        ),\n'
            '        publicPremises = null,\n',
        ),
        (
            '        serviceAreaLabel = "Public premises in Kabulonga; mobile service across nearby areas",\n        publicPremises = PublicPremisesPoint(latitude = -15.420, longitude = 28.360),\n',
            '        serviceAreaLabel = "Public premises in Kabulonga; mobile service across nearby areas",\n'
            '        serviceAreaPreview = PublicServiceAreaPreview(\n'
            '            center = PublicPremisesPoint(latitude = -15.420, longitude = 28.350),\n'
            '            radiusKm = 7.0,\n'
            '        ),\n'
            '        publicPremises = PublicPremisesPoint(latitude = -15.420, longitude = 28.360),\n',
        ),
    )
    for old, new in replacements:
        replace_once(models, old, new)

    replace_once(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/DiscoveryExperience.kt",
        '        SyntheticMapCard(providers = providers)\n',
        '        PrivacySafeMapCard(providers = providers)\n',
    )

    append_before_final_brace(
        "android/direkt-app/app/src/test/java/com/kudzimusar/direkt/ui/discovery/DiscoveryModelsTest.kt",
        '''\n\n    @Test\n    fun `mobile provider publishes a service area but never a base marker`() {\n        val mobile = syntheticDiscoveryProviders.first {\n            it.operatingModel == PublicOperatingModel.Mobile\n        }\n\n        assertTrue(mobile.serviceAreaPreview.radiusKm > 0)\n        assertNull(publicMapMarker(mobile))\n        assertFalse(mobile.containsPrivateCoordinates)\n    }\n\n    @Test\n    fun `fixed and hybrid map markers are consented public premises only`() {\n        val providers = syntheticDiscoveryProviders.filter {\n            it.operatingModel != PublicOperatingModel.Mobile\n        }\n\n        assertTrue(providers.all { publicMapMarker(it) == it.publicPremises })\n        assertTrue(providers.all { it.serviceAreaPreview.radiusKm > 0 })\n    }\n\n    @Test\n    fun `map failure preserves explicit manual and list fallback`() {\n        assertTrue(mapFallbackMessage(MapRuntimeState.Disabled).contains("shown below"))\n        assertTrue(mapFallbackMessage(MapRuntimeState.Failed).contains("remain available"))\n    }\n''',
    )

    replace_once(
        "backend/direkt-api/src/config/environment.ts",
        "export type WhatsAppProviderMode = 'disabled' | 'meta_cloud';\n",
        "export type WhatsAppProviderMode = 'disabled' | 'meta_cloud';\n"
        "export type GoogleMapsBackendMode = 'disabled' | 'google_maps';\n",
    )
    replace_once(
        "backend/direkt-api/src/config/environment.ts",
        '  WHATSAPP_SYNTHETIC_TEMPLATE_LANGUAGE: string;\n}',
        '  WHATSAPP_SYNTHETIC_TEMPLATE_LANGUAGE: string;\n'
        '  GOOGLE_MAPS_BACKEND_MODE: GoogleMapsBackendMode;\n'
        '  GOOGLE_MAPS_SERVER_API_KEY?: string;\n'
        '  GOOGLE_MAPS_GEOCODING_ENDPOINT: string;\n'
        '  GOOGLE_MAPS_REQUEST_TIMEOUT_MS: number;\n'
        '  GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED: boolean;\n}',
    )
    replace_once(
        "backend/direkt-api/src/config/environment.ts",
        'const whatsappTemplateLanguage = Joi.string().pattern(/^[a-z]{2,3}(_[A-Z]{2})?$/);\n',
        'const whatsappTemplateLanguage = Joi.string().pattern(/^[a-z]{2,3}(_[A-Z]{2})?$/);\n'
        "const googleMapsEndpoint = Joi.string().uri({ scheme: ['https'] });\n",
    )
    replace_once(
        "backend/direkt-api/src/config/environment.ts",
        "  WHATSAPP_SYNTHETIC_TEMPLATE_LANGUAGE: whatsappTemplateLanguage.default('en_US'),\n}).custom((value: DirektEnvironment, helpers) => {",
        "  WHATSAPP_SYNTHETIC_TEMPLATE_LANGUAGE: whatsappTemplateLanguage.default('en_US'),\n"
        "  GOOGLE_MAPS_BACKEND_MODE: Joi.string().when('NODE_ENV', {\n"
        "    is: 'production',\n"
        "    then: Joi.valid('disabled').default('disabled'),\n"
        "    otherwise: Joi.valid('disabled', 'google_maps').default('disabled'),\n"
        "  }),\n"
        "  GOOGLE_MAPS_SERVER_API_KEY: providerApiKey.when('GOOGLE_MAPS_BACKEND_MODE', {\n"
        "    is: 'google_maps',\n"
        "    then: providerApiKey.required(),\n"
        "    otherwise: providerApiKey.optional(),\n"
        "  }),\n"
        "  GOOGLE_MAPS_GEOCODING_ENDPOINT: googleMapsEndpoint.default(\n"
        "    'https://maps.googleapis.com/maps/api/geocode/json',\n"
        "  ),\n"
        "  GOOGLE_MAPS_REQUEST_TIMEOUT_MS: Joi.number().integer().min(1000).max(15000).default(5000),\n"
        "  GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED: Joi.boolean()\n"
        "    .truthy('true')\n"
        "    .falsy('false')\n"
        "    .default(false),\n"
        "}).custom((value: DirektEnvironment, helpers) => {",
    )
    replace_once(
        "backend/direkt-api/src/config/environment.ts",
        "  if (value.NODE_ENV === 'production' && value.WHATSAPP_PROVIDER_MODE !== 'disabled') {\n    return helpers.message({\n      custom:\n        'Production WhatsApp provider mode must remain disabled until later provider/legal/privacy and release gates.',\n    });\n  }\n",
        "  if (value.NODE_ENV === 'production' && value.WHATSAPP_PROVIDER_MODE !== 'disabled') {\n    return helpers.message({\n      custom:\n        'Production WhatsApp provider mode must remain disabled until later provider/legal/privacy and release gates.',\n    });\n  }\n"
        "  if (value.NODE_ENV === 'production' && value.GOOGLE_MAPS_BACKEND_MODE !== 'disabled') {\n"
        "    return helpers.message({\n"
        "      custom: 'Production Google Maps backend mode must remain disabled until later participant and release gates.',\n"
        "    });\n"
        "  }\n",
    )
    replace_once(
        "backend/direkt-api/src/config/environment.ts",
        "  if (value.WHATSAPP_PROVIDER_MODE !== 'disabled') {\n    if (value.DIREKT_DATA_MODE !== 'synthetic-only') {\n      return helpers.message({\n        custom: 'WhatsApp provider activation currently permits synthetic-only data mode.',\n      });\n    }\n    if (!value.WHATSAPP_SYNTHETIC_SEND_APPROVED) {\n      return helpers.message({\n        custom: 'WhatsApp provider activation requires the explicit synthetic-send approval latch.',\n      });\n    }\n  }\n",
        "  if (value.WHATSAPP_PROVIDER_MODE !== 'disabled') {\n    if (value.DIREKT_DATA_MODE !== 'synthetic-only') {\n      return helpers.message({\n        custom: 'WhatsApp provider activation currently permits synthetic-only data mode.',\n      });\n    }\n    if (!value.WHATSAPP_SYNTHETIC_SEND_APPROVED) {\n      return helpers.message({\n        custom: 'WhatsApp provider activation requires the explicit synthetic-send approval latch.',\n      });\n    }\n  }\n"
        "  if (value.GOOGLE_MAPS_BACKEND_MODE !== 'disabled') {\n"
        "    if (value.DIREKT_DATA_MODE !== 'synthetic-only') {\n"
        "      return helpers.message({\n"
        "        custom: 'Google Maps backend activation currently permits synthetic-only data mode.',\n"
        "      });\n"
        "    }\n"
        "    if (!value.GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED) {\n"
        "      return helpers.message({\n"
        "        custom: 'Google Maps backend activation requires the explicit synthetic Maps approval latch.',\n"
        "      });\n"
        "    }\n"
        "  }\n",
    )

    replace_once(
        "backend/direkt-api/.env.example",
        '# WHATSAPP_SYNTHETIC_TEMPLATE_NAME (approved template only)\n',
        '# WHATSAPP_SYNTHETIC_TEMPLATE_NAME (approved template only)\n\n'
        '# RC7 Google Maps is fail-closed. Backend Geocoding is synthetic-only and server-controlled.\n'
        'GOOGLE_MAPS_BACKEND_MODE=disabled\n'
        'GOOGLE_MAPS_GEOCODING_ENDPOINT=https://maps.googleapis.com/maps/api/geocode/json\n'
        'GOOGLE_MAPS_REQUEST_TIMEOUT_MS=5000\n'
        'GOOGLE_MAPS_SYNTHETIC_CANARY_APPROVED=false\n'
        '# GOOGLE_MAPS_SERVER_API_KEY is supplied only through Secret Manager for the backend canary/runtime.\n'
        '# Android uses a different restricted key injected as DIREKT_ANDROID_MAPS_API_KEY at protected build time.\n',
    )

    replace_once(
        "backend/direkt-api/src/app.module.ts",
        "import { InteractionModule } from './interaction/interaction.module';\n",
        "import { InteractionModule } from './interaction/interaction.module';\nimport { LocationModule } from './location/location.module';\n",
    )
    replace_once(
        "backend/direkt-api/src/app.module.ts",
        '    InteractionModule,\n    OperationsModule,\n',
        '    InteractionModule,\n    LocationModule,\n    OperationsModule,\n',
    )
    replace_once(
        "backend/direkt-api/package.json",
        '    "start:dev": "ts-node --transpile-only src/main.ts",\n',
        '    "start:dev": "ts-node --transpile-only src/main.ts",\n'
        '    "canary:maps": "node dist/location/maps-canary.js",\n',
    )

    print("RC7 existing-source patch applied successfully.")


if __name__ == "__main__":
    main()
