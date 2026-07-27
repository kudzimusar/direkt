package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CreateContactHandoffDto
import com.kudzimusar.direkt.generated.api.models.RevokeContactHandoffDto

interface TrackedInteractionsAndContactHandoffApi {
    /**
     * POST api/v1/enquiries/{enquiryId}/handoffs
     *
     *
     * Responses:
     *  - 201: Creates a synthetic disabled-delivery contact handoff after provider acceptance and current channel-specific consent.
     *
     * @param enquiryId
     * @param idempotencyKey
     * @param createContactHandoffDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/enquiries/{enquiryId}/handoffs")
    fun interactionHandoffControllerCreate(@Path("enquiryId") enquiryId: kotlin.String, @Header("idempotency-key") idempotencyKey: kotlin.String, @Body createContactHandoffDto: CreateContactHandoffDto): Call<Unit>

    /**
     * GET api/v1/interactions/{interactionId}
     *
     *
     * Responses:
     *  - 200: Returns one customer-owned tracked interaction and safe history.
     *
     * @param interactionId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/interactions/{interactionId}")
    fun interactionHandoffControllerCustomerInteraction(@Path("interactionId") interactionId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/interactions
     *
     *
     * Responses:
     *  - 200: Lists tracked interactions owned by this customer.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/interactions")
    fun interactionHandoffControllerCustomerInteractions(): Call<Unit>

    /**
     * GET api/v1/enquiries/{enquiryId}/handoffs
     *
     *
     * Responses:
     *  - 200: Lists consent-scoped handoffs owned by this customer.
     *
     * @param enquiryId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/enquiries/{enquiryId}/handoffs")
    fun interactionHandoffControllerListCustomer(@Path("enquiryId") enquiryId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me/enquiries/{enquiryId}/handoff
     *
     *
     * Responses:
     *  - 200: Returns only the current masked, consent-scoped contact hint. External delivery remains disabled.
     *
     * @param enquiryId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me/enquiries/{enquiryId}/handoff")
    fun interactionHandoffControllerProviderHandoff(@Path("enquiryId") enquiryId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me/interactions
     *
     *
     * Responses:
     *  - 200: Lists tracked interactions in the actor-resolved provider scope.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me/interactions")
    fun interactionHandoffControllerProviderInteractions(): Call<Unit>

    /**
     * GET api/v1/interactions/{interactionId}/review-eligibility
     *
     *
     * Responses:
     *  - 200: Returns deterministic tracked-interaction review eligibility.
     *
     * @param interactionId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/interactions/{interactionId}/review-eligibility")
    fun interactionHandoffControllerReviewEligibility(@Path("interactionId") interactionId: kotlin.String): Call<Unit>

    /**
     * POST api/v1/enquiries/{enquiryId}/handoffs/{handoffId}/revoke
     *
     *
     * Responses:
     *  - 200: Revokes current customer consent and its linked handoff.
     *
     * @param enquiryId
     * @param handoffId
     * @param revokeContactHandoffDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/enquiries/{enquiryId}/handoffs/{handoffId}/revoke")
    fun interactionHandoffControllerRevoke(@Path("enquiryId") enquiryId: kotlin.String, @Path("handoffId") handoffId: kotlin.String, @Body revokeContactHandoffDto: RevokeContactHandoffDto): Call<Unit>

}
