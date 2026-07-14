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
    ['/api/v1/operations/session', 'get'],
    ['/api/v1/operations/emergency-actions', 'post'],
  ];
  for (const [requiredPath, method] of requiredOperations) {
    if (!paths[requiredPath]?.[method]) {
      throw new Error(`Missing required ${method.toUpperCase()} operation: ${requiredPath}`);
    }
  }

  for (const [protectedPath, method] of [
    ['/api/v1/auth/sessions', 'get'],
    ['/api/v1/operations/session', 'get'],
    ['/api/v1/operations/emergency-actions', 'post'],
  ] as const) {
    if (!paths[protectedPath]?.[method]?.security?.length) {
      throw new Error(`Protected operation is missing bearer security: ${method} ${protectedPath}`);
    }
  }

  const prohibited = Object.keys(paths).filter((pathName) =>
    /(providers|verification|evidence|payments|subscriptions)/i.test(pathName),
  );
  if (prohibited.length > 0) {
    throw new Error(`Phase 2C exposed prohibited domain paths: ${prohibited.join(', ')}`);
  }

  process.stdout.write(
    `${JSON.stringify({ event: 'openapi_check_passed', pathCount: Object.keys(paths).length })}\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown OpenAPI check failure';
  process.stderr.write(`${JSON.stringify({ event: 'openapi_check_failed', message })}\n`);
  process.exitCode = 1;
});
