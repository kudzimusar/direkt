import { SetMetadata } from '@nestjs/common';
import type { Permission } from './permissions';

export const REQUIRED_PERMISSION_KEY = 'direkt.requiredPermission';

export interface RequiredPermission {
  permission: Permission;
  providerParam?: string;
}

export const RequirePermission = (
  permission: Permission,
  options: { providerParam?: string } = {},
): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRED_PERMISSION_KEY, {
    permission,
    ...(options.providerParam ? { providerParam: options.providerParam } : {}),
  } satisfies RequiredPermission);
