import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { AuthorizationService } from '../authorization/authorization.service';
import type {
  ApproveOperationsOverrideDto,
  CreateOperationsEscalationDto,
  CreateOperationsOverrideDto,
  ResolveOperationsEscalationDto,
} from './operations-escalation.dto';
import { OperationsEscalationRepository } from './operations-escalation.repository';
import type {
  OperationsEscalationView,
  OperationsOverrideRequestView,
} from './operations-escalation.types';

interface PostgresErrorLike {
  code?: string;
  message?: string;
}

@Injectable()
export class OperationsEscalationService {
  constructor(
    private readonly repository: OperationsEscalationRepository,
    private readonly authorization: AuthorizationService,
  ) {}

  async escalations(actor: AuthenticatedActor): Promise<OperationsEscalationView[]> {
    return this.repository.listEscalations(actor.identityId, await this.hasAllAccess(actor));
  }

  async createEscalation(
    actor: AuthenticatedActor,
    dto: CreateOperationsEscalationDto,
    requestId?: string,
  ): Promise<OperationsEscalationView> {
    this.assertFuture(dto.dueAt, 'Escalation dueAt');
    return this.domain(() => this.repository.createEscalation(actor, dto, requestId));
  }

  startEscalation(
    actor: AuthenticatedActor,
    escalationId: string,
    reason: string,
    requestId?: string,
  ): Promise<OperationsEscalationView> {
    return this.domain(() =>
      this.repository.startEscalation(actor, escalationId, reason, requestId),
    );
  }

  resolveEscalation(
    actor: AuthenticatedActor,
    escalationId: string,
    dto: ResolveOperationsEscalationDto,
    requestId?: string,
  ): Promise<OperationsEscalationView> {
    return this.domain(() =>
      this.repository.resolveEscalation(actor, escalationId, dto, requestId),
    );
  }

  async overrides(actor: AuthenticatedActor): Promise<OperationsOverrideRequestView[]> {
    return this.repository.listOverrides(actor.identityId, await this.hasAllAccess(actor));
  }

  createOverride(
    actor: AuthenticatedActor,
    dto: CreateOperationsOverrideDto,
    requestId?: string,
  ): Promise<OperationsOverrideRequestView> {
    this.assertFuture(dto.dueAt, 'Override dueAt');
    return this.domain(() => this.repository.createOverride(actor, dto, requestId));
  }

  approveOverride(
    actor: AuthenticatedActor,
    overrideRequestId: string,
    dto: ApproveOperationsOverrideDto,
    requestId?: string,
  ): Promise<OperationsOverrideRequestView> {
    return this.domain(() =>
      this.repository.approveOverride(actor, overrideRequestId, dto, requestId),
    );
  }

  private async hasAllAccess(actor: AuthenticatedActor): Promise<boolean> {
    const snapshot = await this.authorization.snapshot(actor);
    return snapshot.roles.some((role) => ['trust_supervisor', 'admin', 'auditor'].includes(role));
  }

  private assertFuture(value: string, label: string): void {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      throw new BadRequestException(`${label} must be a future timestamp.`);
    }
  }

  private async domain<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      const databaseError = error as PostgresErrorLike;
      if (databaseError.code === '23505' || databaseError.code === '23P01') {
        throw new ConflictException(
          databaseError.message ?? 'The operations workflow conflicts with an active record.',
        );
      }
      if (
        databaseError.code === '23503' ||
        databaseError.code === '23514' ||
        databaseError.code === 'P0001' ||
        databaseError.code === '22P02'
      ) {
        throw new BadRequestException(
          databaseError.message ?? 'The operations workflow violates a trust-control rule.',
        );
      }
      throw error;
    }
  }
}
