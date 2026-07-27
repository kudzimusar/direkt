package com.kudzimusar.direkt.ui.discovery

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.Circle
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapUiSettings
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.rememberCameraPositionState
import com.google.maps.android.compose.rememberUpdatedMarkerState
import com.kudzimusar.direkt.BuildConfig
import kotlinx.coroutines.delay

@Composable
fun PrivacySafeMapCard(providers: List<SyntheticPublicProvider>) {
    var runtimeState by remember(BuildConfig.DIREKT_MAPS_ENABLED) {
        mutableStateOf(
            if (BuildConfig.DIREKT_MAPS_ENABLED) MapRuntimeState.Loading else MapRuntimeState.Disabled,
        )
    }

    LaunchedEffect(BuildConfig.DIREKT_MAPS_ENABLED) {
        if (BuildConfig.DIREKT_MAPS_ENABLED) {
            delay(15_000)
            if (runtimeState == MapRuntimeState.Loading) {
                runtimeState = MapRuntimeState.Failed
            }
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("discovery-map-card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(9.dp),
        ) {
            Text(
                "MAP",
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(
                "Privacy-safe map preview",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                "Only consented public premises and published service areas are shown. Private provider bases never become markers.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            if (runtimeState == MapRuntimeState.Disabled || runtimeState == MapRuntimeState.Failed) {
                MapFallback(runtimeState = runtimeState, providers = providers)
            } else {
                val cameraPositionState = rememberCameraPositionState {
                    position = CameraPosition.fromLatLngZoom(LatLng(-15.4167, 28.3000), 11f)
                }
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(320.dp)
                        .testTag("discovery-google-map"),
                ) {
                    GoogleMap(
                        modifier = Modifier.fillMaxSize(),
                        cameraPositionState = cameraPositionState,
                        properties = MapProperties(isMyLocationEnabled = false),
                        uiSettings = MapUiSettings(
                            myLocationButtonEnabled = false,
                            mapToolbarEnabled = false,
                            zoomControlsEnabled = true,
                        ),
                        onMapLoaded = { runtimeState = MapRuntimeState.Ready },
                    ) {
                        providers.forEach { provider ->
                            val area = provider.serviceAreaPreview
                            Circle(
                                center = LatLng(area.center.latitude, area.center.longitude),
                                radius = area.radiusKm * 1_000,
                                fillColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                                strokeColor = MaterialTheme.colorScheme.primary,
                            )
                            publicMapMarker(provider)?.let { premises ->
                                Marker(
                                    state = rememberUpdatedMarkerState(
                                        position = LatLng(premises.latitude, premises.longitude),
                                    ),
                                    title = provider.displayName,
                                    snippet = "Consented public premises in ${provider.locality}",
                                )
                            }
                        }
                    }
                    if (runtimeState == MapRuntimeState.Loading) {
                        Card(
                            modifier = Modifier
                                .align(Alignment.TopCenter)
                                .padding(12.dp)
                                .testTag("discovery-map-loading"),
                        ) {
                            Text(
                                "Loading privacy-safe map…",
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                style = MaterialTheme.typography.bodySmall,
                            )
                        }
                    }
                }
                if (runtimeState == MapRuntimeState.Ready) {
                    Text(
                        "Map loaded. List view remains the accessible and low-bandwidth equivalent.",
                        modifier = Modifier.testTag("discovery-map-ready"),
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
                PublicMapTextEquivalent(providers)
            }
        }
    }
}

@Composable
private fun MapFallback(
    runtimeState: MapRuntimeState,
    providers: List<SyntheticPublicProvider>,
) {
    Text(
        mapFallbackMessage(runtimeState),
        modifier = Modifier.testTag("discovery-map-fallback"),
        style = MaterialTheme.typography.bodySmall,
        fontWeight = FontWeight.SemiBold,
    )
    PublicMapTextEquivalent(providers)
    Text(
        "Manual area and list discovery remain fully available without location permission.",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}

@Composable
private fun PublicMapTextEquivalent(providers: List<SyntheticPublicProvider>) {
    providers.forEach { provider ->
        val publication = if (publicMapMarker(provider) == null) {
            "published service area only"
        } else {
            "consented public premises plus published service area"
        }
        Text(
            "• ${provider.displayName} — $publication",
            modifier = Modifier.testTag("discovery-map-provider-${provider.publicId}"),
            style = MaterialTheme.typography.bodySmall,
        )
    }
}
