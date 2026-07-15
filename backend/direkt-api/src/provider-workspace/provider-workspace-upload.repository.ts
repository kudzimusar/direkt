import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type { CreateWorkspaceUploadIntentDto } from './provider-workspace.dto';
import type {
  ProviderWorkspaceUploadIntentView,
  WorkspaceUploadState,
} from './provider-workspace.types';

interface WorkspaceContextRow {
  provider_id: string;
}

interface CaseContractRow {
  case_id: string;
  provider_id: string;
  requirement_id: string;
  category_key: string;
  category_name: string;
  requirement_key: string;
  requirement_label: string;
  check_key: string;
}

interface UploadIntentRow extends CaseContractRow {
  upload_intent_id: string;
  created_by_identity_id: string;
  client_intent_key: string;
  evidence_class: CreateWorkspaceUploadIntentDto['evidenceClass'];
  document_type: string;
  content_type: string;
  max_bytes: string;
  consent_confirmed: boolean;
  replacement_for_evidence_id: string | null;
  state: WorkspaceUploadState;
  attempt_count: number;
  active_upload_session_id: string | null;
  submitted_evidence_id: string | null;
  last_error_code: string | null;
  created_at: Date;
  updated_at: Date;
  submitted_at: Date | null;
  cancelled_at: Date | null;
}

export interface PreparedWorkspaceUploadAttempt {
  intent: ProviderWorkspaceUploadIntentView;
  providerId: string;
  categoryKey: string;
  requirementKey: string;
  evidenceClass: CreateWorkspaceUploadIntentDto['evidenceClass'];
  documentType: string;
  contentType: string;
  maxBytes: number;
  consentConfirmed: boolean;
  replacementForEvidenceId: string | null;
  attemptNumber: number;
  shouldCreateSession: boolean;
}

@Injectable()
export class ProviderWorkspaceUploadRepository {
  constructor(private readonly database: DatabaseService) {}

  prepareNew(
    actor: AuthenticatedActor,
    input: CreateWorkspaceUploadIntentDto,
  ): Promise<PreparedWorkspaceUploadAttempt> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProvider(client, actor.identityId);
      const contract = await this.caseContract(client, providerId, input.caseId);

      await client.query(
        `INSERT INTO provider_workspace.upload_intents (
           provider_id,
           created_by_identity_id,
           case_id,
           requirement_id,
           client_intent_key,
           evidence_class,
           document_type,
           content_type,
           max_bytes,
           consent_confirmed,
           replacement_for_evidence_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (provider_id, created_by_identity_id, client_intent_key) DO NOTHING`,
        [
          providerId,
          actor.identityId,
          contract.case_id,
          contract.requirement_id,
          input.clientIntentKey,
          input.evidenceClass,
          input.documentType,
          input.contentType,
          input.maxBytes,
          input.consentConfirmed,
          input.replacementForEvidenceId ?? null,
        ],
      );

      const row = await this.intentByClientKeyForUpdate(
        client,
        providerId,
        actor.identityId,
        input.clientIntentKey,
      );
      this.assertIdempotentContract(row, input);
      return this.prepareLockedIntent(client, row);
    });
  }

  prepareRetry(
    actor: AuthenticatedActor,
    uploadIntentId: string,
  ): Promise<PreparedWorkspaceUploadAttempt> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProvider(client, actor.identityId);
      const row = await this.intentForUpdate(client, providerId, actor.identityId, uploadIntentId);
      if (!['interrupted', 'retryable'].includes(row.state)) {
        throw new ConflictException(
          'Only interrupted or retryable uploads can start a new attempt.',
        );
      }
      return this.prepareLockedIntent(client, row);
    });
  }

  async attachSession(
    actor: AuthenticatedActor,
    uploadIntentId: string,
    uploadSessionId: string,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProvider(client, actor.identityId);
      const row = await this.intentForUpdate(client, providerId, actor.identityId, uploadIntentId);
      if (row.state !== 'uploading' || row.active_upload_session_id) {
        throw new ConflictException('The provider upload intent is not ready for a session.');
      }

      await client.query(
        `INSERT INTO provider_workspace.upload_attempts (
           upload_intent_id,
           upload_session_id,
           attempt_number
         ) VALUES ($1, $2, $3)`,
        [uploadIntentId, uploadSessionId, row.attempt_count],
      );
      await client.query(
        `UPDATE provider_workspace.upload_intents
         SET active_upload_session_id = $2
         WHERE id = $1`,
        [uploadIntentId, uploadSessionId],
      );
      return this.intentView(client, providerId, actor.identityId, uploadIntentId);
    });
  }

  markPreparationFailure(
    actor: AuthenticatedActor,
    uploadIntentId: string,
    errorCode: string,
  ): Promise<void> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProvider(client, actor.identityId);
      const row = await this.intentForUpdate(client, providerId, actor.identityId, uploadIntentId);
      if (row.state === 'uploading' && !row.active_upload_session_id) {
        await client.query(
          `UPDATE provider_workspace.upload_intents
           SET state = 'retryable', last_error_code = $2
           WHERE id = $1`,
          [uploadIntentId, errorCode],
        );
      }
    });
  }

  markInterrupted(
    actor: AuthenticatedActor,
    uploadIntentId: string,
    errorCode: string,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProvider(client, actor.identityId);
      const row = await this.intentForUpdate(client, providerId, actor.identityId, uploadIntentId);
      if (row.state === 'interrupted') {
        return this.mapIntent(row);
      }
      if (row.state !== 'uploading' || !row.active_upload_session_id) {
        throw new ConflictException('Only an active upload attempt can be marked interrupted.');
      }

      await client.query(
        `UPDATE evidence.upload_sessions
         SET status = 'cancelled'
         WHERE id = $1 AND status = 'requested'`,
        [row.active_upload_session_id],
      );
      await client.query(
        `UPDATE provider_workspace.upload_attempts
         SET state = 'interrupted', error_code = $2, interrupted_at = now()
         WHERE upload_intent_id = $1
           AND upload_session_id = $3
           AND state = 'uploading'`,
        [uploadIntentId, errorCode, row.active_upload_session_id],
      );
      await client.query(
        `UPDATE provider_workspace.upload_intents
         SET state = 'interrupted', active_upload_session_id = NULL, last_error_code = $2
         WHERE id = $1`,
        [uploadIntentId, errorCode],
      );
      return this.intentView(client, providerId, actor.identityId, uploadIntentId);
    });
  }

  cancel(
    actor: AuthenticatedActor,
    uploadIntentId: string,
    reason: string,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProvider(client, actor.identityId);
      const row = await this.intentForUpdate(client, providerId, actor.identityId, uploadIntentId);
      if (row.state === 'cancelled') {
        return this.mapIntent(row);
      }
      if (row.state === 'submitted') {
        throw new ConflictException('Submitted evidence upload intents cannot be cancelled.');
      }

      if (row.active_upload_session_id) {
        await client.query(
          `UPDATE evidence.upload_sessions
           SET status = 'cancelled'
           WHERE id = $1 AND status = 'requested'`,
          [row.active_upload_session_id],
        );
        await client.query(
          `UPDATE provider_workspace.upload_attempts
           SET state = 'cancelled', error_code = 'PROVIDER_CANCELLED', completed_at = now()
           WHERE upload_intent_id = $1
             AND upload_session_id = $2
             AND state = 'uploading'`,
          [uploadIntentId, row.active_upload_session_id],
        );
      }

      await client.query(
        `UPDATE provider_workspace.upload_intents
         SET state = 'cancelled',
             active_upload_session_id = NULL,
             last_error_code = 'PROVIDER_CANCELLED',
             cancelled_at = now()
         WHERE id = $1`,
        [uploadIntentId],
      );
      await this.audit(client, actor, providerId, uploadIntentId, 'provider_upload_cancelled', {
        reason,
        privateObjectKeyExposed: false,
      });
      return this.intentView(client, providerId, actor.identityId, uploadIntentId);
    });
  }

  complete(
    actor: AuthenticatedActor,
    uploadIntentId: string,
    evidenceId: string,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProvider(client, actor.identityId);
      const row = await this.intentForUpdate(client, providerId, actor.identityId, uploadIntentId);
      if (row.state === 'submitted') {
        if (row.submitted_evidence_id !== evidenceId) {
          throw new ConflictException('The upload intent was submitted with different evidence.');
        }
        return this.mapIntent(row);
      }
      if (row.state !== 'uploading' || !row.active_upload_session_id) {
        throw new ConflictException('The upload intent has no active completable attempt.');
      }

      const evidence = await client.query<{ id: string }>(
        `SELECT items.id
         FROM evidence.items AS items
         JOIN evidence.versions AS versions ON versions.id = items.current_version_id
         WHERE items.id = $1
           AND items.provider_id = $2
           AND items.requirement_id = $3
           AND versions.upload_session_id = $4`,
        [evidenceId, providerId, row.requirement_id, row.active_upload_session_id],
      );
      if (!evidence.rows[0]) {
        throw new ConflictException('Confirmed evidence does not match the active upload attempt.');
      }

      await client.query(
        `UPDATE provider_workspace.upload_attempts
         SET state = 'completed', completed_at = now()
         WHERE upload_intent_id = $1
           AND upload_session_id = $2
           AND state = 'uploading'`,
        [uploadIntentId, row.active_upload_session_id],
      );
      await client.query(
        `UPDATE provider_workspace.upload_intents
         SET state = 'submitted',
             submitted_evidence_id = $2,
             submitted_at = now(),
             last_error_code = NULL
         WHERE id = $1`,
        [uploadIntentId, evidenceId],
      );
      await this.audit(client, actor, providerId, uploadIntentId, 'provider_upload_submitted', {
        evidenceId,
        attemptCount: row.attempt_count,
        privateObjectKeyExposed: false,
      });
      return this.intentView(client, providerId, actor.identityId, uploadIntentId);
    });
  }

  list(actor: AuthenticatedActor): Promise<ProviderWorkspaceUploadIntentView[]> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProvider(client, actor.identityId);
      const result = await client.query<UploadIntentRow>(
        `${this.intentQuery()}
         WHERE intents.provider_id = $1
           AND intents.created_by_identity_id = $2
         ORDER BY intents.updated_at DESC, intents.id`,
        [providerId, actor.identityId],
      );
      return result.rows.map((row) => this.mapIntent(row));
    });
  }

  detail(
    actor: AuthenticatedActor,
    uploadIntentId: string,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.resolveProvider(client, actor.identityId);
      return this.intentView(client, providerId, actor.identityId, uploadIntentId);
    });
  }

  private async prepareLockedIntent(
    client: PoolClient,
    row: UploadIntentRow,
  ): Promise<PreparedWorkspaceUploadAttempt> {
    if (row.state === 'submitted' || row.state === 'uploading') {
      return this.prepared(row, false);
    }
    if (row.state === 'cancelled' || row.state === 'terminal_failure') {
      throw new ConflictException('The provider upload intent is terminal and cannot be retried.');
    }

    const updated = await client.query<UploadIntentRow>(
      `UPDATE provider_workspace.upload_intents
       SET state = 'uploading',
           attempt_count = attempt_count + 1,
           active_upload_session_id = NULL,
           last_error_code = NULL
       WHERE id = $1
       RETURNING *`,
      [row.upload_intent_id],
    );
    const refreshed = await this.intentById(
      client,
      row.provider_id,
      row.created_by_identity_id,
      row.upload_intent_id,
    );
    void updated;
    return this.prepared(refreshed, true);
  }

  private prepared(
    row: UploadIntentRow,
    shouldCreateSession: boolean,
  ): PreparedWorkspaceUploadAttempt {
    return {
      intent: this.mapIntent(row),
      providerId: row.provider_id,
      categoryKey: row.category_key,
      requirementKey: row.requirement_key,
      evidenceClass: row.evidence_class,
      documentType: row.document_type,
      contentType: row.content_type,
      maxBytes: Number(row.max_bytes),
      consentConfirmed: row.consent_confirmed,
      replacementForEvidenceId: row.replacement_for_evidence_id,
      attemptNumber: row.attempt_count,
      shouldCreateSession,
    };
  }

  private async resolveProvider(client: PoolClient, identityId: string): Promise<string> {
    const result = await client.query<WorkspaceContextRow>(
      `SELECT DISTINCT assignments.provider_id
       FROM authz.role_assignments AS assignments
       JOIN authz.roles AS roles ON roles.id = assignments.role_id
       JOIN provider.organizations AS organizations ON organizations.id = assignments.provider_id
       WHERE assignments.identity_id = $1
         AND assignments.scope_type = 'provider'
         AND assignments.provider_id IS NOT NULL
         AND assignments.revoked_at IS NULL
         AND assignments.starts_at <= now()
         AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
         AND roles.role_key IN ('provider_owner', 'provider_member')
         AND organizations.status <> 'archived'
       ORDER BY assignments.provider_id
       LIMIT 2`,
      [identityId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('The authenticated identity has no writable provider workspace.');
    }
    if (result.rows.length > 1) {
      throw new ConflictException('A server-owned provider workspace context is required.');
    }
    return (result.rows[0] as WorkspaceContextRow).provider_id;
  }

  private async caseContract(
    client: PoolClient,
    providerId: string,
    caseId: string,
  ): Promise<CaseContractRow> {
    const result = await client.query<CaseContractRow>(
      `SELECT
         cases.id AS case_id,
         cases.provider_id,
         cases.requirement_id,
         categories.category_key,
         categories.name AS category_name,
         requirements.requirement_key,
         requirements.label AS requirement_label,
         cases.check_key
       FROM verification.cases AS cases
       JOIN catalog.service_categories AS categories ON categories.id = cases.category_id
       JOIN catalog.requirements AS requirements ON requirements.id = cases.requirement_id
       JOIN provider.category_selections AS selections
         ON selections.provider_id = cases.provider_id
        AND selections.category_id = cases.category_id
        AND selections.requirement_version_id = cases.requirement_version_id
       WHERE cases.id = $1
         AND cases.provider_id = $2
         AND selections.status = 'selected'
         AND cases.status IN ('draft', 'awaiting_evidence', 'correction_required')`,
      [caseId, providerId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('An open provider verification case was not found.');
    }
    return row;
  }

  private assertIdempotentContract(
    row: UploadIntentRow,
    input: CreateWorkspaceUploadIntentDto,
  ): void {
    const sameContract =
      row.case_id === input.caseId &&
      row.evidence_class === input.evidenceClass &&
      row.document_type === input.documentType &&
      row.content_type === input.contentType &&
      Number(row.max_bytes) === input.maxBytes &&
      row.consent_confirmed === input.consentConfirmed &&
      row.replacement_for_evidence_id === (input.replacementForEvidenceId ?? null);
    if (!sameContract) {
      throw new ConflictException(
        'The client intent key already exists with a different upload contract.',
      );
    }
  }

  private async intentByClientKeyForUpdate(
    client: PoolClient,
    providerId: string,
    identityId: string,
    clientIntentKey: string,
  ): Promise<UploadIntentRow> {
    const result = await client.query<UploadIntentRow>(
      `${this.intentQuery()}
       WHERE intents.provider_id = $1
         AND intents.created_by_identity_id = $2
         AND intents.client_intent_key = $3
       FOR UPDATE OF intents`,
      [providerId, identityId, clientIntentKey],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Provider upload intent was not found.');
    }
    return row;
  }

  private async intentForUpdate(
    client: PoolClient,
    providerId: string,
    identityId: string,
    uploadIntentId: string,
  ): Promise<UploadIntentRow> {
    const result = await client.query<UploadIntentRow>(
      `${this.intentQuery()}
       WHERE intents.provider_id = $1
         AND intents.created_by_identity_id = $2
         AND intents.id = $3
       FOR UPDATE OF intents`,
      [providerId, identityId, uploadIntentId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Provider upload intent was not found.');
    }
    return row;
  }

  private intentView(
    client: PoolClient,
    providerId: string,
    identityId: string,
    uploadIntentId: string,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.intentById(client, providerId, identityId, uploadIntentId).then((row) =>
      this.mapIntent(row),
    );
  }

  private async intentById(
    client: PoolClient,
    providerId: string,
    identityId: string,
    uploadIntentId: string,
  ): Promise<UploadIntentRow> {
    const result = await client.query<UploadIntentRow>(
      `${this.intentQuery()}
       WHERE intents.provider_id = $1
         AND intents.created_by_identity_id = $2
         AND intents.id = $3`,
      [providerId, identityId, uploadIntentId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Provider upload intent was not found.');
    }
    return row;
  }

  private intentQuery(): string {
    return `SELECT
       intents.id AS upload_intent_id,
       intents.provider_id,
       intents.created_by_identity_id,
       intents.case_id,
       intents.requirement_id,
       intents.client_intent_key,
       intents.evidence_class,
       intents.document_type,
       intents.content_type,
       intents.max_bytes::text,
       intents.consent_confirmed,
       intents.replacement_for_evidence_id,
       intents.state,
       intents.attempt_count,
       intents.active_upload_session_id,
       intents.submitted_evidence_id,
       intents.last_error_code,
       intents.created_at,
       intents.updated_at,
       intents.submitted_at,
       intents.cancelled_at,
       categories.category_key,
       categories.name AS category_name,
       requirements.requirement_key,
       requirements.label AS requirement_label,
       cases.check_key
     FROM provider_workspace.upload_intents AS intents
     JOIN verification.cases AS cases ON cases.id = intents.case_id
     JOIN catalog.service_categories AS categories ON categories.id = cases.category_id
     JOIN catalog.requirements AS requirements ON requirements.id = intents.requirement_id`;
  }

  private mapIntent(row: UploadIntentRow): ProviderWorkspaceUploadIntentView {
    return {
      uploadIntentId: row.upload_intent_id,
      caseId: row.case_id,
      categoryKey: row.category_key,
      categoryName: row.category_name,
      requirementKey: row.requirement_key,
      requirementLabel: row.requirement_label,
      checkKey: row.check_key,
      state: row.state,
      attemptCount: row.attempt_count,
      activeUploadSessionId: row.active_upload_session_id,
      submittedEvidenceId: row.submitted_evidence_id,
      lastErrorCode: row.last_error_code,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      submittedAt: row.submitted_at?.toISOString() ?? null,
      cancelledAt: row.cancelled_at?.toISOString() ?? null,
      safeToRetry: row.state === 'interrupted' || row.state === 'retryable',
      privateObjectKeyExposed: false,
      synthetic: true,
    };
  }

  private async audit(
    client: PoolClient,
    actor: AuthenticatedActor,
    providerId: string,
    resourceId: string,
    action: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await client.query(
      `INSERT INTO platform.audit_events (
         actor_type,
         actor_id,
         provider_id,
         action,
         resource_type,
         resource_id,
         outcome,
         metadata
       ) VALUES ('identity', $1, $2, $3, 'provider_upload_intent', $4, 'success', $5::jsonb)`,
      [actor.identityId, providerId, action, resourceId, JSON.stringify(metadata)],
    );
  }
}
