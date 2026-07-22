import {
  PushProviderRejectedError,
  PushProviderUnavailableError,
  type PushProviderPort,
  type PushProviderSendRequest,
  type PushProviderSendResult,
} from './push-provider.port';

interface MetadataTokenResponse {
  access_token?: unknown;
}

interface FcmSendResponse {
  name?: unknown;
}

export class FcmPushProviderAdapter implements PushProviderPort {
  readonly provider = 'fcm' as const;

  constructor(
    private readonly projectId: string,
    private readonly timeoutMs: number,
  ) {}

  async send(request: PushProviderSendRequest): Promise<PushProviderSendResult> {
    const accessToken = await this.fetchMetadataAccessToken();
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(this.projectId)}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          message: {
            token: request.token,
            data: {
              direkt_kind: 'rc4_synthetic_canary',
              direkt_delivery_id: request.deliveryId,
              direkt_source_sha: request.sourceSha,
              direkt_phase: request.phase,
            },
            android: {
              priority: 'high',
              ttl: '60s',
              collapse_key: `direkt-rc4-${request.phase}`,
            },
          },
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      },
    ).catch((error: unknown) => {
      throw new PushProviderUnavailableError(
        error instanceof Error ? `FCM request failed: ${error.name}` : 'FCM request failed.',
      );
    });

    const responseText = await response.text();
    if (!response.ok) {
      const invalidToken = /UNREGISTERED|registration-token-not-registered/i.test(responseText);
      if (response.status === 429 || response.status >= 500) {
        throw new PushProviderUnavailableError(`FCM request unavailable with HTTP ${response.status}.`);
      }
      throw new PushProviderRejectedError(
        response.status,
        invalidToken,
        `FCM rejected the bounded push request with HTTP ${response.status}.`,
      );
    }

    let parsed: FcmSendResponse;
    try {
      parsed = JSON.parse(responseText) as FcmSendResponse;
    } catch {
      throw new PushProviderUnavailableError('FCM returned a malformed success response.');
    }
    if (typeof parsed.name !== 'string' || !parsed.name.startsWith(`projects/${this.projectId}/messages/`)) {
      throw new PushProviderUnavailableError('FCM success response did not contain a valid message name.');
    }
    return { provider: 'fcm', messageId: parsed.name };
  }

  private async fetchMetadataAccessToken(): Promise<string> {
    const response = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      {
        headers: { 'Metadata-Flavor': 'Google' },
        signal: AbortSignal.timeout(this.timeoutMs),
      },
    ).catch((error: unknown) => {
      throw new PushProviderUnavailableError(
        error instanceof Error
          ? `Google metadata credential request failed: ${error.name}`
          : 'Google metadata credential request failed.',
      );
    });
    if (!response.ok) {
      throw new PushProviderUnavailableError(
        `Google metadata credential request failed with HTTP ${response.status}.`,
      );
    }
    const payload = (await response.json()) as MetadataTokenResponse;
    if (typeof payload.access_token !== 'string' || payload.access_token.length < 20) {
      throw new PushProviderUnavailableError('Google metadata credential response was invalid.');
    }
    return payload.access_token;
  }
}
