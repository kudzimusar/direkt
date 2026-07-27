package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.AddRepresentativeDto
import com.kudzimusar.direkt.generated.api.models.CreateProviderDto
import com.kudzimusar.direkt.generated.api.models.ProviderTransitionDto
import com.kudzimusar.direkt.generated.api.models.UpdateProviderProfileDto
import com.kudzimusar.direkt.generated.api.models.UpsertCustomerProfileDto

interface ProviderCoreApi {
    /**
     * POST api/v1/providers/{providerId}/representatives
     *
     *
     * Responses:
     *  - 201: Assigns a provider-scoped synthetic representative.
     *
     * @param providerId
     * @param addRepresentativeDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/providers/{providerId}/representatives")
    fun providerControllerAddRepresentative(@Path("providerId") providerId: kotlin.String, @Body addRepresentativeDto: AddRepresentativeDto): Call<Unit>

    /**
     * GET api/v1/categories
     *
     *
     * Responses:
     *  - 200: Lists active service categories and immutable requirements.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/categories")
    fun providerControllerCategories(): Call<Unit>

    /**
     * POST api/v1/providers
     *
     *
     * Responses:
     *  - 201: Creates a non-public provider draft and assigns the creator as provider owner.
     *
     * @param createProviderDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/providers")
    fun providerControllerCreateProvider(@Body createProviderDto: CreateProviderDto): Call<Unit>

    /**
     * GET api/v1/operations/providers
     *
     *
     * Responses:
     *  - 200: Lists internal non-public provider drafts for the synthetic operations portal.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/providers")
    fun providerControllerOperationsProviders(): Call<Unit>

    /**
     * GET api/v1/providers/{providerId}
     *
     *
     * Responses:
     *  - 200: Reads a non-public provider draft within server-owned scope.
     *
     * @param providerId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/providers/{providerId}")
    fun providerControllerProvider(@Path("providerId") providerId: kotlin.String): Call<Unit>

    /**
     * PUT api/v1/providers/{providerId}/categories/{categoryKey}
     *
     *
     * Responses:
     *  - 200: Pins the provider draft to the active category requirement version.
     *
     * @param providerId
     * @param categoryKey
     * @return [Call]<[Unit]>
     */
    @PUT("api/v1/providers/{providerId}/categories/{categoryKey}")
    fun providerControllerSelectCategory(@Path("providerId") providerId: kotlin.String, @Path("categoryKey") categoryKey: kotlin.String): Call<Unit>

    /**
     * POST api/v1/providers/{providerId}/state-transitions
     *
     *
     * Responses:
     *  - 200: Performs a validated internal provider-state transition without publication.
     *
     * @param providerId
     * @param providerTransitionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/providers/{providerId}/state-transitions")
    fun providerControllerTransitionProvider(@Path("providerId") providerId: kotlin.String, @Body providerTransitionDto: ProviderTransitionDto): Call<Unit>

    /**
     * PATCH api/v1/providers/{providerId}/profile
     *
     *
     * Responses:
     *  - 200: Updates a non-public provider profile draft.
     *
     * @param providerId
     * @param updateProviderProfileDto
     * @return [Call]<[Unit]>
     */
    @PATCH("api/v1/providers/{providerId}/profile")
    fun providerControllerUpdateProvider(@Path("providerId") providerId: kotlin.String, @Body updateProviderProfileDto: UpdateProviderProfileDto): Call<Unit>

    /**
     * PUT api/v1/account/profile
     *
     *
     * Responses:
     *  - 200: Creates or updates the authenticated synthetic customer profile.
     *
     * @param upsertCustomerProfileDto
     * @return [Call]<[Unit]>
     */
    @PUT("api/v1/account/profile")
    fun providerControllerUpsertCustomerProfile(@Body upsertCustomerProfileDto: UpsertCustomerProfileDto): Call<Unit>

}
