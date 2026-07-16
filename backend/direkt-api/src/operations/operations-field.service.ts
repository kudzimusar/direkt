import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { AuthorizationService } from '../authorization/authorization.service';
import type {
  CancelOperationsFieldWorkDto,
  CreateOperationsFieldWorkDto,
  ReassignOperationsFieldWorkDto,
  SubmitOperationsFieldInspectionDto,
  TransitionOperationsFieldWorkDto,
} from './operations-field.dto';
import { OperationsFieldRepository } from './operations-field.repository';
import type {
  OperationsFieldQueue,
  OperationsFieldWorkItem,
} from './operations-field.types';

interface PostgresErrorLike {
  code?: string;
  message?: string;
}

@Injectable()
export class OperationsFieldService {
  constructor(
    private readonly repository: OperationsFieldRepository,
    private readonly authorization: AuthorizationService,
  ) {}

  async queue(actor: AuthenticatedActor): Promise<OperationsFieldQueue> {
    const allWork = await this.hasFullAccess(actor);
    const items = await this.repository.list(actor.identityId, allWork);
    const now = Date.now();
    return {
      scope: allWork ? 'all' : 'mine',
      generatedAt: new Date(now).toISOString(),
      summary: {
        total: items.length,
        scheduled: items.filter((item) => item.state === 'scheduled').length,
        inProgress: items.filter((item) =>
          ['accepted', 'in_progress'].includes(item.state),
        ).length,
        overdue: items.filter(
          (item) =>
            ['scheduled', 'accepted', 'in_progress'].includes(item.state) &&
            new Date(item.dueAt).getTime() < now,
        ).length,
        terminal: items.filter((item) =>
          ['submitted', 'missed', 'unable_to_verify', 'safety_abort', 'cancelled', 'reassigned'].includes(
            item.state,
          ),
        ).length,
      },
      items,
      synthetic: true,
    };
  }

  async detail(actor: AuthenticatedActor, workItemId: string): Promise<OperationsFieldWorkItem> {
    return this.repository.detail(workItemId, actor.identityId, await this.hasFullAccess(actor));
  }

  async create(
    actor: AuthenticatedActor,
    dto: CreateOperationsFieldWorkDto,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    this.assertSchedule(dto.scheduledFor, dto.dueAt);
    return this.domain(() => this.repository.create(actor, dto, requestId));
  }

  async transition(
    actor: AuthenticatedActor,
    workItemId: string,
    dto: TransitionOperationsFieldWorkDto,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    return this.domain(() => this.repository.transition(actor, workItemId, dto, requestId));
  }

  async cancel(
    actor: AuthenticatedActor,
    workItemId: string,
    dto: CancelOperationsFieldWorkDto,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    return this.domain(() => this.repository.cancel(actor, workItemId, dto, requestId));
  }

  async reassign(
    actor: AuthenticatedActor,
    workItemId: string,
    dto: ReassignOperationsFieldWorkDto,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    this.assertSchedule(dto.scheduledFor, dto.dueAt);
    return this.domain(() => this.repository.reassign(actor, workItemId, dto, requestId));
  }

  async submit(
    actor: AuthenticatedActor,
    workItemId: string,
    dto: SubmitOperationsFieldInspectionDto,
    requestId?: string,
  ): Promise<OperationsFieldWorkItem> {
    const occurredAt = new Date(dto.occurredAt);
    if (Number.isNaN(occurredAt.getTime()) || occurredAt.getTime() > Date.now()) {
      throw new BadRequestException('Field inspection occurrence time must be valid and not future.');
    }
    if (dto.observations.length === 0) {
      throw new BadRequestException('At least one structured field observation is required.');
    }
    const keys = dto.observations.map((observation) => observation.key);
    if (new Set(keys).size !== keys.length) {
      throw new BadRequestException('Field observation keys must be unique within a submission.');
    }
    const payloadHash = createHash('sha256')
      .update(
        JSON.stringify({
          outcome: dto.outcome,
          checklistVersion: dto.checklistVersion,
          publicSafeSummary: dto.publicSafeSummary.trim(),
          privateNotes: dto.privateNotes?.trim() ?? null,
          observations: dto.observations.map((observation) => ({
            key: observation.key,
            result: observation.result,
            note: observation.note?.trim() ?? null,
          })),
          evidenceReferences: [...(dto.evidenceReferences ?? [])].sort(),
          policyVersion: dto.policyVersion,
          occurredAt: dto.occurredAt,
        }),
        'utf8',
      )
      .digest('hex');
    return this.domain(() =>
      this.repository.submit(actor, workItemId, dto, payloadHash, requestId),
    );
  }

  private async hasFullAccess(actor: AuthenticatedActor): Promise<boolean> {
    const snapshot = await this.authorization.snapshot(actor);
    const fullAccess = snapshot.roles.some((role) =>
      ['trust_supervisor', 'admin'].includes(role),
    );
    if (!fullAccess && !snapshot.roles.includes('field_agent')) {
      throw new ForbiddenException('The authenticated identity has no field-work scope.');
    }
    return fullAccess;
  }

  private assertSchedule(scheduledForValue: string, dueAtValue: string): void {
    const scheduledFor = new Date(scheduledForValue);
    const dueAt = new Date(dueAtValue);
    if (
      Number.isNaN(scheduledFor.getTime()) ||
      Number.isNaN(dueAt.getTime()) ||
      dueAt.getTime() <= scheduledFor.getTime()
    ) {
      throw new BadRequestException('Field-work dueAt must be after scheduledFor.');
    }
  }

  private async domain<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      const databaseError = error as PostgresErrorLike;
      if (databaseError.code === '23505' || databaseError.code === '23P01') {
        throw new ConflictException(
          databaseError.message ?? 'The field-work request conflicts with active work.',
        );
      }
      if (
        databaseError.code === '23503' ||
        databaseError.code === '23514' ||
        databaseError.code === 'P0001' ||
        databaseError.code === '22P02'
      ) {
        throw new BadRequestException(
          databaseError.message ?? 'The field-work request violates a scoped workflow rule.',
        );
      }
      throw error;
    }
  }
}
