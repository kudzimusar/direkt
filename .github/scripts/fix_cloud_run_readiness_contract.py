from pathlib import Path

path = Path('.github/workflows/cloud-run-development-deploy.yml')
text = path.read_text()
old = "          jq -e '.status == \"ready\"' \"${RUNNER_TEMP}/direkt-health.json\" >/dev/null"
new = "          jq -e '.status == \"ok\" and .database.status == \"ready\"' \"${RUNNER_TEMP}/direkt-health.json\" >/dev/null"
if text.count(old) != 1:
    raise SystemExit(f'Expected one stale readiness assertion; found {text.count(old)}')
path.write_text(text.replace(old, new))
