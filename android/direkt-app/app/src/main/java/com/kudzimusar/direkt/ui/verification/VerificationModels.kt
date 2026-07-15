package com.kudzimusar.direkt.ui.verification

import java.time.Instant

enum class EvidenceState(val label: String) {
    Processing("Processing privately"),
    ReadyForReview("Ready for review"),
    CorrectionRequired("Correction required"),
    Approved("Approved for this check"),
    Rejected("Rejected"),
    Revoked("Revoked"),
    Expired("Expired"),
}

enum class CaseState(val label: String) {
    AwaitingEvidence("Awaiting evidence"),
    ReadyForReview("Ready for review"),
    Assigned("Assigned"),
    InReview("In review"),
    CorrectionRequired("Correction required"),
    Approved("Approved"),
    Rejected("Rejected"),
    Revoked("Revoked"),
    Expired("Expired"),
}

data class EvidenceVersionSummary(
    val version: Int,
    val documentType: String,
    val evidenceClass: String,
    val expiresAt: Instant?,
    val state: EvidenceState,
)

data class VerificationTimelineItem(
    val title: String,
    val detail: String,
    val state: CaseState,
    val recordedAt: Instant,
)

data class ScopedClaimCard(
    val claimKey: String,
    val statement: String,
    val limitation: String,
    val checkedAt: Instant,
    val validUntil: Instant,
    val state: String = "active",
) {
    fun effectiveState(at: Instant): String = when {
        state == "revoked" -> "revoked"
        state == "degraded" -> "degraded"
        !validUntil.isAfter(at) -> "expired"
        else -> "active"
    }
}

data class SyntheticVerificationCase(
    val checkName: String,
    val requirementVersion: String,
    val caseState: CaseState,
    val evidenceVersions: List<EvidenceVersionSummary>,
    val timeline: List<VerificationTimelineItem>,
    val claim: ScopedClaimCard?,
) {
    val containsRealEvidence: Boolean = false
    val publiclyDiscoverable: Boolean = false
}

val syntheticVerificationCase = SyntheticVerificationCase(
    checkName = "Representative identity check",
    requirementVersion = "Plumbing · requirement version 1",
    caseState = CaseState.Approved,
    evidenceVersions = listOf(
        EvidenceVersionSummary(
            version = 1,
            documentType = "Synthetic identity document metadata",
            evidenceClass = "Identity",
            expiresAt = Instant.parse("2026-11-30T00:00:00Z"),
            state = EvidenceState.CorrectionRequired,
        ),
        EvidenceVersionSummary(
            version = 2,
            documentType = "Synthetic corrected identity document metadata",
            evidenceClass = "Identity",
            expiresAt = Instant.parse("2027-07-15T00:00:00Z"),
            state = EvidenceState.Approved,
        ),
    ),
    timeline = listOf(
        VerificationTimelineItem(
            title = "Evidence submitted privately",
            detail = "Only metadata is shown in this synthetic build. The original file would remain private.",
            state = CaseState.AwaitingEvidence,
            recordedAt = Instant.parse("2026-07-15T09:00:00Z"),
        ),
        VerificationTimelineItem(
            title = "Correction requested",
            detail = "Version 1 was unreadable. The original decision history remains append-only.",
            state = CaseState.CorrectionRequired,
            recordedAt = Instant.parse("2026-07-15T10:00:00Z"),
        ),
        VerificationTimelineItem(
            title = "Independent review completed",
            detail = "The scoped representative identity check passed. No qualification or safety claim was made.",
            state = CaseState.Approved,
            recordedAt = Instant.parse("2026-07-15T11:00:00Z"),
        ),
    ),
    claim = ScopedClaimCard(
        claimKey = "representative_identity_checked",
        statement = "Representative identity checked",
        limitation = "This does not verify qualifications, safety or future workmanship.",
        checkedAt = Instant.parse("2026-07-15T11:00:00Z"),
        validUntil = Instant.parse("2027-07-15T00:00:00Z"),
    ),
)