package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CancelEnquiryDto
import com.kudzimusar.direkt.generated.api.models.CreateEnquiryDto
import com.kudzimusar.direkt.generated.api.models.TransitionEnquiryDto

interface EnquiriesAndTrackedInteractionsApi {
    /**
     * POST api/v1/enquiries/{enquiryId}/cancel
     *
     *
     * Responses:
     *  - 200: Cancels a customer-owned non-terminal enquiry.
     *
     * @param enquiryId
     * @param cancelEnquiryDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/enquiries/{enquiryId}/cancel")
    fun interactionControllerCancelCustomer(@Path("enquiryId") enquiryId: kotlin.String, @Body cancelEnquiryDto: CancelEnquiryDto): Call<Unit>

    /**
     * POST api/v1/enquiries
     *
     *
     * Responses:
     *  - 201: Creates an idempotent structured enquiry.
     *
     * @param idempotencyKey
     * @param createEnquiryDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/enquiries")
    fun interactionControllerCreate(@Header("idempotency-key") idempotencyKey: kotlin.String, @Body createEnquiryDto: CreateEnquiryDto): Call<Unit>

    /**
     * GET api/v1/enquiries/{enquiryId}
     *
     *
     * Responses:
     *  - 200: Returns one customer-owned enquiry and safe history.
     *
     * @param enquiryId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/enquiries/{enquiryId}")
    fun interactionControllerDetailCustomer(@Path("enquiryId") enquiryId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me/enquiries/{enquiryId}
     *
     *
     * Responses:
     *  - 200: Returns one provider-scoped enquiry and safe history.
     *
     * @param enquiryId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me/enquiries/{enquiryId}")
    fun interactionControllerDetailProvider(@Path("enquiryId") enquiryId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/enquiries
     *
     *
     * Responses:
     *  - 200: Lists enquiries owned by the authenticated customer.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/enquiries")
    fun interactionControllerListCustomer(): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me/enquiries
     *
     *
     * Responses:
     *  - 200: Lists enquiries in the server-resolved provider workspace.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me/enquiries")
    fun interactionControllerListProvider(): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/enquiries/{enquiryId}/transitions
     *
     *
     * Responses:
     *  - 200: Applies a concurrency-safe provider enquiry transition.
     *
     * @param enquiryId
     * @param transitionEnquiryDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/enquiries/{enquiryId}/transitions")
    fun interactionControllerTransitionProvider(@Path("enquiryId") enquiryId: kotlin.String, @Body transitionEnquiryDto: TransitionEnquiryDto): Call<Unit>

}
