package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


interface OperationsInteractionHistoryApi {
    /**
     * GET api/v1/operations/interactions
     *
     *
     * Responses:
     *  - 200: Lists privacy-safe tracked interaction summaries without customer identity, contact values, evidence or moderation rationale.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/interactions")
    fun interactionOperationsControllerList(): Call<Unit>

}
