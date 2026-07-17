import { BadRequestException, ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import type { DirektRequest } from '../../src/platform/http/request-context';
import { PermissionGuard } from '../../src/authorization/permission.guard';
import { PERMISSIONS } from '../../src/authorization/permissions';
import { PublicRoute } from '../../src/authorization/public.decorator';
import { RequirePermission } from '../../src/authorization/require-permission.decorator';
import type { AuthorizationService } from '../../src/authorization/authorization.service';

class UnclassifiedController {
  handler(): void {}
}

class PublicController {
  @PublicRoute()
  handler(): void {}
}

class ActorProviderController {
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_READ, { providerFromActor: true })
  handler(): void {}
}

class ResourceProviderController {
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_READ, { providerParam: 'providerId' })
  handler(): void {}
}

class AmbiguousPolicyController {
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_READ, {
    providerParam: 'providerId',
    providerFromActor: true,
  })
  handler(): void {}
}

function contextFor(
  controller: new () => unknown,
  request: Partial<DirektRequest> = {},
): ExecutionContext {
  return {
    getClass: () => controller,
    getHandler: () => controller.prototype.handler,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function authorizationMock(): {
  service: AuthorizationService;
  assertPermission: ReturnType<typeof vi.fn>;
  assertAnyProviderPermission: ReturnType<typeof vi.fn>;
} {
  const assertPermission = vi.fn().mockResolvedValue(undefined);
  const assertAnyProviderPermission = vi.fn().mockResolvedValue(undefined);
  return {
    service: {
      assertPermission,
      assertAnyProviderPermission,
    } as unknown as AuthorizationService,
    assertPermission,
    assertAnyProviderPermission,
  };
}

describe('Phase 10 permission guard', () => {
  it('allows an explicitly public route without an authorization call', async () => {
    const authorization = authorizationMock();
    const guard = new PermissionGuard(new Reflector(), authorization.service);

    await expect(guard.canActivate(contextFor(PublicController))).resolves.toBe(true);
    expect(authorization.assertPermission).not.toHaveBeenCalled();
    expect(authorization.assertAnyProviderPermission).not.toHaveBeenCalled();
  });

  it('denies a protected route that has no explicit authorization policy', async () => {
    const authorization = authorizationMock();
    const guard = new PermissionGuard(new Reflector(), authorization.service);

    await expect(guard.canActivate(contextFor(UnclassifiedController))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('denies a route with both actor-resolved and parameter provider policies', async () => {
    const authorization = authorizationMock();
    const guard = new PermissionGuard(new Reflector(), authorization.service);

    await expect(guard.canActivate(contextFor(AmbiguousPolicyController))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('uses the live actor-resolved provider permission path', async () => {
    const authorization = authorizationMock();
    const guard = new PermissionGuard(new Reflector(), authorization.service);
    const request = {
      actor: { identityId: 'identity-1', sessionId: 'session-1' },
      requestId: 'request-1',
      params: {},
    } as Partial<DirektRequest>;

    await expect(guard.canActivate(contextFor(ActorProviderController, request))).resolves.toBe(
      true,
    );
    expect(authorization.assertAnyProviderPermission).toHaveBeenCalledWith(
      request.actor,
      PERMISSIONS.PROVIDER_PROFILE_READ,
      'request-1',
    );
    expect(authorization.assertPermission).not.toHaveBeenCalled();
  });

  it('rejects an ambiguous provider route parameter before authorization', async () => {
    const authorization = authorizationMock();
    const guard = new PermissionGuard(new Reflector(), authorization.service);
    const request = {
      actor: { identityId: 'identity-1', sessionId: 'session-1' },
      requestId: 'request-1',
      params: { providerId: ['provider-1', 'provider-2'] },
    } as unknown as Partial<DirektRequest>;

    await expect(
      guard.canActivate(contextFor(ResourceProviderController, request)),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(authorization.assertPermission).not.toHaveBeenCalled();
  });
});
