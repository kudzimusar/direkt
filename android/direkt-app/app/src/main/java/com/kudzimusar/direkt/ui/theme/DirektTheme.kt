package com.kudzimusar.direkt.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DirektGreen = Color(0xFF087A55)
private val DirektGreenDark = Color(0xFF00513A)
private val DirektMint = Color(0xFFD9F5E9)
private val DirektInk = Color(0xFF16211C)
private val DirektSurface = Color(0xFFF8FAF9)
private val DirektAmber = Color(0xFFF2A900)

private val LightColors = lightColorScheme(
    primary = DirektGreen,
    onPrimary = Color.White,
    primaryContainer = DirektMint,
    onPrimaryContainer = DirektGreenDark,
    secondary = Color(0xFF3E6255),
    tertiary = DirektAmber,
    background = DirektSurface,
    onBackground = DirektInk,
    surface = Color.White,
    onSurface = DirektInk,
    error = Color(0xFFBA1A1A),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF71D7AE),
    onPrimary = Color(0xFF003828),
    primaryContainer = DirektGreenDark,
    onPrimaryContainer = Color(0xFFA0F4D0),
    secondary = Color(0xFFA5CCBC),
    tertiary = Color(0xFFFFC94A),
    background = Color(0xFF101512),
    onBackground = Color(0xFFE0E4E1),
    surface = Color(0xFF171D19),
    onSurface = Color(0xFFE0E4E1),
)

@Composable
fun DirektTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content,
    )
}
