package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CreateProviderReviewResponseDto
import com.kudzimusar.direkt.generated.api.models.CreateReviewAppealDto
import com.kudzimusar.direkt.generated.api.models.CreateReviewDto
import com.kudzimusar.direkt.generated.api.models.DecideReviewAppealDto
import com.kudzimusar.direkt.generated.api.models.ModerateReviewDto
import com.kudzimusar.direkt.generated.api.models.ReportReviewDto

interface TrackedReviewsAndModerationApi {
    /**
     * POST api/v1/reviews/{reviewId}/appeals
     *
     *
     * Responses:
     *  - 200:
     *
     * @param reviewId
     * @param createReviewAppealDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/reviews/{reviewId}/appeals")
    fun reviewControllerAppealCustomer(@Path("reviewId") reviewId: kotlin.String, @Body createReviewAppealDto: CreateReviewAppealDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/reviews/{reviewId}/appeals
     *
     *
     * Responses:
     *  - 200:
     *
     * @param reviewId
     * @param createReviewAppealDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/reviews/{reviewId}/appeals")
    fun reviewControllerAppealProvider(@Path("reviewId") reviewId: kotlin.String, @Body createReviewAppealDto: CreateReviewAppealDto): Call<Unit>

    /**
     * POST api/v1/interactions/{interactionId}/reviews
     *
     *
     * Responses:
     *  - 201: Creates one pending review from an eligible owned interaction.
     *
     * @param interactionId
     * @param createReviewDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/interactions/{interactionId}/reviews")
    fun reviewControllerCreate(@Path("interactionId") interactionId: kotlin.String, @Body createReviewDto: CreateReviewDto): Call<Unit>

    /**
     * POST api/v1/operations/review-appeals/{appealId}/decisions
     *
     *
     * Responses:
     *  - 200:
     *
     * @param appealId
     * @param decideReviewAppealDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/review-appeals/{appealId}/decisions")
    fun reviewControllerDecideAppeal(@Path("appealId") appealId: kotlin.String, @Body decideReviewAppealDto: DecideReviewAppealDto): Call<Unit>

    /**
     * GET api/v1/reviews/{reviewId}
     *
     *
     * Responses:
     *  - 200: Returns one customer-owned review with safe appeal state.
     *
     * @param reviewId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/reviews/{reviewId}")
    fun reviewControllerDetailCustomer(@Path("reviewId") reviewId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/reviews
     *
     *
     * Responses:
     *  - 200: Lists reviews and appeals owned by this customer.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/reviews")
    fun reviewControllerListCustomer(): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me/reviews
     *
     *
     * Responses:
     *  - 200:
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me/reviews")
    fun reviewControllerListProvider(): Call<Unit>

    /**
     * POST api/v1/operations/reviews/{reviewId}/moderation
     *
     *
     * Responses:
     *  - 200:
     *
     * @param reviewId
     * @param moderateReviewDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/reviews/{reviewId}/moderation")
    fun reviewControllerModerate(@Path("reviewId") reviewId: kotlin.String, @Body moderateReviewDto: ModerateReviewDto): Call<Unit>


    /**
    * enum for parameter status
    */
    @Serializable
    enum class StatusReviewControllerOperations(val value: kotlin.String) {
            @SerialName(value = "pending") PENDING("pending"),
            @SerialName(value = "published") PUBLISHED("published"),
            @SerialName(value = "withheld") WITHHELD("withheld"),
            @SerialName(value = "removed") REMOVED("removed"),
            @SerialName(value = "appealed") APPEALED("appealed"),
    }

    /**
     * GET api/v1/operations/reviews
     *
     *
     * Responses:
     *  - 200:
     *
     * @param status  (optional)
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/reviews")
    fun reviewControllerOperations(@Query("status") status: StatusReviewControllerOperations? = null): Call<Unit>

    /**
     * GET api/v1/public/providers/{publicProviderId}/reviews
     *
     *
     * Responses:
     *  - 200:
     *
     * @param publicProviderId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/public/providers/{publicProviderId}/reviews")
    fun reviewControllerPublicReviews(@Path("publicProviderId") publicProviderId: kotlin.String): Call<Unit>

    /**
     * POST api/v1/reviews/{reviewId}/reports
     *
     *
     * Responses:
     *  - 200:
     *
     * @param reviewId
     * @param reportReviewDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/reviews/{reviewId}/reports")
    fun reviewControllerReport(@Path("reviewId") reviewId: kotlin.String, @Body reportReviewDto: ReportReviewDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/reviews/{reviewId}/response
     *
     *
     * Responses:
     *  - 200:
     *
     * @param reviewId
     * @param createProviderReviewResponseDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/reviews/{reviewId}/response")
    fun reviewControllerRespondProvider(@Path("reviewId") reviewId: kotlin.String, @Body createProviderReviewResponseDto: CreateProviderReviewResponseDto): Call<Unit>

}
