package com.kudzimusar.direkt.ui.discovery

enum class SearchAreaMode(val label: String) {
    Manual("Choose area manually"),
    OneTimeLocation("Use current area once"),
}

enum class DiscoveryViewMode(val label: String) {
    List("List"),
    Map("Map"),
}

enum class DiscoveryImageMode(val label: String) {
    LowBandwidth("Data saver"),
    Standard("Standard images"),
    NoImages("No images"),
}

enum class PublicOperatingModel(val label: String) {
    FixedPremises("Fixed premises"),
    Mobile("Mobile service"),
    Hybrid("Premises and mobile"),
}

data class PublicClaim(
    val key: String,
    val statement: String,
    val limitation: String,
    val validUntilLabel: String,
)

data class PublicPremisesPoint(
    val latitude: Double,
    val longitude: Double,
)

data class PublicImage(
    val lowBandwidthLabel: String?,
    val standardLabel: String?,
    val altText: String?,
)

data class SyntheticPublicProvider(
    val publicId: String,
    val displayName: String,
    val category: String,
    val operatingModel: PublicOperatingModel,
    val locality: String,
    val serviceAreaLabel: String,
    val publicPremises: PublicPremisesPoint?,
    val distanceKm: Double?,
    val availability: String,
    val claims: List<PublicClaim>,
    val reasons: List<String>,
    val image: PublicImage,
    val saved: Boolean = false,
) {
    val sharePath: String = "/providers/$publicId"
    val containsPrivateCoordinates: Boolean = false
    val containsRealProviderData: Boolean = false

    fun distanceLabel(): String = when {
        operatingModel == PublicOperatingModel.Mobile -> "Matched by service area"
        distanceKm != null -> "${"%.1f".format(distanceKm)} km from public premises"
        else -> "Distance unavailable"
    }
}

data class DiscoveryUiState(
    val onboardingComplete: Boolean = false,
    val areaMode: SearchAreaMode = SearchAreaMode.Manual,
    val manualArea: String = "Woodlands, Lusaka",
    val category: String = "Plumbing",
    val query: String = "",
    val availabilityOnly: Boolean = false,
    val claimFilter: String? = null,
    val viewMode: DiscoveryViewMode = DiscoveryViewMode.List,
    val imageMode: DiscoveryImageMode = DiscoveryImageMode.LowBandwidth,
) {
    val backgroundLocationEnabled: Boolean = false
    val currentLocationStored: Boolean = false
}

val syntheticDiscoveryProviders = listOf(
    SyntheticPublicProvider(
        publicId = "10000000-0000-4000-8000-000000005001",
        displayName = "Synthetic Woodlands Plumbing",
        category = "Plumbing",
        operatingModel = PublicOperatingModel.FixedPremises,
        locality = "Woodlands, Lusaka",
        serviceAreaLabel = "Woodlands and nearby Lusaka neighbourhoods",
        publicPremises = PublicPremisesPoint(latitude = -15.421, longitude = 28.335),
        distanceKm = 2.4,
        availability = "Available",
        claims = listOf(
            PublicClaim(
                key = "identity_checked",
                statement = "Representative identity checked",
                limitation = "This does not verify qualifications, safety or future workmanship.",
                validUntilLabel = "Current until Jan 2028",
            ),
            PublicClaim(
                key = "service_experience_checked",
                statement = "Plumbing experience record checked",
                limitation = "This does not guarantee price, availability or the outcome of future work.",
                validUntilLabel = "Current until Jan 2028",
            ),
        ),
        reasons = listOf(
            "Current mandatory checks",
            "Public premises within selected distance",
            "Currently marked available",
        ),
        image = PublicImage(
            lowBandwidthLabel = "Small synthetic workshop image · 24 KB",
            standardLabel = "Standard synthetic workshop image · 180 KB",
            altText = "Synthetic plumbing tools arranged in a public workshop",
        ),
        saved = true,
    ),
    SyntheticPublicProvider(
        publicId = "10000000-0000-4000-8000-000000005002",
        displayName = "Synthetic Mobile Plumber",
        category = "Plumbing",
        operatingModel = PublicOperatingModel.Mobile,
        locality = "Lusaka Central service area",
        serviceAreaLabel = "Serves central and southern Lusaka",
        publicPremises = null,
        distanceKm = null,
        availability = "Limited",
        claims = listOf(
            PublicClaim(
                key = "identity_checked",
                statement = "Representative identity checked",
                limitation = "This does not verify qualifications, safety or future workmanship.",
                validUntilLabel = "Current until Jan 2028",
            ),
        ),
        reasons = listOf("Current mandatory checks", "Serves your selected area"),
        image = PublicImage(lowBandwidthLabel = null, standardLabel = null, altText = null),
    ),
    SyntheticPublicProvider(
        publicId = "10000000-0000-4000-8000-000000005003",
        displayName = "Synthetic Hybrid Plumbing",
        category = "Plumbing",
        operatingModel = PublicOperatingModel.Hybrid,
        locality = "Kabulonga, Lusaka",
        serviceAreaLabel = "Public premises in Kabulonga; mobile service across nearby areas",
        publicPremises = PublicPremisesPoint(latitude = -15.420, longitude = 28.360),
        distanceKm = 4.8,
        availability = "Available",
        claims = listOf(
            PublicClaim(
                key = "identity_checked",
                statement = "Representative identity checked",
                limitation = "This does not verify qualifications, safety or future workmanship.",
                validUntilLabel = "Current until Jan 2028",
            ),
        ),
        reasons = listOf("Current mandatory checks", "Serves your selected area"),
        image = PublicImage(
            lowBandwidthLabel = "Small synthetic service image · 18 KB",
            standardLabel = null,
            altText = "Synthetic mobile plumbing service kit",
        ),
    ),
)

fun filteredSyntheticProviders(
    state: DiscoveryUiState,
    providers: List<SyntheticPublicProvider> = syntheticDiscoveryProviders,
): List<SyntheticPublicProvider> = providers
    .filter { provider -> provider.category == state.category }
    .filter { provider ->
        state.query.isBlank() ||
            provider.displayName.contains(state.query, ignoreCase = true) ||
            provider.locality.contains(state.query, ignoreCase = true)
    }
    .filter { provider -> !state.availabilityOnly || provider.availability == "Available" }
    .filter { provider ->
        state.claimFilter == null || provider.claims.any { claim -> claim.key == state.claimFilter }
    }
    .sortedWith(
        compareBy<SyntheticPublicProvider> { provider -> provider.distanceKm == null }
            .thenBy { provider -> provider.distanceKm ?: Double.MAX_VALUE }
            .thenBy { provider -> provider.displayName }
            .thenBy { provider -> provider.publicId },
    )

fun locationEducation(areaMode: SearchAreaMode): String = when (areaMode) {
    SearchAreaMode.Manual ->
        "Manual area search works without location permission and is never treated as lower trust."
    SearchAreaMode.OneTimeLocation ->
        "DIREKT would use location once to choose a search origin. Background tracking stays off."
}
