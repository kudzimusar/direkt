import Link from 'next/link';
import type { Metadata } from 'next';
import { MetricCard, WorkflowStateCard, WorkspaceIntro } from '@/components/operations-workspace';

export const metadata: Metadata = { title: 'Mission control' };

const workspaces = [
  { label: 'Triage queue', href: '/operations/triage', note: 'Priority, ownership, age and SLA state.' },
  { label: 'Evidence review', href: '/operations/evidence-review', note: 'Assigned revocable private access.' },
  { label: 'Field workflow', href: '/operations/field-work', note: 'Structured advisory inspections.' },
  { label: 'Escalations and overrides', href: '/operations/escalations', note: 'Owned escalation and four-eyes control.' },
  { label: 'Incidents and complaints', href: '/operations/incidents', note: 'Bounded internal operations records.' },
  { label: 'Expiry and reporting', href: '/operations/reporting', note: 'Privacy-safe renewal and aggregate metrics.' },
] as const;

export default function OperationsPage() {
  return (
    <section aria-labelledby="mission-control-heading">
      <WorkspaceIntro
        eyebrow="Phase 7 operations portal"
        title="Mission control"
        description="One synthetic desktop workspace for triage, assigned private review, structured field work, escalations and privacy-safe reporting. Every route remains permission-aware and API-only."
        headingId="mission-control-heading"
      />

      <div className="metric-grid" aria-label="Synthetic operations summary">
        <MetricCard label="Triage visible" value="3" note="One breached case and one unassigned case." tone="danger" />
        <MetricCard label="Field work active" value="1" note="Advisory only; no decision or claim mutation." tone="info" />
        <MetricCard label="Escalations active" value="2" note="Explicit owner, severity, due date and policy." tone="warning" />
        <MetricCard label="Evidence due" value="2" note="Document contents and storage metadata excluded." tone="warning" />
      </div>

      <section className="workspace-panel" aria-labelledby="workspace-links-heading">
        <h2 id="workspace-links-heading">Operations workspaces</h2>
        <div className="summary-grid">
          {workspaces.map((workspace) => (
            <article className="summary-card" key={workspace.href}>
              <h3><Link href={workspace.href}>{workspace.label}</Link></h3>
              <p>{workspace.note}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="workflow-state-grid" aria-label="Portal-wide critical states">
        <WorkflowStateCard state="loading" title="Loading" description="Safe skeletons contain no copied private records." tone="info" />
        <WorkflowStateCard state="access_denied" title="Access denied" description="Navigation and controls derive from server permission keys." tone="danger" />
        <WorkflowStateCard state="revoked_assignment" title="Assignment revoked" description="Private evidence access stops immediately." tone="warning" />
        <WorkflowStateCard state="conflicting_action" title="Conflicting action" description="Stale or duplicate workflow mutations are rejected." tone="warning" />
      </div>

      <section className="control-panel" aria-labelledby="controls-heading">
        <h2 id="controls-heading">Non-negotiable Phase 7 controls</h2>
        <ul>
          <li>The portal communicates through versioned HTTP API routes only.</li>
          <li>No database, PostGIS, object-storage or backend repository module is imported.</li>
          <li>Private evidence access is assigned, short-lived, audited and revocable.</li>
          <li>Field observations remain advisory and cannot create claims or final decisions.</li>
          <li>High-risk authorization requires two distinct eligible approvers.</li>
          <li>Reports exclude document contents, object keys, private coordinates and private notes.</li>
          <li>Phase 8 customer workflows and Phase 9 commercial workflows remain unavailable.</li>
        </ul>
      </section>
    </section>
  );
}
