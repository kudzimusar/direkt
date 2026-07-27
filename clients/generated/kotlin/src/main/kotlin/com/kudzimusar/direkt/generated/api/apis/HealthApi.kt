package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


interface HealthApi {
    /**
     * GET api/v1/health/live
     *
     *
     * Responses:
     *  - 200: The API process is alive.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/health/live")
    fun healthControllerLiveness(): Call<Unit>

    /**
     * GET api/v1/health/ready
     *
     *
     * Responses:
     *  - 200: The API, PostgreSQL and PostGIS are ready.
     *  - 503: PostgreSQL or PostGIS is unavailable.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/health/ready")
    fun healthControllerReadiness(): Call<Unit>

}
