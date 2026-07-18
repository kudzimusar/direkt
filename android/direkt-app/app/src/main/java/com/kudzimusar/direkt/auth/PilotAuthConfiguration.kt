package com.kudzimusar.direkt.auth

import com.kudzimusar.direkt.BuildConfig

internal data class PilotAuthConfiguration(
    val apiBaseUrl: String,
    val firebaseApiKey: String,
    val firebaseAppId: String,
    val firebaseProjectId: String,
    val noticeVersion: String,
) {
    val enabled: Boolean
        get() =
            apiBaseUrl.startsWith("https://") &&
                firebaseApiKey.isNotBlank() &&
                firebaseAppId.isNotBlank() &&
                firebaseProjectId.isNotBlank() &&
                noticeVersion.isNotBlank()

    companion object {
        fun fromBuildConfig(): PilotAuthConfiguration =
            PilotAuthConfiguration(
                apiBaseUrl = BuildConfig.DIREKT_PILOT_API_BASE_URL.trimEnd('/'),
                firebaseApiKey = BuildConfig.DIREKT_FIREBASE_API_KEY,
                firebaseAppId = BuildConfig.DIREKT_FIREBASE_APP_ID,
                firebaseProjectId = BuildConfig.DIREKT_FIREBASE_PROJECT_ID,
                noticeVersion = BuildConfig.DIREKT_PILOT_NOTICE_VERSION,
            )
    }
}
