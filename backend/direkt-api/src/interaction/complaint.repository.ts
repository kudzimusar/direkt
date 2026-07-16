import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PoolClient } from "pg";
import type { AuthenticatedActor } from "../authorization/authenticated-actor";
import { DatabaseService } from "../platform/database/database.service";
import type {
  CreateInteractionComplaintDto,
  OperationsComplaintQueryDto,
  TransitionInteractionComplaintDto,
} from "./complaint.dto";
import type {
  InteractionComplaintEventView,
  InteractionComplaintStatus,
  InteractionComplaintType,
  InteractionComplaintView,
  OperationsComplaintListView,
} from "./complaint.types";

interface ComplaintRow {
  complaint_id: string;
  interaction_id: string;
  customer_identity_id: string;
  public_provider_id: string;
  provider_display_name: string;
  category_key: string;
  complaint_type: InteractionComplaintType;
  summary: string;
  status: InteractionComplaintStatus;
  revision: number;
  created_at: Date;
  updated_at: Date;
  terminal_at: Date | null;
}

interface ComplaintEventRow {
  event_id: string;
  sequence: number;
  from_status: InteractionComplaintStatus | null;
  to_status: InteractionComplaintStatus;
  actor_kind: "customer" | "operations";
  reason: string;
  policy_version: string;
  occurred_at: Date;
}

@Injectable()
export class ComplaintRepository {
  constructor(private readonly database: DatabaseService) {}

  create(
    actor: AuthenticatedActor,
    interactionId: string,
    dto: CreateInteractionComplaintDto,
    keyHash: string,
    fingerprint: string,
    requestId?: string,
  ): Promise<InteractionComplaintView> {
    return this.database.transaction(async (client) => {
      await client.query(
        `SELECT pg_advisory_xact_lock(hashtextextended($1 || ':' || $2, 0))`,
        [actor.identityId, keyHash],
      );
      const existing = await client.query<{ id: string; request_fingerprint: string }>(
        `SELECT id, request_fingerprint FROM interaction.complaints
         WHERE customer_identity_id = $1 AND idempotency_key_hash = $2 FOR UPDATE`,
        [actor.identityId, keyHash],
      );
      const replay = existing.rows[0];
      if (replay) {
        if (replay.request_fingerprint !== fingerprint) {
          throw new ConflictException(
            "The idempotency key already exists with a different complaint.",
          );
        }
        return this.load(client, replay.id, "customer", actor.identityId);
      }

      const scope = await client.query<{
        customer_identity_id: string;
        provider_id: string;
        category_id: string;
      }>(
        `SELECT customer_identity_id, provider_id, category_id
         FROM interaction.tracked_interactions
         WHERE id = $1 AND customer_identity_id = $2 FOR UPDATE`,
        [interactionId, actor.identityId],
      );
      const row = scope.rows[0];
      if (!row) {
        throw new NotFoundException(
          "Tracked interaction was not found in the customer scope.",
        );
      }
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO interaction.complaints (
           interaction_id, customer_identity_id, provider_id, category_id,
           complaint_type, summary, policy_version, idempotency_key_hash, request_fingerprint
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          interactionId,
          row.customer_identity_id,
          row.provider_id,
          row.category_id,
          dto.complaintType,
          dto.summary.trim(),
          dto.policyVersion.trim(),
          keyHash,
          fingerprint,
        ],
      );
      const complaintId = inserted.rows[0]?.id;
      if (!complaintId) throw new Error("Complaint creation returned no identifier.");
      await this.audit(client, actor, row.provider_id, requestId, "interaction_complaint_created", complaintId, {
        interactionId,
        complaintType: dto.complaintType,
        phase7IncidentLinked: false,
        trustOrRankingMutation: false,
      });
      return this.load(client, complaintId, "customer", actor.identityId);
    });
  }

  listCustomer(actor: AuthenticatedActor): Promise<InteractionComplaintView[]> {
    return this.database.transaction(async (client) => {
      const ids = await client.query<{ id: string }>(
        `SELECT id FROM interaction.complaints WHERE customer_identity_id = $1
         ORDER BY created_at DESC, id DESC LIMIT 100`,
        [actor.identityId],
      );
      return Promise.all(ids.rows.map((row) => this.load(client, row.id, "customer", actor.identityId)));
    });
  }

  detailCustomer(actor: AuthenticatedActor, complaintId: string): Promise<InteractionComplaintView> {
    return this.database.transaction((client) =>
      this.load(client, complaintId, "customer", actor.identityId),
    );
  }

  operations(query: OperationsComplaintQueryDto): Promise<OperationsComplaintListView> {
    return this.database.transaction(async (client) => {
      const values: unknown[] = [];
      let where = "";
      if (query.status) {
        values.push(query.status);
        where = `WHERE status = $${values.length}`;
      }
      const ids = await client.query<{ id: string }>(
        `SELECT id FROM interaction.complaints ${where}
         ORDER BY CASE status WHEN 'submitted' THEN 1 WHEN 'triaged' THEN 2 ELSE 3 END,
                  created_at, id LIMIT 300`,
        values,
      );
      return {
        phase7IncidentDataIncluded: false,
        items: await Promise.all(ids.rows.map((row) => this.load(client, row.id, "operations", ""))),
      };
    });
  }

  transition(
    actor: AuthenticatedActor,
    complaintId: string,
    dto: TransitionInteractionComplaintDto,
    requestId?: string,
  ): Promise<InteractionComplaintView> {
    return this.database.transaction(async (client) => {
      const scope = await client.query<{ provider_id: string }>(
        "SELECT provider_id FROM interaction.complaints WHERE id = $1",
        [complaintId],
      );
      const providerId = scope.rows[0]?.provider_id;
      if (!providerId) throw new NotFoundException("Complaint was not found.");
      try {
        await client.query(
          `SELECT (interaction.transition_complaint($1, $2, $3, $4, $5, $6)).id`,
          [
            complaintId,
            actor.identityId,
            dto.targetStatus,
            dto.expectedRevision,
            dto.reason.trim(),
            dto.policyVersion.trim(),
          ],
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("revision conflict")) throw new ConflictException(message);
        if (message.includes("not found")) throw new NotFoundException("Complaint was not found.");
        throw new BadRequestException(message || "Complaint transition failed.");
      }
      await this.audit(client, actor, providerId, requestId, "interaction_complaint_transitioned", complaintId, {
        targetStatus: dto.targetStatus,
        phase7IncidentLinked: false,
      });
      return this.load(client, complaintId, "operations", "");
    });
  }

  private async load(
    client: PoolClient,
    complaintId: string,
    scope: "customer" | "operations",
    scopeValue: string,
  ): Promise<InteractionComplaintView> {
    const values: unknown[] = [complaintId];
    const clauses = ["complaints.id = $1"];
    if (scope === "customer") {
      values.push(scopeValue);
      clauses.push(`complaints.customer_identity_id = $${values.length}`);
    }
    const result = await client.query<ComplaintRow>(
      `SELECT
         complaints.id AS complaint_id,
         complaints.interaction_id,
         complaints.customer_identity_id,
         publications.id AS public_provider_id,
         profiles.display_name AS provider_display_name,
         categories.category_key,
         complaints.complaint_type,
         complaints.summary,
         complaints.status,
         complaints.revision,
         complaints.created_at,
         complaints.updated_at,
         complaints.terminal_at
       FROM interaction.complaints AS complaints
       JOIN interaction.tracked_interactions AS tracked ON tracked.id = complaints.interaction_id
       JOIN discovery.publications AS publications ON publications.id = tracked.publication_id
       JOIN provider.profiles AS profiles ON profiles.provider_id = complaints.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = complaints.category_id
       WHERE ${clauses.join(" AND ")}`,
      values,
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException("Complaint was not found in the authenticated scope.");
    }
    const events = await client.query<ComplaintEventRow>(
      `SELECT id AS event_id, sequence, from_status, to_status, actor_kind, reason, policy_version, occurred_at
       FROM interaction.complaint_events WHERE complaint_id = $1 ORDER BY sequence`,
      [complaintId],
    );
    return {
      complaintId: row.complaint_id,
      interactionId: row.interaction_id,
      publicProviderId: row.public_provider_id,
      providerDisplayName: row.provider_display_name,
      categoryKey: row.category_key,
      complaintType: row.complaint_type,
      summary: row.summary,
      status: row.status,
      revision: row.revision,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      terminalAt: row.terminal_at?.toISOString() ?? null,
      events: events.rows.map((event): InteractionComplaintEventView => ({
        eventId: event.event_id,
        sequence: event.sequence,
        fromStatus: event.from_status,
        toStatus: event.to_status,
        actorKind: event.actor_kind,
        reason: event.reason,
        policyVersion: event.policy_version,
        occurredAt: event.occurred_at.toISOString(),
        actorIdentityExposed: false,
      })),
      phase7IncidentLinked: false,
      contactIncluded: false,
      privateInteractionDetailIncluded: false,
      actorIdentityExposed: false,
      trustOrRankingMutation: false,
      synthetic: true,
    };
  }

  private async audit(
    client: PoolClient,
    actor: AuthenticatedActor,
    providerId: string,
    requestId: string | undefined,
    action: string,
    resourceId: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await client.query(
      `INSERT INTO platform.audit_events (
         request_id, actor_type, actor_id, provider_id, action, resource_type, resource_id, outcome, metadata
       ) VALUES ($1, 'identity', $2, $3, $4, 'interaction_complaint', $5, 'success', $6::jsonb)`,
      [requestId ?? null, actor.identityId, providerId, action, resourceId, JSON.stringify(metadata)],
    );
  }
}
