import type { Metadata } from 'next';
import {
  DenseTableRegion,
  MetricCard,
  StatusPill,
  WorkflowStateCard,
  WorkspaceIntro,
} from '@/components/operations-workspace';
import { operationsEndpoints } from '@/lib/operations-api';

export const metadata: Metadata = { title: 'Interaction history' };

const interactions = [
  {
    id: 'INT-S8-001',
    provider: 'Synthetic Copperbelt Repairs',
    category: 'Plumbing',
    status: 'Completed',
    tone: 'success' as const,
    events: 7,
    handoffs: 1,
    complaints: 0,
    review: 'Published',
    lastEvent: 'Provider response submitted',
  },
  {
    id: 'INT-S8-002',
    provider: 'Synthetic Mobile Mechanic',
    category: 'Vehicle repair',
    status: 'Active',
    tone: 'info' as const,
    events: 3,
    handoffs: 0,
    complaints: 1,
    review: 'Not eligible',
    lastEvent: 'Provider accepted',
  },
  {
    id: 'INT-S8-003',
    provider: 'Synthetic Garden Care',
    category: 'Landscaping',
    status: 'Cancelled',
    tone: 'warning' as const,
    events: 2,
    handoffs: 0,
    complaints: 0,
    review: 'Not eligible',
    lastEvent: 'Customer cancelled',
  },
] as const;

export default function InteractionHistoryPage() {
  return (
    <section aria-labelledby="interaction-history-heading">
      <WorkspaceIntro
        eyebrow="Stage 8D · privacy-safe lifecycle"
        title="Interaction history"
        description="Read-only tracked enquiry summaries from the API. Customer identity, contact values, private evidence and moderation rationale are excluded from this workspace."
        headingId="interaction-history-heading"
      />

      <div className="metric-grid" aria-label="Interaction summary">
        <MetricCard
          label="Active"
          value="1"
          note="Accepted enquiries with an open tracked interaction."
          tone="info"
        />
        <MetricCard
          label="Completed"
          value="1"
          note="Closed interactions with deterministic review eligibility."
          tone="success"
        />
        <MetricCard
          label="Cancelled"
          value="1"
          note="Cancelled interactions never become review eligible."
          tone="warning"
        />
        <MetricCard
          label="Raw contacts"
          value="0"
          note="Only aggregate handoff counts are returned to operations."
          tone="neutral"
        />
      </div>

      <DenseTableRegion label="Privacy-safe tracked interactions">
        <table>
          <caption>Tracked interaction queue</caption>
          <thead>
            <tr>
              <th scope="col">Interaction</th>
              <th scope="col">Provider</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
              <th scope="col">Events</th>
              <th scope="col">Handoffs</th>
              <th scope="col">Complaints</th>
              <th scope="col">Review</th>
              <th scope="col">Last event</th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((interaction) => (
              <tr key={interaction.id} data-queue-row tabIndex={0}>
                <th scope="row">{interaction.id}</th>
                <td>{interaction.provider}</td>
                <td>{interaction.category}</td>
                <td>
                  <StatusPill tone={interaction.tone}>{interaction.status}</StatusPill>
                </td>
                <td>{interaction.events}</td>
                <td>{interaction.handoffs}</td>
                <td>{interaction.complaints}</td>
                <td>{interaction.review}</td>
                <td>{interaction.lastEvent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <section className="workspace-panel" aria-labelledby="interaction-projection-heading">
        <h2 id="interaction-projection-heading">Operations projection allowlist</h2>
        <dl className="definition-grid">
          <div>
            <dt>Lifecycle state</dt>
            <dd>Included</dd>
          </div>
          <div>
            <dt>Event and linkage counts</dt>
            <dd>Included</dd>
          </div>
          <div>
            <dt>Customer identity</dt>
            <dd>Excluded</dd>
          </div>
          <div>
            <dt>Contact value or hint</dt>
            <dd>Excluded</dd>
          </div>
          <div>
            <dt>Private evidence</dt>
            <dd>Excluded</dd>
          </div>
          <div>
            <dt>Trust or ranking mutation</dt>
            <dd>Forbidden</dd>
          </div>
        </dl>
      </section>

      <div className="workflow-state-grid" aria-label="Interaction history states">
        <WorkflowStateCard
          state="loading"
          title="Interactions loading"
          description="The shell contains no customer identifier or contact placeholder."
          tone="info"
        />
        <WorkflowStateCard
          state="empty"
          title="No tracked interactions"
          description="An empty queue is valid and does not imply access to enquiries outside operations scope."
          tone="neutral"
        />
        <WorkflowStateCard
          state="access_denied"
          title="Permission denied"
          description="The API requires operations.interactions.read on an active global assignment."
          tone="danger"
        />
        <WorkflowStateCard
          state="consent_expired"
          title="Handoff no longer current"
          description="Operations still sees only an aggregate count; providers lose current handoff access."
          tone="warning"
        />
      </div>

      <p className="api-boundary-note">
        API-only boundary: <code>{operationsEndpoints.interactions}</code>. No browser database
        client is imported.
      </p>
    </section>
  );
}
