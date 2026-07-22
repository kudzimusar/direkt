package com.kudzimusar.direkt.notifications

import android.content.Context
import android.content.Intent
import com.google.firebase.messaging.FirebaseMessaging
import com.kudzimusar.direkt.BuildConfig
import java.io.File

internal object FcmCanary {
    const val EXTRA_MODE = "direkt_rc4_fcm_canary"
    const val TOKEN_FILE = "rc4-fcm-token"

    private val sourceShaPattern = Regex("^[0-9a-f]{40}$")

    fun handleLaunch(context: Context, intent: Intent) {
        if (!canRun()) return
        if (intent.getStringExtra(EXTRA_MODE)?.trim()?.lowercase() != "token") return

        val tokenFile = File(context.filesDir, TOKEN_FILE)
        tokenFile.delete()
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            val token = task.result?.takeIf { task.isSuccessful && it.length in 20..4096 } ?: return@addOnCompleteListener
            tokenFile.writeText(token, Charsets.UTF_8)
        }
    }

    fun canRun(): Boolean =
        BuildConfig.DEBUG &&
            BuildConfig.DIREKT_CRASHLYTICS_CANARY_ENABLED &&
            BuildConfig.DIREKT_CRASHLYTICS_DATA_MODE == "synthetic-only" &&
            sourceShaPattern.matches(BuildConfig.DIREKT_CRASHLYTICS_SOURCE_SHA)
}
