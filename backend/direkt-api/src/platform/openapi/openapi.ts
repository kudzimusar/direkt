import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('DIREKT API')
    .setDescription(
      'Foundation contract for the DIREKT verification-led local service marketplace. No public provider or trust mutation endpoints exist in Phase 2B.',
    )
    .setVersion('0.1.0')
    .addServer('/', 'API root')
    .build();

  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) => `${controllerKey}_${methodKey}`,
  });
}
