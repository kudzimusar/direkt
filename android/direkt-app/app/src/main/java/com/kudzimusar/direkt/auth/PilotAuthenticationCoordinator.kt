package com.kudzimusar.direkt.auth

import android.app.Activity
import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import com.kudzimusar.direkt.notifications.PushRegistrationCoordinator
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

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
    private val pushRegistrationCoordinator = PushRegistrationCoordinator(context)
    private val executor = Executors.newSingleThreadExecutor()
    private val sessionExchangeClient: PilotSessionExchangeClient by lazy {
        GeneratedPilotSessionExchangeClient.fromBaseUrl(configuration.apiBaseUrl)
    }
    private var verificationId: String? = null
    private var consentAcceptedForVerification = false

    val enabled: Boolean
        get() = configuration.enabled

    val noticeVersion: String
        get() = configuration.noticeVersion

    fun currentSession(): PilotSession? = sessionStore.load()

    fun startPhoneVerification(
        activity: Activity,
        phoneNumber: String,
        consentAccepted: Boolean,
        onResult: (PilotAuthResult) -> Unit,
    ) {
        if (!enabled) {
            onResult(PilotAuthResult.Error("Pilot authentication is not configured."))
            return
        }
        if (!consentAccepted) {
            onResult(PilotAuthResult.Error("Accept the approved pilot notice before verification."))
            return
        }
        if (!ZAMBIA_PHONE_PATTERN.matches(phoneNumber)) {
            onResult(PilotAuthResult.Error("Use a Zambia phone number in +260XXXXXXXXX format."))
            return
        }

        consentAcceptedForVerification = true
        val auth = firebaseAuth()
        val callbacks =
            object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
                override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                    signInAndExchange(activity, auth, credential, onResult)
                }

                override fun onVerificationFailed(exception: com.google.firebase.FirebaseException) {
                    consentAcceptedForVerification = false
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
        if (!consentAcceptedForVerification) {
            onResult(PilotAuthResult.Error("Accept the approved pilot notice before verification."))
            return
        }
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
        sessionStore.load()?.let(pushRegistrationCoordinator::unregisterCurrentDevice)
        if (enabled) {
            runCatching { firebaseAuth().signOut() }
        }
        sessionStore.clear()
        verificationId = null
        consentAcceptedForVerification = false
    }

    private fun signInAndExchange(
        activity: Activity,
        auth: FirebaseAuth,
        credential: PhoneAuthCredential,
        onResult: (PilotAuthResult) -> Unit,
    ) {
        auth.signInWithCredential(credential).addOnCompleteListener(activity) { signInTask ->
            if (!signInTask.isSuccessful) {
                auth.signOut()
                onResult(PilotAuthResult.Error("Phone verification could not be completed."))
                return@addOnCompleteListener
            }
            val user = signInTask.result?.user
            if (user == null) {
                auth.signOut()
                onResult(PilotAuthResult.Error("Phone verification could not be completed."))
                return@addOnCompleteListener
            }
            user.getIdToken(true).addOnCompleteListener(activity) { tokenTask ->
                if (!tokenTask.isSuccessful) {
                    auth.signOut()
                    onResult(PilotAuthResult.Error("A secure pilot session could not be created."))
                    return@addOnCompleteListener
                }
                val idToken = tokenTask.result?.token
                if (idToken.isNullOrBlank()) {
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
                    if (!consentAcceptedForVerification) {
                        throw IllegalStateException("Pilot notice consent is not active.")
                    }
                    sessionExchangeClient.exchange(
                        idToken = idToken,
                        noticeVersion = configuration.noticeVersion,
                    )
                }

            auth.signOut()
            activity.runOnUiThread {
                result.fold(
                    onSuccess = { session ->
                        sessionStore.save(session)
                        pushRegistrationCoordinator.registerCurrentToken(session)
                        verificationId = null
                        consentAcceptedForVerification = false
                        onResult(PilotAuthResult.SignedIn(session.sessionId))
                    },
                    onFailure = {
                        onResult(PilotAuthResult.Error("A secure DIREKT session could not be created."))
                    },
                )
            }
        }
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
