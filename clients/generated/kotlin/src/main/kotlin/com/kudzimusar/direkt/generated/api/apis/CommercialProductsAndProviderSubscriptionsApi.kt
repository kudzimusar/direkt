package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CancelCommercialPaymentIntentDto
import com.kudzimusar.direkt.generated.api.models.CancelCommercialSubscriptionDto
import com.kudzimusar.direkt.generated.api.models.CommercialPolicyDto
import com.kudzimusar.direkt.generated.api.models.CreateCommercialPaymentIntentDto
import com.kudzimusar.direkt.generated.api.models.CreateCommercialSubscriptionDto

interface CommercialProductsAndProviderSubscriptionsApi {
    /**
     * POST api/v1/provider-workspace/me/payment-intents/{paymentIntentId}/cancel
     *
     *
     * Responses:
     *  - 200: Cancels one provider-scoped non-terminal payment intent.
     *
     * @param paymentIntentId
     * @param cancelCommercialPaymentIntentDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/payment-intents/{paymentIntentId}/cancel")
    fun commercialControllerCancelPaymentIntent(@Path("paymentIntentId") paymentIntentId: kotlin.String, @Body cancelCommercialPaymentIntentDto: CancelCommercialPaymentIntentDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/subscriptions/{subscriptionId}/cancel
     *
     *
     * Responses:
     *  - 200: Cancels one provider-scoped non-terminal subscription.
     *
     * @param subscriptionId
     * @param cancelCommercialSubscriptionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/subscriptions/{subscriptionId}/cancel")
    fun commercialControllerCancelSubscription(@Path("subscriptionId") subscriptionId: kotlin.String, @Body cancelCommercialSubscriptionDto: CancelCommercialSubscriptionDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/invoices/{invoiceId}/payment-intents
     *
     *
     * Responses:
     *  - 201: Creates one retry-safe synthetic payment intent.
     *
     * @param invoiceId
     * @param idempotencyKey
     * @param createCommercialPaymentIntentDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/invoices/{invoiceId}/payment-intents")
    fun commercialControllerCreatePaymentIntent(@Path("invoiceId") invoiceId: kotlin.String, @Header("idempotency-key") idempotencyKey: kotlin.String, @Body createCommercialPaymentIntentDto: CreateCommercialPaymentIntentDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/subscriptions
     *
     *
     * Responses:
     *  - 201: Creates one retry-safe pending provider subscription.
     *
     * @param idempotencyKey
     * @param createCommercialSubscriptionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/subscriptions")
    fun commercialControllerCreateSubscription(@Header("idempotency-key") idempotencyKey: kotlin.String, @Body createCommercialSubscriptionDto: CreateCommercialSubscriptionDto): Call<Unit>

    /**
     * POST api/v1/provider-workspace/me/subscriptions/{subscriptionId}/invoices
     *
     *
     * Responses:
     *  - 201: Issues or returns the current immutable subscription invoice.
     *
     * @param subscriptionId
     * @param commercialPolicyDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/provider-workspace/me/subscriptions/{subscriptionId}/invoices")
    fun commercialControllerIssueInvoice(@Path("subscriptionId") subscriptionId: kotlin.String, @Body commercialPolicyDto: CommercialPolicyDto): Call<Unit>

    /**
     * GET api/v1/commercial/products
     *
     *
     * Responses:
     *  - 200: Returns the safe synthetic commercial product catalogue.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/commercial/products")
    fun commercialControllerProducts(): Call<Unit>

    /**
     * GET api/v1/provider-workspace/me/commercial
     *
     *
     * Responses:
     *  - 200: Returns the actor-resolved provider commercial workspace.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/provider-workspace/me/commercial")
    fun commercialControllerProviderWorkspace(): Call<Unit>

}
