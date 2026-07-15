package com.kudzimusar.direkt.phase3

enum class ProviderPathway(val label: String) {
    REGISTERED_BUSINESS("Registered business"),
    QUALIFIED_INDIVIDUAL("Qualified individual"),
    EXPERIENCED_INFORMAL("Experienced informal provider"),
}

enum class OperatingModel(val label: String) {
    FIXED("Fixed premises"),
    MOBILE("Mobile"),
    HYBRID("Hybrid"),
}

enum class ProviderProfileState { DRAFT, COMPLETE, ARCHIVED }

data class ProviderDraftUiState(
    val providerId: String,
    val displayName: String,
    val pathway: ProviderPathway,
    val operatingModel: OperatingModel,
    val categories: List<String>,
    val profileState: ProviderProfileState,
    val discoverabilityBlocked: Boolean = true,
    val synthetic: Boolean = true,
)

object ProviderCorePolicy {
    fun canTransition(from: ProviderProfileState, to: ProviderProfileState): Boolean =
        from == to || when (from) {
            ProviderProfileState.DRAFT ->
                to == ProviderProfileState.COMPLETE || to == ProviderProfileState.ARCHIVED
            ProviderProfileState.COMPLETE ->
                to == ProviderProfileState.DRAFT || to == ProviderProfileState.ARCHIVED
            ProviderProfileState.ARCHIVED -> false
        }

    fun canComplete(state: ProviderDraftUiState): Boolean =
        state.synthetic && state.discoverabilityBlocked && state.categories.isNotEmpty()
}

val syntheticProviderDrafts = listOf(
    ProviderDraftUiState(
        providerId = "synthetic-provider-lsk-001",
        displayName = "Synthetic Lusaka Plumbing Draft",
        pathway = ProviderPathway.QUALIFIED_INDIVIDUAL,
        operatingModel = OperatingModel.MOBILE,
        categories = listOf("Plumbing"),
        profileState = ProviderProfileState.COMPLETE,
    ),
    ProviderDraftUiState(
        providerId = "synthetic-provider-lsk-002",
        displayName = "Synthetic Workshop Draft",
        pathway = ProviderPathway.REGISTERED_BUSINESS,
        operatingModel = OperatingModel.HYBRID,
        categories = listOf("Motor-vehicle mechanics"),
        profileState = ProviderProfileState.DRAFT,
    ),
)
