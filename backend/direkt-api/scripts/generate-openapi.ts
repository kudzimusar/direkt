import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/configure-application';

export async function generateOpenApi(): Promise<string> {
  process.env.NODE_ENV ??= 'test';
  const app = await NestFactory.create(AppModule, { logger: false });

  try {
    const document = configureApplication(app);
    const outputDirectory = resolve(process.cwd(), 'artifacts');
    const outputPath = resolve(outputDirectory, 'openapi.json');
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
    return outputPath;
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  void generateOpenApi()
    .then((path) => {
      process.stdout.write(`${JSON.stringify({ event: 'openapi_generated', path })}\n`);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown OpenAPI generation failure';
      process.stderr.write(`${JSON.stringify({ event: 'openapi_generation_failed', message })}\n`);
      process.exitCode = 1;
    });
}
