package com.kudzimusar.direkt.auth

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import org.json.JSONObject
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

internal data class PilotSession(
    val identityId: String,
    val sessionId: String,
    val accessToken: String,
    val accessTokenExpiresAt: String,
    val refreshToken: String,
    val refreshTokenExpiresAt: String,
)

internal class PilotSessionStore(context: Context) {
    private val preferences =
        context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    fun save(session: PilotSession) {
        val plaintext =
            JSONObject()
                .put("identityId", session.identityId)
                .put("sessionId", session.sessionId)
                .put("accessToken", session.accessToken)
                .put("accessTokenExpiresAt", session.accessTokenExpiresAt)
                .put("refreshToken", session.refreshToken)
                .put("refreshTokenExpiresAt", session.refreshTokenExpiresAt)
                .toString()
                .toByteArray(Charsets.UTF_8)
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey())
        val ciphertext = cipher.doFinal(plaintext)
        preferences
            .edit()
            .putString(KEY_IV, Base64.encodeToString(cipher.iv, Base64.NO_WRAP))
            .putString(KEY_PAYLOAD, Base64.encodeToString(ciphertext, Base64.NO_WRAP))
            .apply()
    }

    fun load(): PilotSession? {
        val encodedIv = preferences.getString(KEY_IV, null) ?: return null
        val encodedPayload = preferences.getString(KEY_PAYLOAD, null) ?: return null
        return runCatching {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(
                Cipher.DECRYPT_MODE,
                secretKey(),
                GCMParameterSpec(128, Base64.decode(encodedIv, Base64.NO_WRAP)),
            )
            val json =
                JSONObject(
                    cipher
                        .doFinal(Base64.decode(encodedPayload, Base64.NO_WRAP))
                        .toString(Charsets.UTF_8),
                )
            PilotSession(
                identityId = json.getString("identityId"),
                sessionId = json.getString("sessionId"),
                accessToken = json.getString("accessToken"),
                accessTokenExpiresAt = json.getString("accessTokenExpiresAt"),
                refreshToken = json.getString("refreshToken"),
                refreshTokenExpiresAt = json.getString("refreshTokenExpiresAt"),
            )
        }.getOrElse {
            clear()
            null
        }
    }

    fun clear() {
        preferences.edit().remove(KEY_IV).remove(KEY_PAYLOAD).apply()
    }

    private fun secretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER).apply { load(null) }
        (keyStore.getKey(KEY_ALIAS, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE_PROVIDER)
        generator.init(
            KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
            ).setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build(),
        )
        return generator.generateKey()
    }

    private companion object {
        const val PREFERENCES_NAME = "direkt_pilot_session"
        const val KEY_ALIAS = "direkt_pilot_session_v1"
        const val KEYSTORE_PROVIDER = "AndroidKeyStore"
        const val TRANSFORMATION = "AES/GCM/NoPadding"
        const val KEY_IV = "iv"
        const val KEY_PAYLOAD = "payload"
    }
}
