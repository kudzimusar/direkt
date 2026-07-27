package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


interface CommunicationsApi {
    /**
     * POST api/v1/communications/whatsapp/opt-out
     *
     *
     * Responses:
     *  - 200: Opts all verified phone contacts owned by the authenticated identity out of WhatsApp delivery without exposing raw contact values.
     *
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/communications/whatsapp/opt-out")
    fun whatsAppOptOutControllerOptOut(): Call<Unit>

}
