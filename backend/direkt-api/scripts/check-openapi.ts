import { readFile } from 'node:fs/promises';
import { generateOpenApi } from './generate-openapi';

interface OpenApiOperation {
  security?: Array<Record<string, unknown>>;
}

interface OpenApiDocument {
  openapi?: string;
  paths?: Record<string, Record<string, OpenApiOperation>>;
}

async function main(): Promise<void> {
  const path = await generateOpenApi();
  const document = JSON.parse(await readFile(path, 'utf8')) as OpenApiDocument;
  if (!document.openapi?.startsWith('3.')) throw new Error('Expected an OpenAPI 3.x document.');

  const paths = document.paths ?? {};
  const requiredOperations: Array<[string, string]> = [
    ['/api/v1/health/live', 'get'],
    ['/api/v1/health/ready', 'get'],
    ['/api/v1/auth/challenges', 'post'],
    ['/api/v1/auth/challenges/verify', 'post'],
    ['/api/v1/auth/sessions/rotate', 'post'],
    ['/api/v1/auth/sessions', 'get'],
    ['/api/v1/account/profile', 'put'],
    ['/api/v1/providers', 'post'],
    ['/api/v1/providers/{providerId}', 'get'],
    ['/api/v1/categories', 'get'],
    ['/api/v1/provider-workspace/me', 'get'],
    ['/api/v1/provider-workspace/me/subscription-status', 'get'],
    ['/api/v1/enquiries', 'post'],
    ['/api/v1/enquiries', 'get'],
    ['/api/v1/enquiries/{enquiryId}', 'get'],
    ['/api/v1/enquiries/{enquiryId}/cancel', 'post'],
    ['/api/v1/provider-workspace/me/enquiries', 'get'],
    ['/api/v1/provider-workspace/me/enquiries/{enquiryId}', 'get'],
    ['/api/v1/provider-workspace/me/enquiries/{enquiryId}/transitions', 'post'],
    ['/api/v1/enquiries/{enquiryId}/handoffs', 'post'],
    ['/api/v1/enquiries/{enquiryId}/handoffs', 'get'],
    ['/api/v1/enquiries/{enquiryId}/handoffs/{handoffId}/revoke', 'post'],
    ['/api/v1/interactions', 'get'],
    ['/api/v1/interactions/{interactionId}', 'get'],
    ['/api/v1/interactions/{interactionId}/review-eligibility', 'get'],
    ['/api/v1/provider-workspace/me/interactions', 'get'],
    ['/api/v1/provider-workspace/me/enquiries/{enquiryId}/handoff', 'get'],
    ['/api/v1/interactions/{interactionId}/reviews', 'post'],
    ['/api/v1/reviews', 'get'],
    ['/api/v1/reviews/{reviewId}', 'get'],
    ['/api/v1/reviews/{reviewId}/appeals', 'post'],
    ['/api/v1/reviews/{reviewId}/reports', 'post'],
    ['/api/v1/provider-workspace/me/reviews', 'get'],
    ['/api/v1/provider-workspace/me/reviews/{reviewId}/response', 'post'],
    ['/api/v1/provider-workspace/me/reviews/{reviewId}/appeals', 'post'],
    ['/api/v1/operations/reviews', 'get'],
    ['/api/v1/operations/reviews/{reviewId}/moderation', 'post'],
    ['/api/v1/operations/review-appeals/{appealId}/decisions', 'post'],
    ['/api/v1/public/providers/{publicProviderId}/reviews', 'get'],
    ['/api/v1/interactions/{interactionId}/complaints', 'post'],
    ['/api/v1/complaints', 'get'],
    ['/api/v1/complaints/{complaintId}', 'get'],
    ['/api/v1/operations/interaction-complaints', 'get'],
    ['/api/v1/operations/interaction-complaints/{complaintId}/transitions', 'post'],
    ['/api/v1/public/categories', 'get'],
    ['/api/v1/public/providers/search', 'get'],
    ['/api/v1/public/providers/{publicProviderId}', 'get'],
    ['/api/v1/public/providers/{publicProviderId}/claims', 'get'],
    ['/api/v1/public/providers/{publicProviderId}/availability', 'get'],
    ['/api/v1/public/providers/{publicProviderId}/share', 'get'],
    ['/api/v1/operations/session', 'get'],
  ];

  for (const [requiredPath, method] of requiredOperations) {
    if (!paths[requiredPath]?.[method]) {
      throw new Error(`Missing required ${method.toUpperCase()} operation: ${requiredPath}`);
    }
  }

  const bodyAuthenticatedOperations = new Set([
    'POST /api/v1/auth/challenges',
    'POST /api/v1/auth/challenges/verify',
    'POST /api/v1/auth/sessions/rotate',
  ]);
  const publicOperations = new Set([
    'GET /api/v1/public/categories',
    'GET /api/v1/public/providers/search',
    'GET /api/v1/public/providers/{publicProviderId}',
    'GET /api/v1/public/providers/{publicProviderId}/claims',
    'GET /api/v1/public/providers/{publicProviderId}/availability',
    'GET /api/v1/public/providers/{publicProviderId}/share',
    'GET /api/v1/public/providers/{publicProviderId}/reviews',
  ]);
  for (const [protectedPath, method] of requiredOperations.filter(
    ([pathName]) => !pathName.includes('/health/'),
  )) {
    const operationKey = `${method.toUpperCase()} ${protectedPath}`;
    if (
      !bodyAuthenticatedOperations.has(operationKey) &&
      !publicOperations.has(operationKey) &&
      !paths[protectedPath]?.[method]?.security?.length
    ) {
      throw new Error(`Protected operation is missing bearer security: ${method} ${protectedPath}`);
    }
  }

  const publicPrivatePaths = Object.keys(paths).filter(
    (pathName) =>
      pathName.startsWith('/api/v1/public/') &&
      /evidence|verification-cases|upload-intents|complaints|appeals|handoffs|interactions/i.test(
        pathName,
      ),
  );
  if (publicPrivatePaths.length > 0) {
    throw new Error(
      `Private lifecycle routes were exposed publicly: ${publicPrivatePaths.join(', ')}`,
    );
  }

  const subscriptionMethods = Object.keys(
    paths['/api/v1/provider-workspace/me/subscription-status'] ?? {},
  ).filter((method) => ['get', 'post', 'put', 'patch', 'delete'].includes(method));
  if (subscriptionMethods.length !== 1 || subscriptionMethods[0] !== 'get') {
    throw new Error('The deferred Phase 9 subscription boundary is not read-only.');
  }

  const prohibited = Object.keys(paths).filter(
    (pathName) =>
      /(payments|invoices|entitlements|webhooks|public-directory|discoverable|chat|attachments|voice-calls|video-calls)/i.test(
        pathName,
      ) ||
      (/subscriptions/i.test(pathName) &&
        pathName !== '/api/v1/provider-workspace/me/subscription-status'),
  );
  if (prohibited.length > 0) {
    throw new Error(`Phase 8 exposed prohibited domain paths: ${prohibited.join(', ')}`);
  }

  process.stdout.write(
    `${JSON.stringify({ event: 'openapi_check_passed', pathCount: Object.keys(paths).length, phase: 8 })}\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown OpenAPI check failure';
  process.stderr.write(`${JSON.stringify({ event: 'openapi_check_failed', message })}\n`);
  process.exitCode = 1;
});
