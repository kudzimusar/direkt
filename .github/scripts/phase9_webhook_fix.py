from pathlib import Path


e2e = Path("backend/direkt-api/test/e2e/commercial-lifecycle.e2e.spec.ts")
text = e2e.read_text()
text = text.replace("import { AppModule } from '../../src/app.module';\n", "")
old_bootstrap = """    process.env.PAYMENT_SYNTHETIC_WEBHOOK_SECRET = WEBHOOK_SECRET;
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();"""
new_bootstrap = """    process.env.PAYMENT_SYNTHETIC_WEBHOOK_SECRET = WEBHOOK_SECRET;
    await runMigrations(url);
    const { AppModule } = await import('../../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();"""
if old_bootstrap not in text:
    raise SystemExit("Commercial E2E bootstrap marker missing")
text = text.replace(old_bootstrap, new_bootstrap)
old_conflict = """    await sendWebhook(conflictingReplay).expect(409);

    const reversalPayload = {"""
new_conflict = """    await sendWebhook(conflictingReplay).expect(409);
    await expect(
      pool.query(
        `SELECT (commercial.record_webhook_receipt(
           'synthetic', $1, 'payment.reversed', $2, true, true, $3, now(), $4::jsonb
         )).id`,
        [
          successfulWebhookPayload.externalEventId,
          'f'.repeat(64),
          payment.paymentIntentId,
          JSON.stringify({
            targetStatus: 'reversed',
            amountMinor: 15000,
            currency: 'ZMW',
            reasonCode: 'SYNTHETIC_REVERSAL',
            policyVersion: 'phase9-e2e-v1',
            rawPayloadStored: false,
          }),
        ],
      ),
    ).rejects.toThrow(/different payload/i);

    const reversalPayload = {"""
if old_conflict not in text:
    raise SystemExit("Commercial conflicting replay marker missing")
e2e.write_text(text.replace(old_conflict, new_conflict))

repository = Path("backend/direkt-api/src/commercial/commercial.repository.ts")
text = repository.read_text()
old_metadata = """            amountMinor: dto.amountMinor,
            currency: dto.currency,
            rawPayloadStored: false,"""
new_metadata = """            amountMinor: dto.amountMinor,
            currency: dto.currency,
            reasonCode: dto.reasonCode,
            policyVersion: dto.policyVersion,
            rawPayloadStored: false,"""
if old_metadata not in text:
    raise SystemExit("Webhook safe metadata marker missing")
text = text.replace(old_metadata, new_metadata)
text = text.replace(
    "'PAYMENT_WEBHOOK_AMOUNT_MISMATCH',",
    "'PAYMENT_WEBHOOK_AMOUNT_OR_CURRENCY_MISMATCH',",
)
repository.write_text(text)
