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

  if (!document.openapi?.startsWith('3.')) {
    throw new Error('Expected an OpenAPI 3.x document.');
  }

  const paths = document.paths ?? {};
  const requiredOperations: Array<[string, string]> = [
    ['/api/v1/health/live', 'get'],
    ['/api/v1/health/ready', 'get'],
    ['/api/v1/auth/challenges', 'post'],
    ['/api/v1/auth/challenges/verify', 'post'],
    ['/api/v1/auth/sessions/rotate', 'post'],
    ['/api/v1/auth/sessions', 'get'],
    ['/api/v1/auth/sessions/revoke-others', 'post'],
    ['/api/v1/account/profile', 'put'],
    ['/api/v1/providers', 'post'],
    ['/api/v1/providers/{providerId}', 'get'],
    ['/api/v1/providers/{providerId}/profile', 'patch'],
    ['/api/v1/providers/{providerId}/state-transitions', 'post'],
    ['/api/v1/providers/{providerId}/representatives', 'post'],
    ['/api/v1/providers/{providerId}/categories/{categoryKey}', 'put'],
    ['/api/v1/categories', 'get'],
    ['/api/v1/provider-workspace/me', 'get'],
    ['/api/v1/providers/{providerId}/evidence/upload-sessions', 'post'],
    ['/api/v1/providers/{providerId}/evidence', 'post'],
    ['/api/v1/providers/{providerId}/evidence', 'get'],
    ['/api/v1/providers/{providerId}/evidence/{evidenceId}', 'get'],
    ['/api/v1/providers/{providerId}/evidence/{evidenceId}/revoke', 'post'],
    ['/api/v1/providers/{providerId}/verification-cases', 'post'],
    ['/api/v1/providers/{providerId}/verification-cases', 'get'],
    ['/api/v1/providers/{providerId}/claims', 'get'],
    ['/api/v1/operations/verification-queue', 'get'],
    ['/api/v1/verification-cases/{caseId}', 'get'],
    ['/api/v1/verification-cases/{caseId}/assignments', 'post'],
    ['/api/v1/verification-cases/{caseId}/evidence/{evidenceId}/access', 'post'],
    ['/api/v1/verification-cases/{caseId}/recommendations', 'post'],
    ['/api/v1/verification-cases/{caseId}/decisions', 'post'],
    ['/api/v1/verification-cases/{caseId}/field-visits', 'post'],
    ['/api/v1/operations/verification/expire-claims', 'post'],
    ['/api/v1/operations/providers/{providerId}/claims', 'get'],
    ['/api/v1/public/categories', 'get'],
    ['/api/v1/public/providers/search', 'get'],
    ['/api/v1/public/providers/{publicProviderId}', 'get'],
    ['/api/v1/public/providers/{publicProviderId}/claims', 'get'],
    ['/api/v1/public/providers/{publicProviderId}/availability', 'get'],
    ['/api/v1/public/providers/{publicProviderId}/share', 'get'],
    ['/api/v1/account/saved-providers/{publicProviderId}', 'post'],
    ['/api/v1/account/saved-providers/{publicProviderId}', 'delete'],
    ['/api/v1/account/saved-providers', 'get'],
    ['/api/v1/operations/discovery/publication-eligibility', 'get'],
    ['/api/v1/operations/providers/{providerId}/discovery/publication', 'post'],
    ['/api/v1/operations/discovery/publications/{publicProviderId}/hide', 'post'],
    ['/api/v1/operations/session', 'get'],
    ['/api/v1/operations/providers', 'get'],
    ['/api/v1/operations/emergency-actions', 'post'],
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

  const publicEvidencePaths = Object.keys(paths).filter(
    (pathName) =>
      pathName.startsWith('/api/v1/public/') && /evidence|verification-cases/i.test(pathName),
  );
  if (publicEvidencePaths.length > 0) {
    throw new Error(
      `Private evidence or case routes were exposed publicly: ${publicEvidencePaths.join(', ')}`,
    );
  }

  const prohibited = Object.keys(paths).filter((pathName) =>
    /(payments|subscriptions|public-directory|discoverable)/i.test(pathName),
  );
  if (prohibited.length > 0) {
    throw new Error(`Phase 6 exposed prohibited domain paths: ${prohibited.join(', ')}`);
  }

  process.stdout.write(
    `${JSON.stringify({ event: 'openapi_check_passed', pathCount: Object.keys(paths).length, phase: 6 })}\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown OpenAPI check failure';
  process.stderr.write(`${JSON.stringify({ event: 'openapi_check_failed', message })}\n`);
  process.exitCode = 1;
});