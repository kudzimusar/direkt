package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.FirebaseSessionExchangeDto
import com.kudzimusar.direkt.generated.api.models.RequestChallengeDto
import com.kudzimusar.direkt.generated.api.models.RevokeSessionDto
import com.kudzimusar.direkt.generated.api.models.RotateSessionDto
import com.kudzimusar.direkt.generated.api.models.VerifyChallengeDto

interface AuthenticationApi {
    /**
     * POST api/v1/auth/firebase/exchange
     *
     *
     * Responses:
     *  - 200: Verifies a recent Firebase phone ID token and exchanges it for a DIREKT rotating session.
     *  - 401: The Firebase token or external identity binding is invalid or unsafe.
     *
     * @param firebaseSessionExchangeDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/auth/firebase/exchange")
    fun authControllerExchangeFirebaseSession(@Body firebaseSessionExchangeDto: FirebaseSessionExchangeDto): Call<Unit>

    /**
     * GET api/v1/auth/sessions
     *
     *
     * Responses:
     *  - 200: Lists sessions belonging to the authenticated identity.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/auth/sessions")
    fun authControllerListSessions(): Call<Unit>

    /**
     * POST api/v1/auth/challenges
     *
     *
     * Responses:
     *  - 202: Enumeration-safe challenge acknowledgement. Delivery is synthetic in Phase 2C.
     *
     * @param requestChallengeDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/auth/challenges")
    fun authControllerRequestChallenge(@Body requestChallengeDto: RequestChallengeDto): Call<Unit>

    /**
     * POST api/v1/auth/sessions/revoke-others
     *
     *
     * Responses:
     *  - 200: Revokes all sessions except the current session.
     *
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/auth/sessions/revoke-others")
    fun authControllerRevokeOtherSessions(): Call<Unit>

    /**
     * POST api/v1/auth/sessions/{sessionId}/revoke
     *
     *
     * Responses:
     *  - 200: Revokes one session belonging to the authenticated identity.
     *
     * @param sessionId
     * @param revokeSessionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/auth/sessions/{sessionId}/revoke")
    fun authControllerRevokeSession(@Path("sessionId") sessionId: kotlin.String, @Body revokeSessionDto: RevokeSessionDto): Call<Unit>

    /**
     * POST api/v1/auth/sessions/rotate
     *
     *
     * Responses:
     *  - 200: Rotates an active refresh session and returns new tokens.
     *  - 401: The refresh token is invalid, expired or reused.
     *
     * @param rotateSessionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/auth/sessions/rotate")
    fun authControllerRotateSession(@Body rotateSessionDto: RotateSessionDto): Call<Unit>

    /**
     * POST api/v1/auth/challenges/verify
     *
     *
     * Responses:
     *  - 200: Creates an identity and rotating session after verification.
     *  - 401: The challenge is invalid, expired or locked.
     *
     * @param verifyChallengeDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/auth/challenges/verify")
    fun authControllerVerifyChallenge(@Body verifyChallengeDto: VerifyChallengeDto): Call<Unit>

}
