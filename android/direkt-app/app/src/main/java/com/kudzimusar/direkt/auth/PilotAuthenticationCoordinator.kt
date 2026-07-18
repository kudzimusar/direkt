package com.kudzimusar.direkt.auth

import android.app.Activity
import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import org.json.JSONObject
import java.net.URL
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import javax.net.ssl.HttpsURLConnection

internal sealed interface PilotAuthResult {
    data object CodeSent : PilotAuthResult

    data class SignedIn(
        val sessionId: String,
    ) : PilotAuthResult

    data class Error(
        val message: String,
    ) : PilotAuthResult
}

internal class PilotAuthenticationCoordinator(
    private val context: Context,
    private val configuration: PilotAuthConfiguration = PilotAuthConfiguration.fromBuildConfig(),
) {
    private val sessionStore = PilotSessionStore(context)
    private val executor = Executors.newSingleThreadExecutor()
    private var verificationId: String? = null

    val enabled: Boolean
        get() = configuration.enabled

    val noticeVersion: String
        get() = configuration.noticeVersion

    fun currentSession(): PilotSession? = sessionStore.load()

    fun startPhoneVerification(
        activity: Activity,
        phoneNumber: String,
        onResult: (PilotAuthResult) -> Unit,
    ) {
        if (!enabled) {
            onResult(PilotAuthResult.Error("Pilot authentication is not configured."))
            return
        }
        if (!ZAMBIA_PHONE_PATTERN.matches(phoneNumber)) {
            onResult(PilotAuthResult.Error("Use a Zambia phone number in +260XXXXXXXXX format."))
            return
        }

        val auth = firebaseAuth()
        val callbacks =
            object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
                override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                    signInAndExchange(activity, auth, credential, onResult)
                }

                override fun onVerificationFailed(exception: com.google.firebase.FirebaseException) {
                    onResult(PilotAuthResult.Error("Phone verification could not be completed."))
                }

                override fun onCodeSent(
                    newVerificationId: String,
                    token: PhoneAuthProvider.ForceResendingToken,
                ) {
                    verificationId = newVerificationId
                    onResult(PilotAuthResult.CodeSent)
                }
            }

        PhoneAuthProvider.verifyPhoneNumber(
            PhoneAuthOptions.newBuilder(auth)
                .setPhoneNumber(phoneNumber)
                .setTimeout(60L, TimeUnit.SECONDS)
                .setActivity(activity)
                .setCallbacks(callbacks)
                .build(),
        )
    }

    fun submitVerificationCode(
        activity: Activity,
        code: String,
        onResult: (PilotAuthResult) -> Unit,
    ) {
        val activeVerificationId = verificationId
        if (activeVerificationId.isNullOrBlank()) {
            onResult(PilotAuthResult.Error("Request a verification code first."))
            return
        }
        if (!CODE_PATTERN.matches(code)) {
            onResult(PilotAuthResult.Error("Enter the 6-digit verification code."))
            return
        }
        signInAndExchange(
            activity = activity,
            auth = firebaseAuth(),
            credential = PhoneAuthProvider.getCredential(activeVerificationId, code),
            onResult = onResult,
        )
    }

    fun signOut() {
        runCatching { firebaseAuth().signOut() }
        sessionStore.clear()
        verificationId = null
    }

    private fun signInAndExchange(
        activity: Activity,
        auth: FirebaseAuth,
        credential: PhoneAuthCredential,
        onResult: (PilotAuthResult) -> Unit,
    ) {
        auth.signInWithCredential(credential).addOnCompleteListener(activity) { signInTask ->
            val user = signInTask.result?.user
            if (!signInTask.isSuccessful || user == null) {
                auth.signOut()
                onResult(PilotAuthResult.Error("Phone verification could not be completed."))
                return@addOnCompleteListener
            }
            user.getIdToken(true).addOnCompleteListener(activity) { tokenTask ->
                val idToken = tokenTask.result?.token
                if (!tokenTask.isSuccessful || idToken.isNullOrBlank()) {
                    auth.signOut()
                    onResult(PilotAuthResult.Error("A secure pilot session could not be created."))
                    return@addOnCompleteListener
                }
                exchangeForDirektSession(activity, auth, idToken, onResult)
            }
        }
    }

    private fun exchangeForDirektSession(
        activity: Activity,
        auth: FirebaseAuth,
        idToken: String,
        onResult: (PilotAuthResult) -> Unit,
    ) {
        executor.execute {
            val result =
                runCatching {
                    val endpoint = URL("${configuration.apiBaseUrl}/api/v1/auth/firebase/exchange")
                    val connection = endpoint.openConnection() as HttpsURLConnection
                    try {
                        connection.requestMethod = "POST"
                        connection.connectTimeout = 10_000
                        connection.readTimeout = 10_000
                        connection.doOutput = true
                        connection.setRequestProperty("Content-Type", "application/json")
                        connection.setRequestProperty("Accept", "application/json")
                        val body =
                            JSONObject()
                                .put("idToken", idToken)
                                .put("deviceLabel", "Android pilot device")
                                .toString()
                        connection.outputStream.use { output ->
                            output.write(body.toByteArray(Charsets.UTF_8))
                        }
                        if (connection.responseCode !in 200..299) {
                            throw IllegalStateException("Session exchange was rejected.")
                        }
                        val responseBody =
                            connection.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
                        parseSession(responseBody)
                    } finally {
                        connection.disconnect()
                    }
                }

            auth.signOut()
            activity.runOnUiThread {
                result.fold(
                    onSuccess = { session ->
                        sessionStore.save(session)
                        verificationId = null
                        onResult(PilotAuthResult.SignedIn(session.sessionId))
                    },
                    onFailure = {
                        onResult(PilotAuthResult.Error("A secure DIREKT session could not be created."))
                    },
                )
            }
        }
    }

    private fun parseSession(responseBody: String): PilotSession {
        val json = JSONObject(responseBody)
        return PilotSession(
            identityId = json.getString("identityId"),
            sessionId = json.getString("sessionId"),
            accessToken = json.getString("accessToken"),
            accessTokenExpiresAt = json.getString("accessTokenExpiresAt"),
            refreshToken = json.getString("refreshToken"),
            refreshTokenExpiresAt = json.getString("refreshTokenExpiresAt"),
        )
    }

    private fun firebaseAuth(): FirebaseAuth {
        val existing = runCatching { FirebaseApp.getInstance(FIREBASE_APP_NAME) }.getOrNull()
        val app =
            existing
                ?: FirebaseApp.initializeApp(
                    context,
                    FirebaseOptions.Builder()
                        .setApiKey(configuration.firebaseApiKey)
                        .setApplicationId(configuration.firebaseAppId)
                        .setProjectId(configuration.firebaseProjectId)
                        .build(),
                    FIREBASE_APP_NAME,
                )
        return FirebaseAuth.getInstance(app)
    }

    private companion object {
        const val FIREBASE_APP_NAME = "direkt-pilot"
        val ZAMBIA_PHONE_PATTERN = Regex("^\\+260\\d{9}$")
        val CODE_PATTERN = Regex("^\\d{6}$")
    }
}
