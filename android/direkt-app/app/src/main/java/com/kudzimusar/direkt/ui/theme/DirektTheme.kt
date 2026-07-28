package com.kudzimusar.direkt.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

val DirektBlue = Color(0xFF2457F5)
val DirektBlueStrong = Color(0xFF173EB5)
val DirektBlueSoft = Color(0xFFEAF0FF)
val DirektIndigo = Color(0xFF5B45F5)
val DirektTeal = Color(0xFF0F927F)
val DirektTealSoft = Color(0xFFE3F7F3)
val DirektOrange = Color(0xFFF97316)
val DirektOrangeSoft = Color(0xFFFFF0E5)
val DirektAmber = Color(0xFFE99A00)
val DirektAmberSoft = Color(0xFFFFF4D8)
val DirektViolet = Color(0xFF7445E8)
val DirektVioletSoft = Color(0xFFF1EAFF)
val DirektSuccess = Color(0xFF087A63)
val DirektSuccessSoft = Color(0xFFE3F5EF)
val DirektDanger = Color(0xFFC9342C)
val DirektDangerSoft = Color(0xFFFDEBE9)
val DirektInk = Color(0xFF101B35)
val DirektBackground = Color(0xFFF7F9FC)
val DirektSurfaceSubtle = Color(0xFFF1F4F9)
val DirektOutline = Color(0xFFD7DFEA)
val DirektTextSecondary = Color(0xFF59667A)

private val LightColors = lightColorScheme(
    primary = DirektBlue,
    onPrimary = Color.White,
    primaryContainer = DirektBlueSoft,
    onPrimaryContainer = DirektInk,
    secondary = DirektTeal,
    onSecondary = Color.White,
    secondaryContainer = DirektTealSoft,
    onSecondaryContainer = DirektInk,
    tertiary = DirektOrange,
    onTertiary = Color.White,
    tertiaryContainer = DirektOrangeSoft,
    onTertiaryContainer = DirektInk,
    background = DirektBackground,
    onBackground = DirektInk,
    surface = Color.White,
    onSurface = DirektInk,
    surfaceVariant = DirektSurfaceSubtle,
    onSurfaceVariant = DirektTextSecondary,
    outline = DirektOutline,
    outlineVariant = Color(0xFFE7EBF2),
    error = DirektDanger,
    onError = Color.White,
    errorContainer = DirektDangerSoft,
    onErrorContainer = DirektInk,
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF9BB4FF),
    onPrimary = Color(0xFF06205F),
    primaryContainer = Color(0xFF21356C),
    onPrimaryContainer = Color(0xFFF2F5FA),
    secondary = Color(0xFF75D7C5),
    onSecondary = Color(0xFF063A32),
    secondaryContainer = Color(0xFF173F39),
    onSecondaryContainer = Color(0xFFF2F5FA),
    tertiary = Color(0xFFFFAE76),
    onTertiary = Color(0xFF522200),
    tertiaryContainer = Color(0xFF4A2D1E),
    onTertiaryContainer = Color(0xFFF2F5FA),
    background = Color(0xFF0D1320),
    onBackground = Color(0xFFF2F5FA),
    surface = Color(0xFF141C2B),
    onSurface = Color(0xFFF2F5FA),
    surfaceVariant = Color(0xFF202B3D),
    onSurfaceVariant = Color(0xFFC3CBD8),
    outline = Color(0xFF3A4658),
    outlineVariant = Color(0xFF2A3547),
    error = Color(0xFFFFB4AC),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF4A1E22),
    onErrorContainer = Color(0xFFFFDAD6),
)

private val DirektTypography = Typography(
    displaySmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 36.sp,
        lineHeight = 42.sp,
        letterSpacing = (-0.5).sp,
    ),
    headlineLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 30.sp,
        lineHeight = 36.sp,
        letterSpacing = (-0.3).sp,
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 26.sp,
        lineHeight = 32.sp,
        letterSpacing = (-0.2).sp,
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 18.sp,
        lineHeight = 24.sp,
    ),
    titleSmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 22.sp,
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 17.sp,
        lineHeight = 26.sp,
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
    ),
    bodySmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
    ),
    labelLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp,
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 13.sp,
        lineHeight = 18.sp,
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.7.sp,
    ),
)

private val DirektShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(20.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

@Composable
fun DirektTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = DirektTypography,
        shapes = DirektShapes,
        content = content,
    )
}
