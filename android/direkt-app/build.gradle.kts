import java.util.Properties
import org.gradle.api.DefaultTask
import org.gradle.api.file.RegularFileProperty
import org.gradle.api.tasks.InputFile
import org.gradle.api.tasks.PathSensitive
import org.gradle.api.tasks.PathSensitivity
import org.gradle.api.tasks.TaskAction

plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.compose) apply false
}

val formalEligibilityKeys = listOf(
    "DIREKT_FORMAL_PHASE12_AUTHORIZED",
    "DIREKT_PRODUCTION_CLIENT_READY",
    "DIREKT_ACCOUNT_DELETION_READY",
    "DIREKT_PRODUCTION_OPERATIONS_READY",
    "DIREKT_PLAY_RELEASE_READY",
)

fun parseTrackedProperties(text: String, source: String): Map<String, String> {
    val result = linkedMapOf<String, String>()
    text.lineSequence().forEachIndexed { index, raw ->
        val line = raw.trim()
        if (line.isEmpty() || line.startsWith("#")) return@forEachIndexed
        val separator = line.indexOf('=')
        require(separator > 0) { "Invalid property at $source:${index + 1}" }
        val key = line.substring(0, separator).trim()
        val value = line.substring(separator + 1).trim()
        require(key !in result) { "Duplicate property $key in $source" }
        result[key] = value
    }
    return result
}

fun validateFormalReleaseEligibility(
    version: Map<String, String>,
    eligibility: Map<String, String>,
) {
    val channel = version["DIREKT_RELEASE_CHANNEL"]
        ?: error("DIREKT_RELEASE_CHANNEL is missing")
    val values = formalEligibilityKeys.associateWith { key ->
        eligibility[key] ?: error("$key is missing from release/eligibility.properties")
    }
    values.forEach { (key, value) ->
        require(value == "true" || value == "false") {
            "$key must be exactly true or false"
        }
    }
    if (channel == "preauthorization") {
        require(values.values.all { it == "false" }) {
            "All formal release eligibility latches must remain false during preauthorization"
        }
    } else {
        require(channel == "release-candidate" || channel == "production") {
            "Unsupported DIREKT_RELEASE_CHANNEL '$channel'"
        }
        val blocked = values.filterValues { it != "true" }.keys
        require(blocked.isEmpty()) {
            "Release-capable source is blocked until all formal Phase 12 eligibility latches are true: ${blocked.joinToString()}"
        }
    }
}

// Non-excludable configuration-time boundary. This intentionally validates the tracked
// release channel and formal eligibility assertions while Gradle configures the build,
// before task exclusion (`-x`) can remove any verification task from the execution graph.
val trackedVersionText = providers.fileContents(
    layout.projectDirectory.file("release/version.properties"),
).asText.get()
val trackedEligibilityText = providers.fileContents(
    layout.projectDirectory.file("release/eligibility.properties"),
).asText.get()
validateFormalReleaseEligibility(
    parseTrackedProperties(trackedVersionText, "release/version.properties"),
    parseTrackedProperties(trackedEligibilityText, "release/eligibility.properties"),
)

abstract class VerifyFormalReleaseEligibility : DefaultTask() {
    @get:InputFile
    @get:PathSensitive(PathSensitivity.RELATIVE)
    abstract val versionFile: RegularFileProperty

    @get:InputFile
    @get:PathSensitive(PathSensitivity.RELATIVE)
    abstract val eligibilityFile: RegularFileProperty

    @TaskAction
    fun verify() {
        val version = Properties().apply {
            versionFile.get().asFile.inputStream().use(::load)
        }
        val eligibility = Properties().apply {
            eligibilityFile.get().asFile.inputStream().use(::load)
        }
        validateFormalReleaseEligibility(
            version.stringPropertyNames().associateWith { version.getProperty(it).trim() },
            eligibility.stringPropertyNames().associateWith { eligibility.getProperty(it).trim() },
        )
    }
}

val verifyFormalReleaseEligibility = tasks.register<VerifyFormalReleaseEligibility>(
    "verifyFormalReleaseEligibility",
) {
    group = "verification"
    description = "Revalidates evidence-backed Phase 12 eligibility before release-capable packaging."
    versionFile.set(layout.projectDirectory.file("release/version.properties"))
    eligibilityFile.set(layout.projectDirectory.file("release/eligibility.properties"))
}

subprojects {
    tasks.matching {
        it.name in setOf("bundleRelease", "assembleRelease", "packageReleaseBundle", "signReleaseBundle")
    }.configureEach {
        dependsOn(verifyFormalReleaseEligibility)
    }
}
