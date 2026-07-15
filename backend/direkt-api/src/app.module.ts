import { MiddlewareConsumer, Module, type NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { environmentSchema } from './config/environment';
import { OperationsModule } from './operations/operations.module';
import { AuditModule } from './platform/audit/audit.module';
import { DatabaseModule } from './platform/database/database.module';
import { HealthModule } from './platform/health/health.module';
import { CorrelationIdMiddleware } from './platform/http/correlation-id.middleware';
import { RequestLoggingMiddleware } from './platform/http/request-logging.middleware';
import { ProviderModule } from './provider-core/provider.module';
import { Phase3Module } from './phase3/phase3.module';

@Module({
  imports: [
    Phase3Module,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: environmentSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    DatabaseModule,
    AuditModule,
    AuthModule,
    AuthorizationModule,
    HealthModule,
    OperationsModule,
    ProviderModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
