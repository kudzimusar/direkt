import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { DirektRequest } from '../platform/http/request-context';
import { AuthorizationService } from './authorization.service';
import { PUBLIC_ROUTE_KEY } from './public.decorator';
import {
  REQUIRED_PERMISSION_KEY,
  type RequiredPermission,
} from './require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorization: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publicRoute = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (publicRoute) {
      return true;
    }

    const requirement = this.reflector.getAllAndOverride<RequiredPermission>(
      REQUIRED_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requirement) {
      throw new ForbiddenException('This route has no authorization policy.');
    }

    const request = context.switchToHttp().getRequest<DirektRequest>();
    const providerId = requirement.providerParam
      ? request.params[requirement.providerParam]
      : undefined;
    await this.authorization.assertPermission(
      request.actor,
      requirement.permission,
      providerId ? { providerId } : {},
      request.requestId,
    );
    return true;
  }
}
