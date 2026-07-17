from pathlib import Path

path = Path("backend/direkt-api/test/e2e/commercial-lifecycle.e2e.spec.ts")
text = path.read_text()
marker = """    const adjustmentCreated = await request(httpServer())
      .post('/api/v1/operations/commercial/adjustments')"""
insert = """    const adjustmentFixtureClient = await pool.connect();
    let unrelatedPaymentIntentId: string;
    try {
      await adjustmentFixtureClient.query('BEGIN');
      await adjustmentFixtureClient.query(
        `SELECT set_config('direkt.commercial_write', 'on', true)`,
      );
      const unrelatedInvoice = await adjustmentFixtureClient.query<{ id: string }>(
        `INSERT INTO commercial.invoices (
           provider_id, subscription_id, invoice_number, status, currency,
           subtotal_minor, total_minor, due_at, policy_version
         ) VALUES (
           $1, NULL, 'SYN-20260717-ADJREF001', 'open', 'ZMW',
           15000, 15000, now() + interval '7 days', 'phase9-e2e-v1'
         ) RETURNING id`,
        [providerId],
      );
      const unrelatedInvoiceId = unrelatedInvoice.rows[0]?.id;
      if (!unrelatedInvoiceId) throw new Error('Unrelated adjustment invoice fixture was not created.');
      const unrelatedPayment = await adjustmentFixtureClient.query<{ id: string }>(
        `INSERT INTO commercial.payment_intents (
           provider_id, invoice_id, provider_key, external_reference, status,
           currency, amount_minor, idempotency_key_hash, request_fingerprint,
           created_by_identity_id, expires_at, policy_version
         ) VALUES (
           $1, $2, 'synthetic', 'SYN-PAY-ADJREF0001', 'requires_action',
           'ZMW', 15000, repeat('a', 64), repeat('b', 64),
           $3, now() + interval '30 minutes', 'phase9-e2e-v1'
         ) RETURNING id`,
        [providerId, unrelatedInvoiceId, owner.identityId],
      );
      unrelatedPaymentIntentId = unrelatedPayment.rows[0]?.id ?? '';
      if (!unrelatedPaymentIntentId) {
        throw new Error('Unrelated adjustment payment fixture was not created.');
      }
      await adjustmentFixtureClient.query('COMMIT');
    } catch (error) {
      await adjustmentFixtureClient.query('ROLLBACK');
      throw error;
    } finally {
      adjustmentFixtureClient.release();
    }

    await request(httpServer())
      .post('/api/v1/operations/commercial/adjustments')
      .set('authorization', `Bearer ${financeRequester.accessToken}`)
      .send({
        providerId,
        invoiceId: invoice.invoiceId,
        paymentIntentId: unrelatedPaymentIntentId,
        adjustmentType: 'synthetic_refund',
        currency: 'ZMW',
        amountMinor: 1000,
        reason: 'Reject a same-provider payment that belongs to a different invoice.',
        policyVersion: 'phase9-e2e-v1',
      })
      .expect(400);

    const adjustmentCreated = await request(httpServer())
      .post('/api/v1/operations/commercial/adjustments')"""
if marker not in text:
    raise SystemExit("Adjustment insertion marker missing")
path.write_text(text.replace(marker, insert))
