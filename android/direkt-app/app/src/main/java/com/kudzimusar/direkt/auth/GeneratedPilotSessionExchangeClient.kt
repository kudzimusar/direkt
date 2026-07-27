package com.kudzimusar.direkt.auth

import com.kudzimusar.direkt.generated.api.apis.AuthenticationApi
import com.kudzimusar.direkt.generated.api.infrastructure.ApiClient
import com.kudzimusar.direkt.generated.api.models.AuthenticatedSessionResponseDto
import com.kudzimusar.direkt.generated.api.models.FirebaseSessionExchangeDto
import java.net.URI
import java.util.concurrent.TimeUnit
import okhttp3.OkHttpClient
import retrofit2.Response

internal fun interface FirebaseSessionExchangeCall {
    fun execute(request: FirebaseSessionExchangeDto): Response<AuthenticatedSessionResponseDto>
}

internal fun interface PilotSessionExchangeClient {
    fun exchange(
        idToken: String,
        noticeVersion: String,
    ): PilotSession
}

internal class GeneratedPilotSessionExchangeClient(
    private val exchangeCall: FirebaseSessionExchangeCall,
) : PilotSessionExchangeClient {
    override fun exchange(
        idToken: String,
        noticeVersion: String,
    ): PilotSession {
        val request =
            FirebaseSessionExchangeDto(
                idToken = idToken,
                noticeVersion = noticeVersion,
                consentAccepted = true,
                deviceLabel = DEVICE_LABEL,
            )
        val response = exchangeCall.execute(request)
        if (!response.isSuccessful) {
            throw IllegalStateException("Session exchange was rejected.")
        }
        val session = response.body() ?: throw IllegalStateException("Session exchange returned no body.")
        require(session.tokenType == "Bearer") { "Session exchange returned an unsupported token type." }
        return session.toPilotSession()
    }

    private fun AuthenticatedSessionResponseDto.toPilotSession(): PilotSession =
        PilotSession(
            identityId = identityId,
            sessionId = sessionId,
            accessToken = accessToken,
            accessTokenExpiresAt = accessTokenExpiresAt,
            refreshToken = refreshToken,
            refreshTokenExpiresAt = refreshTokenExpiresAt,
        )

    internal companion object {
        private const val DEVICE_LABEL = "Android pilot device"

        fun fromBaseUrl(apiBaseUrl: String): GeneratedPilotSessionExchangeClient {
            val normalizedBaseUrl = normalizeHttpsBaseUrl(apiBaseUrl)
            val safeHttpClient =
                OkHttpClient.Builder()
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(10, TimeUnit.SECONDS)
                    .writeTimeout(10, TimeUnit.SECONDS)
                    .followRedirects(false)
                    .followSslRedirects(false)
                    .retryOnConnectionFailure(false)
            val generatedApi =
                ApiClient(
                    baseUrl = normalizedBaseUrl,
                    okHttpClientBuilder = safeHttpClient,
                ).createService(AuthenticationApi::class.java)
            return GeneratedPilotSessionExchangeClient(
                FirebaseSessionExchangeCall { request ->
                    generatedApi.authControllerExchangeFirebaseSession(request).execute()
                },
            )
        }

        internal fun normalizeHttpsBaseUrl(raw: String): String {
            val trimmed = raw.trim()
            require(trimmed.isNotEmpty()) { "DIREKT API base URL is required." }
            val uri = URI(trimmed).normalize()
            require(uri.scheme.equals("https", ignoreCase = true)) {
                "DIREKT API base URL must use HTTPS."
            }
            require(!uri.host.isNullOrBlank()) { "DIREKT API base URL must include a host." }
            require(uri.userInfo == null) { "DIREKT API base URL must not contain user information." }
            require(uri.query == null && uri.fragment == null) {
                "DIREKT API base URL must not contain a query or fragment."
            }
            return uri.toString().trimEnd('/') + "/"
        }
    }
}
