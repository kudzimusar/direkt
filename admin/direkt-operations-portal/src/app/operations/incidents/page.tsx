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

export const metadata: Metadata = { title: 'Incidents and complaints' };

const incidents = [
  {
    id: 'INC-S7-001',
    type: 'Operations complaint',
    provider: 'Synthetic Copperbelt Repairs',
    category: 'Internal service concern',
    owner: 'Synthetic support operator',
    severity: 'High',
    tone: 'warning' as const,
    status: 'Investigating',
  },
  {
    id: 'INC-S7-002',
    type: 'Operations incident',
    provider: 'Synthetic Mobile Mechanic',
    category: 'Evidence scope mismatch',
    owner: 'Synthetic trust supervisor',
    severity: 'Critical',
    tone: 'danger' as const,
    status: 'Open',
  },
] as const;

export default function IncidentsPage() {
  return (
    <section aria-labelledby="incidents-heading">
      <WorkspaceIntro
        eyebrow="Stage 7E · bounded internal records"
        title="Incidents and complaints"
        description="Internal operations records linked only to authorized provider, case and evidence scope. This workspace does not implement customer reviews, enquiries, moderation or appeals."
        headingId="incidents-heading"
      >
        <PermissionAction
          session={syntheticSupervisorSession}
          permission="operations.incidents.manage"
          label="Create internal record"
          deniedLabel="Creation denied"
          accessKey="n"
        />
      </WorkspaceIntro>

      <div className="metric-grid" aria-label="Incident summary">
        <MetricCard label="Open" value="1" note="Awaiting an assigned owner to begin investigation." tone="danger" />
        <MetricCard label="Investigating" value="1" note="Only the owner or supervisor/admin may resolve." tone="warning" />
        <MetricCard label="Resolved today" value="0" note="Resolution requires a reason code and summary." tone="neutral" />
        <MetricCard label="Customer interactions" value="0" note="Phase 8 interaction history is not implemented here." tone="success" />
      </div>

      <DenseTableRegion label="Synthetic internal incidents and complaints">
        <table>
          <caption>Bounded operations records</caption>
          <thead>
            <tr>
              <th scope="col">Record</th>
              <th scope="col">Type</th>
              <th scope="col">Provider</th>
              <th scope="col">Category</th>
              <th scope="col">Owner</th>
              <th scope="col">Severity</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} data-queue-row tabIndex={0}>
                <th scope="row">{incident.id}</th>
                <td>{incident.type}</td>
                <td>{incident.provider}</td>
                <td>{incident.category}</td>
                <td>{incident.owner}</td>
                <td><StatusPill tone={incident.tone}>{incident.severity}</StatusPill></td>
                <td>{incident.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <section className="workspace-panel" aria-labelledby="incident-privacy-heading">
        <h2 id="incident-privacy-heading">Response allowlist</h2>
        <dl className="definition-grid">
          <div><dt>Private details</dt><dd>Persisted internally, never returned</dd></div>
          <div><dt>Evidence content</dt><dd>Excluded</dd></div>
          <div><dt>Private coordinates</dt><dd>Excluded</dd></div>
          <div><dt>Customer interaction history</dt><dd>Not implemented</dd></div>
          <div><dt>Cross-provider linkage</dt><dd>Rejected by database scope checks</dd></div>
          <div><dt>Resolution authority</dt><dd>Owner, trust supervisor or admin</dd></div>
        </dl>
      </section>

      <div className="workflow-state-grid" aria-label="Incident critical states">
        <WorkflowStateCard state="loading" title="Records loading" description="Private detail is never placed in the loading shell or client state." tone="info" />
        <WorkflowStateCard state="empty" title="No internal records" description="An empty result does not imply access to customer review workflows." tone="neutral" />
        <WorkflowStateCard state="access_denied" title="Unowned resolution" description="An unrelated support operator cannot resolve another owner’s record." tone="danger" />
        <WorkflowStateCard state="conflicting_action" title="Already resolved" description="Terminal records reject a second resolution or dismissal." tone="warning" />
      </div>

      <p className="api-boundary-note">
        API boundary: <code>/api/v1/operations/incidents</code>. Customer complaint linkage remains reserved for Phase 8.
      </p>
    </section>
  );
}
