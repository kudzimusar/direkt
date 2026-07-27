package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


interface CustomerDiscoveryApi {
    /**
     * POST api/v1/public/discovery/assist
     * Suggests active service categories from a short synthetic service-need description.
     *
     * Responses:
     *  - 200: Returns bounded AI-assisted or deterministic category suggestions. Suggestions never create trust, ranking or provider authority.
     *
     * @param body
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/public/discovery/assist")
    fun discoveryControllerAssist(@Body body: kotlin.Any): Call<Unit>

    /**
     * GET api/v1/public/providers/{publicProviderId}/availability
     *
     *
     * Responses:
     *  - 200: Returns minimal public availability from the safe profile.
     *
     * @param publicProviderId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/public/providers/{publicProviderId}/availability")
    fun discoveryControllerAvailability(@Path("publicProviderId") publicProviderId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/public/categories
     *
     *
     * Responses:
     *  - 200: Lists active public-safe service categories.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/public/categories")
    fun discoveryControllerCategories(): Call<Unit>

    /**
     * GET api/v1/public/providers/{publicProviderId}/claims
     *
     *
     * Responses:
     *  - 200: Returns current scoped claim cards and limitations only.
     *
     * @param publicProviderId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/public/providers/{publicProviderId}/claims")
    fun discoveryControllerClaims(@Path("publicProviderId") publicProviderId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/operations/discovery/publication-eligibility
     *
     *
     * Responses:
     *  - 200: Lists publication eligibility without private coordinates or evidence details.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/discovery/publication-eligibility")
    fun discoveryControllerEligibility(): Call<Unit>

    /**
     * POST api/v1/operations/discovery/publications/{publicProviderId}/hide
     *
     *
     * Responses:
     *  - 200: Hides a publication through an audited policy function.
     *
     * @param publicProviderId
     * @param body
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/discovery/publications/{publicProviderId}/hide")
    fun discoveryControllerHidePublication(@Path("publicProviderId") publicProviderId: kotlin.String, @Body body: kotlin.Any): Call<Unit>

    /**
     * POST api/v1/public/discovery/search-area/normalize
     * Normalizes a bounded Zambian discovery area without storing private location.
     *
     * Responses:
     *  - 200: Returns a Zambia-bounded search point for discovery only. Manual area search remains available on every failure.
     *
     * @param body
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/public/discovery/search-area/normalize")
    fun discoveryControllerNormalizeSearchArea(@Body body: kotlin.Any): Call<Unit>

    /**
     * GET api/v1/public/providers/{publicProviderId}
     *
     *
     * Responses:
     *  - 200: Returns one eligible public-safe provider profile.
     *
     * @param publicProviderId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/public/providers/{publicProviderId}")
    fun discoveryControllerProfile(@Path("publicProviderId") publicProviderId: kotlin.String): Call<Unit>

    /**
     * POST api/v1/operations/providers/{providerId}/discovery/publication
     *
     *
     * Responses:
     *  - 201: Evaluates and refreshes a synthetic publication through database policy.
     *
     * @param providerId
     * @param body
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/providers/{providerId}/discovery/publication")
    fun discoveryControllerRefreshPublication(@Path("providerId") providerId: kotlin.String, @Body body: kotlin.Any): Call<Unit>

    /**
     * POST api/v1/account/saved-providers/{publicProviderId}
     *
     *
     * Responses:
     *  - 201: Saves an eligible public provider for this identity.
     *
     * @param publicProviderId
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/account/saved-providers/{publicProviderId}")
    fun discoveryControllerSave(@Path("publicProviderId") publicProviderId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/account/saved-providers
     *
     *
     * Responses:
     *  - 200: Lists the authenticated identity’s eligible saved providers.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/account/saved-providers")
    fun discoveryControllerSaved(): Call<Unit>

    /**
     * GET api/v1/public/providers/search
     * Searches eligible synthetic provider publications without private coordinates.
     *
     * Responses:
     *  - 200: Returns deterministic public-safe discovery cards.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/public/providers/search")
    fun discoveryControllerSearch(): Call<Unit>

    /**
     * GET api/v1/public/providers/{publicProviderId}/share
     *
     *
     * Responses:
     *  - 200: Returns share-safe metadata with no private location.
     *
     * @param publicProviderId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/public/providers/{publicProviderId}/share")
    fun discoveryControllerShare(@Path("publicProviderId") publicProviderId: kotlin.String): Call<Unit>

    /**
     * DELETE api/v1/account/saved-providers/{publicProviderId}
     *
     *
     * Responses:
     *  - 200: Removes a saved public provider for this identity.
     *
     * @param publicProviderId
     * @return [Call]<[Unit]>
     */
    @DELETE("api/v1/account/saved-providers/{publicProviderId}")
    fun discoveryControllerUnsave(@Path("publicProviderId") publicProviderId: kotlin.String): Call<Unit>

}
