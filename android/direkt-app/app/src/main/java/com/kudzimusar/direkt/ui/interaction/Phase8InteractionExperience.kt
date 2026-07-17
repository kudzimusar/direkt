package com.kudzimusar.direkt.ui.interaction

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

enum class SyntheticEnquiryStatus(val label: String) {
    Received("Received"),
    Acknowledged("Acknowledged"),
    NeedsInformation("Needs information"),
    Accepted("Accepted"),
    Declined("Declined"),
    Closed("Closed"),
}

data class SyntheticInteractionEvent(
    val sequence: Int,
    val label: String,
    val detail: String,
)

data class SyntheticCustomerInteraction(
    val providerDisplayName: String,
    val categoryName: String,
    val enquiryStatus: SyntheticEnquiryStatus,
    val enquiryRevision: Int,
    val maskedContactHint: String,
    val handoffChannel: String,
    val handoffExpiresLabel: String,
    val reviewEligible: Boolean,
    val moderationStatus: String,
    val events: List<SyntheticInteractionEvent>,
)

val syntheticCustomerInteraction = SyntheticCustomerInteraction(
    providerDisplayName = "Synthetic Copperbelt Repairs",
    categoryName = "Plumbing",
    enquiryStatus = SyntheticEnquiryStatus.Accepted,
    enquiryRevision = 3,
    maskedContactHint = "+260 ••• •• 104",
    handoffChannel = "WhatsApp",
    handoffExpiresLabel = "Expires in 23 hours",
    reviewEligible = true,
    moderationStatus = "Withheld · appeal available",
    events = listOf(
        SyntheticInteractionEvent(1, "Enquiry received", "A bounded service brief was recorded."),
        SyntheticInteractionEvent(2, "Provider accepted", "A tracked interaction was opened."),
        SyntheticInteractionEvent(3, "Consent granted", "A 24-hour WhatsApp handoff was created."),
        SyntheticInteractionEvent(4, "Interaction closed", "The deterministic review window opened."),
    ),
)

@Composable
fun CustomerInteractionExperience(
    interaction: SyntheticCustomerInteraction = syntheticCustomerInteraction,
) {
    val context = LocalContext.current
    val store = remember(context.applicationContext) {
        InteractionDraftStore(
            SharedPreferencesInteractionDraftPersistence(context.applicationContext),
        )
    }
    var draft by remember { mutableStateOf(store.current()) }
    var handoffRevoked by remember { mutableStateOf(false) }
    var appealSubmitted by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .testTag("phase8-customer-interactions")
            .semantics {
                contentDescription = "Customer enquiries, contact consent, history, reviews and appeals"
            },
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        InteractionCard {
            Text(
                "Tracked customer interaction",
                modifier = Modifier.semantics { heading() },
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(6.dp))
            Text(interaction.providerDisplayName, fontWeight = FontWeight.Bold)
            Text("${interaction.categoryName} · revision ${interaction.enquiryRevision}")
            StatusLabel(interaction.enquiryStatus.label)
            Text(
                "The provider, publication and category are resolved by the API. This screen cannot redirect scope.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        OfflineDraftCard(
            snapshot = draft,
            onSave = {
                draft = store.saveOffline(
                    serviceSummary = "A synthetic leaking kitchen tap needs a bounded plumbing assessment this week.",
                    localitySummary = "Woodlands, Lusaka",
                    preferredChannel = "whatsapp",
                )
            },
            onSend = { draft = store.startSend() },
            onInterrupt = { draft = store.markRetryable("NETWORK_INTERRUPTED") },
            onSubmit = { draft = store.markSubmitted(serverRevision = 1) },
            onStale = { draft = store.markStaleRevision(expectedRevision = 3) },
            onRefresh = { draft = store.refreshRevision(currentRevision = 4) },
            onExpireConsent = { draft = store.markConsentExpired() },
            onRenewConsent = { draft = store.renewConsent() },
            onReset = { draft = store.reset() },
        )

        InteractionCard(
            modifier = Modifier
                .testTag("phase8-handoff-consent")
                .semantics {
                    contentDescription = if (handoffRevoked) {
                        "WhatsApp consent revoked; provider contact access denied"
                    } else {
                        "WhatsApp consent active; masked contact ${interaction.maskedContactHint}"
                    }
                },
        ) {
            Text("Contact handoff consent", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            if (handoffRevoked) {
                StatusLabel("Revoked")
                Text("The provider can no longer retrieve the masked handoff.")
                Button(
                    modifier = Modifier.testTag("phase8-renew-handoff"),
                    onClick = { handoffRevoked = false },
                ) {
                    Text("Grant new 24-hour consent")
                }
            } else {
                Text("${interaction.handoffChannel} · ${interaction.maskedContactHint}")
                Text(interaction.handoffExpiresLabel)
                Text("External call or message delivery is disabled in Phase 8.")
                OutlinedButton(
                    modifier = Modifier.testTag("phase8-revoke-handoff"),
                    onClick = { handoffRevoked = true },
                ) {
                    Text("Revoke consent")
                }
            }
        }

        InteractionCard(modifier = Modifier.testTag("phase8-interaction-history")) {
            Text("Private interaction history", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            interaction.events.forEach { event ->
                Text("${event.sequence}. ${event.label}", fontWeight = FontWeight.SemiBold)
                Text(event.detail, style = MaterialTheme.typography.bodySmall)
                Spacer(Modifier.height(6.dp))
            }
            Text(
                "Actor identifiers, raw contact data, evidence and internal moderation rationale are excluded.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        InteractionCard(modifier = Modifier.testTag("phase8-review-appeal")) {
            Text("Review and appeal", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            StatusLabel(if (interaction.reviewEligible) "Eligible" else "Not eligible")
            Text("Moderation: ${if (appealSubmitted) "Appealed · awaiting decision" else interaction.moderationStatus}")
            Text("One active review is allowed for this completed tracked interaction.")
            Button(
                modifier = Modifier.testTag("phase8-submit-appeal"),
                enabled = !appealSubmitted,
                onClick = { appealSubmitted = true },
            ) {
                Text(if (appealSubmitted) "Appeal submitted" else "Submit bounded appeal")
            }
        }

        CriticalInteractionStates()
        InteractionTrustBoundary()
    }
}

@Composable
private fun OfflineDraftCard(
    snapshot: InteractionDraftSnapshot,
    onSave: () -> Unit,
    onSend: () -> Unit,
    onInterrupt: () -> Unit,
    onSubmit: () -> Unit,
    onStale: () -> Unit,
    onRefresh: () -> Unit,
    onExpireConsent: () -> Unit,
    onRenewConsent: () -> Unit,
    onReset: () -> Unit,
) {
    InteractionCard(
        modifier = Modifier
            .testTag("phase8-offline-draft")
            .semantics {
                contentDescription =
                    "Interaction draft ${snapshot.state.label}, attempt ${snapshot.attemptCount}"
            },
    ) {
        Text("Low-bandwidth enquiry draft", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(6.dp))
        StatusLabel(snapshot.state.label)
        snapshot.logicalRequestId?.let { Text("Retry-safe request ${it.take(8)}…") }
        if (snapshot.serviceSummary.isNotBlank()) {
            Text(snapshot.serviceSummary)
            Text(snapshot.localitySummary, style = MaterialTheme.typography.bodySmall)
        }
        snapshot.lastErrorCode?.let { Text("Recovery code: $it") }
        snapshot.expectedRevision?.let { Text("Expected revision: $it") }
        Spacer(Modifier.height(8.dp))

        when (snapshot.state) {
            InteractionDraftState.Empty -> Button(
                modifier = Modifier.testTag("phase8-save-offline"),
                onClick = onSave,
            ) { Text("Save synthetic draft offline") }

            InteractionDraftState.OfflineDraft,
            InteractionDraftState.Retryable,
            -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    modifier = Modifier.testTag("phase8-send-draft"),
                    onClick = onSend,
                ) { Text("Send") }
                OutlinedButton(onClick = onStale) { Text("Simulate stale") }
                OutlinedButton(onClick = onExpireConsent) { Text("Expire consent") }
            }

            InteractionDraftState.Sending -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    modifier = Modifier.testTag("phase8-complete-send"),
                    onClick = onSubmit,
                ) { Text("Complete") }
                OutlinedButton(
                    modifier = Modifier.testTag("phase8-interrupt-send"),
                    onClick = onInterrupt,
                ) { Text("Interrupt") }
            }

            InteractionDraftState.StaleRevision -> Button(
                modifier = Modifier.testTag("phase8-refresh-revision"),
                onClick = onRefresh,
            ) { Text("Refresh current revision") }

            InteractionDraftState.ConsentExpired -> Button(
                modifier = Modifier.testTag("phase8-renew-consent"),
                onClick = onRenewConsent,
            ) { Text("Renew channel consent") }

            InteractionDraftState.Submitted -> OutlinedButton(
                modifier = Modifier.testTag("phase8-reset-draft"),
                onClick = onReset,
            ) { Text("Start another enquiry") }
        }
    }
}

@Composable
fun ProviderInteractionExperience() {
    var status by remember { mutableStateOf(SyntheticEnquiryStatus.Received) }
    var revision by remember { mutableStateOf(1) }
    var responseSubmitted by remember { mutableStateOf(false) }
    var providerAppealSubmitted by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .testTag("phase8-provider-interactions")
            .semantics {
                contentDescription = "Provider enquiry inbox and review response workspace"
            },
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        InteractionCard {
            Text(
                "Provider enquiry inbox",
                modifier = Modifier.semantics { heading() },
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(6.dp))
            Text("Synthetic kitchen tap assessment", fontWeight = FontWeight.Bold)
            Text("Woodlands, Lusaka · within one week")
            StatusLabel("${status.label} · revision $revision")
            Text(
                "Customer identity and raw contact data are hidden until a current consent-scoped handoff exists.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        InteractionCard(modifier = Modifier.testTag("phase8-provider-transition-actions")) {
            Text("Concurrency-safe response", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            when (status) {
                SyntheticEnquiryStatus.Received -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        modifier = Modifier.testTag("phase8-provider-acknowledge"),
                        onClick = {
                            status = SyntheticEnquiryStatus.Acknowledged
                            revision += 1
                        },
                    ) { Text("Acknowledge") }
                    OutlinedButton(
                        modifier = Modifier.testTag("phase8-provider-needs-info"),
                        onClick = {
                            status = SyntheticEnquiryStatus.NeedsInformation
                            revision += 1
                        },
                    ) { Text("Needs information") }
                }

                SyntheticEnquiryStatus.Acknowledged,
                SyntheticEnquiryStatus.NeedsInformation,
                -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        modifier = Modifier.testTag("phase8-provider-accept"),
                        onClick = {
                            status = SyntheticEnquiryStatus.Accepted
                            revision += 1
                        },
                    ) { Text("Accept") }
                    OutlinedButton(
                        modifier = Modifier.testTag("phase8-provider-decline"),
                        onClick = {
                            status = SyntheticEnquiryStatus.Declined
                            revision += 1
                        },
                    ) { Text("Decline") }
                }

                SyntheticEnquiryStatus.Accepted -> Button(
                    modifier = Modifier.testTag("phase8-provider-close"),
                    onClick = {
                        status = SyntheticEnquiryStatus.Closed
                        revision += 1
                    },
                ) { Text("Close tracked interaction") }

                SyntheticEnquiryStatus.Declined,
                SyntheticEnquiryStatus.Closed,
                -> Text("Terminal enquiries reject repeated or stale transitions.")
            }
        }

        InteractionCard(modifier = Modifier.testTag("phase8-provider-handoff")) {
            Text("Current contact handoff", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            Text("WhatsApp · +260 ••• •• 104")
            Text("Synthetic only · expires in 23 hours · external delivery disabled")
        }

        InteractionCard(modifier = Modifier.testTag("phase8-provider-review-response")) {
            Text("Review response", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            StatusLabel(if (responseSubmitted) "Response submitted" else "Awaiting response")
            Text("One bounded provider response is permitted. It cannot change verification or ranking.")
            Button(
                modifier = Modifier.testTag("phase8-provider-submit-response"),
                enabled = !responseSubmitted,
                onClick = { responseSubmitted = true },
            ) {
                Text(if (responseSubmitted) "Response locked" else "Submit response")
            }
            Spacer(Modifier.height(8.dp))
            OutlinedButton(
                modifier = Modifier.testTag("phase8-provider-submit-appeal"),
                enabled = !providerAppealSubmitted,
                onClick = { providerAppealSubmitted = true },
            ) {
                Text(if (providerAppealSubmitted) "Appeal submitted" else "Appeal withheld review")
            }
        }

        CriticalInteractionStates()
        InteractionTrustBoundary()
    }
}

@Composable
private fun CriticalInteractionStates() {
    Column(
        modifier = Modifier.testTag("phase8-critical-states"),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text("Critical recoverable states", style = MaterialTheme.typography.titleMedium)
        StateCard("Offline draft", "Keep the logical request identifier and retry safely.")
        StateCard("Access denied", "Copied identifiers never grant customer or provider scope.")
        StateCard("Stale revision", "Refresh before retrying a lifecycle transition.")
        StateCard("Consent expired", "Do not reveal a contact hint until new consent is granted.")
        StateCard("Moderation pending", "Public output remains unavailable until published.")
        StateCard("Empty", "No enquiries or reviews is a valid, accessible state.")
    }
}

@Composable
private fun StateCard(title: String, detail: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(title, fontWeight = FontWeight.SemiBold)
            Text(detail, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun StatusLabel(label: String) {
    AssistChip(onClick = {}, label = { Text(label) })
}

@Composable
private fun InteractionTrustBoundary() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("phase8-interaction-trust-boundary"),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
        ),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("Stage 8 trust boundary", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text(
                "Interactions, reviews, responses, appeals and complaints cannot create verification claims, publication eligibility, paid ranking or payment state.",
            )
        }
    }
}

@Composable
private fun InteractionCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            content = { content() },
        )
    }
}
