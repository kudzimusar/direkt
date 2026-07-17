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

export const metadata: Metadata = { title: 'Customer complaints' };

const complaints = [
  {
    id: 'CMP-S8-001',
    interaction: 'INT-S8-002',
    provider: 'Synthetic Mobile Mechanic',
    type: 'Provider conduct',
    summary: 'Customer reported a bounded conduct concern after the tracked interaction began.',
    status: 'Submitted',
    tone: 'warning' as const,
    revision: 1,
  },
  {
    id: 'CMP-S8-002',
    interaction: 'INT-S8-004',
    provider: 'Synthetic Copperbelt Repairs',
    type: 'Contact privacy',
    summary: 'Customer asked operations to review use of an expired contact handoff.',
    status: 'Triaged',
    tone: 'info' as const,
    revision: 2,
  },
  {
    id: 'CMP-S8-003',
    interaction: 'INT-S8-005',
    provider: 'Synthetic Garden Care',
    type: 'Service quality',
    summary: 'Operations recorded a reasoned resolution without changing verification state.',
    status: 'Resolved',
    tone: 'success' as const,
    revision: 3,
  },
] as const;

export default function CustomerComplaintsPage() {
  return (
    <section aria-labelledby="customer-complaints-heading">
      <WorkspaceIntro
        eyebrow="Stage 8F · customer complaint linkage"
        title="Customer complaints"
        description="Customer-owned complaints are linked to tracked interactions and processed through a separate state machine from Phase 7 internal incidents."
        headingId="customer-complaints-heading"
      >
        <PermissionAction
          session={syntheticSupervisorSession}
          permission="operations.complaints.manage"
          label="Open complaint transition"
          deniedLabel="Transition denied"
          accessKey="c"
        />
      </WorkspaceIntro>

      <div className="metric-grid" aria-label="Customer complaint summary">
        <MetricCard
          label="Submitted"
          value="1"
          note="Awaiting a reasoned triage or direct resolution."
          tone="warning"
        />
        <MetricCard
          label="Triaged"
          value="1"
          note="Linked interaction context is privacy-safe and read-only."
          tone="info"
        />
        <MetricCard
          label="Resolved"
          value="1"
          note="Resolution cannot change provider verification or publication."
          tone="success"
        />
        <MetricCard
          label="Phase 7 incident links"
          value="0"
          note="Customer complaints remain a distinct Stage 8 domain."
          tone="neutral"
        />
      </div>

      <DenseTableRegion label="Synthetic customer complaint queue">
        <table>
          <caption>Tracked-interaction customer complaints</caption>
          <thead>
            <tr>
              <th scope="col">Complaint</th>
              <th scope="col">Interaction</th>
              <th scope="col">Provider</th>
              <th scope="col">Type</th>
              <th scope="col">Summary</th>
              <th scope="col">Status</th>
              <th scope="col">Revision</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.id} data-queue-row tabIndex={0}>
                <th scope="row">{complaint.id}</th>
                <td>{complaint.interaction}</td>
                <td>{complaint.provider}</td>
                <td>{complaint.type}</td>
                <td>{complaint.summary}</td>
                <td>
                  <StatusPill tone={complaint.tone}>{complaint.status}</StatusPill>
                </td>
                <td>{complaint.revision}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <section className="workspace-panel" aria-labelledby="complaint-state-heading">
        <h2 id="complaint-state-heading">Complaint state machine</h2>
        <dl className="definition-grid">
          <div>
            <dt>Submitted</dt>
            <dd>May transition to triaged or resolved</dd>
          </div>
          <div>
            <dt>Triaged</dt>
            <dd>May transition to resolved or closed</dd>
          </div>
          <div>
            <dt>Resolved</dt>
            <dd>May transition to closed</dd>
          </div>
          <div>
            <dt>Concurrency</dt>
            <dd>Expected revision required</dd>
          </div>
          <div>
            <dt>Audit</dt>
            <dd>Operator, reason and policy version recorded</dd>
          </div>
          <div>
            <dt>Phase 7 incidents</dt>
            <dd>Not joined or exposed</dd>
          </div>
        </dl>
      </section>

      <div className="workflow-state-grid" aria-label="Customer complaint critical states">
        <WorkflowStateCard
          state="loading"
          title="Complaints loading"
          description="The shell excludes customer contact and private evidence."
          tone="info"
        />
        <WorkflowStateCard
          state="empty"
          title="No customer complaints"
          description="An empty queue is distinct from the internal incident queue."
          tone="neutral"
        />
        <WorkflowStateCard
          state="stale_revision"
          title="Complaint changed"
          description="Refresh before retrying a reasoned transition."
          tone="warning"
        />
        <WorkflowStateCard
          state="access_denied"
          title="Manage permission required"
          description="Auditors can read safe projections but cannot mutate complaint state."
          tone="danger"
        />
      </div>

      <p className="api-boundary-note">
        API-only boundaries: <code>{operationsEndpoints.interactionComplaints}</code> and{' '}
        <code>{operationsEndpoints.interactionComplaintTransition('complaint-id')}</code>. Internal
        incidents remain at <code>{operationsEndpoints.incidents}</code>.
      </p>
    </section>
  );
}
