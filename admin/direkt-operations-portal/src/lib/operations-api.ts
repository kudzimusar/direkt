export const operationsEndpoints = {
  triage: '/api/v1/operations/verification-queue',
  reviewWorkspace: (caseId: string) =>
    `/api/v1/verification-cases/${encodeURIComponent(caseId)}/review-workspace`,
  evidenceAccess: (caseId: string, evidenceId: string) =>
    `/api/v1/verification-cases/${encodeURIComponent(caseId)}/evidence/${encodeURIComponent(evidenceId)}/access`,
  fieldWork: '/api/v1/operations/field-work-items',
  escalations: '/api/v1/operations/escalations',
  overrides: '/api/v1/operations/high-risk-overrides',
  incidents: '/api/v1/operations/incidents',
  expiry: '/api/v1/operations/expiry-renewal',
  metrics: '/api/v1/operations/reporting/metrics',
  metricsExport: '/api/v1/operations/reporting/export',
} as const;

export interface OperationsApiOptions {
  baseUrl: string;
  accessToken: string;
  fetchImplementation?: typeof fetch;
}

export class OperationsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'OperationsApiError';
  }
}

export class OperationsApiClient {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly fetchImplementation: typeof fetch;

  constructor(options: OperationsApiOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.accessToken = options.accessToken;
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${this.accessToken}`,
        ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
      },
    });

    if (!response.ok) {
      throw new OperationsApiError(
        `Operations API request failed with ${response.status}.`,
        response.status,
      );
    }

    return (await response.json()) as T;
  }
}
