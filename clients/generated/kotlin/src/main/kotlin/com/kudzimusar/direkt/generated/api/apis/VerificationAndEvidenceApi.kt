package com.kudzimusar.direkt.generated.api.apis

import com.kudzimusar.direkt.generated.api.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Call
import okhttp3.RequestBody
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kudzimusar.direkt.generated.api.models.AssignVerificationCaseDto
import com.kudzimusar.direkt.generated.api.models.ConfirmEvidenceDto
import com.kudzimusar.direkt.generated.api.models.CreateDecisionDto
import com.kudzimusar.direkt.generated.api.models.CreateFieldVisitDto
import com.kudzimusar.direkt.generated.api.models.CreateRecommendationDto
import com.kudzimusar.direkt.generated.api.models.CreateUploadSessionDto
import com.kudzimusar.direkt.generated.api.models.CreateVerificationCaseDto
import com.kudzimusar.direkt.generated.api.models.ExpireClaimsDto
import com.kudzimusar.direkt.generated.api.models.RevokeEvidenceAccessGrantDto
import com.kudzimusar.direkt.generated.api.models.RevokeEvidenceDto

interface VerificationAndEvidenceApi {
    /**
     * POST api/v1/verification-cases/{caseId}/assignments
     *
     *
     * Responses:
     *  - 201: Assigns an authorized reviewer, field agent or supervisor.
     *
     * @param caseId
     * @param assignVerificationCaseDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/verification-cases/{caseId}/assignments")
    fun verificationEvidenceControllerAssignCase(@Path("caseId") caseId: kotlin.String, @Body assignVerificationCaseDto: AssignVerificationCaseDto): Call<Unit>

    /**
     * GET api/v1/verification-cases/{caseId}
     *
     *
     * Responses:
     *  - 200: Reads a verification case only for an active assigned operator.
     *
     * @param caseId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/verification-cases/{caseId}")
    fun verificationEvidenceControllerAssignedCase(@Path("caseId") caseId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/providers/{providerId}/verification-cases
     *
     *
     * Responses:
     *  - 200: Lists provider-scoped verification cases and safe evidence metadata.
     *
     * @param providerId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/providers/{providerId}/verification-cases")
    fun verificationEvidenceControllerCases(@Path("providerId") providerId: kotlin.String): Call<Unit>

    /**
     * POST api/v1/providers/{providerId}/evidence
     *
     *
     * Responses:
     *  - 201: Confirms synthetic private upload metadata and creates an immutable evidence version.
     *
     * @param providerId
     * @param confirmEvidenceDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/providers/{providerId}/evidence")
    fun verificationEvidenceControllerConfirmEvidence(@Path("providerId") providerId: kotlin.String, @Body confirmEvidenceDto: ConfirmEvidenceDto): Call<Unit>

    /**
     * POST api/v1/providers/{providerId}/verification-cases
     *
     *
     * Responses:
     *  - 201: Creates a separate scoped verification case.
     *
     * @param providerId
     * @param createVerificationCaseDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/providers/{providerId}/verification-cases")
    fun verificationEvidenceControllerCreateCase(@Path("providerId") providerId: kotlin.String, @Body createVerificationCaseDto: CreateVerificationCaseDto): Call<Unit>

    /**
     * POST api/v1/providers/{providerId}/evidence/upload-sessions
     *
     *
     * Responses:
     *  - 201: Creates a short-lived synthetic private upload grant after provider-scope checks.
     *
     * @param providerId
     * @param createUploadSessionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/providers/{providerId}/evidence/upload-sessions")
    fun verificationEvidenceControllerCreateUploadSession(@Path("providerId") providerId: kotlin.String, @Body createUploadSessionDto: CreateUploadSessionDto): Call<Unit>

    /**
     * POST api/v1/verification-cases/{caseId}/decisions
     *
     *
     * Responses:
     *  - 201: Records an immutable final decision and derives a scoped claim when approved.
     *
     * @param caseId
     * @param createDecisionDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/verification-cases/{caseId}/decisions")
    fun verificationEvidenceControllerDecide(@Path("caseId") caseId: kotlin.String, @Body createDecisionDto: CreateDecisionDto): Call<Unit>

    /**
     * GET api/v1/providers/{providerId}/evidence
     *
     *
     * Responses:
     *  - 200: Lists private evidence metadata without storage object references.
     *
     * @param providerId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/providers/{providerId}/evidence")
    fun verificationEvidenceControllerEvidence(@Path("providerId") providerId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/providers/{providerId}/evidence/{evidenceId}
     *
     *
     * Responses:
     *  - 200: Reads one private evidence metadata record without evidence bytes.
     *
     * @param providerId
     * @param evidenceId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/providers/{providerId}/evidence/{evidenceId}")
    fun verificationEvidenceControllerEvidenceItem(@Path("providerId") providerId: kotlin.String, @Path("evidenceId") evidenceId: kotlin.String): Call<Unit>

    /**
     * POST api/v1/operations/verification/expire-claims
     *
     *
     * Responses:
     *  - 200: Runs deterministic evidence and claim expiry processing.
     *
     * @param expireClaimsDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/verification/expire-claims")
    fun verificationEvidenceControllerExpireClaims(@Body expireClaimsDto: ExpireClaimsDto): Call<Unit>

    /**
     * POST api/v1/verification-cases/{caseId}/field-visits
     *
     *
     * Responses:
     *  - 201: Records an immutable assignment-bound field-visit outcome.
     *
     * @param caseId
     * @param createFieldVisitDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/verification-cases/{caseId}/field-visits")
    fun verificationEvidenceControllerFieldVisit(@Path("caseId") caseId: kotlin.String, @Body createFieldVisitDto: CreateFieldVisitDto): Call<Unit>

    /**
     * GET api/v1/operations/providers/{providerId}/claims
     *
     *
     * Responses:
     *  - 200: Lists safe claim cards for internal operations review.
     *
     * @param providerId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/providers/{providerId}/claims")
    fun verificationEvidenceControllerOperationsClaims(@Path("providerId") providerId: kotlin.String): Call<Unit>

    /**
     * POST api/v1/verification-cases/{caseId}/evidence/{evidenceId}/access
     *
     *
     * Responses:
     *  - 201: Issues an audited revocable authorization and a short-lived synthetic reviewer URL.
     *
     * @param caseId
     * @param evidenceId
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/verification-cases/{caseId}/evidence/{evidenceId}/access")
    fun verificationEvidenceControllerPrivateEvidenceAccess(@Path("caseId") caseId: kotlin.String, @Path("evidenceId") evidenceId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/providers/{providerId}/claims
     *
     *
     * Responses:
     *  - 200: Lists safe scoped claim cards without original evidence.
     *
     * @param providerId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/providers/{providerId}/claims")
    fun verificationEvidenceControllerProviderClaims(@Path("providerId") providerId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/operations/verification-queue
     *
     *
     * Responses:
     *  - 200: Lists the deterministic role-scoped verification triage queue without private evidence content.
     *
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/operations/verification-queue")
    fun verificationEvidenceControllerQueue(): Call<Unit>

    /**
     * POST api/v1/verification-cases/{caseId}/recommendations
     *
     *
     * Responses:
     *  - 201: Records an immutable assigned-reviewer recommendation.
     *
     * @param caseId
     * @param createRecommendationDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/verification-cases/{caseId}/recommendations")
    fun verificationEvidenceControllerRecommend(@Path("caseId") caseId: kotlin.String, @Body createRecommendationDto: CreateRecommendationDto): Call<Unit>

    /**
     * POST api/v1/operations/evidence-access/{grantId}/redeem
     *
     *
     * Responses:
     *  - 201: Rechecks the live assignment and evidence version before issuing a fresh short-lived URL.
     *
     * @param grantId
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/evidence-access/{grantId}/redeem")
    fun verificationEvidenceControllerRedeemEvidenceAccess(@Path("grantId") grantId: kotlin.String): Call<Unit>

    /**
     * GET api/v1/verification-cases/{caseId}/review-workspace
     *
     *
     * Responses:
     *  - 200: Returns the assigned reviewer workspace without storage references, submitter identity or private notes.
     *
     * @param caseId
     * @return [Call]<[Unit]>
     */
    @GET("api/v1/verification-cases/{caseId}/review-workspace")
    fun verificationEvidenceControllerReviewWorkspace(@Path("caseId") caseId: kotlin.String): Call<Unit>

    /**
     * POST api/v1/providers/{providerId}/evidence/{evidenceId}/revoke
     *
     *
     * Responses:
     *  - 200: Revokes provider evidence and deterministically degrades dependent claims.
     *
     * @param providerId
     * @param evidenceId
     * @param revokeEvidenceDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/providers/{providerId}/evidence/{evidenceId}/revoke")
    fun verificationEvidenceControllerRevokeEvidence(@Path("providerId") providerId: kotlin.String, @Path("evidenceId") evidenceId: kotlin.String, @Body revokeEvidenceDto: RevokeEvidenceDto): Call<Unit>

    /**
     * POST api/v1/operations/evidence-access/{grantId}/revoke
     *
     *
     * Responses:
     *  - 200: Revokes an active evidence access authorization without retaining its URL.
     *
     * @param grantId
     * @param revokeEvidenceAccessGrantDto
     * @return [Call]<[Unit]>
     */
    @POST("api/v1/operations/evidence-access/{grantId}/revoke")
    fun verificationEvidenceControllerRevokeEvidenceAccess(@Path("grantId") grantId: kotlin.String, @Body revokeEvidenceAccessGrantDto: RevokeEvidenceAccessGrantDto): Call<Unit>

}
