package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


interface AccountApi {
    /**
     * GET api/v1/account/contacts
     *
     *
     * Responses:
     *  - 200: Lists opaque authenticated-account contact references and masked hints. Raw contact values are never returned.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/account/contacts")
    fun accountContactControllerList(): Call<Unit>

}
