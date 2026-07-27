package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CreateInteractionComplaintDto
import com.kudzimusar.direkt.generated.api.models.TransitionInteractionComplaintDto

interface InteractionComplaintsApi {
    /**
     * POST api/v1/interactions/{interactionId}/complaints
     *
     *
     * Responses:
     *  - 201: Creates an idempotent customer complaint linked to an owned tracked interaction without creating a Phase 7 internal incident.
     *
     * @param interactionId
     * @param idempotencyKey
     * @param createInteractionComplaintDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/interactions/{interactionId}/complaints")
    fun complaintControllerCreate(@Path("interactionId") interactionId: kotlin.String, @Header("idempotency-key") idempotencyKey: kotlin.String, @Body createInteractionComplaintDto: CreateInteractionComplaintDto): Call<Unit>

    /**
     * GET api/v1/complaints/{complaintId}
     *
     *
     * Responses:
     *  - 200: Returns one customer-owned complaint and safe event history.
     *
     * @param complaintId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/complaints/{complaintId}")
    fun complaintControllerDetailCustomer(@Path("complaintId") complaintId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/complaints
     *
     *
     * Responses:
     *  - 200: Lists complaints owned by the authenticated customer.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/complaints")
    fun complaintControllerListCustomer(): Call<Unit>


    /**
    * enum for parameter status
    */
    @Serializable
    enum class StatusComplaintControllerOperations(val value: kotlin.String) {
            @SerialName(value = "submitted") SUBMITTED("submitted"),
            @SerialName(value = "triaged") TRIAGED("triaged"),
            @SerialName(value = "resolved") RESOLVED("resolved"),
            @SerialName(value = "closed") CLOSED("closed"),
    }

    /**
     * GET api/v1/operations/interaction-complaints
     *
     *
     * Responses:
     *  - 200: Lists privacy-safe customer complaint projections without Phase 7 incident details.
     *
     * @param status  (optional)
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/interaction-complaints")
    fun complaintControllerOperations(@Query("status") status: StatusComplaintControllerOperations? = null): Call<Unit>

    /**
     * POST api/v1/operations/interaction-complaints/{complaintId}/transitions
     *
     *
     * Responses:
     *  - 200: Applies a revision-safe complaint transition with an immutable reason.
     *
     * @param complaintId
     * @param transitionInteractionComplaintDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/interaction-complaints/{complaintId}/transitions")
    fun complaintControllerTransition(@Path("complaintId") complaintId: kotlin.String, @Body transitionInteractionComplaintDto: TransitionInteractionComplaintDto): Call<Unit>

}
