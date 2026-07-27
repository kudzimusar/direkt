package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CreateOperationsIncidentDto
import com.kudzimusar.direkt.generated.api.models.ResolveOperationsIncidentDto
import com.kudzimusar.direkt.generated.api.models.StartOperationsIncidentDto

interface OperationsIncidentsAndReportingApi {
    /**
     * POST api/v1/operations/incidents
     *
     *
     * Responses:
     *  - 201: Creates an internal operations record linked only to authorized provider, case and evidence scope.
     *
     * @param createOperationsIncidentDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/incidents")
    fun operationsReportingControllerCreateIncident(@Body createOperationsIncidentDto: CreateOperationsIncidentDto): Call<Unit>

    /**
     * GET api/v1/operations/expiry-renewal
     *
     *
     * Responses:
     *  - 200: Lists evidence and claim expiry/renewal states without document content, object keys or private coordinates.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/expiry-renewal")
    fun operationsReportingControllerExpiry(): Call<Unit>

    /**
     * GET api/v1/operations/reporting/export
     *
     *
     * Responses:
     *  - 200: Returns an allowlisted JSON metrics export without provider, evidence or private-location identifiers.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/reporting/export")
    fun operationsReportingControllerExportMetrics(): Call<Unit>

    /**
     * GET api/v1/operations/incidents
     *
     *
     * Responses:
     *  - 200: Lists bounded internal complaint and incident records without private details or customer interaction history.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/incidents")
    fun operationsReportingControllerIncidents(): Call<Unit>

    /**
     * GET api/v1/operations/reporting/metrics
     *
     *
     * Responses:
     *  - 200: Returns aggregate privacy-safe operations metrics.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/reporting/metrics")
    fun operationsReportingControllerMetrics(): Call<Unit>

    /**
     * POST api/v1/operations/incidents/{incidentId}/resolve
     *
     *
     * Responses:
     *  - 200: Resolves or dismisses a bounded internal operations record.
     *
     * @param incidentId
     * @param resolveOperationsIncidentDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/incidents/{incidentId}/resolve")
    fun operationsReportingControllerResolveIncident(@Path("incidentId") incidentId: kotlin.String, @Body resolveOperationsIncidentDto: ResolveOperationsIncidentDto): Call<Unit>

    /**
     * POST api/v1/operations/incidents/{incidentId}/start
     *
     *
     * Responses:
     *  - 200: Starts an internal incident owned by the authenticated operator.
     *
     * @param incidentId
     * @param startOperationsIncidentDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/incidents/{incidentId}/start")
    fun operationsReportingControllerStartIncident(@Path("incidentId") incidentId: kotlin.String, @Body startOperationsIncidentDto: StartOperationsIncidentDto): Call<Unit>

}
