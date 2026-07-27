package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CommercialPolicyDto
import com.kudzimusar.direkt.generated.api.models.DecideCommercialAdjustmentDto
import com.kudzimusar.direkt.generated.api.models.RequestCommercialAdjustmentDto
import com.kudzimusar.direkt.generated.api.models.TransitionCommercialProductDto
import com.kudzimusar.direkt.generated.api.models.TransitionCommercialSubscriptionDto
import com.kudzimusar.direkt.generated.api.models.TransitionReconciliationCaseDto

interface OperationsCommercialControlsApi {
    /**
     * POST api/v1/operations/commercial/adjustments/{adjustmentId}/apply
     *
     *
     * Responses:
     *  - 200: Posts an approved adjustment through the balanced ledger.
     *
     * @param adjustmentId
     * @param commercialPolicyDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/commercial/adjustments/{adjustmentId}/apply")
    fun commercialOperationsControllerApplyAdjustment(@Path("adjustmentId") adjustmentId: kotlin.String, @Body commercialPolicyDto: CommercialPolicyDto): Call<Unit>

    /**
     * POST api/v1/operations/commercial/adjustments/{adjustmentId}/decisions
     *
     *
     * Responses:
     *  - 200: Records one separated adjustment approval or rejection.
     *
     * @param adjustmentId
     * @param decideCommercialAdjustmentDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/commercial/adjustments/{adjustmentId}/decisions")
    fun commercialOperationsControllerDecideAdjustment(@Path("adjustmentId") adjustmentId: kotlin.String, @Body decideCommercialAdjustmentDto: DecideCommercialAdjustmentDto): Call<Unit>

    /**
     * GET api/v1/operations/commercial
     *
     *
     * Responses:
     *  - 200: Returns the safe API-only commercial operations overview.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/commercial")
    fun commercialOperationsControllerOverview(): Call<Unit>

    /**
     * POST api/v1/operations/commercial/adjustments
     *
     *
     * Responses:
     *  - 201: Creates one bounded adjustment request.
     *
     * @param requestCommercialAdjustmentDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/commercial/adjustments")
    fun commercialOperationsControllerRequestAdjustment(@Body requestCommercialAdjustmentDto: RequestCommercialAdjustmentDto): Call<Unit>

    /**
     * POST api/v1/operations/commercial/products/{productId}/transitions
     *
     *
     * Responses:
     *  - 200: Activates or retires one commercial product.
     *
     * @param productId
     * @param transitionCommercialProductDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/commercial/products/{productId}/transitions")
    fun commercialOperationsControllerTransitionProduct(@Path("productId") productId: kotlin.String, @Body transitionCommercialProductDto: TransitionCommercialProductDto): Call<Unit>

    /**
     * POST api/v1/operations/commercial/reconciliation/{reconciliationCaseId}/transitions
     *
     *
     * Responses:
     *  - 200: Transitions one reconciliation exception with reasoned audit.
     *
     * @param reconciliationCaseId
     * @param transitionReconciliationCaseDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/commercial/reconciliation/{reconciliationCaseId}/transitions")
    fun commercialOperationsControllerTransitionReconciliation(@Path("reconciliationCaseId") reconciliationCaseId: kotlin.String, @Body transitionReconciliationCaseDto: TransitionReconciliationCaseDto): Call<Unit>

    /**
     * POST api/v1/operations/commercial/subscriptions/{subscriptionId}/transitions
     *
     *
     * Responses:
     *  - 200: Applies an authorized subscription lifecycle transition.
     *
     * @param subscriptionId
     * @param transitionCommercialSubscriptionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/commercial/subscriptions/{subscriptionId}/transitions")
    fun commercialOperationsControllerTransitionSubscription(@Path("subscriptionId") subscriptionId: kotlin.String, @Body transitionCommercialSubscriptionDto: TransitionCommercialSubscriptionDto): Call<Unit>

}
