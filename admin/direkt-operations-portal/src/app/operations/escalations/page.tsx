import type { Metadata } from 'next';
import {
  DenseTableRegion,
  PermissionAction,
  StatusPill,
  WorkflowStateCard,
  WorkspaceIntro,
} from '@/components/operations-workspace';
import { syntheticSupervisorSession } from '@/lib/session';

export const metadata: Metadata = { title: 'Escalations and overrides' };

const escalations = [
  {
    id: 'ESC-S7-001',
    caseId: 'CASE-S7-001',
    severity: 'Critical',
    tone: 'danger' as const,
    owner: 'Synthetic trust supervisor',
    due: '16 Jul · 12:30',
    status: 'In progress',
  },
  {
    id: 'ESC-S7-002',
    caseId: 'CASE-S7-007',
    severity: 'Medium',
    tone: 'warning' as const,
    owner: 'Synthetic administrator',
    due: '16 Jul · 18:00',
    status: 'Open',
  },
] as const;

export default function EscalationsPage() {
  return (
    <section aria-labelledby="escalations-heading">
      <WorkspaceIntro
        eyebrow="Stage 7D · reasoned escalation controls"
        title="Escalations and overrides"
        description="Explicit severity, owner, due date and resolution state, plus independent four-eyes authorization for high-risk requests. Authorization never creates a decision or claim."
        headingId="escalations-heading"
      >
        <PermissionAction
          session={syntheticSupervisorSession}
          permission="operations.escalations.manage"
          label="Create escalation"
          deniedLabel="Escalation denied"
        />
        <PermissionAction
          session={syntheticSupervisorSession}
          permission="operations.override.request"
          label="Request high-risk override"
          deniedLabel="Override denied"
        />
      </WorkspaceIntro>

      <DenseTableRegion label="Synthetic case escalations">
        <table>
          <caption>Policy-versioned escalation queue</caption>
          <thead>
            <tr>
              <th scope="col">Escalation</th>
              <th scope="col">Case</th>
              <th scope="col">Severity</th>
              <th scope="col">Owner</th>
              <th scope="col">Due</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {escalations.map((item) => (
              <tr key={item.id} data-queue-row tabIndex={0}>
                <th scope="row">{item.id}</th>
                <td>{item.caseId}</td>
                <td><StatusPill tone={item.tone}>{item.severity}</StatusPill></td>
                <td>{item.owner}</td>
                <td>{item.due}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <div className="split-workspace">
        <section className="workspace-panel" aria-labelledby="override-heading">
          <h2 id="override-heading">High-risk authorization request</h2>
          <dl className="definition-grid">
            <div><dt>Request</dt><dd>OVERRIDE-S7-001</dd></div>
            <div><dt>Case</dt><dd>CASE-S7-008</dd></div>
            <div><dt>Requested result</dt><dd>Approved</dd></div>
            <div><dt>Mandatory evidence</dt><dd><StatusPill tone="success">Complete</StatusPill></dd></div>
            <div><dt>Evidence snapshot</dt><dd>2 current clean versions</dd></div>
            <div><dt>Trust-state effect</dt><dd>None until a separate decision</dd></div>
          </dl>
        </section>

        <aside className="workspace-panel" aria-labelledby="approval-heading">
          <h2 id="approval-heading">Four-eyes approval</h2>
          <ol className="approval-track">
            <li><span>Requester</span><strong>Synthetic reviewer</strong></li>
            <li><span>Approver 1</span><StatusPill tone="success">Approved</StatusPill></li>
            <li><span>Approver 2</span><StatusPill tone="warning">Pending</StatusPill></li>
          </ol>
          <PermissionAction
            session={syntheticSupervisorSession}
            permission="operations.override.approve"
            label="Record independent approval"
            deniedLabel="Approval denied"
          />
        </aside>
      </div>

      <div className="workflow-state-grid" aria-label="Escalation and override critical states">
        <WorkflowStateCard state="overdue" title="Escalation overdue" description="Severity and due state remain visible until an auditable resolution." tone="danger" />
        <WorkflowStateCard state="conflicting_action" title="Duplicate approver" description="The same identity cannot count twice toward four-eyes approval." tone="warning" />
        <WorkflowStateCard state="access_denied" title="Self-approval denied" description="Requester, provider creator and evidence submitter cannot approve." tone="danger" />
        <WorkflowStateCard state="blocked" title="Mandatory evidence missing" description="An override cannot bypass incomplete evidence or provider/category scope." tone="warning" />
      </div>

      <p className="api-boundary-note">
        API boundaries: <code>/api/v1/operations/escalations</code> and <code>/api/v1/operations/high-risk-overrides</code>.
      </p>
    </section>
  );
}
