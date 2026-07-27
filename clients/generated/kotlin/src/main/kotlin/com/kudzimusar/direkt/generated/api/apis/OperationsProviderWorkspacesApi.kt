package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


interface OperationsProviderWorkspacesApi {
    /**
     * GET api/v1/operations/provider-workspaces
     *
     *
     * Responses:
     *  - 200: Returns aggregate provider-workspace readiness, verification and upload-state counts without coordinates, evidence identifiers or private object keys.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/provider-workspaces")
    fun providerWorkspaceOperationsControllerList(): Call<Unit>

}
