package com.kudzimusar.direkt.observability

import com.kudzimusar.direkt.BuildConfig

internal data class CrashlyticsConfiguration(
    val mode: String,
    val release: String,
    val firebaseApiKey: String,
    val firebaseAppId: String,
    val firebaseProjectId: String,
) {
    val syntheticCanaryEnabled: Boolean
        get() = mode == SYNTHETIC_CANARY_MODE

    fun requireValidSyntheticCanary() {
        require(syntheticCanaryEnabled) {
            "Crashlytics synthetic canary is disabled."
        }
        require(RELEASE_PATTERN.matches(release)) {
            "Crashlytics release must be an exact lowercase 40-character source SHA."
        }
        require(firebaseApiKey.isNotBlank()) {
            "Crashlytics synthetic canary requires the Firebase API key."
        }
        require(firebaseAppId.isNotBlank()) {
            "Crashlytics synthetic canary requires the Firebase app ID."
        }
        require(firebaseProjectId.isNotBlank()) {
            "Crashlytics synthetic canary requires the Firebase project ID."
        }
    }

    companion object {
        const val DISABLED_MODE = "disabled"
        const val SYNTHETIC_CANARY_MODE = "synthetic-canary"
        private val RELEASE_PATTERN = Regex("^[0-9a-f]{40}$")

        fun fromBuildConfig(): CrashlyticsConfiguration =
            CrashlyticsConfiguration(
                mode = BuildConfig.DIREKT_CRASHLYTICS_MODE,
                release = BuildConfig.DIREKT_CRASHLYTICS_RELEASE,
                firebaseApiKey = BuildConfig.DIREKT_FIREBASE_API_KEY,
                firebaseAppId = BuildConfig.DIREKT_FIREBASE_APP_ID,
                firebaseProjectId = BuildConfig.DIREKT_FIREBASE_PROJECT_ID,
            )
    }
}
