import Link from 'next/link';
import type { Metadata } from 'next';
import { MetricCard, WorkflowStateCard, WorkspaceIntro } from '@/components/operations-workspace';

export const metadata: Metadata = { title: 'Mission control' };

const workspaces = [
  {
    label: 'Triage queue',
    href: '/operations/triage',
    note: 'Prioritize new and ageing cases by SLA, risk and ownership.',
    action: 'Open queue',
  },
  {
    label: 'Evidence review',
    href: '/operations/evidence-review',
    note: 'Review assigned private evidence with short-lived, revocable access.',
    action: 'Review evidence',
  },
  {
    label: 'Field workflow',
    href: '/operations/field-work',
    note: 'Coordinate structured visits and advisory field observations.',
    action: 'View assignments',
  },
  {
    label: 'Escalations and overrides',
    href: '/operations/escalations',
    note: 'Handle high-risk exceptions with explicit ownership and four-eyes control.',
    action: 'Open escalations',
  },
  {
    label: 'Incidents and complaints',
    href: '/operations/incidents',
    note: 'Triage trust, safety and operational incidents without broadening data access.',
    action: 'Review cases',
  },
  {
    label: 'Expiry and reporting',
    href: '/operations/reporting',
    note: 'Track renewal pressure, turnaround and privacy-safe operational trends.',
    action: 'View reporting',
  },
] as const;

export default function OperationsPage() {
  return (
    <section aria-labelledby="mission-control-heading">
      {/* Historical Phase 7 closure is preserved by repository controls; no phase label is rendered. */}
      <WorkspaceIntro
        eyebrow="Operations"
        title="Mission control"
        description="Prioritize trust and safety work, review evidence securely, coordinate field activity and keep every consequential action auditable."
        headingId="mission-control-heading"
      />

      <section className="ops-command-hero" aria-label="Operations command summary">
        <div className="ops-command-heading">
          <div>
            <h2>What needs attention now</h2>
            <p>
              Start with overdue and unassigned work, then move through evidence, field tasks and
              escalations without losing case context.
            </p>
          </div>
          <div className="ops-live-context" aria-label="Current operational context">
            <span className="ops-context-chip">Lusaka pilot context</span>
            <span className="ops-context-chip">Synthetic review data</span>
            <span className="ops-context-chip">Permission-scoped</span>
          </div>
        </div>

        <div className="metric-grid" aria-label="Operations summary">
          <MetricCard
            label="Triage visible"
            value="3"
            note="One breached case and one unassigned case."
            tone="danger"
          />
          <MetricCard
            label="Field work active"
            value="1"
            note="Advisory observation in progress."
            tone="info"
          />
          <MetricCard
            label="Escalations active"
            value="2"
            note="Owner and due date required."
            tone="warning"
          />
          <MetricCard
            label="Evidence due"
            value="2"
            note="Assigned review items need action."
            tone="warning"
          />
        </div>
      </section>

      <section className="workspace-panel" aria-labelledby="workspace-links-heading">
        <div className="ops-command-heading">
          <div>
            <p className="eyebrow">Workspaces</p>
            <h2 id="workspace-links-heading">Move directly to the task</h2>
          </div>
        </div>
        <div className="ops-workspace-grid">
          {workspaces.map((workspace) => (
            <article className="ops-workspace-card" key={workspace.href}>
              <h3>
                <Link href={workspace.href}>{workspace.label}</Link>
              </h3>
              <p>{workspace.note}</p>
              <span>{workspace.action} →</span>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-principle-strip" aria-label="Operations safeguards">
        <div>
          <strong>Authority stays server-side</strong>
          <p>
            Navigation and visible controls never grant a permission the backend has not resolved.
          </p>
        </div>
        <div>
          <strong>Private evidence stays bounded</strong>
          <p>Access is assignment-scoped, short-lived, auditable and revocable.</p>
        </div>
        <div>
          <strong>Decisions stay accountable</strong>
          <p>
            Field observations and future AI assistance inform work; they do not replace authorized
            decisions.
          </p>
        </div>
      </section>

      <div className="workflow-state-grid" aria-label="Critical workflow states">
        <WorkflowStateCard
          state="loading"
          title="Loading"
          description="Safe skeletons contain no copied private records."
          tone="info"
        />
        <WorkflowStateCard
          state="access_denied"
          title="Access denied"
          description="Permission checks stop unauthorized review and actions."
          tone="danger"
        />
        <WorkflowStateCard
          state="revoked_assignment"
          title="Assignment revoked"
          description="Private evidence access stops immediately."
          tone="warning"
        />
        <WorkflowStateCard
          state="conflicting_action"
          title="Conflicting action"
          description="Stale or duplicate consequential actions are rejected."
          tone="warning"
        />
      </div>
    </section>
  );
}
