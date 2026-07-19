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
        val channel = version.getProperty("DIREKT_RELEASE_CHANNEL")?.trim()
            ?: error("DIREKT_RELEASE_CHANNEL is missing")
        val keys = listOf(
            "DIREKT_FORMAL_PHASE12_AUTHORIZED",
            "DIREKT_PRODUCTION_CLIENT_READY",
            "DIREKT_ACCOUNT_DELETION_READY",
            "DIREKT_PRODUCTION_OPERATIONS_READY",
            "DIREKT_PLAY_RELEASE_READY",
        )
        val values = keys.associateWith { key ->
            eligibility.getProperty(key)?.trim()
                ?: error("$key is missing from release/eligibility.properties")
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
            val blocked = values.filterValues { it != "true" }.keys
            require(blocked.isEmpty()) {
                "Release-capable packaging is blocked until all formal Phase 12 eligibility latches are true: ${blocked.joinToString()}"
            }
        }
    }
}

val verifyFormalReleaseEligibility = tasks.register<VerifyFormalReleaseEligibility>(
    "verifyFormalReleaseEligibility",
) {
    group = "verification"
    description = "Blocks release-capable packaging until all evidence-backed Phase 12 eligibility latches are satisfied."
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
