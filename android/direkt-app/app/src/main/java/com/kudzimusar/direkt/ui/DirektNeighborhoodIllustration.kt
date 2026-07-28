package com.kudzimusar.direkt.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import com.kudzimusar.direkt.ui.theme.DirektBlue
import com.kudzimusar.direkt.ui.theme.DirektIndigo
import com.kudzimusar.direkt.ui.theme.DirektOrange
import com.kudzimusar.direkt.ui.theme.DirektTeal
import com.kudzimusar.direkt.ui.theme.DirektViolet

/**
 * Public-safe decorative marketplace illustration.
 *
 * It represents no real provider, premises, checked location or private
 * coordinate and is deliberately excluded from accessibility semantics by its
 * callers.
 */
@Composable
fun DirektNeighborhoodIllustration(
    modifier: Modifier = Modifier,
) {
    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1.42f),
    ) {
        val w = size.width
        val h = size.height

        drawOval(
            brush = Brush.horizontalGradient(
                listOf(Color(0xFFFFEFA8), Color(0xFFE8F7C8), Color(0xFFBFF4E7)),
            ),
            topLeft = Offset(w * 0.05f, h * 0.75f),
            size = Size(w * 0.9f, h * 0.22f),
        )

        val buildingColors = listOf(
            Color(0xFFFFB778),
            Color(0xFF83B9FF),
            Color(0xFFC783F7),
            Color(0xFFA990F7),
        )
        val buildingX = listOf(0.19f, 0.31f, 0.45f, 0.61f)
        val buildingTop = listOf(0.38f, 0.29f, 0.16f, 0.35f)
        val buildingWidth = listOf(0.12f, 0.14f, 0.15f, 0.11f)
        buildingX.indices.forEach { index ->
            drawRoundRect(
                color = buildingColors[index].copy(alpha = 0.78f),
                topLeft = Offset(w * buildingX[index], h * buildingTop[index]),
                size = Size(w * buildingWidth[index], h * (0.75f - buildingTop[index])),
                cornerRadius = CornerRadius(w * 0.018f),
            )
        }

        val roof = Path().apply {
            moveTo(w * 0.28f, h * 0.66f)
            lineTo(w * 0.52f, h * 0.42f)
            lineTo(w * 0.78f, h * 0.67f)
            lineTo(w * 0.72f, h * 0.74f)
            lineTo(w * 0.52f, h * 0.55f)
            lineTo(w * 0.33f, h * 0.74f)
            close()
        }
        drawPath(
            path = roof,
            brush = Brush.linearGradient(listOf(DirektBlue, DirektIndigo)),
        )
        drawRoundRect(
            color = Color.White,
            topLeft = Offset(w * 0.33f, h * 0.66f),
            size = Size(w * 0.39f, h * 0.25f),
            cornerRadius = CornerRadius(w * 0.012f),
        )
        drawRoundRect(
            color = Color(0xFF0A77E8),
            topLeft = Offset(w * 0.48f, h * 0.76f),
            size = Size(w * 0.1f, h * 0.15f),
            cornerRadius = CornerRadius(w * 0.008f),
        )
        drawRoundRect(
            color = Color(0xFF80C8FF),
            topLeft = Offset(w * 0.37f, h * 0.73f),
            size = Size(w * 0.055f, h * 0.08f),
            cornerRadius = CornerRadius(w * 0.008f),
        )
        drawRoundRect(
            color = Color(0xFF80C8FF),
            topLeft = Offset(w * 0.63f, h * 0.73f),
            size = Size(w * 0.055f, h * 0.08f),
            cornerRadius = CornerRadius(w * 0.008f),
        )

        drawCircle(color = Color(0xFF86D320), radius = w * 0.055f, center = Offset(w * 0.2f, h * 0.76f))
        drawCircle(color = Color(0xFF70C917), radius = w * 0.045f, center = Offset(w * 0.16f, h * 0.82f))
        drawCircle(color = Color(0xFF9ADE28), radius = w * 0.046f, center = Offset(w * 0.24f, h * 0.82f))
        drawLine(
            color = Color(0xFF5B8C30),
            start = Offset(w * 0.2f, h * 0.79f),
            end = Offset(w * 0.2f, h * 0.91f),
            strokeWidth = w * 0.018f,
        )

        val pin = Path().apply {
            moveTo(w * 0.85f, h * 0.26f)
            cubicTo(w * 0.75f, h * 0.26f, w * 0.7f, h * 0.34f, w * 0.7f, h * 0.43f)
            cubicTo(w * 0.7f, h * 0.56f, w * 0.85f, h * 0.72f, w * 0.85f, h * 0.72f)
            cubicTo(w * 0.85f, h * 0.72f, w, h * 0.56f, w, h * 0.43f)
            cubicTo(w, h * 0.34f, w * 0.95f, h * 0.26f, w * 0.85f, h * 0.26f)
            close()
        }
        drawPath(
            path = pin,
            brush = Brush.linearGradient(listOf(DirektOrange, Color(0xFFF04438))),
        )
        drawCircle(
            color = Color.White,
            radius = w * 0.045f,
            center = Offset(w * 0.85f, h * 0.43f),
        )

        drawCircle(
            color = DirektTeal.copy(alpha = 0.16f),
            radius = w * 0.025f,
            center = Offset(w * 0.08f, h * 0.22f),
            style = Stroke(width = w * 0.008f),
        )
        drawCircle(
            color = DirektViolet.copy(alpha = 0.16f),
            radius = w * 0.035f,
            center = Offset(w * 0.58f, h * 0.08f),
        )
    }
}
