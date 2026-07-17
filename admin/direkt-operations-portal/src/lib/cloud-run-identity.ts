const DEFAULT_METADATA_HOST = 'metadata.google.internal';
const DEFAULT_TIMEOUT_MS = 3_000;
const METADATA_IDENTITY_PATH =
  '/computeMetadata/v1/instance/service-accounts/default/identity';

export interface CloudRunIdentityTokenOptions {
  audience?: string | null;
  fetchImplementation?: typeof fetch;
  metadataHost?: string;
  timeoutMs?: number;
}

export class CloudRunIdentityTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloudRunIdentityTokenError';
  }
}

function hasJwtShape(value: string): boolean {
  return value.split('.').length === 3 && !/\s/.test(value);
}

export async function fetchCloudRunIdentityToken(
  options: CloudRunIdentityTokenOptions,
): Promise<string | null> {
  const audience = options.audience?.trim();
  if (!audience) {
    return null;
  }

  const metadataHost =
    options.metadataHost ?? process.env.GCE_METADATA_HOST ?? DEFAULT_METADATA_HOST;
  const endpoint = new URL(`http://${metadataHost}${METADATA_IDENTITY_PATH}`);
  endpoint.searchParams.set('audience', audience);
  endpoint.searchParams.set('format', 'full');

  let response: Response;
  try {
    response = await (options.fetchImplementation ?? fetch)(endpoint, {
      cache: 'no-store',
      headers: { 'Metadata-Flavor': 'Google' },
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
  } catch {
    throw new CloudRunIdentityTokenError('Cloud Run platform identity is unavailable.');
  }

  if (!response.ok) {
    throw new CloudRunIdentityTokenError('Cloud Run platform identity was rejected.');
  }

  const token = (await response.text()).trim();
  if (!hasJwtShape(token)) {
    throw new CloudRunIdentityTokenError('Cloud Run platform identity is malformed.');
  }

  return token;
}

export function configuredCloudRunAudience(): string | null {
  return process.env.DIREKT_API_AUDIENCE?.trim() || null;
}

export function createCloudRunIdentityTokenProvider(
  options: Omit<CloudRunIdentityTokenOptions, 'audience'> = {},
): () => Promise<string | null> {
  return () =>
    fetchCloudRunIdentityToken({
      ...options,
      audience: configuredCloudRunAudience(),
    });
}
