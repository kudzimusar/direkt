import { MiddlewareConsumer, Module, type NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { CommercialModule } from './commercial/commercial.module';
import { environmentSchema } from './config/environment';
import { DiscoveryModule } from './discovery/discovery.module';
import { InteractionModule } from './interaction/interaction.module';
import { OperationsModule } from './operations/operations.module';
import { AuditModule } from './platform/audit/audit.module';
import { DatabaseModule } from './platform/database/database.module';
import { HealthModule } from './platform/health/health.module';
import { CorrelationIdMiddleware } from './platform/http/correlation-id.middleware';
import { RequestLoggingMiddleware } from './platform/http/request-logging.middleware';
import { ProviderModule } from './provider-core/provider.module';
import { ProviderWorkspaceModule } from './provider-workspace/provider-workspace.module';
import { VerificationEvidenceModule } from './verification-evidence/verification-evidence.module';

@Module({
  imports: [
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
    CommercialModule,
    InteractionModule,
    OperationsModule,
    ProviderModule,
    ProviderWorkspaceModule,
    VerificationEvidenceModule,
    DiscoveryModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
