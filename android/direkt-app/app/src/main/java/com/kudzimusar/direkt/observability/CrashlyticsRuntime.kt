package com.kudzimusar.direkt.observability

import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.crashlytics.FirebaseCrashlytics

internal object CrashlyticsRuntime {
    fun configure(
        context: Context,
        configuration: CrashlyticsConfiguration = CrashlyticsConfiguration.fromBuildConfig(),
    ) {
        if (!configuration.syntheticCanaryEnabled) {
            return
        }

        configuration.requireValidSyntheticCanary()
        val firebaseApp =
            runCatching { FirebaseApp.getInstance() }.getOrNull()
                ?: FirebaseApp.initializeApp(
                    context,
                    FirebaseOptions.Builder()
                        .setApiKey(configuration.firebaseApiKey)
                        .setApplicationId(configuration.firebaseAppId)
                        .setProjectId(configuration.firebaseProjectId)
                        .build(),
                )
                ?: error("Default Firebase app could not be initialized for the Crashlytics canary.")

        require(firebaseApp.options.applicationId == configuration.firebaseAppId) {
            "Crashlytics canary Firebase app ID does not match the reviewed configuration."
        }
        require(firebaseApp.options.projectId == configuration.firebaseProjectId) {
            "Crashlytics canary Firebase project does not match the reviewed configuration."
        }

        FirebaseCrashlytics.getInstance().apply {
            setCrashlyticsCollectionEnabled(true)
            setCustomKey("direkt_canary", true)
            setCustomKey("direkt_data_mode", "synthetic-only")
            setCustomKey("direkt_release", configuration.release)
        }
    }
}
