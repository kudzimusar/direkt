from pathlib import Path

path = Path("backend/direkt-api/test/e2e/commercial-lifecycle.e2e.spec.ts")
text = path.read_text()
old = "mismatchCode: 'PAYMENT_WEBHOOK_AMOUNT_MISMATCH',"
new = "mismatchCode: 'PAYMENT_WEBHOOK_AMOUNT_OR_CURRENCY_MISMATCH',"
if text.count(old) != 1:
    raise SystemExit("Expected one stale webhook mismatch assertion")
path.write_text(text.replace(old, new))
