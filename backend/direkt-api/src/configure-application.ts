import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { parseCorsOrigins, type NodeEnvironment } from './config/environment';
import { ProblemDetailsFilter } from './platform/http/problem-details.filter';
import { applySecurityHeaders } from './platform/http/security-headers';
import { createOpenApiDocument } from './platform/openapi/openapi';

export function configureApplication(app: INestApplication): OpenAPIObject {
  const configService = app.get(ConfigService);
  const origins = parseCorsOrigins(configService.get<string>('CORS_ORIGINS'));
  const environment = configService.getOrThrow<NodeEnvironment>('NODE_ENV');

  app.setGlobalPrefix('api/v1');
  applySecurityHeaders(app, environment);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.enableShutdownHooks();

  if (origins.length > 0) {
    app.enableCors({
      origin: origins,
      credentials: false,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['content-type', 'authorization', 'x-request-id', 'idempotency-key'],
      exposedHeaders: ['x-request-id'],
      maxAge: 600,
    });
  }

  const document = createOpenApiDocument(app);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    customSiteTitle: 'DIREKT API documentation',
  });

  return document;
}
