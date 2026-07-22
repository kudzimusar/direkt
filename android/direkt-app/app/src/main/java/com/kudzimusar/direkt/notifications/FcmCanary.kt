package com.kudzimusar.direkt.notifications

import android.content.Context
import android.content.Intent
import com.google.firebase.messaging.FirebaseMessaging
import com.kudzimusar.direkt.BuildConfig
import java.io.File
import org.json.JSONObject

internal object FcmCanary {
    const val EXTRA_MODE = "direkt_rc4_fcm_canary"
    const val TOKEN_FILE = "rc4-fcm-token"
    const val STATUS_FILE = "rc4-fcm-registration-status.json"

    private val sourceShaPattern = Regex("^[0-9a-f]{40}$")
    private val statusLock = Any()

    fun handleLaunch(context: Context, intent: Intent) {
        if (!canRun()) return
        if (intent.getStringExtra(EXTRA_MODE)?.trim()?.lowercase() != "token") return

        File(context.filesDir, TOKEN_FILE).delete()
        File(context.filesDir, STATUS_FILE).delete()
        writeStatus(context, "started", null)

        FirebaseMessaging.getInstance().register().addOnCompleteListener { task ->
            synchronized(statusLock) {
                if (!task.isSuccessful) {
                    writeStatusLocked(
                        context,
                        "failed",
                        task.exception?.javaClass?.simpleName ?: "UnknownError",
                    )
                    return@addOnCompleteListener
                }

                val registrationFile = File(context.filesDir, TOKEN_FILE)
                if (!registrationFile.isFile || registrationFile.length() == 0L) {
                    writeStatusLocked(context, "register_task_succeeded_waiting_callback", null)
                }
            }
        }
    }

    fun recordRegisteredInstallation(
        context: Context,
        installationId: String,
    ) {
        if (!canRun() || installationId.length !in 20..4096) return
        synchronized(statusLock) {
            File(context.filesDir, TOKEN_FILE).writeText(installationId, Charsets.UTF_8)
            writeStatusLocked(context, "registered", null)
        }
    }

    private fun writeStatus(
        context: Context,
        status: String,
        errorType: String?,
    ) {
        synchronized(statusLock) {
            writeStatusLocked(context, status, errorType)
        }
    }

    private fun writeStatusLocked(
        context: Context,
        status: String,
        errorType: String?,
    ) {
        File(context.filesDir, STATUS_FILE).writeText(
            JSONObject()
                .put("status", status)
                .put("errorType", errorType ?: JSONObject.NULL)
                .toString(),
            Charsets.UTF_8,
        )
    }

    fun canRun(): Boolean =
        BuildConfig.DEBUG &&
            BuildConfig.DIREKT_CRASHLYTICS_CANARY_ENABLED &&
            BuildConfig.DIREKT_CRASHLYTICS_DATA_MODE == "synthetic-only" &&
            sourceShaPattern.matches(BuildConfig.DIREKT_CRASHLYTICS_SOURCE_SHA)
}
