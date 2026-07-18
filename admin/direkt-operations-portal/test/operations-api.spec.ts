import { describe, expect, it, vi } from 'vitest';
import {
  OperationsApiClient,
  OperationsApiError,
  operationsEndpoints,
} from '../src/lib/operations-api';

describe('OperationsApiClient', () => {
  it('uses bearer-authenticated no-store HTTP requests', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ synthetic: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const client = new OperationsApiClient({
      baseUrl: 'https://api.synthetic.invalid/',
      accessToken: 'synthetic-token',
      fetchImplementation,
    });

    await expect(client.get<{ synthetic: true }>(operationsEndpoints.commercial)).resolves.toEqual({
      synthetic: true,
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://api.synthetic.invalid/api/v1/operations/commercial',
      expect.objectContaining({
        method: 'GET',
        cache: 'no-store',
        headers: expect.objectContaining({
          accept: 'application/json',
          authorization: 'Bearer synthetic-token',
        }),
      }),
    );
  });

  it('preserves DIREKT authorization and adds the Cloud Run platform token separately', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ synthetic: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const platformIdentityTokenProvider = vi
      .fn<() => Promise<string | null>>()
      .mockResolvedValue('header.payload.signature');
    const client = new OperationsApiClient({
      baseUrl: 'https://api.synthetic.invalid',
      accessToken: 'direkt-application-token',
      fetchImplementation,
      platformIdentityTokenProvider,
    });

    await client.get(operationsEndpoints.triage);

    expect(platformIdentityTokenProvider).toHaveBeenCalledOnce();
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://api.synthetic.invalid/api/v1/operations/verification-queue',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer direkt-application-token',
          'x-serverless-authorization': 'Bearer header.payload.signature',
        }),
      }),
    );
  });

  it('encodes verification, Stage 8 and Stage 9 identifiers in route builders', () => {
    expect(operationsEndpoints.reviewWorkspace('case/one')).toBe(
      '/api/v1/verification-cases/case%2Fone/review-workspace',
    );
    expect(operationsEndpoints.evidenceAccess('case/one', 'evidence/two')).toBe(
      '/api/v1/verification-cases/case%2Fone/evidence/evidence%2Ftwo/access',
    );
    expect(operationsEndpoints.reviewModeration('review/one')).toBe(
      '/api/v1/operations/reviews/review%2Fone/moderation',
    );
    expect(operationsEndpoints.reviewAppealDecision('appeal/one')).toBe(
      '/api/v1/operations/review-appeals/appeal%2Fone/decisions',
    );
    expect(operationsEndpoints.interactionComplaintTransition('complaint/one')).toBe(
      '/api/v1/operations/interaction-complaints/complaint%2Fone/transitions',
    );
    expect(operationsEndpoints.commercialSubscriptionTransition('subscription/one')).toBe(
      '/api/v1/operations/commercial/subscriptions/subscription%2Fone/transitions',
    );
    expect(operationsEndpoints.commercialReconciliationTransition('case/one')).toBe(
      '/api/v1/operations/commercial/reconciliation/case%2Fone/transitions',
    );
    expect(operationsEndpoints.commercialAdjustmentDecision('adjustment/one')).toBe(
      '/api/v1/operations/commercial/adjustments/adjustment%2Fone/decisions',
    );
  });

  it('posts JSON only through the commercial API boundary', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ status: 'investigating', revision: 2 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const client = new OperationsApiClient({
      baseUrl: 'https://api.synthetic.invalid',
      accessToken: 'synthetic-token',
      fetchImplementation,
    });

    await client.post(operationsEndpoints.commercialReconciliationTransition('case-id'), {
      targetStatus: 'investigating',
      expectedRevision: 1,
      reasonCode: 'MISMATCH_REVIEW_STARTED',
      reason: 'Synthetic reasoned commercial transition for API boundary testing.',
      policyVersion: 'phase9-v1',
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://api.synthetic.invalid/api/v1/operations/commercial/reconciliation/case-id/transitions',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
        headers: expect.objectContaining({
          'content-type': 'application/json',
          authorization: 'Bearer synthetic-token',
        }),
      }),
    );
  });

  it('maps non-success responses to an explicit API error', async () => {
    const client = new OperationsApiClient({
      baseUrl: 'https://api.synthetic.invalid',
      accessToken: 'synthetic-token',
      fetchImplementation: vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 403 })),
    });

    await expect(client.get(operationsEndpoints.commercial)).rejects.toEqual(
      expect.objectContaining<Partial<OperationsApiError>>({ status: 403 }),
    );
  });
});
