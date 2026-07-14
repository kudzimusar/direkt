import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('DIREKT API')
    .setDescription(
      'Phase 2C foundation for synthetic passwordless identity, revocable sessions and deny-by-default operations authorization. No provider, evidence, verification-decision or payment mutation is exposed.',
    )
    .setVersion('0.2.0')
    .addServer('/', 'API root')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'DIREKT short-lived access token',
        description: 'Roles and permissions are always resolved server-side from the active session.',
      },
      'bearer',
    )
    .build();

  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) => `${controllerKey}_${methodKey}`,
  });
}
