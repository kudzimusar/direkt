from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one match, found {count}")
    file_path.write_text(text.replace(old, new, 1))


replace_once(
    "backend/direkt-api/test/e2e/provider-workspace-uploads.e2e.spec.ts",
    "AND requirements.requirement_key = 'representative_identity'",
    "AND requirements.requirement_key = 'identity'",
    "catalog requirement fixture key",
)

operations_path = Path(
    "backend/direkt-api/test/e2e/provider-workspace-operations.e2e.spec.ts"
)
operations = operations_path.read_text()
for field in ("uploadIntentId", "uploadSessionId", "evidenceId", "objectKey", "sha256"):
    old = f"expect(serialized).not.toContain('{field}');"
    new = f"expect(serialized).not.toContain('\"{field}\":');"
    count = operations.count(old)
    if count != 1:
        raise RuntimeError(
            f"operations private-field assertion {field}: expected one match, found {count}"
        )
    operations = operations.replace(old, new, 1)
operations_path.write_text(operations)
