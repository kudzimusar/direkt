package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.SyntheticPaymentWebhookDto

interface SyntheticPaymentWebhooksApi {
    /**
     * POST api/v1/webhooks/payments/synthetic
     *
     *
     * Responses:
     *  - 200: Verifies and processes one bounded synthetic webhook without storing raw payload.
     *
     * @param xDirektSignature
     * @param xDirektTimestamp
     * @param syntheticPaymentWebhookDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/webhooks/payments/synthetic")
    fun commercialWebhookControllerProcessSyntheticWebhook(@Header("x-direkt-signature") xDirektSignature: kotlin.String, @Header("x-direkt-timestamp") xDirektTimestamp: kotlin.String, @Body syntheticPaymentWebhookDto: SyntheticPaymentWebhookDto): Call<Unit>

}
