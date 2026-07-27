package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


interface NotificationsApi {
    /**
     * POST api/v1/notifications/push/devices
     *
     *
     * Responses:
     *  - 200: Registers or rotates the authenticated identity’s Android push installation when the controlled-pilot gate is enabled.
     *
     * @param body
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/notifications/push/devices")
    fun pushDeviceControllerRegister(@Body body: kotlin.Any): Call<Unit>

    /**
     * DELETE api/v1/notifications/push/devices/{installationId}
     *
     *
     * Responses:
     *  - 200: Deletes one push installation owned by the authenticated identity.
     *
     * @param installationId
     * @return [Call]<[Unit]>
     */
    @DELETE("api/v1/notifications/push/devices/{installationId}")
    fun pushDeviceControllerUnregister(@Path("installationId") installationId: kotlin.String): Call<Unit>

}
