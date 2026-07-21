package com.kudzimusar.direkt.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp

@Composable
fun DirektNavigationIcon(
    destination: DirektDestination,
    modifier: Modifier = Modifier,
) {
    val color = LocalContentColor.current
    Canvas(modifier = modifier.size(24.dp)) {
        val stroke = size.minDimension * 0.075f
        when (destination) {
            DirektDestination.Discover -> {
                val roof = Path().apply {
                    moveTo(size.width * 0.15f, size.height * 0.45f)
                    lineTo(size.width * 0.5f, size.height * 0.16f)
                    lineTo(size.width * 0.85f, size.height * 0.45f)
                }
                drawPath(roof, color = color, style = Stroke(width = stroke, cap = StrokeCap.Round))
                drawRoundRect(
                    color = color,
                    topLeft = Offset(size.width * 0.25f, size.height * 0.4f),
                    size = Size(size.width * 0.5f, size.height * 0.43f),
                    cornerRadius = CornerRadius(size.width * 0.05f),
                    style = Stroke(width = stroke),
                )
            }

            DirektDestination.Saved -> {
                val bookmark = Path().apply {
                    moveTo(size.width * 0.27f, size.height * 0.14f)
                    lineTo(size.width * 0.73f, size.height * 0.14f)
                    lineTo(size.width * 0.73f, size.height * 0.84f)
                    lineTo(size.width * 0.5f, size.height * 0.67f)
                    lineTo(size.width * 0.27f, size.height * 0.84f)
                    close()
                }
                drawPath(bookmark, color = color, style = Stroke(width = stroke, cap = StrokeCap.Round))
            }

            DirektDestination.Enquiries -> {
                drawRoundRect(
                    color = color,
                    topLeft = Offset(size.width * 0.12f, size.height * 0.18f),
                    size = Size(size.width * 0.76f, size.height * 0.52f),
                    cornerRadius = CornerRadius(size.width * 0.1f),
                    style = Stroke(width = stroke),
                )
                drawLine(
                    color = color,
                    start = Offset(size.width * 0.3f, size.height * 0.76f),
                    end = Offset(size.width * 0.44f, size.height * 0.68f),
                    strokeWidth = stroke,
                    cap = StrokeCap.Round,
                )
                drawLine(
                    color = color,
                    start = Offset(size.width * 0.31f, size.height * 0.38f),
                    end = Offset(size.width * 0.69f, size.height * 0.38f),
                    strokeWidth = stroke,
                    cap = StrokeCap.Round,
                )
                drawLine(
                    color = color,
                    start = Offset(size.width * 0.31f, size.height * 0.52f),
                    end = Offset(size.width * 0.58f, size.height * 0.52f),
                    strokeWidth = stroke,
                    cap = StrokeCap.Round,
                )
            }

            DirektDestination.Account -> {
                drawCircle(
                    color = color,
                    radius = size.minDimension * 0.16f,
                    center = Offset(size.width * 0.5f, size.height * 0.32f),
                    style = Stroke(width = stroke),
                )
                val shoulders = Path().apply {
                    moveTo(size.width * 0.2f, size.height * 0.82f)
                    quadraticTo(
                        size.width * 0.24f,
                        size.height * 0.58f,
                        size.width * 0.5f,
                        size.height * 0.58f,
                    )
                    quadraticTo(
                        size.width * 0.76f,
                        size.height * 0.58f,
                        size.width * 0.8f,
                        size.height * 0.82f,
                    )
                }
                drawPath(shoulders, color = color, style = Stroke(width = stroke, cap = StrokeCap.Round))
            }
        }
    }
}
