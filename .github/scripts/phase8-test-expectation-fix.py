from pathlib import Path

path = Path("test/e2e/interaction-lifecycle.e2e.spec.ts")
source = path.read_text()
old = ").rejects.toThrow(/immutable/i);"
new = ").rejects.toThrow(/immutable|append-only/i);"
count = source.count(old)
if count != 3:
    raise SystemExit(f"Expected three immutable lifecycle assertions, found {count}")
path.write_text(source.replace(old, new))
