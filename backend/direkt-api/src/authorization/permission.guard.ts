import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { DirektRequest } from '../platform/http/request-context';
import { AuthorizationService } from './authorization.service';
import { PUBLIC_ROUTE_KEY } from './public.decorator';
import { REQUIRED_PERMISSION_KEY, type RequiredPermission } from './require-permission.decorator';

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
    if (requirement.providerParam && requirement.providerFromActor) {
      throw new BadRequestException('The provider authorization policy is ambiguous.');
    }

    const request = context.switchToHttp().getRequest<DirektRequest>();
    if (requirement.providerFromActor) {
      await this.authorization.assertAnyProviderPermission(
        request.actor,
        requirement.permission,
        request.requestId,
      );
      return true;
    }

    const rawProviderId = requirement.providerParam
      ? request.params[requirement.providerParam]
      : undefined;
    if (Array.isArray(rawProviderId)) {
      throw new BadRequestException('The provider scope is ambiguous.');
    }

    await this.authorization.assertPermission(
      request.actor,
      requirement.permission,
      rawProviderId ? { providerId: rawProviderId } : {},
      request.requestId,
    );
    return true;
  }
}
