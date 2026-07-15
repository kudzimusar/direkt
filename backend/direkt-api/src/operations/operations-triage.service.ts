import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { AuthorizationService } from '../authorization/authorization.service';
import type { RoleKey } from '../authorization/permissions';
import type { OperationsTriageQueryDto } from './operations-triage.dto';
import { OperationsTriageRepository } from './operations-triage.repository';
import type {
  OperationsTriageQueue,
  OperationsTriageScope,
} from './operations-triage.types';

const FULL_QUEUE_ROLES: RoleKey[] = ['trust_supervisor', 'auditor', 'admin'];

@Injectable()
export class OperationsTriageService {
  constructor(
    private readonly repository: OperationsTriageRepository,
    private readonly authorization: AuthorizationService,
  ) {}

  async queue(
    actor: AuthenticatedActor,
    query: OperationsTriageQueryDto,
  ): Promise<OperationsTriageQueue> {
    const snapshot = await this.authorization.snapshot(actor);
    const scope = this.resolveScope(snapshot.roles);
    const items = await this.repository.list({
      actorIdentityId: actor.identityId,
      scope,
      query,
    });

    return {
      scope,
      generatedAt: new Date().toISOString(),
      summary: {
        total: items.length,
        critical: items.filter((item) => item.priorityBand === 'critical')
          .length,
        breached: items.filter((item) => item.slaState === 'breached').length,
        overdue: items.filter((item) => item.slaState === 'overdue').length,
        dueSoon: items.filter((item) => item.slaState === 'due_soon').length,
        unassigned: items.filter((item) => item.ownership === 'unassigned')
          .length,
        highRisk: items.filter((item) => item.highRisk).length,
        escalationRequired: items.filter((item) => item.escalationRequired)
          .length,
      },
      items,
      synthetic: true,
    };
  }

  private resolveScope(roles: RoleKey[]): OperationsTriageScope {
    if (roles.some((role) => FULL_QUEUE_ROLES.includes(role))) {
      return 'all_cases';
    }
    if (roles.includes('reviewer')) {
      return 'assigned_and_unassigned';
    }
    throw new ForbiddenException(
      'The authenticated identity has no verification triage scope.',
    );
  }
}
