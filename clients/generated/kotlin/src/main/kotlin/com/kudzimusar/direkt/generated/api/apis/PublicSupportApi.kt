package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


interface PublicSupportApi {
    /**
     * POST api/v1/public/support/assist
     * Answers a bounded synthetic help question from approved public DIREKT facts.
     *
     * Responses:
     *  - 200: Returns grounded AI-assisted or deterministic public help with source identifiers and explicit limitations.
     *
     * @param body
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/public/support/assist")
    fun publicSupportControllerAssist(@Body body: kotlin.Any): Call<Unit>

}
