package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.ApproveOperationsOverrideDto
import com.kudzimusar.direkt.generated.api.models.CreateOperationsEscalationDto
import com.kudzimusar.direkt.generated.api.models.CreateOperationsOverrideDto
import com.kudzimusar.direkt.generated.api.models.ResolveOperationsEscalationDto
import com.kudzimusar.direkt.generated.api.models.StartOperationsEscalationDto

interface OperationsEscalationsAndOverridesApi {
    /**
     * POST api/v1/operations/high-risk-overrides/{overrideRequestId}/approvals
     *
     *
     * Responses:
     *  - 201: Records one immutable independent approval or rejection. Two distinct approvals are required.
     *
     * @param overrideRequestId
     * @param approveOperationsOverrideDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/high-risk-overrides/{overrideRequestId}/approvals")
    fun operationsEscalationControllerApproveOverride(@Path("overrideRequestId") overrideRequestId: kotlin.String, @Body approveOperationsOverrideDto: ApproveOperationsOverrideDto): Call<Unit>

    /**
     * POST api/v1/operations/escalations
     *
     *
     * Responses:
     *  - 201: Creates a policy-versioned verification escalation with owner and due date.
     *
     * @param createOperationsEscalationDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/escalations")
    fun operationsEscalationControllerCreateEscalation(@Body createOperationsEscalationDto: CreateOperationsEscalationDto): Call<Unit>

    /**
     * POST api/v1/operations/high-risk-overrides
     *
     *
     * Responses:
     *  - 201: Requests high-risk authorization from a server-owned current mandatory-evidence snapshot.
     *
     * @param createOperationsOverrideDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/high-risk-overrides")
    fun operationsEscalationControllerCreateOverride(@Body createOperationsOverrideDto: CreateOperationsOverrideDto): Call<Unit>

    /**
     * GET api/v1/operations/escalations
     *
     *
     * Responses:
     *  - 200: Lists assigned or authorized escalations without private evidence content or reviewer notes.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/escalations")
    fun operationsEscalationControllerEscalations(): Call<Unit>

    /**
     * GET api/v1/operations/high-risk-overrides
     *
     *
     * Responses:
     *  - 200: Lists evidence-backed override authorizations. These records never create decisions, claims or publication.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/high-risk-overrides")
    fun operationsEscalationControllerOverrides(): Call<Unit>

    /**
     * POST api/v1/operations/escalations/{escalationId}/resolve
     *
     *
     * Responses:
     *  - 200: Resolves or dismisses an active verification escalation.
     *
     * @param escalationId
     * @param resolveOperationsEscalationDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/escalations/{escalationId}/resolve")
    fun operationsEscalationControllerResolveEscalation(@Path("escalationId") escalationId: kotlin.String, @Body resolveOperationsEscalationDto: ResolveOperationsEscalationDto): Call<Unit>

    /**
     * POST api/v1/operations/escalations/{escalationId}/start
     *
     *
     * Responses:
     *  - 200: Starts an escalation owned by the authenticated supervisor.
     *
     * @param escalationId
     * @param startOperationsEscalationDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/escalations/{escalationId}/start")
    fun operationsEscalationControllerStartEscalation(@Path("escalationId") escalationId: kotlin.String, @Body startOperationsEscalationDto: StartOperationsEscalationDto): Call<Unit>

}
