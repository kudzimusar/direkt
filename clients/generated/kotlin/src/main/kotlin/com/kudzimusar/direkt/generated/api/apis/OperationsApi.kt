package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.EmergencyActionDto

interface OperationsApi {
    /**
     * POST api/v1/operations/emergency-actions
     *
     *
     * Responses:
     *  - 200: Records a synthetic emergency-action audit event without changing domain state.
     *
     * @param emergencyActionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/emergency-actions")
    fun operationsControllerEmergencyAction(@Body emergencyActionDto: EmergencyActionDto): Call<Unit>

    /**
     * GET api/v1/operations/session
     *
     *
     * Responses:
     *  - 200: Returns the server-resolved operations authorization snapshot.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/session")
    fun operationsControllerSession(): Call<Unit>

}
