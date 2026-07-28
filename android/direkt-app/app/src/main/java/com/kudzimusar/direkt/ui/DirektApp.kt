package com.kudzimusar.direkt.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.kudzimusar.direkt.ui.auth.PilotAuthenticationExperience
import com.kudzimusar.direkt.ui.commercial.ProviderCommercialExperience
import com.kudzimusar.direkt.ui.discovery.CustomerDiscoveryExperience
import com.kudzimusar.direkt.ui.discovery.SavedProvidersExperience
import com.kudzimusar.direkt.ui.interaction.CustomerInteractionExperience
import com.kudzimusar.direkt.ui.interaction.ProviderInteractionExperience
import com.kudzimusar.direkt.ui.provider.ProviderWorkspaceSection
import com.kudzimusar.direkt.ui.provider.WorldClassProviderWorkspaceExperience
import com.kudzimusar.direkt.ui.theme.DirektAmberSoft
import com.kudzimusar.direkt.ui.theme.DirektBlue
import com.kudzimusar.direkt.ui.theme.DirektBlueSoft
import com.kudzimusar.direkt.ui.theme.DirektIndigo
import com.kudzimusar.direkt.ui.theme.DirektOrangeSoft
import com.kudzimusar.direkt.ui.theme.DirektTeal
import com.kudzimusar.direkt.ui.theme.DirektTealSoft
import com.kudzimusar.direkt.ui.theme.DirektViolet
import com.kudzimusar.direkt.ui.theme.DirektVioletSoft

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DirektApp(
    appState: DirektAppState = rememberDirektAppState(),
) {
    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("foundation-root"),
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                title = { DirektBrand() },
                actions = {
                    CompactModeSelector(
                        selectedMode = appState.mode,
                        onModeSelected = appState::switchMode,
                    )
                    Spacer(Modifier.width(12.dp))
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.96f),
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
                ),
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.98f),
                tonalElevation = 3.dp,
            ) {
                DirektDestination.entries.forEach { destination ->
                    val selected = appState.destination == destination
                    NavigationBarItem(
                        modifier = Modifier.testTag("nav-${destination.name.lowercase()}"),
                        selected = selected,
                        onClick = { appState.navigate(destination) },
                        icon = { DirektNavigationIcon(destination) },
                        label = {
                            Text(
                                text = destinationLabel(appState.mode, destination),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = DirektBlue,
                            selectedTextColor = DirektBlue,
                            indicatorColor = DirektBlueSoft,
                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        ),
                    )
                }
            }
        },
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 18.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            if (appState.destination != DirektDestination.Discover) {
                item {
                    PageIntroCard(
                        eyebrow = if (appState.mode == DirektMode.Customer) "FOR YOU" else "YOUR BUSINESS",
                        title = screenTitle(appState),
                        summary = screenSummary(appState),
                        showIllustration = appState.mode == DirektMode.Customer,
                    )
                }
                item { TrustPrincipleCard() }
            }

            if (appState.destination == DirektDestination.Account) {
                item { PilotAuthenticationExperience() }
            }

            if (appState.mode == DirektMode.Customer) {
                when (appState.destination) {
                    DirektDestination.Discover -> item { CustomerDiscoveryExperience() }
                    DirektDestination.Saved -> item { SavedProvidersExperience() }
                    DirektDestination.Account -> item { AccountPrivacyOverview() }
                    DirektDestination.Enquiries -> item { CustomerInteractionExperience() }
                }
            } else {
                when (appState.destination) {
                    DirektDestination.Discover -> item {
                        WorldClassProviderWorkspaceExperience(ProviderWorkspaceSection.Dashboard)
                    }
                    DirektDestination.Saved -> item {
                        WorldClassProviderWorkspaceExperience(ProviderWorkspaceSection.Evidence)
                    }
                    DirektDestination.Enquiries -> item { ProviderInteractionExperience() }
                    DirektDestination.Account -> item {
                        WorldClassProviderWorkspaceExperience(ProviderWorkspaceSection.Profile)
                    }
                }
                if (appState.destination == DirektDestination.Account) {
                    item { ProviderCommercialExperience() }
                }
            }
        }
    }
}

@Composable
private fun DirektBrand() {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFF0B84F3), DirektBlue, DirektIndigo),
                    ),
                ),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "D",
                color = Color.White,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
        }
        Text(
            text = "DIREKT",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            letterSpacing = MaterialTheme.typography.labelSmall.letterSpacing,
        )
    }
}

@Composable
private fun CompactModeSelector(
    selectedMode: DirektMode,
    onModeSelected: (DirektMode) -> Unit,
) {
    Surface(
        shape = CircleShape,
        color = MaterialTheme.colorScheme.surface,
        border = CardDefaults.outlinedCardBorder(),
    ) {
        Row(
            modifier = Modifier.padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            DirektMode.entries.forEach { mode ->
                val selected = selectedMode == mode
                Surface(
                    modifier = Modifier
                        .height(40.dp)
                        .testTag("mode-${mode.name.lowercase()}"),
                    onClick = { onModeSelected(mode) },
                    shape = CircleShape,
                    color = if (selected) DirektBlue else Color.Transparent,
                    contentColor = if (selected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                ) {
                    Box(
                        modifier = Modifier.padding(horizontal = 15.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = mode.label,
                            style = MaterialTheme.typography.labelLarge,
                            maxLines = 1,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PageIntroCard(
    eyebrow: String,
    title: String,
    summary: String,
    showIllustration: Boolean,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(if (showIllustration) 232.dp else 190.dp)
                .background(
                    Brush.linearGradient(
                        listOf(
                            DirektBlueSoft.copy(alpha = 0.42f),
                            MaterialTheme.colorScheme.surface,
                            DirektOrangeSoft.copy(alpha = 0.5f),
                        ),
                    ),
                )
                .padding(22.dp),
        ) {
            if (showIllustration) {
                DirektNeighborhoodIllustration(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .width(190.dp)
                        .alpha(0.94f),
                )
            }
            Column(
                modifier = Modifier
                    .fillMaxWidth(if (showIllustration) 0.68f else 1f)
                    .align(Alignment.CenterStart),
                verticalArrangement = Arrangement.spacedBy(9.dp),
            ) {
                Text(
                    text = eyebrow,
                    style = MaterialTheme.typography.labelSmall,
                    color = DirektBlue,
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = summary,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun TrustPrincipleCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Row(
            modifier = Modifier
                .background(
                    Brush.linearGradient(
                        listOf(
                            Color(0xFFEEF2FF),
                            Color(0xFFF4EEFF),
                            Color(0xFFFFF1EA),
                        ),
                    ),
                )
                .padding(18.dp),
            horizontalArrangement = Arrangement.spacedBy(15.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Surface(
                modifier = Modifier.size(58.dp),
                shape = RoundedCornerShape(20.dp),
                color = Color.White.copy(alpha = 0.82f),
                contentColor = DirektBlue,
                shadowElevation = 4.dp,
            ) {
                Box(contentAlignment = Alignment.Center) {
                    DirektNavigationIcon(
                        destination = DirektDestination.Saved,
                        modifier = Modifier.size(30.dp),
                    )
                }
            }
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(5.dp),
            ) {
                Text(
                    text = "Proof before persuasion",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF10245D),
                )
                Text(
                    text = "Trust information is shown check by check. A payment or subscription never upgrades a provider's trust status.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF385286),
                )
            }
        }
    }
}

@Composable
private fun AccountPrivacyOverview() {
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text(
            text = "Account & privacy",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )
        AccountInfoRow(
            title = "Privacy preferences",
            supporting = "Control consent, communication and public-profile choices.",
            accent = DirektTeal,
            container = DirektTealSoft,
        )
        AccountInfoRow(
            title = "Active sessions",
            supporting = "Authorized sessions remain backend-controlled and revocable.",
            accent = DirektViolet,
            container = DirektVioletSoft,
        )
        AccountInfoRow(
            title = "Verification & consent",
            supporting = "Review what DIREKT may use without changing provider trust authority.",
            accent = MaterialTheme.colorScheme.tertiary,
            container = DirektAmberSoft,
        )
    }
}

@Composable
private fun AccountInfoRow(
    title: String,
    supporting: String,
    accent: Color,
    container: Color,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(container),
                contentAlignment = Alignment.Center,
            ) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(accent),
                )
            }
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(3.dp),
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                )
                Text(
                    text = supporting,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

private fun destinationLabel(mode: DirektMode, destination: DirektDestination): String =
    if (mode == DirektMode.Customer) {
        when (destination) {
            DirektDestination.Discover -> "Home"
            DirektDestination.Saved -> "Saved"
            DirektDestination.Enquiries -> "Enquiries"
            DirektDestination.Account -> "Account"
        }
    } else {
        when (destination) {
            DirektDestination.Discover -> "Overview"
            DirektDestination.Saved -> "Evidence"
            DirektDestination.Enquiries -> "Enquiries"
            DirektDestination.Account -> "Account"
        }
    }

private fun screenTitle(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> when (appState.destination) {
        DirektDestination.Discover -> "What do you need help with?"
        DirektDestination.Saved -> "Your shortlist"
        DirektDestination.Enquiries -> "Your service requests"
        DirektDestination.Account -> "Account and privacy"
    }
    DirektMode.Provider -> when (appState.destination) {
        DirektDestination.Discover -> "Run your service business"
        DirektDestination.Saved -> "Checks and evidence"
        DirektDestination.Enquiries -> "Customer enquiries"
        DirektDestination.Account -> "Business account"
    }
}

private fun screenSummary(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> when (appState.destination) {
        DirektDestination.Discover ->
            "Describe the job in your own words or choose a service, then compare current check-specific trust information."
        DirektDestination.Saved ->
            "Keep promising providers together so you can compare services, availability and current trust information before deciding."
        DirektDestination.Enquiries ->
            "Follow enquiries, provider responses, consent-aware contact handoffs and eligible review activity in one place."
        DirektDestination.Account ->
            "Manage your identity, active sessions, consent and security preferences."
    }
    DirektMode.Provider -> when (appState.destination) {
        DirektDestination.Discover ->
            "See what needs attention, keep your services current and understand what customers can see."
        DirektDestination.Saved ->
            "Understand each requirement, track review progress and fix action-required items without exposing private evidence."
        DirektDestination.Enquiries ->
            "Respond to structured customer requests and keep tracked interactions moving."
        DirektDestination.Account ->
            "Manage your business profile, security and commercial settings while trust decisions remain independent."
    }
}
