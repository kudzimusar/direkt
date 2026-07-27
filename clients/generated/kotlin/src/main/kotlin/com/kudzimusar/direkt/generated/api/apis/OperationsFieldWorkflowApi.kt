package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CancelOperationsFieldWorkDto
import com.kudzimusar.direkt.generated.api.models.CreateOperationsFieldWorkDto
import com.kudzimusar.direkt.generated.api.models.ReassignOperationsFieldWorkDto
import com.kudzimusar.direkt.generated.api.models.SubmitOperationsFieldInspectionDto
import com.kudzimusar.direkt.generated.api.models.TransitionOperationsFieldWorkDto

interface OperationsFieldWorkflowApi {
    /**
     * POST api/v1/operations/field-work-items/{workItemId}/cancel
     *
     *
     * Responses:
     *  - 200: Cancels active field work and revokes its field-agent assignment.
     *
     * @param workItemId
     * @param cancelOperationsFieldWorkDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/field-work-items/{workItemId}/cancel")
    fun operationsFieldControllerCancel(@Path("workItemId") workItemId: kotlin.String, @Body cancelOperationsFieldWorkDto: CancelOperationsFieldWorkDto): Call<Unit>

    /**
     * POST api/v1/operations/field-work-items
     *
     *
     * Responses:
     *  - 201: Creates one scoped field-agent assignment and policy-versioned inspection work item.
     *
     * @param createOperationsFieldWorkDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/field-work-items")
    fun operationsFieldControllerCreate(@Body createOperationsFieldWorkDto: CreateOperationsFieldWorkDto): Call<Unit>

    /**
     * GET api/v1/operations/field-work-items/{workItemId}
     *
     *
     * Responses:
     *  - 200: Reads one scoped field-work item without private coordinates, private notes or evidence identifiers.
     *
     * @param workItemId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/field-work-items/{workItemId}")
    fun operationsFieldControllerDetail(@Path("workItemId") workItemId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/operations/field-work-items
     *
     *
     * Responses:
     *  - 200: Lists field work for the assigned field agent or all work for trust supervisors and administrators.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/field-work-items")
    fun operationsFieldControllerQueue(): Call<Unit>

    /**
     * POST api/v1/operations/field-work-items/{workItemId}/reassign
     *
     *
     * Responses:
     *  - 201: Atomically closes the prior field assignment and creates a scoped replacement.
     *
     * @param workItemId
     * @param reassignOperationsFieldWorkDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/field-work-items/{workItemId}/reassign")
    fun operationsFieldControllerReassign(@Path("workItemId") workItemId: kotlin.String, @Body reassignOperationsFieldWorkDto: ReassignOperationsFieldWorkDto): Call<Unit>

    /**
     * POST api/v1/operations/field-work-items/{workItemId}/submissions
     *
     *
     * Responses:
     *  - 201: Records an immutable idempotent advisory inspection submission and the existing scoped field-visit record.
     *
     * @param workItemId
     * @param submitOperationsFieldInspectionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/field-work-items/{workItemId}/submissions")
    fun operationsFieldControllerSubmit(@Path("workItemId") workItemId: kotlin.String, @Body submitOperationsFieldInspectionDto: SubmitOperationsFieldInspectionDto): Call<Unit>

    /**
     * POST api/v1/operations/field-work-items/{workItemId}/transitions
     *
     *
     * Responses:
     *  - 200: Lets the assigned field agent accept or start the scoped inspection.
     *
     * @param workItemId
     * @param transitionOperationsFieldWorkDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/field-work-items/{workItemId}/transitions")
    fun operationsFieldControllerTransition(@Path("workItemId") workItemId: kotlin.String, @Body transitionOperationsFieldWorkDto: TransitionOperationsFieldWorkDto): Call<Unit>

}
