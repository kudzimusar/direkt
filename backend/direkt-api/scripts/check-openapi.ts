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
    ['/api/v1/operations/interactions', 'get'],
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
    ['/api/v1/commercial/products', 'get'],
    ['/api/v1/provider-workspace/me/commercial', 'get'],
    ['/api/v1/provider-workspace/me/subscriptions', 'post'],
    ['/api/v1/provider-workspace/me/subscriptions/{subscriptionId}/cancel', 'post'],
    ['/api/v1/provider-workspace/me/subscriptions/{subscriptionId}/invoices', 'post'],
    ['/api/v1/provider-workspace/me/invoices/{invoiceId}/payment-intents', 'post'],
    ['/api/v1/provider-workspace/me/payment-intents/{paymentIntentId}/cancel', 'post'],
    ['/api/v1/webhooks/payments/synthetic', 'post'],
    ['/api/v1/operations/commercial', 'get'],
    ['/api/v1/operations/commercial/products/{productId}/transitions', 'post'],
    ['/api/v1/operations/commercial/subscriptions/{subscriptionId}/transitions', 'post'],
    [
      '/api/v1/operations/commercial/reconciliation/{reconciliationCaseId}/transitions',
      'post',
    ],
    ['/api/v1/operations/commercial/adjustments', 'post'],
    ['/api/v1/operations/commercial/adjustments/{adjustmentId}/decisions', 'post'],
    ['/api/v1/operations/commercial/adjustments/{adjustmentId}/apply', 'post'],
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
    'GET /api/v1/commercial/products',
    'POST /api/v1/webhooks/payments/synthetic',
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
      /evidence|verification-cases|upload-intents|complaints|appeals|handoffs|interactions|subscriptions|invoices|payments|ledger|reconciliation/i.test(
        pathName,
      ),
  );
  if (publicPrivatePaths.length > 0) {
    throw new Error(
      `Private lifecycle routes were exposed publicly: ${publicPrivatePaths.join(', ')}`,
    );
  }

  if (paths['/api/v1/provider-workspace/me/subscription-status']) {
    throw new Error('The deferred Phase 9 subscription placeholder still exists.');
  }

  const realProviderPaths = Object.keys(paths).filter(
    (pathName) =>
      /(airtel|mtn|mpesa|stripe|paypal|card-payments|mobile-money|production-payments|raw-webhooks)/i.test(
        pathName,
      ) ||
      (/webhooks\/payments/i.test(pathName) &&
        pathName !== '/api/v1/webhooks/payments/synthetic'),
  );
  if (realProviderPaths.length > 0) {
    throw new Error(`Unapproved payment-provider paths were exposed: ${realProviderPaths.join(', ')}`);
  }

  const prohibitedDeferredDomains = Object.keys(paths).filter((pathName) =>
    /(chat|attachments|voice-calls|video-calls)/i.test(pathName),
  );
  if (prohibitedDeferredDomains.length > 0) {
    throw new Error(
      `Deferred communication domains were exposed: ${prohibitedDeferredDomains.join(', ')}`,
    );
  }

  const serialized = JSON.stringify(document);
  const sensitiveSchemaFields = [
    '"cardNumber"',
    '"cvv"',
    '"mobileMoneyPin"',
    '"paymentProviderSecret"',
    '"serviceRoleKey"',
    '"rawPayload":',
    '"rawBody":',
  ].filter((token) => serialized.includes(token));
  if (sensitiveSchemaFields.length > 0) {
    throw new Error(
      `Sensitive payment fields entered OpenAPI: ${sensitiveSchemaFields.join(', ')}`,
    );
  }

  process.stdout.write(
    `${JSON.stringify({ event: 'openapi_check_passed', pathCount: Object.keys(paths).length, phase: 9 })}\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown OpenAPI check failure';
  process.stderr.write(`${JSON.stringify({ event: 'openapi_check_failed', message })}\n`);
  process.exitCode = 1;
});
