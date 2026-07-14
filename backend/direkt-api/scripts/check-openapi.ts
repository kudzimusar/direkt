import { readFile } from 'node:fs/promises';
import { generateOpenApi } from './generate-openapi';

interface OpenApiDocument {
  openapi?: string;
  paths?: Record<string, Record<string, unknown>>;
}

async function main(): Promise<void> {
  const path = await generateOpenApi();
  const document = JSON.parse(await readFile(path, 'utf8')) as OpenApiDocument;

  if (!document.openapi?.startsWith('3.')) {
    throw new Error('Expected an OpenAPI 3.x document.');
  }

  const paths = document.paths ?? {};
  for (const requiredPath of ['/api/v1/health/live', '/api/v1/health/ready']) {
    if (!paths[requiredPath]?.get) {
      throw new Error(`Missing required GET operation: ${requiredPath}`);
    }
  }

  const prohibited = Object.keys(paths).filter((pathName) =>
    /(providers|verification|evidence|payments|subscriptions)/i.test(pathName),
  );
  if (prohibited.length > 0) {
    throw new Error(`Phase 2B exposed prohibited domain paths: ${prohibited.join(', ')}`);
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
