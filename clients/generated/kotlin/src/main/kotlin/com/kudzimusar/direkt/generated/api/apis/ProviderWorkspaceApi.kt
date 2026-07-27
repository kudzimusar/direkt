package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CancelWorkspaceUploadDto
import com.kudzimusar.direkt.generated.api.models.ConfirmWorkspaceUploadDto
import com.kudzimusar.direkt.generated.api.models.CreateWorkspaceUploadIntentDto
import com.kudzimusar.direkt.generated.api.models.MarkWorkspaceUploadInterruptedDto
import com.kudzimusar.direkt.generated.api.models.RemoveWorkspaceServiceDto
import com.kudzimusar.direkt.generated.api.models.UpdateProviderProfileDto
import com.kudzimusar.direkt.generated.api.models.UpdateWorkspaceAvailabilityDto
import com.kudzimusar.direkt.generated.api.models.UpdateWorkspaceLocationDto

interface ProviderWorkspaceApi {
    /**
     * DELETE api/v1/provider-workspace/me/upload-intents/{uploadIntentId}
     *
     *
     * Responses:
     *  - 200: Cancels a non-submitted provider upload intent.
     *
     * @param uploadIntentId
     * @param cancelWorkspaceUploadDto
     * @return [Call]<[Unit]>
     */
    @DELETE("api/v1/provider-workspace/me/upload-intents/{uploadIntentId}")
    fun providerWorkspaceControllerCancelUploadIntent(@Path("uploadIntentId") uploadIntentId: kotlin.String, @Body cancelWorkspaceUploadDto: CancelWorkspaceUploadDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/upload-intents/{uploadIntentId}/confirm
     *
     *
     * Responses:
     *  - 200: Confirms the active private upload against the intent’s server-owned case and creates one immutable evidence version.
     *
     * @param uploadIntentId
     * @param confirmWorkspaceUploadDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/upload-intents/{uploadIntentId}/confirm")
    fun providerWorkspaceControllerConfirmUploadIntent(@Path("uploadIntentId") uploadIntentId: kotlin.String, @Body confirmWorkspaceUploadDto: ConfirmWorkspaceUploadDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/upload-intents
     *
     *
     * Responses:
     *  - 201: Creates an idempotent logical upload intent and, when needed, a fresh synthetic private upload session.
     *
     * @param createWorkspaceUploadIntentDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/upload-intents")
    fun providerWorkspaceControllerCreateUploadIntent(@Body createWorkspaceUploadIntentDto: CreateWorkspaceUploadIntentDto): Call<Unit>

    /**
     * PUT api/v1/provider-workspace/me/upload-intents/{uploadIntentId}/interrupted
     *
     *
     * Responses:
     *  - 200: Marks the active attempt interrupted and makes the logical intent safely retryable.
     *
     * @param uploadIntentId
     * @param markWorkspaceUploadInterruptedDto
     * @return [Call]<[Unit]>
     */
    @PUT("api/v1/provider-workspace/me/upload-intents/{uploadIntentId}/interrupted")
    fun providerWorkspaceControllerInterruptUploadIntent(@Path("uploadIntentId") uploadIntentId: kotlin.String, @Body markWorkspaceUploadInterruptedDto: MarkWorkspaceUploadInterruptedDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/ai-onboarding-guide
     *
     *
     * Responses:
     *  - 200: Returns synthetic-safe advisory onboarding guidance. It cannot satisfy requirements, approve evidence, create trust claims, or publish services.
     *
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/ai-onboarding-guide")
    fun providerWorkspaceControllerOnboardingGuide(): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/ai-profile-draft
     *
     *
     * Responses:
     *  - 200: Returns an editable synthetic-safe public profile draft from provider-safe workspace facts. Provider confirmation remains mandatory.
     *
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/ai-profile-draft")
    fun providerWorkspaceControllerProfileDraft(): Call<Unit>

    /**
     * DELETE api/v1/provider-workspace/me/services/{categoryKey}
     *
     *
     * Responses:
     *  - 200: Removes a provider service without deleting its historical cases, evidence, decisions or claims.
     *
     * @param categoryKey
     * @param removeWorkspaceServiceDto
     * @return [Call]<[Unit]>
     */
    @DELETE("api/v1/provider-workspace/me/services/{categoryKey}")
    fun providerWorkspaceControllerRemoveService(@Path("categoryKey") categoryKey: kotlin.String, @Body removeWorkspaceServiceDto: RemoveWorkspaceServiceDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/upload-intents/{uploadIntentId}/retry
     *
     *
     * Responses:
     *  - 201: Creates a fresh private upload session for a retryable intent.
     *
     * @param uploadIntentId
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/upload-intents/{uploadIntentId}/retry")
    fun providerWorkspaceControllerRetryUploadIntent(@Path("uploadIntentId") uploadIntentId: kotlin.String): Call<Unit>

    /**
     * PUT api/v1/provider-workspace/me/services/{categoryKey}
     *
     *
     * Responses:
     *  - 200: Selects the active immutable requirement version for a provider service.
     *
     * @param categoryKey
     * @return [Call]<[Unit]>
     */
    @PUT("api/v1/provider-workspace/me/services/{categoryKey}")
    fun providerWorkspaceControllerSelectService(@Path("categoryKey") categoryKey: kotlin.String): Call<Unit>

    /**
     * PUT api/v1/provider-workspace/me/availability/{categoryKey}
     *
     *
     * Responses:
     *  - 200: Updates minimal availability independently of claims, publication and trust ranking.
     *
     * @param categoryKey
     * @param updateWorkspaceAvailabilityDto
     * @return [Call]<[Unit]>
     */
    @PUT("api/v1/provider-workspace/me/availability/{categoryKey}")
    fun providerWorkspaceControllerUpdateAvailability(@Path("categoryKey") categoryKey: kotlin.String, @Body updateWorkspaceAvailabilityDto: UpdateWorkspaceAvailabilityDto): Call<Unit>

    /**
     * PUT api/v1/provider-workspace/me/location
     *
     *
     * Responses:
     *  - 200: Stores private base, consented public premises and service-area geometry as separate models. Coordinates are write-only in this response contract.
     *
     * @param updateWorkspaceLocationDto
     * @return [Call]<[Unit]>
     */
    @PUT("api/v1/provider-workspace/me/location")
    fun providerWorkspaceControllerUpdateLocation(@Body updateWorkspaceLocationDto: UpdateWorkspaceLocationDto): Call<Unit>

    /**
     * PATCH api/v1/provider-workspace/me/profile
     *
     *
     * Responses:
     *  - 200: Updates the actor-resolved provider profile without publishing it.
     *
     * @param updateProviderProfileDto
     * @return [Call]<[Unit]>
     */
    @PATCH("api/v1/provider-workspace/me/profile")
    fun providerWorkspaceControllerUpdateProfile(@Body updateProviderProfileDto: UpdateProviderProfileDto): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me/upload-intents/{uploadIntentId}
     *
     *
     * Responses:
     *  - 200: Returns safe persistent state for one provider upload intent.
     *
     * @param uploadIntentId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me/upload-intents/{uploadIntentId}")
    fun providerWorkspaceControllerUploadIntent(@Path("uploadIntentId") uploadIntentId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me/upload-intents
     *
     *
     * Responses:
     *  - 200: Lists the authenticated representative’s recoverable upload intents without private object keys.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me/upload-intents")
    fun providerWorkspaceControllerUploadIntents(): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me/verification-timeline
     *
     *
     * Responses:
     *  - 200: Returns provider-safe case, evidence, decision and claim events without reviewer identities, private rationale or storage references.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me/verification-timeline")
    fun providerWorkspaceControllerVerificationTimeline(): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me
     *
     *
     * Responses:
     *  - 200: Returns the single active provider workspace resolved from the authenticated identity. No provider ownership is accepted from client input.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me")
    fun providerWorkspaceControllerWorkspace(): Call<Unit>

}
