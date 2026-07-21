import { MiddlewareConsumer, Module, type NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { AccountContactModule } from './account-contact/account-contact.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { CommercialModule } from './commercial/commercial.module';
import { CommunicationsModule } from './communications/communications.module';
import { environmentSchema } from './config/environment';
import { DiscoveryModule } from './discovery/discovery.module';
import { InteractionModule } from './interaction/interaction.module';
import { OperationsModule } from './operations/operations.module';
import { AuditModule } from './platform/audit/audit.module';
import { DatabaseModule } from './platform/database/database.module';
import { HealthModule } from './platform/health/health.module';
import { CorrelationIdMiddleware } from './platform/http/correlation-id.middleware';
import { RequestLoggingMiddleware } from './platform/http/request-logging.middleware';
import { AbuseControlMiddleware } from './platform/security/abuse-control.middleware';
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
    AiModule,
    CommunicationsModule,
    AuthModule,
    AuthorizationModule,
    AccountContactModule,
    HealthModule,
    CommercialModule,
    InteractionModule,
    OperationsModule,
    ProviderModule,
    ProviderWorkspaceModule,
    VerificationEvidenceModule,
    DiscoveryModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware, AbuseControlMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
