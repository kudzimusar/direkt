package com.kudzimusar.direkt.notifications

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.kudzimusar.direkt.MainActivity
import com.kudzimusar.direkt.R
import org.json.JSONObject
import java.io.File
import java.util.UUID

class DirektFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        PushRegistrationCoordinator(applicationContext).registerRotatedToken(token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        if (!FcmCanary.canRun()) return

        val data = message.data
        if (data["direkt_kind"] != "rc4_synthetic_canary") return
        val sourceSha = data["direkt_source_sha"] ?: return
        if (sourceSha != com.kudzimusar.direkt.BuildConfig.DIREKT_CRASHLYTICS_SOURCE_SHA) return
        val phase = data["direkt_phase"]?.takeIf { it == "foreground" || it == "background" } ?: return
        val deliveryId = data["direkt_delivery_id"]?.takeIf(::isUuid) ?: return
        if (!markDeliveryOnce(deliveryId)) return

        File(filesDir, "rc4-fcm-receipt-$phase.json").writeText(
            JSONObject()
                .put("kind", "rc4_synthetic_canary")
                .put("deliveryId", deliveryId)
                .put("sourceSha", sourceSha)
                .put("phase", phase)
                .toString(),
            Charsets.UTF_8,
        )
        showSyntheticNotification(phase)
    }

    private fun markDeliveryOnce(deliveryId: String): Boolean {
        val preferences = getSharedPreferences(RECEIPT_PREFERENCES, Context.MODE_PRIVATE)
        if (preferences.getBoolean(deliveryId, false)) return false
        preferences.edit().putBoolean(deliveryId, true).apply()
        return true
    }

    private fun showSyntheticNotification(phase: String) {
        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        val manager = getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(
                NotificationChannel(
                    CHANNEL_ID,
                    "DIREKT integration checks",
                    NotificationManager.IMPORTANCE_DEFAULT,
                ).apply {
                    description = "Synthetic-only integration verification notifications"
                    setShowBadge(false)
                },
            )
        }
        val pendingIntent =
            PendingIntent.getActivity(
                this,
                0,
                Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        val builder =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Notification.Builder(this, CHANNEL_ID)
            } else {
                Notification.Builder(this)
            }
        manager.notify(
            if (phase == "foreground") FOREGROUND_NOTIFICATION_ID else BACKGROUND_NOTIFICATION_ID,
            builder
                .setSmallIcon(R.drawable.ic_direkt)
                .setContentTitle("DIREKT notification check")
                .setContentText("Synthetic delivery verified. No participant data was used.")
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build(),
        )
    }

    private fun isUuid(value: String): Boolean = runCatching { UUID.fromString(value) }.isSuccess

    private companion object {
        const val CHANNEL_ID = "direkt-integration-checks"
        const val RECEIPT_PREFERENCES = "direkt_rc4_fcm_receipts"
        const val FOREGROUND_NOTIFICATION_ID = 4_401
        const val BACKGROUND_NOTIFICATION_ID = 4_402
    }
}
