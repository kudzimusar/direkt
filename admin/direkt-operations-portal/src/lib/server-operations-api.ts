import 'server-only';

import { createCloudRunIdentityTokenProvider } from './cloud-run-identity';
import { OperationsApiClient } from './operations-api';

export function createServerOperationsApiClient(
  applicationAccessToken: string,
  fetchImplementation: typeof fetch = fetch,
): OperationsApiClient {
  const baseUrl = process.env.DIREKT_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error('The DIREKT API base URL is not configured.');
  }

  return new OperationsApiClient({
    baseUrl,
    accessToken: applicationAccessToken,
    fetchImplementation,
    platformIdentityTokenProvider: createCloudRunIdentityTokenProvider({
      fetchImplementation,
    }),
  });
}
