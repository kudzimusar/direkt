import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { AccessTokenGuard } from './access-token.guard';
import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationService } from './authorization.service';
import { PermissionGuard } from './permission.guard';

@Global()
@Module({
  imports: [AuthModule],
  providers: [
    AuthorizationRepository,
    AuthorizationService,
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
