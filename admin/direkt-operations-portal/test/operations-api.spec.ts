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

    await expect(client.get<{ synthetic: true }>(operationsEndpoints.triage)).resolves.toEqual({
      synthetic: true,
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://api.synthetic.invalid/api/v1/operations/verification-queue',
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

  it('encodes case and evidence identifiers in route builders', () => {
    expect(operationsEndpoints.reviewWorkspace('case/one')).toBe(
      '/api/v1/verification-cases/case%2Fone/review-workspace',
    );
    expect(operationsEndpoints.evidenceAccess('case/one', 'evidence/two')).toBe(
      '/api/v1/verification-cases/case%2Fone/evidence/evidence%2Ftwo/access',
    );
  });

  it('maps non-success responses to an explicit API error', async () => {
    const client = new OperationsApiClient({
      baseUrl: 'https://api.synthetic.invalid',
      accessToken: 'synthetic-token',
      fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 403 })),
    });

    await expect(client.get(operationsEndpoints.incidents)).rejects.toEqual(
      expect.objectContaining<Partial<OperationsApiError>>({ status: 403 }),
    );
  });
});
