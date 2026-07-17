package com.kudzimusar.direkt.ui.commercial

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

enum class CommercialSubscriptionPreviewState(val label: String) {
    Pending("Pending activation"),
    Active("Active"),
    Grace("Grace period"),
    PastDue("Past due"),
    Cancelled("Cancelled"),
}

@Composable
fun ProviderCommercialExperience() {
    val context = LocalContext.current
    val store = remember(context.applicationContext) {
        CommercialPaymentDraftStore(
            SharedPreferencesCommercialPaymentDraftPersistence(context.applicationContext),
        )
    }
    var paymentDraft by remember { mutableStateOf(store.current()) }
    var subscriptionState by remember {
        mutableStateOf(CommercialSubscriptionPreviewState.Pending)
    }
    var subscriptionRevision by remember { mutableStateOf(1) }
    var invoiceStatus by remember { mutableStateOf("Open") }
    var invoiceRevision by remember { mutableStateOf(1) }

    Column(
        modifier = Modifier
            .testTag("phase9-commercial-workspace")
            .semantics {
                contentDescription =
                    "Provider products, subscription, invoices, synthetic payment and receipt recovery"
            },
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        CommercialCard(modifier = Modifier.testTag("phase9-product")) {
            Text(
                text = "Commercial workspace",
                modifier = Modifier.semantics { heading() },
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(6.dp))
            Text("Provider workspace core", fontWeight = FontWeight.Bold)
            Text("ZMW 150.00 monthly · synthetic catalogue")
            Text("Workspace tools, invoice history and non-ranking productivity summaries.")
            BoundaryText(
                "A subscription never creates verification, publication, discovery ranking or review preference.",
            )
        }

        CommercialCard(
            modifier = Modifier
                .testTag("phase9-subscription")
                .semantics {
                    contentDescription =
                        "Subscription ${subscriptionState.label}, revision $subscriptionRevision"
                },
        ) {
            Text("Subscription and entitlements", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            CommercialStatus("${subscriptionState.label} · revision $subscriptionRevision")
            Text(entitlementSummary(subscriptionState))
            Spacer(Modifier.height(8.dp))
            when (subscriptionState) {
                CommercialSubscriptionPreviewState.Pending -> Button(
                    modifier = Modifier.testTag("phase9-activate-subscription"),
                    onClick = {
                        subscriptionState = CommercialSubscriptionPreviewState.Active
                        subscriptionRevision += 1
                    },
                ) { Text("Confirm synthetic payment") }

                CommercialSubscriptionPreviewState.Active -> Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    OutlinedButton(
                        modifier = Modifier.testTag("phase9-start-grace"),
                        onClick = {
                            subscriptionState = CommercialSubscriptionPreviewState.Grace
                            subscriptionRevision += 1
                        },
                    ) { Text("Start grace") }
                    OutlinedButton(
                        modifier = Modifier.testTag("phase9-cancel-subscription"),
                        onClick = {
                            subscriptionState = CommercialSubscriptionPreviewState.Cancelled
                            subscriptionRevision += 1
                        },
                    ) { Text("Cancel") }
                }

                CommercialSubscriptionPreviewState.Grace -> Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Button(
                        modifier = Modifier.testTag("phase9-recover-subscription"),
                        onClick = {
                            subscriptionState = CommercialSubscriptionPreviewState.Active
                            subscriptionRevision += 1
                        },
                    ) { Text("Recover") }
                    OutlinedButton(
                        modifier = Modifier.testTag("phase9-mark-past-due"),
                        onClick = {
                            subscriptionState = CommercialSubscriptionPreviewState.PastDue
                            subscriptionRevision += 1
                        },
                    ) { Text("End grace") }
                }

                CommercialSubscriptionPreviewState.PastDue -> Button(
                    modifier = Modifier.testTag("phase9-recover-past-due"),
                    onClick = {
                        subscriptionState = CommercialSubscriptionPreviewState.Active
                        subscriptionRevision += 1
                    },
                ) { Text("Record recovery") }

                CommercialSubscriptionPreviewState.Cancelled -> Text(
                    "Cancelled access remains separate from provider suspension and trust state.",
                )
            }
        }

        CommercialCard(
            modifier = Modifier
                .testTag("phase9-invoice")
                .semantics {
                    contentDescription = "Synthetic invoice $invoiceStatus, revision $invoiceRevision"
                },
        ) {
            Text("Invoice SYN-20260717-DEMO0001", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            CommercialStatus("$invoiceStatus · revision $invoiceRevision")
            Text("Provider workspace core")
            Text("1 × ZMW 150.00 · total ZMW 150.00")
            BoundaryText(
                "Minor-unit line values are immutable. No card, PIN, phone number or account credential is stored.",
            )
        }

        PaymentRecoveryCard(
            snapshot = paymentDraft,
            onPrepare = {
                paymentDraft = store.prepareOffline(
                    invoiceId = "00000000-0000-4000-8000-000000009901",
                    currency = "ZMW",
                    amountMinor = 15_000,
                    expectedRevision = 1,
                )
            },
            onInitiate = { paymentDraft = store.startInitiation() },
            onInterrupt = { paymentDraft = store.markRetryable("NETWORK_INTERRUPTED") },
            onRequiresAction = { paymentDraft = store.markRequiresAction(serverRevision = 1) },
            onProcessing = { paymentDraft = store.markProcessing() },
            onFail = { paymentDraft = store.markFailed("SYNTHETIC_PROVIDER_DECLINED") },
            onSucceed = {
                paymentDraft = store.markSucceeded(serverRevision = 2)
                invoiceStatus = "Paid"
                invoiceRevision += 1
                subscriptionState = CommercialSubscriptionPreviewState.Active
                subscriptionRevision += 1
            },
            onReverse = {
                paymentDraft = store.markReversed(serverRevision = 3)
                invoiceStatus = "Open"
                invoiceRevision += 1
                subscriptionState = CommercialSubscriptionPreviewState.Grace
                subscriptionRevision += 1
            },
            onCancel = { paymentDraft = store.markCancelled(serverRevision = 2) },
            onExpire = { paymentDraft = store.markExpired(serverRevision = 2) },
            onStale = { paymentDraft = store.markStaleRevision(currentRevision = 2) },
            onRefresh = { paymentDraft = store.refreshRevision(currentRevision = 2) },
            onReset = { paymentDraft = store.reset() },
        )

        CommercialCard(modifier = Modifier.testTag("phase9-critical-states")) {
            Text("Critical recovery states", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            Text("Offline draft · duplicate replay · stale revision · failed signature")
            Text("Grace · past due · cancelled · expired · reversed · reconciliation mismatch")
            BoundaryText(
                "The backend remains authoritative. Android preserves retry identity, not payment credentials.",
            )
        }
    }
}

@Composable
private fun PaymentRecoveryCard(
    snapshot: CommercialPaymentDraftSnapshot,
    onPrepare: () -> Unit,
    onInitiate: () -> Unit,
    onInterrupt: () -> Unit,
    onRequiresAction: () -> Unit,
    onProcessing: () -> Unit,
    onFail: () -> Unit,
    onSucceed: () -> Unit,
    onReverse: () -> Unit,
    onCancel: () -> Unit,
    onExpire: () -> Unit,
    onStale: () -> Unit,
    onRefresh: () -> Unit,
    onReset: () -> Unit,
) {
    CommercialCard(
        modifier = Modifier
            .testTag("phase9-payment-draft")
            .semantics {
                contentDescription =
                    "Commercial payment ${snapshot.state.label}, attempt ${snapshot.attemptCount}"
            },
    ) {
        Text("Low-bandwidth payment recovery", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(6.dp))
        CommercialStatus(snapshot.state.label)
        snapshot.logicalRequestId?.let { Text("Retry-safe request ${it.take(8)}…") }
        snapshot.invoiceId?.let { Text("Opaque invoice ${it.takeLast(8)}") }
        if (snapshot.amountMinor > 0) {
            Text("${snapshot.currency} ${formatMinor(snapshot.amountMinor)}")
        }
        snapshot.expectedRevision?.let { Text("Expected revision: $it") }
        snapshot.lastErrorCode?.let { Text("Recovery code: $it") }
        Spacer(Modifier.height(8.dp))

        when (snapshot.state) {
            CommercialPaymentDraftState.Empty -> Button(
                modifier = Modifier.testTag("phase9-prepare-payment"),
                onClick = onPrepare,
            ) { Text("Prepare synthetic payment offline") }

            CommercialPaymentDraftState.PreparedOffline,
            CommercialPaymentDraftState.Retryable,
            CommercialPaymentDraftState.Failed,
            -> Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    modifier = Modifier.testTag("phase9-initiate-payment"),
                    onClick = onInitiate,
                ) { Text("Initiate with same request ID") }
                OutlinedButton(
                    modifier = Modifier.testTag("phase9-stale-payment"),
                    onClick = onStale,
                ) { Text("Simulate stale revision") }
            }

            CommercialPaymentDraftState.Initiating -> Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Button(
                    modifier = Modifier.testTag("phase9-requires-action"),
                    onClick = onRequiresAction,
                ) { Text("Require action") }
                OutlinedButton(
                    modifier = Modifier.testTag("phase9-interrupt-payment"),
                    onClick = onInterrupt,
                ) { Text("Interrupt") }
            }

            CommercialPaymentDraftState.StaleRevision -> Button(
                modifier = Modifier.testTag("phase9-refresh-payment"),
                onClick = onRefresh,
            ) { Text("Refresh backend revision") }

            CommercialPaymentDraftState.RequiresAction -> Column(
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Button(
                    modifier = Modifier.testTag("phase9-process-payment"),
                    onClick = onProcessing,
                ) { Text("Process synthetic action") }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = onFail) { Text("Fail") }
                    OutlinedButton(onClick = onCancel) { Text("Cancel") }
                    OutlinedButton(onClick = onExpire) { Text("Expire") }
                }
            }

            CommercialPaymentDraftState.Processing -> Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Button(
                    modifier = Modifier.testTag("phase9-succeed-payment"),
                    onClick = onSucceed,
                ) { Text("Confirm success") }
                OutlinedButton(onClick = onInterrupt) { Text("Interrupt") }
            }

            CommercialPaymentDraftState.Succeeded -> Column(
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text("Backend-confirmed receipt is available.")
                OutlinedButton(
                    modifier = Modifier.testTag("phase9-reverse-payment"),
                    onClick = onReverse,
                ) { Text("Record synthetic reversal") }
            }

            CommercialPaymentDraftState.Reversed,
            CommercialPaymentDraftState.Cancelled,
            CommercialPaymentDraftState.Expired,
            -> OutlinedButton(
                modifier = Modifier.testTag("phase9-reset-payment"),
                onClick = onReset,
            ) { Text("Start another payment") }
        }

        Spacer(Modifier.height(8.dp))
        BoundaryText(
            "Synthetic mode never moves money. Signed backend events, invoice totals and ledger reconciliation remain authoritative.",
        )
    }
}

@Composable
private fun CommercialCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
            content = content,
        )
    }
}

@Composable
private fun CommercialStatus(label: String) {
    AssistChip(onClick = {}, label = { Text(label) })
}

@Composable
private fun BoundaryText(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}

private fun entitlementSummary(state: CommercialSubscriptionPreviewState): String = when (state) {
    CommercialSubscriptionPreviewState.Pending -> "Entitlements remain suspended until payment succeeds."
    CommercialSubscriptionPreviewState.Active -> "Workspace, invoice history and productivity entitlements are active."
    CommercialSubscriptionPreviewState.Grace -> "Entitlements are limited until the seven-day grace window ends."
    CommercialSubscriptionPreviewState.PastDue -> "Commercial entitlements are suspended; trust and publication are unchanged."
    CommercialSubscriptionPreviewState.Cancelled -> "Commercial entitlements are revoked; provider trust records remain intact."
}

private fun formatMinor(amountMinor: Long): String = "%d.%02d".format(
    amountMinor / 100,
    amountMinor % 100,
)
