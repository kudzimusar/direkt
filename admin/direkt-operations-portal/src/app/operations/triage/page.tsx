import type { Metadata } from 'next';
import {
  DenseTableRegion,
  MetricCard,
  StatusPill,
  WorkflowStateCard,
  WorkspaceIntro,
} from '@/components/operations-workspace';

export const metadata: Metadata = { title: 'Triage queue' };

const triageItems = [
  {
    caseId: 'CASE-S7-001',
    provider: 'Synthetic Copperbelt Repairs',
    check: 'Representative identity',
    owner: 'Synthetic reviewer',
    age: '2h 14m',
    priority: 'Critical',
    priorityTone: 'danger' as const,
    sla: 'Breached',
    slaTone: 'danger' as const,
  },
  {
    caseId: 'CASE-S7-002',
    provider: 'Synthetic Mobile Mechanic',
    check: 'Operating model',
    owner: 'Unassigned',
    age: '51m',
    priority: 'High',
    priorityTone: 'warning' as const,
    sla: 'Due soon',
    slaTone: 'warning' as const,
  },
  {
    caseId: 'CASE-S7-003',
    provider: 'Synthetic Appliance Lab',
    check: 'Experience evidence',
    owner: 'Synthetic reviewer',
    age: '18m',
    priority: 'Normal',
    priorityTone: 'info' as const,
    sla: 'Within SLA',
    slaTone: 'success' as const,
  },
] as const;

export default function TriagePage() {
  return (
    <section aria-labelledby="triage-heading">
      <WorkspaceIntro
        eyebrow="Stage 7A · role-scoped operations"
        title="Triage queue"
        description="Deterministic priority, ownership, queue age and service-level state. The backend resolves role scope; this page never broadens access."
        headingId="triage-heading"
      >
        <div className="workspace-filter">
          <label htmlFor="triage-filter">Filter synthetic queue</label>
          <input
            id="triage-filter"
            data-operations-filter
            type="search"
            placeholder="Case, provider, check or owner"
          />
        </div>
      </WorkspaceIntro>

      <div className="metric-grid" aria-label="Triage summary">
        <MetricCard
          label="Visible cases"
          value="3"
          note="Scoped to the active synthetic permission snapshot."
          tone="info"
        />
        <MetricCard
          label="Breached"
          value="1"
          note="Critical because the active SLA state is breached."
          tone="danger"
        />
        <MetricCard
          label="Unassigned"
          value="1"
          note="Available only to roles with queue-wide visibility."
          tone="warning"
        />
        <MetricCard
          label="Blocked"
          value="0"
          note="No mandatory-evidence block in this fixture."
          tone="success"
        />
      </div>

      <DenseTableRegion label="Synthetic verification triage queue">
        <table>
          <caption>Role-scoped verification cases</caption>
          <thead>
            <tr>
              <th scope="col">Case</th>
              <th scope="col">Provider</th>
              <th scope="col">Check</th>
              <th scope="col">Owner</th>
              <th scope="col">Age</th>
              <th scope="col">Priority</th>
              <th scope="col">SLA</th>
            </tr>
          </thead>
          <tbody>
            {triageItems.map((item) => (
              <tr key={item.caseId} data-queue-row tabIndex={0}>
                <th scope="row">{item.caseId}</th>
                <td>{item.provider}</td>
                <td>{item.check}</td>
                <td>{item.owner}</td>
                <td>{item.age}</td>
                <td>
                  <StatusPill tone={item.priorityTone}>{item.priority}</StatusPill>
                </td>
                <td>
                  <StatusPill tone={item.slaTone}>{item.sla}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <div className="workflow-state-grid" aria-label="Triage critical states">
        <WorkflowStateCard
          state="loading"
          title="Loading"
          description="Keep the queue shell and announce progress without flashing private data."
          tone="info"
        />
        <WorkflowStateCard
          state="empty"
          title="No visible work"
          description="An empty queue is distinct from an authorization failure."
          tone="neutral"
        />
        <WorkflowStateCard
          state="overdue"
          title="Overdue work"
          description="Age and SLA state remain visible without evidence contents."
          tone="danger"
        />
        <WorkflowStateCard
          state="access_denied"
          title="Access denied"
          description="Support, finance, provider and field-agent roles cannot acquire reviewer scope."
          tone="warning"
        />
      </div>

      <p className="api-boundary-note">
        API boundary: <code>GET /api/v1/operations/verification-queue</code>. No portal module
        imports a database, object store or backend repository.
      </p>
    </section>
  );
}
