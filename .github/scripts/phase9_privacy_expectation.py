from pathlib import Path

path = Path("backend/direkt-api/test/e2e/commercial-lifecycle.e2e.spec.ts")
text = path.read_text()
old = "    expect(serialized).not.toContain('customerContact');"
new = """    expect(serialized).not.toContain('phase9-owner@example.invalid');
    expect(serialized).not.toContain('phase9-other-owner@example.invalid');"""
if text.count(old) != 1:
    raise SystemExit("Expected one overbroad customer-contact assertion")
path.write_text(text.replace(old, new))
