package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.CreatePilotInvitationDto
import com.kudzimusar.direkt.generated.api.models.RevokePilotInvitationDto

interface PilotInvitationsApi {
    /**
     * POST api/v1/operations/pilot-invitations
     *
     *
     * Responses:
     *  - 201: Creates one invite-only controlled-pilot admission record.
     *
     * @param createPilotInvitationDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/pilot-invitations")
    fun pilotInvitationControllerCreate(@Body createPilotInvitationDto: CreatePilotInvitationDto): Call<Unit>

    /**
     * GET api/v1/operations/pilot-invitations
     *
     *
     * Responses:
     *  - 200: Lists privacy-minimized pilot invitation states.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/pilot-invitations")
    fun pilotInvitationControllerList(): Call<Unit>

    /**
     * POST api/v1/operations/pilot-invitations/{invitationId}/revoke
     *
     *
     * Responses:
     *  - 200: Revokes one unclaimed pilot invitation.
     *
     * @param invitationId
     * @param revokePilotInvitationDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/pilot-invitations/{invitationId}/revoke")
    fun pilotInvitationControllerRevoke(@Path("invitationId") invitationId: kotlin.String, @Body revokePilotInvitationDto: RevokePilotInvitationDto): Call<Unit>

}
