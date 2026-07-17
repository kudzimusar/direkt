package com.kudzimusar.direkt.ui.provider

enum class ProviderWorkspaceSection {
    Dashboard,
    Evidence,
    Timeline,
    Profile,
}

enum class ProviderTaskState(val label: String) {
    Complete("Complete"),
    ActionRequired("Action required"),
    Blocked("Blocked"),
    NotStarted("Not started"),
}

data class ProviderWorkspaceTask(
    val key: String,
    val title: String,
    val detail: String,
    val state: ProviderTaskState,
    val priority: Int,
)

data class ProviderWorkspaceReadiness(
    val profileComplete: Boolean,
    val selectedServices: Int,
    val mandatoryRequirements: Int,
    val evidenceSubmitted: Int,
    val openCases: Int,
    val correctionsRequired: Int,
    val currentClaims: Int,
    val publicationEligibleServices: Int,
) {
    val completionPercent: Int
        get() {
            val checks = listOf(
                profileComplete,
                selectedServices > 0,
                mandatoryRequirements > 0 && evidenceSubmitted >= mandatoryRequirements,
                correctionsRequired == 0,
                mandatoryRequirements > 0 && currentClaims >= mandatoryRequirements,
            )
            return (checks.count { it } * 100) / checks.size
        }
}

data class ProviderWorkspaceLocationBoundary(
    val privateBaseStored: Boolean,
    val publicPremisesConfigured: Boolean,
    val publicPremisesConsent: Boolean,
    val publicLocality: String?,
    val serviceAreaConfigured: Boolean,
) {
    val safeSummary: String
        get() = buildList {
            add(if (privateBaseStored) "Private base stored" else "Private base not stored")
            add(
                if (publicPremisesConfigured && publicPremisesConsent) {
                    "Public premises consented"
                } else {
                    "No public premises point"
                },
            )
            add(if (serviceAreaConfigured) "Service area configured" else "Service area required")
        }.joinToString(" · ")
}

data class ProviderDeferredSurface(
    val label: String,
    val phaseOwner: String,
    val state: String,
    val mutationAllowed: Boolean = false,
)

data class ProviderWorkspaceSnapshot(
    val displayName: String,
    val representativeRole: String,
    val operatingModel: String,
    val localitySummary: String,
    val selectedService: String,
    val availability: String,
    val readiness: ProviderWorkspaceReadiness,
    val location: ProviderWorkspaceLocationBoundary,
    val tasks: List<ProviderWorkspaceTask>,
    val deferredSurfaces: List<ProviderDeferredSurface>,
    val synthetic: Boolean = true,
) {
    val trustBoundary: String =
        "Profile, availability, uploads, interactions and commercial state cannot create claims, publication or trust ranking."
}

val syntheticProviderWorkspace = ProviderWorkspaceSnapshot(
    displayName = "Synthetic Copperbelt Repairs",
    representativeRole = "Provider owner",
    operatingModel = "Hybrid",
    localitySummary = "Woodlands, Lusaka",
    selectedService = "Plumbing · requirement version 1",
    availability = "Limited · next opening in two days",
    readiness = ProviderWorkspaceReadiness(
        profileComplete = true,
        selectedServices = 1,
        mandatoryRequirements = 2,
        evidenceSubmitted = 1,
        openCases = 1,
        correctionsRequired = 1,
        currentClaims = 0,
        publicationEligibleServices = 0,
    ),
    location = ProviderWorkspaceLocationBoundary(
        privateBaseStored = true,
        publicPremisesConfigured = true,
        publicPremisesConsent = true,
        publicLocality = "Woodlands, Lusaka",
        serviceAreaConfigured = true,
    ),
    tasks = listOf(
        ProviderWorkspaceTask(
            key = "complete_profile",
            title = "Complete provider profile",
            detail = "Operating model, locality and business pathway fields are complete.",
            state = ProviderTaskState.Complete,
            priority = 10,
        ),
        ProviderWorkspaceTask(
            key = "resolve_correction",
            title = "Replace identity evidence",
            detail = "The scoped identity check requires a clearer synthetic document.",
            state = ProviderTaskState.ActionRequired,
            priority = 20,
        ),
        ProviderWorkspaceTask(
            key = "track_verification",
            title = "Track verification progress",
            detail = "One private case remains open. No provider-wide verified status is inferred.",
            state = ProviderTaskState.NotStarted,
            priority = 30,
        ),
    ),
    deferredSurfaces = listOf(
        ProviderDeferredSurface("Subscription status", "Phase 9", "Synthetic read-only"),
    ),
)
