package com.kudzimusar.direkt.ui.provider

enum class ProviderPathway(val label: String) {
    RegisteredBusiness("Registered business"),
    QualifiedIndividual("Qualified individual"),
    ExperiencedInformal("Experienced informal provider"),
}

enum class OperatingModel(val label: String) {
    FixedPremises("Fixed premises"),
    Mobile("Mobile"),
    Hybrid("Hybrid"),
}

enum class ProviderDraftStatus(val label: String) {
    Draft("Draft"),
    ReadyForVerification("Ready for verification"),
    Suspended("Suspended"),
    Archived("Archived"),
}

data class ProviderDraft(
    val displayName: String,
    val pathway: ProviderPathway,
    val operatingModel: OperatingModel,
    val localitySummary: String?,
    val serviceAreaSummary: String,
    val categoryNames: List<String>,
    val status: ProviderDraftStatus = ProviderDraftStatus.Draft,
) {
    val discoverable: Boolean = false

    fun validationIssues(): List<String> = buildList {
        if (displayName.trim().length < 2) add("Display name is required")
        if (serviceAreaSummary.trim().length < 2) add("Service area is required")
        if (operatingModel != OperatingModel.Mobile && localitySummary.isNullOrBlank()) {
            add("A public-safe locality summary is required")
        }
        if (categoryNames.isEmpty()) add("Select at least one service category")
    }

    fun canTransitionTo(target: ProviderDraftStatus): Boolean = when (status) {
        ProviderDraftStatus.Draft -> target in setOf(
            ProviderDraftStatus.ReadyForVerification,
            ProviderDraftStatus.Archived,
        )
        ProviderDraftStatus.ReadyForVerification -> target in setOf(
            ProviderDraftStatus.Draft,
            ProviderDraftStatus.Suspended,
            ProviderDraftStatus.Archived,
        )
        ProviderDraftStatus.Suspended -> target in setOf(
            ProviderDraftStatus.Draft,
            ProviderDraftStatus.Archived,
        )
        ProviderDraftStatus.Archived -> false
    }
}

val syntheticProviderDraft = ProviderDraft(
    displayName = "Synthetic Copperbelt Repairs",
    pathway = ProviderPathway.RegisteredBusiness,
    operatingModel = OperatingModel.FixedPremises,
    localitySummary = "Woodlands, Lusaka",
    serviceAreaSummary = "Woodlands and nearby Lusaka neighbourhoods",
    categoryNames = listOf("Plumbing"),
)