import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { AuditService } from '../platform/audit/audit.service';
import type { AuthenticatedActor, AuthorizationScope } from './authenticated-actor';
import { AuthorizationRepository, type AuthorizationSnapshot } from './authorization.repository';
import { PERMISSIONS, type Permission } from './permissions';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly repository: AuthorizationRepository,
    private readonly audit: AuditService,
  ) {}

  snapshot(
    actor: AuthenticatedActor,
    scope: AuthorizationScope = {},
  ): Promise<AuthorizationSnapshot> {
    return this.repository.snapshot(actor.identityId, scope.providerId);
  }

  async assertPermission(
    actor: AuthenticatedActor,
    permission: Permission,
    scope: AuthorizationScope = {},
    requestId?: string,
  ): Promise<AuthorizationSnapshot> {
    const snapshot = await this.snapshot(actor, scope);
    if (!snapshot.permissions.includes(permission)) {
      await this.recordDenial(actor, permission, scope, requestId);
      throw new ForbiddenException(
        'The authenticated identity is not permitted to perform this action.',
      );
    }
    return snapshot;
  }

  async assertAnyProviderPermission(
    actor: AuthenticatedActor,
    permission: Permission,
    requestId?: string,
  ): Promise<AuthorizationSnapshot> {
    const snapshot = await this.repository.anyProviderSnapshot(actor.identityId);
    if (!snapshot.permissions.includes(permission)) {
      await this.recordDenial(actor, permission, {}, requestId, {
        providerScope: 'actor_resolved',
      });
      throw new ForbiddenException(
        'The authenticated identity has no permitted provider workspace.',
      );
    }
    return snapshot;
  }

  async assertEvidenceDecision(
    actor: AuthenticatedActor,
    submittedByIdentityId: string,
    providerId: string,
    requestId?: string,
  ): Promise<void> {
    if (actor.identityId === submittedByIdentityId) {
      await this.audit.record({
        actorType: 'identity',
        actorId: actor.identityId,
        providerId,
        ...(requestId ? { requestId } : {}),
        action: 'self_approval_denied',
        resourceType: 'verification_policy',
        outcome: 'denied',
        metadata: { separationOfDuties: true },
      });
      throw new ForbiddenException('An actor cannot approve evidence they submitted.');
    }
    await this.assertPermission(
      actor,
      PERMISSIONS.VERIFICATION_FINAL_DECISION,
      { providerId },
      requestId,
    );
  }

  async assertEmergencyAction(
    actor: AuthenticatedActor,
    reason: string,
    requestId?: string,
  ): Promise<void> {
    if (reason.trim().length < 12) {
      throw new BadRequestException('Emergency actions require a specific reason.');
    }
    await this.assertPermission(actor, PERMISSIONS.ADMIN_EMERGENCY_ACTION, {}, requestId);
  }

  private async recordDenial(
    actor: AuthenticatedActor,
    permission: Permission,
    scope: AuthorizationScope,
    requestId?: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.audit.record({
      actorType: 'identity',
      actorId: actor.identityId,
      ...(scope.providerId ? { providerId: scope.providerId } : {}),
      ...(requestId ? { requestId } : {}),
      action: 'authorization_denied',
      resourceType: 'permission',
      outcome: 'denied',
      metadata: { permission, ...metadata },
    });
  }
}
