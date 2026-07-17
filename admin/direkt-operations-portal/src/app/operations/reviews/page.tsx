import type { Metadata } from 'next';
import {
  DenseTableRegion,
  MetricCard,
  PermissionAction,
  StatusPill,
  WorkflowStateCard,
  WorkspaceIntro,
} from '@/components/operations-workspace';
import { operationsEndpoints } from '@/lib/operations-api';
import { syntheticSupervisorSession } from '@/lib/session';

export const metadata: Metadata = { title: 'Review moderation' };

const reviews = [
  {
    id: 'REV-S8-001',
    provider: 'Synthetic Copperbelt Repairs',
    rating: '5/5',
    title: 'Clear and professional service',
    status: 'Pending',
    tone: 'info' as const,
    revision: 1,
    response: 'Not submitted',
    appeal: 'None',
  },
  {
    id: 'REV-S8-002',
    provider: 'Synthetic Garden Care',
    rating: '2/5',
    title: 'Timing did not match the plan',
    status: 'Appealed',
    tone: 'warning' as const,
    revision: 3,
    response: 'Submitted',
    appeal: 'Customer appeal submitted',
  },
  {
    id: 'REV-S8-003',
    provider: 'Synthetic Mobile Mechanic',
    rating: '4/5',
    title: 'Useful diagnosis and explanation',
    status: 'Published',
    tone: 'success' as const,
    revision: 2,
    response: 'Submitted',
    appeal: 'None',
  },
] as const;

export default function ReviewModerationPage() {
  return (
    <section aria-labelledby="review-moderation-heading">
      <WorkspaceIntro
        eyebrow="Stage 8E · moderated public output"
        title="Review moderation and appeals"
        description="Moderate one review per qualifying tracked interaction, preserve one provider response, and decide appeals with explicit reason codes and optimistic revisions."
        headingId="review-moderation-heading"
      >
        <PermissionAction
          session={syntheticSupervisorSession}
          permission="operations.reviews.manage"
          label="Open moderation action"
          deniedLabel="Moderation denied"
          accessKey="m"
        />
      </WorkspaceIntro>

      <div className="metric-grid" aria-label="Review moderation summary">
        <MetricCard
          label="Pending"
          value="1"
          note="Not public until an authorized moderation transition publishes it."
          tone="info"
        />
        <MetricCard
          label="Appealed"
          value="1"
          note="Prior withheld or removed state is retained for a denied appeal."
          tone="warning"
        />
        <MetricCard
          label="Published"
          value="1"
          note="Only the public allowlist is returned on provider pages."
          tone="success"
        />
        <MetricCard
          label="Trust mutations"
          value="0"
          note="Reviews and responses cannot create claims, publication or ranking state."
          tone="neutral"
        />
      </div>

      <DenseTableRegion label="Synthetic review moderation queue">
        <table>
          <caption>Tracked-interaction reviews</caption>
          <thead>
            <tr>
              <th scope="col">Review</th>
              <th scope="col">Provider</th>
              <th scope="col">Rating</th>
              <th scope="col">Title</th>
              <th scope="col">Status</th>
              <th scope="col">Revision</th>
              <th scope="col">Provider response</th>
              <th scope="col">Appeal</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} data-queue-row tabIndex={0}>
                <th scope="row">{review.id}</th>
                <td>{review.provider}</td>
                <td>{review.rating}</td>
                <td>{review.title}</td>
                <td>
                  <StatusPill tone={review.tone}>{review.status}</StatusPill>
                </td>
                <td>{review.revision}</td>
                <td>{review.response}</td>
                <td>{review.appeal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <section className="workspace-panel" aria-labelledby="review-action-heading">
        <h2 id="review-action-heading">Reasoned action contract</h2>
        <dl className="definition-grid">
          <div>
            <dt>Moderation targets</dt>
            <dd>Published, withheld or removed</dd>
          </div>
          <div>
            <dt>Concurrency</dt>
            <dd>Expected revision required</dd>
          </div>
          <div>
            <dt>Appeal decisions</dt>
            <dd>Upheld or denied with reason</dd>
          </div>
          <div>
            <dt>Denied appeal</dt>
            <dd>Restores the original withheld or removed state</dd>
          </div>
          <div>
            <dt>Provider response</dt>
            <dd>One immutable response</dd>
          </div>
          <div>
            <dt>Public exposure</dt>
            <dd>Published reviews only</dd>
          </div>
        </dl>
      </section>

      <div className="workflow-state-grid" aria-label="Review moderation critical states">
        <WorkflowStateCard
          state="loading"
          title="Moderation queue loading"
          description="No customer identity, contact or private interaction detail enters the loading shell."
          tone="info"
        />
        <WorkflowStateCard
          state="empty"
          title="No reviews awaiting action"
          description="An empty queue is valid; no synthetic placeholder becomes public data."
          tone="neutral"
        />
        <WorkflowStateCard
          state="stale_revision"
          title="Review changed"
          description="Refresh the current revision before applying a moderation decision."
          tone="warning"
        />
        <WorkflowStateCard
          state="access_denied"
          title="Manage permission required"
          description="Read-only reviewers cannot publish, withhold, remove or decide appeals."
          tone="danger"
        />
      </div>

      <p className="api-boundary-note">
        API-only boundaries: <code>{operationsEndpoints.reviews}</code>,{' '}
        <code>{operationsEndpoints.reviewModeration('review-id')}</code> and{' '}
        <code>{operationsEndpoints.reviewAppealDecision('appeal-id')}</code>.
      </p>
    </section>
  );
}
