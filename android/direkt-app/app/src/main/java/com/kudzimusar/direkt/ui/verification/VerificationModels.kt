package com.kudzimusar.direkt.ui.verification

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
    val expiresAtEpochMillis: Long?,
    val state: EvidenceState,
)

data class VerificationTimelineItem(
    val title: String,
    val detail: String,
    val state: CaseState,
    val recordedAtEpochMillis: Long,
)

data class ScopedClaimCard(
    val claimKey: String,
    val statement: String,
    val limitation: String,
    val checkedAtEpochMillis: Long,
    val validUntilEpochMillis: Long,
    val state: String = "active",
) {
    fun effectiveState(atEpochMillis: Long): String = when {
        state == "revoked" -> "revoked"
        state == "degraded" -> "degraded"
        validUntilEpochMillis <= atEpochMillis -> "expired"
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
            expiresAtEpochMillis = 1_795_996_800_000,
            state = EvidenceState.CorrectionRequired,
        ),
        EvidenceVersionSummary(
            version = 2,
            documentType = "Synthetic corrected identity document metadata",
            evidenceClass = "Identity",
            expiresAtEpochMillis = 1_815_609_600_000,
            state = EvidenceState.Approved,
        ),
    ),
    timeline = listOf(
        VerificationTimelineItem(
            title = "Evidence submitted privately",
            detail = "Only metadata is shown in this synthetic build. The original file would remain private.",
            state = CaseState.AwaitingEvidence,
            recordedAtEpochMillis = 1_784_106_000_000,
        ),
        VerificationTimelineItem(
            title = "Correction requested",
            detail = "Version 1 was unreadable. The original decision history remains append-only.",
            state = CaseState.CorrectionRequired,
            recordedAtEpochMillis = 1_784_109_600_000,
        ),
        VerificationTimelineItem(
            title = "Independent review completed",
            detail = "The scoped representative identity check passed. No qualification or safety claim was made.",
            state = CaseState.Approved,
            recordedAtEpochMillis = 1_784_113_200_000,
        ),
    ),
    claim = ScopedClaimCard(
        claimKey = "representative_identity_checked",
        statement = "Representative identity checked",
        limitation = "This does not verify qualifications, safety or future workmanship.",
        checkedAtEpochMillis = 1_784_113_200_000,
        validUntilEpochMillis = 1_815_609_600_000,
    ),
)