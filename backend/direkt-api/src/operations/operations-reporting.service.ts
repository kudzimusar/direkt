import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { AuthorizationService } from '../authorization/authorization.service';
import type {
  CreateOperationsIncidentDto,
  ResolveOperationsIncidentDto,
} from './operations-reporting.dto';
import { OperationsReportingRepository } from './operations-reporting.repository';
import type {
  OperationsExpiryItem,
  OperationsIncidentView,
  OperationsMetricsExport,
  OperationsMetricsSnapshot,
} from './operations-reporting.types';

interface PostgresErrorLike {
  code?: string;
  message?: string;
}

@Injectable()
export class OperationsReportingService {
  constructor(
    private readonly repository: OperationsReportingRepository,
    private readonly authorization: AuthorizationService,
  ) {}

  async incidents(actor: AuthenticatedActor): Promise<OperationsIncidentView[]> {
    const snapshot = await this.authorization.snapshot(actor);
    const allAccess = snapshot.roles.some((role) =>
      ['trust_supervisor', 'admin', 'auditor'].includes(role),
    );
    return this.repository.listIncidents(actor.identityId, allAccess);
  }

  createIncident(
    actor: AuthenticatedActor,
    dto: CreateOperationsIncidentDto,
    requestId?: string,
  ): Promise<OperationsIncidentView> {
    const dueAt = new Date(dto.dueAt);
    if (Number.isNaN(dueAt.getTime()) || dueAt.getTime() <= Date.now()) {
      throw new BadRequestException('Operations incident dueAt must be a future timestamp.');
    }
    return this.domain(() => this.repository.createIncident(actor, dto, requestId));
  }

  startIncident(
    actor: AuthenticatedActor,
    incidentId: string,
    reason: string,
    requestId?: string,
  ): Promise<OperationsIncidentView> {
    return this.domain(() => this.repository.startIncident(actor, incidentId, reason, requestId));
  }

  resolveIncident(
    actor: AuthenticatedActor,
    incidentId: string,
    dto: ResolveOperationsIncidentDto,
    requestId?: string,
  ): Promise<OperationsIncidentView> {
    return this.domain(() => this.repository.resolveIncident(actor, incidentId, dto, requestId));
  }

  expiry(): Promise<OperationsExpiryItem[]> {
    return this.repository.expiry();
  }

  metrics(): Promise<OperationsMetricsSnapshot> {
    return this.repository.metrics();
  }

  async exportMetrics(): Promise<OperationsMetricsExport> {
    const snapshot = await this.repository.metrics();
    return {
      schemaVersion: 'phase7-v1',
      generatedAt: snapshot.generatedAt,
      format: 'json',
      fields: [
        ['triageTotal', snapshot.triageTotal],
        ['triageOverdue', snapshot.triageOverdue],
        ['triageBreached', snapshot.triageBreached],
        ['decisionsLast30Days', snapshot.decisionsLast30Days],
        ['correctionsLast30Days', snapshot.correctionsLast30Days],
        ['fieldWorkActive', snapshot.fieldWorkActive],
        ['fieldWorkCompletedLast30Days', snapshot.fieldWorkCompletedLast30Days],
        ['escalationsActive', snapshot.escalationsActive],
        ['incidentsActive', snapshot.incidentsActive],
        ['evidenceDue', snapshot.evidenceDue],
        ['claimsDue', snapshot.claimsDue],
      ].map(([key, value]) => ({ key: String(key), value: Number(value) })),
      allowlistedFieldsOnly: true,
      providerIdentifiersIncluded: false,
      evidenceIdentifiersIncluded: false,
      privateCoordinatesIncluded: false,
      synthetic: true,
    };
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
          databaseError.message ?? 'The operations incident conflicts with an active record.',
        );
      }
      if (
        databaseError.code === '23503' ||
        databaseError.code === '23514' ||
        databaseError.code === 'P0001' ||
        databaseError.code === '22P02'
      ) {
        throw new BadRequestException(
          databaseError.message ?? 'The operations incident violates a scoped workflow rule.',
        );
      }
      throw error;
    }
  }
}
