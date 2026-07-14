import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface AuditEventInput {
  actorType: 'identity' | 'system';
  actorId?: string;
  providerId?: string;
  requestId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  outcome?: 'success' | 'denied' | 'failed';
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly database: DatabaseService) {}

  async record(input: AuditEventInput): Promise<void> {
    await this.database.query(
      `INSERT INTO platform.audit_events (
         request_id,
         actor_type,
         actor_id,
         provider_id,
         action,
         resource_type,
         resource_id,
         outcome,
         metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
      [
        input.requestId ?? null,
        input.actorType,
        input.actorId ?? null,
        input.providerId ?? null,
        input.action,
        input.resourceType,
        input.resourceId ?? null,
        input.outcome ?? 'success',
        JSON.stringify(input.metadata ?? {}),
      ],
    );
  }
}
