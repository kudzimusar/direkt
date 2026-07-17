import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type {
  CreateProviderReviewResponseDto,
  CreateReviewAppealDto,
  CreateReviewDto,
  DecideReviewAppealDto,
  ModerateReviewDto,
  OperationsReviewQueryDto,
  ReportReviewDto,
} from './review.dto';
import type {
  OperationsReviewListView,
  ProviderReviewListView,
  ProviderReviewResponseView,
  PublicReviewView,
  ReviewAppealView,
  ReviewModerationStatus,
  ReviewView,
} from './review.types';

interface ReviewRow {
  review_id: string;
  interaction_id: string;
  customer_identity_id: string;
  public_provider_id: string;
  provider_id: string;
  provider_display_name: string;
  category_key: string;
  category_name: string;
  rating: number;
  title: string;
  body: string;
  moderation_status: ReviewModerationStatus;
  revision: number;
  created_at: Date;
  published_at: Date | null;
}

interface AppealRow {
  appeal_id: string;
  appellant_scope: 'customer' | 'provider';
  reason: string;
  status: 'submitted' | 'upheld' | 'denied';
  created_at: Date;
  decided_at: Date | null;
  decision_reason_code: string | null;
  decision_reason: string | null;
}

@Injectable()
export class ReviewRepository {
  constructor(private readonly database: DatabaseService) {}

  createReview(
    actor: AuthenticatedActor,
    interactionId: string,
    dto: CreateReviewDto,
    requestId?: string,
  ): Promise<ReviewView> {
    return this.database
      .transaction(async (client) => {
        const scope = await client.query<{
          customer_identity_id: string;
          publication_id: string;
          provider_id: string;
          category_id: string;
        }>(
          `SELECT customer_identity_id, publication_id, provider_id, category_id
         FROM interaction.tracked_interactions
         WHERE id = $1 AND customer_identity_id = $2
         FOR UPDATE`,
          [interactionId, actor.identityId],
        );
        const row = scope.rows[0];
        if (!row) throw new NotFoundException('Qualifying tracked interaction was not found.');
        const inserted = await client.query<{ id: string }>(
          `INSERT INTO interaction.reviews (
           interaction_id, customer_identity_id, publication_id, provider_id,
           category_id, rating, title, body, policy_version
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
          [
            interactionId,
            actor.identityId,
            row.publication_id,
            row.provider_id,
            row.category_id,
            dto.rating,
            dto.title.trim(),
            dto.body.trim(),
            dto.policyVersion.trim(),
          ],
        );
        const reviewId = inserted.rows[0]?.id;
        if (!reviewId) throw new Error('Review creation returned no identifier.');
        await this.audit(
          client,
          actor,
          row.provider_id,
          requestId,
          'interaction_review_created',
          reviewId,
          {
            interactionId,
            rating: dto.rating,
            trustOrRankingMutation: false,
          },
        );
        return this.load(client, reviewId, 'customer', actor.identityId);
      })
      .catch((error: unknown) => {
        const code = (error as { code?: string }).code;
        if (code === '23505') {
          throw new ConflictException('This tracked interaction already has a review.');
        }
        const message = error instanceof Error ? error.message : '';
        if (message.includes('qualifying tracked interaction')) {
          throw new BadRequestException(message);
        }
        throw error;
      });
  }

  listCustomer(actor: AuthenticatedActor): Promise<ReviewView[]> {
    return this.database.transaction(async (client) => {
      const ids = await client.query<{ id: string }>(
        `SELECT id FROM interaction.reviews
         WHERE customer_identity_id = $1 ORDER BY created_at DESC, id DESC`,
        [actor.identityId],
      );
      return Promise.all(
        ids.rows.map((row) => this.load(client, row.id, 'customer', actor.identityId)),
      );
    });
  }

  detailCustomer(actor: AuthenticatedActor, reviewId: string): Promise<ReviewView> {
    return this.database.transaction((client) =>
      this.load(client, reviewId, 'customer', actor.identityId),
    );
  }

  providerReviews(actor: AuthenticatedActor): Promise<ProviderReviewListView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.providerContext(client, actor.identityId);
      const ids = await client.query<{ id: string }>(
        `SELECT id FROM interaction.reviews WHERE provider_id = $1
         ORDER BY created_at DESC, id DESC`,
        [providerId],
      );
      return {
        providerScope: 'actor_resolved',
        items: await Promise.all(
          ids.rows.map((row) => this.load(client, row.id, 'provider', providerId)),
        ),
      };
    });
  }

  respondProvider(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: CreateProviderReviewResponseDto,
    requestId?: string,
  ): Promise<ReviewView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.providerContext(client, actor.identityId);
      try {
        await client.query(
          `INSERT INTO interaction.provider_review_responses (
             review_id, provider_id, responder_identity_id, body, policy_version
           ) VALUES ($1, $2, $3, $4, $5)`,
          [reviewId, providerId, actor.identityId, dto.body.trim(), dto.policyVersion.trim()],
        );
      } catch (error) {
        if ((error as { code?: string }).code === '23505') {
          throw new ConflictException('This review already has a provider response.');
        }
        throw error;
      }
      await this.audit(
        client,
        actor,
        providerId,
        requestId,
        'interaction_provider_review_response_created',
        reviewId,
        {
          trustOrRankingMutation: false,
        },
      );
      return this.load(client, reviewId, 'provider', providerId);
    });
  }

  createCustomerAppeal(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: CreateReviewAppealDto,
    requestId?: string,
  ): Promise<ReviewView> {
    return this.createAppeal(actor, reviewId, dto, 'customer', requestId);
  }

  createProviderAppeal(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: CreateReviewAppealDto,
    requestId?: string,
  ): Promise<ReviewView> {
    return this.createAppeal(actor, reviewId, dto, 'provider', requestId);
  }

  operationsReviews(query: OperationsReviewQueryDto): Promise<OperationsReviewListView> {
    return this.database.transaction(async (client) => {
      const values: unknown[] = [];
      let where = '';
      if (query.status) {
        values.push(query.status);
        where = `WHERE moderation_status = $${values.length}`;
      }
      const ids = await client.query<{ id: string }>(
        `SELECT id FROM interaction.reviews ${where}
         ORDER BY CASE moderation_status WHEN 'pending' THEN 1 WHEN 'appealed' THEN 2 ELSE 3 END,
                  created_at, id LIMIT 300`,
        values,
      );
      return {
        moderationScope: 'privacy_safe',
        items: await Promise.all(
          ids.rows.map((row) => this.load(client, row.id, 'operations', '')),
        ),
      };
    });
  }

  moderate(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: ModerateReviewDto,
    requestId?: string,
  ): Promise<ReviewView> {
    return this.database.transaction(async (client) => {
      const providerId = await this.providerId(client, reviewId);
      try {
        await client.query(`SELECT (interaction.moderate_review($1, $2, $3, $4, $5, $6, $7)).id`, [
          reviewId,
          actor.identityId,
          dto.targetStatus,
          dto.reasonCode.trim().toUpperCase(),
          dto.reason.trim(),
          dto.policyVersion.trim(),
          dto.expectedRevision,
        ]);
      } catch (error) {
        throw this.lifecycleError(error, 'Review');
      }
      await this.audit(
        client,
        actor,
        providerId,
        requestId,
        'interaction_review_moderated',
        reviewId,
        {
          targetStatus: dto.targetStatus,
          reasonCode: dto.reasonCode.trim().toUpperCase(),
          trustOrRankingMutation: false,
        },
      );
      return this.load(client, reviewId, 'operations', '');
    });
  }

  decideAppeal(
    actor: AuthenticatedActor,
    appealId: string,
    dto: DecideReviewAppealDto,
    requestId?: string,
  ): Promise<ReviewView> {
    return this.database.transaction(async (client) => {
      const scope = await client.query<{ review_id: string; provider_id: string }>(
        `SELECT appeals.review_id, reviews.provider_id
         FROM interaction.review_appeals AS appeals
         JOIN interaction.reviews AS reviews ON reviews.id = appeals.review_id
         WHERE appeals.id = $1`,
        [appealId],
      );
      const row = scope.rows[0];
      if (!row) throw new NotFoundException('Review appeal was not found.');
      try {
        await client.query(`SELECT (interaction.decide_review_appeal($1, $2, $3, $4, $5, $6)).id`, [
          appealId,
          actor.identityId,
          dto.decisionStatus,
          dto.reasonCode.trim().toUpperCase(),
          dto.reason.trim(),
          dto.policyVersion.trim(),
        ]);
      } catch (error) {
        throw this.lifecycleError(error, 'Appeal');
      }
      await this.audit(
        client,
        actor,
        row.provider_id,
        requestId,
        'interaction_review_appeal_decided',
        appealId,
        {
          decision: dto.decisionStatus,
          reasonCode: dto.reasonCode.trim().toUpperCase(),
        },
      );
      return this.load(client, row.review_id, 'operations', '');
    });
  }

  report(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: ReportReviewDto,
  ): Promise<{ reported: true; reviewId: string }> {
    return this.database.transaction(async (client) => {
      const review = await client.query<{ id: string }>(
        `SELECT id FROM interaction.reviews
         WHERE id = $1 AND moderation_status = 'published'`,
        [reviewId],
      );
      if (!review.rows[0]) throw new NotFoundException('Published review was not found.');
      try {
        await client.query(
          `INSERT INTO interaction.review_reports (
             review_id, reporter_identity_id, reason_code, detail
           ) VALUES ($1, $2, $3, $4)`,
          [reviewId, actor.identityId, dto.reasonCode, dto.detail.trim()],
        );
      } catch (error) {
        if ((error as { code?: string }).code === '23505') {
          throw new ConflictException('This identity already reported the review.');
        }
        throw error;
      }
      return { reported: true, reviewId };
    });
  }

  publicReviews(publicProviderId: string): Promise<PublicReviewView[]> {
    return this.database.transaction(async (client) => {
      const ids = await client.query<{ id: string }>(
        `SELECT reviews.id
         FROM interaction.reviews AS reviews
         JOIN discovery.publications AS publications ON publications.id = reviews.publication_id
         WHERE publications.id = $1
           AND publications.status = 'published'
           AND reviews.moderation_status = 'published'
         ORDER BY reviews.published_at DESC, reviews.id DESC LIMIT 100`,
        [publicProviderId],
      );
      const views = await Promise.all(
        ids.rows.map((row) => this.load(client, row.id, 'operations', '')),
      );
      return views.map((view): PublicReviewView => ({
        reviewId: view.reviewId,
        publicProviderId: view.publicProviderId,
        providerDisplayName: view.providerDisplayName,
        categoryKey: view.categoryKey,
        rating: view.rating,
        title: view.title,
        body: view.body,
        publishedAt: view.publishedAt as string,
        providerResponse: view.providerResponse,
        contactIncluded: false,
        interactionIdentifierIncluded: false,
        moderationRationaleIncluded: false,
        synthetic: true,
      }));
    });
  }

  private createAppeal(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: CreateReviewAppealDto,
    scope: 'customer' | 'provider',
    requestId?: string,
  ): Promise<ReviewView> {
    return this.database.transaction(async (client) => {
      let providerId: string | null = null;
      if (scope === 'provider') providerId = await this.providerContext(client, actor.identityId);
      try {
        await client.query(
          `INSERT INTO interaction.review_appeals (
             review_id, appellant_scope, appellant_identity_id, provider_id, reason, policy_version
           ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            reviewId,
            scope,
            actor.identityId,
            providerId,
            dto.reason.trim(),
            dto.policyVersion.trim(),
          ],
        );
      } catch (error) {
        if ((error as { code?: string }).code === '23505') {
          throw new ConflictException(
            'A submitted appeal already exists for this review and scope.',
          );
        }
        throw this.lifecycleError(error, 'Appeal');
      }
      const resolvedProviderId = providerId ?? (await this.providerId(client, reviewId));
      await this.audit(
        client,
        actor,
        resolvedProviderId,
        requestId,
        'interaction_review_appeal_created',
        reviewId,
        {
          appellantScope: scope,
        },
      );
      return this.load(
        client,
        reviewId,
        scope === 'provider' ? 'provider' : 'customer',
        scope === 'provider' ? resolvedProviderId : actor.identityId,
      );
    });
  }

  private async load(
    client: PoolClient,
    reviewId: string,
    scope: 'customer' | 'provider' | 'operations',
    scopeId: string,
  ): Promise<ReviewView> {
    const clauses = ['reviews.id = $1'];
    const values: unknown[] = [reviewId];
    if (scope === 'customer') {
      values.push(scopeId);
      clauses.push(`reviews.customer_identity_id = $${values.length}`);
    } else if (scope === 'provider') {
      values.push(scopeId);
      clauses.push(`reviews.provider_id = $${values.length}`);
    }
    const result = await client.query<ReviewRow>(
      `SELECT reviews.id AS review_id,
              reviews.interaction_id,
              reviews.customer_identity_id,
              publications.id AS public_provider_id,
              reviews.provider_id,
              profiles.display_name AS provider_display_name,
              categories.category_key,
              categories.name AS category_name,
              reviews.rating,
              reviews.title,
              reviews.body,
              reviews.moderation_status,
              reviews.revision,
              reviews.created_at,
              reviews.published_at
       FROM interaction.reviews AS reviews
       JOIN discovery.publications AS publications ON publications.id = reviews.publication_id
       JOIN provider.profiles AS profiles ON profiles.provider_id = reviews.provider_id
       JOIN catalog.service_categories AS categories ON categories.id = reviews.category_id
       WHERE ${clauses.join(' AND ')}`,
      values,
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Review was not found in the authenticated scope.');
    const [response, appeals, reports] = await Promise.all([
      client.query<{ response_id: string; body: string; created_at: Date }>(
        `SELECT id AS response_id, body, created_at
         FROM interaction.provider_review_responses WHERE review_id = $1`,
        [reviewId],
      ),
      client.query<AppealRow>(
        `SELECT id AS appeal_id, appellant_scope, reason, status, created_at,
                decided_at, decision_reason_code, decision_reason
         FROM interaction.review_appeals WHERE review_id = $1 ORDER BY created_at`,
        [reviewId],
      ),
      client.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM interaction.review_reports WHERE review_id = $1`,
        [reviewId],
      ),
    ]);
    const responseRow = response.rows[0];
    return {
      reviewId: row.review_id,
      interactionId: row.interaction_id,
      publicProviderId: row.public_provider_id,
      providerDisplayName: row.provider_display_name,
      categoryKey: row.category_key,
      categoryName: row.category_name,
      rating: row.rating,
      title: row.title,
      body: row.body,
      moderationStatus: row.moderation_status,
      revision: row.revision,
      createdAt: row.created_at.toISOString(),
      publishedAt: row.published_at?.toISOString() ?? null,
      providerResponse: responseRow
        ? ({
            responseId: responseRow.response_id,
            body: responseRow.body,
            createdAt: responseRow.created_at.toISOString(),
            providerIdentityExposed: false,
          } satisfies ProviderReviewResponseView)
        : null,
      appeals: appeals.rows.map((appeal): ReviewAppealView => ({
        appealId: appeal.appeal_id,
        appellantScope: appeal.appellant_scope,
        reason: appeal.reason,
        status: appeal.status,
        createdAt: appeal.created_at.toISOString(),
        decidedAt: appeal.decided_at?.toISOString() ?? null,
        decisionReasonCode: appeal.decision_reason_code,
        decisionReason: appeal.decision_reason,
        actorIdentityExposed: false,
      })),
      reportsCount: Number(reports.rows[0]?.count ?? 0),
      customerIdentityExposed: false,
      contactIncluded: false,
      interactionPrivateDetailIncluded: false,
      internalRationaleIncluded: false,
      trustOrRankingMutation: false,
      synthetic: true,
    };
  }

  private async providerContext(client: PoolClient, identityId: string): Promise<string> {
    const result = await client.query<{ provider_id: string }>(
      `SELECT DISTINCT assignments.provider_id
       FROM authz.role_assignments AS assignments
       JOIN authz.roles AS roles ON roles.id = assignments.role_id
       WHERE assignments.identity_id = $1
         AND assignments.scope_type = 'provider'
         AND assignments.provider_id IS NOT NULL
         AND assignments.revoked_at IS NULL
         AND assignments.starts_at <= now()
         AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
         AND roles.role_key IN ('provider_owner', 'provider_member', 'provider_responder')
       ORDER BY assignments.provider_id LIMIT 2`,
      [identityId],
    );
    if (result.rows.length === 0)
      throw new NotFoundException('No active provider workspace was found.');
    if (result.rows.length > 1)
      throw new ConflictException('A server-owned provider workspace context is required.');
    return (result.rows[0] as { provider_id: string }).provider_id;
  }

  private async providerId(client: PoolClient, reviewId: string): Promise<string> {
    const result = await client.query<{ provider_id: string }>(
      `SELECT provider_id FROM interaction.reviews WHERE id = $1`,
      [reviewId],
    );
    const providerId = result.rows[0]?.provider_id;
    if (!providerId) throw new NotFoundException('Review was not found.');
    return providerId;
  }

  private lifecycleError(error: unknown, resource: string): Error {
    const message = error instanceof Error ? error.message : `${resource} lifecycle failed.`;
    if (message.toLowerCase().includes('not found')) return new NotFoundException(message);
    if (message.toLowerCase().includes('conflict') || message.toLowerCase().includes('already')) {
      return new ConflictException(message);
    }
    return new BadRequestException(message);
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
         request_id, actor_type, actor_id, provider_id, action,
         resource_type, resource_id, outcome, metadata
       ) VALUES ($1, 'identity', $2, $3, $4, 'interaction_review', $5, 'success', $6::jsonb)`,
      [
        requestId ?? null,
        actor.identityId,
        providerId,
        action,
        resourceId,
        JSON.stringify(metadata),
      ],
    );
  }
}
