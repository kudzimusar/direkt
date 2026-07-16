import type { Metadata } from 'next';
import {
  DenseTableRegion,
  MetricCard,
  PermissionAction,
  StatusPill,
  WorkflowStateCard,
  WorkspaceIntro,
} from '@/components/operations-workspace';
import { syntheticSupervisorSession } from '@/lib/session';

export const metadata: Metadata = { title: 'Field workflow' };

const assignments = [
  {
    workItem: 'FIELD-S7-001',
    caseId: 'CASE-S7-004',
    provider: 'Synthetic Mobile Mechanic',
    agent: 'Synthetic field agent A',
    schedule: '16 Jul · 13:00',
    due: '16 Jul · 17:00',
    state: 'In progress',
    tone: 'info' as const,
  },
  {
    workItem: 'FIELD-S7-002',
    caseId: 'CASE-S7-005',
    provider: 'Synthetic Appliance Lab',
    agent: 'Synthetic field agent B',
    schedule: '16 Jul · 09:00',
    due: '16 Jul · 11:00',
    state: 'Unable to verify',
    tone: 'warning' as const,
  },
  {
    workItem: 'FIELD-S7-003',
    caseId: 'CASE-S7-006',
    provider: 'Synthetic Copperbelt Repairs',
    agent: 'Synthetic field agent C',
    schedule: '15 Jul · 14:00',
    due: '15 Jul · 18:00',
    state: 'Missed',
    tone: 'danger' as const,
  },
] as const;

export default function FieldWorkPage() {
  return (
    <section aria-labelledby="field-work-heading">
      <WorkspaceIntro
        eyebrow="Stage 7C · advisory field operations"
        title="Field workflow"
        description="Assignment-bound inspections, structured observations, safe terminal outcomes and idempotent offline submission. Field agents cannot create claims or final decisions."
        headingId="field-work-heading"
      >
        <PermissionAction
          session={syntheticSupervisorSession}
          permission="operations.field_work.manage"
          label="Create assignment"
          deniedLabel="Assignment denied"
          accessKey="n"
        />
      </WorkspaceIntro>

      <div className="metric-grid" aria-label="Field workflow summary">
        <MetricCard
          label="Scheduled"
          value="1"
          note="Future assignment with an active field-agent identity."
          tone="info"
        />
        <MetricCard
          label="In progress"
          value="1"
          note="Accepted and started through valid state transitions."
          tone="info"
        />
        <MetricCard
          label="Missed"
          value="1"
          note="Terminal advisory state; no verification result is created."
          tone="danger"
        />
        <MetricCard
          label="Offline replays"
          value="0"
          note="Duplicate client keys return the original submission."
          tone="success"
        />
      </div>

      <DenseTableRegion label="Synthetic field assignments">
        <table>
          <caption>Structured field work items</caption>
          <thead>
            <tr>
              <th scope="col">Work item</th>
              <th scope="col">Case</th>
              <th scope="col">Provider</th>
              <th scope="col">Field agent</th>
              <th scope="col">Scheduled</th>
              <th scope="col">Due</th>
              <th scope="col">State</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.workItem} data-queue-row tabIndex={0}>
                <th scope="row">{assignment.workItem}</th>
                <td>{assignment.caseId}</td>
                <td>{assignment.provider}</td>
                <td>{assignment.agent}</td>
                <td>{assignment.schedule}</td>
                <td>{assignment.due}</td>
                <td>
                  <StatusPill tone={assignment.tone}>{assignment.state}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <div className="split-workspace">
        <section className="workspace-panel" aria-labelledby="inspection-heading">
          <h2 id="inspection-heading">Structured inspection preview</h2>
          <dl className="definition-grid">
            <div>
              <dt>Template</dt>
              <dd>standard_field_inspection · v1</dd>
            </div>
            <div>
              <dt>Checklist</dt>
              <dd>standard-field-checklist-v1</dd>
            </div>
            <div>
              <dt>Provider presence</dt>
              <dd>Confirmed</dd>
            </div>
            <div>
              <dt>Evidence consistency</dt>
              <dd>Not observed</dd>
            </div>
            <div>
              <dt>Outcome</dt>
              <dd>Inconclusive</dd>
            </div>
            <div>
              <dt>Trust effect</dt>
              <dd>Advisory only</dd>
            </div>
          </dl>
        </section>
        <aside className="workspace-panel" aria-labelledby="field-safety-heading">
          <h2 id="field-safety-heading">Safety and privacy</h2>
          <ul>
            <li>No private coordinates are displayed or accepted in public-safe text.</li>
            <li>Private notes and evidence identifiers remain excluded from responses.</li>
            <li>Safety abort, missed and unable-to-verify are explicit terminal states.</li>
            <li>Reassignment and cancellation preserve the original work-item history.</li>
          </ul>
        </aside>
      </div>

      <div className="workflow-state-grid" aria-label="Field workflow critical states">
        <WorkflowStateCard
          state="loading"
          title="Assignments loading"
          description="The queue announces progress without rendering stale assignment data."
          tone="info"
        />
        <WorkflowStateCard
          state="empty"
          title="No assigned visits"
          description="A field agent sees only their active and historical scoped work."
          tone="neutral"
        />
        <WorkflowStateCard
          state="conflicting_action"
          title="Offline conflict"
          description="A reused client key with a different payload is rejected."
          tone="warning"
        />
        <WorkflowStateCard
          state="access_denied"
          title="Wrong field agent"
          description="Another field agent receives a not-found response for the work item."
          tone="danger"
        />
      </div>

      <p className="api-boundary-note">
        API boundary: <code>/api/v1/operations/field-work-items</code>. The portal does not activate
        a production mobile field application.
      </p>
    </section>
  );
}
