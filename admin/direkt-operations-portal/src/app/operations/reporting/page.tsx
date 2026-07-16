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

export const metadata: Metadata = { title: 'Expiry and reporting' };

const expiryItems = [
  {
    record: 'EVD-S7-010',
    type: 'Evidence',
    provider: 'Synthetic Copperbelt Repairs',
    label: 'Identity evidence',
    expires: '26 Jul 2026',
    days: '10',
    action: 'Due soon',
    tone: 'warning' as const,
  },
  {
    record: 'CLAIM-S7-004',
    type: 'Claim',
    provider: 'Synthetic Mobile Mechanic',
    label: 'Operating model confirmed',
    expires: '16 Jul 2026',
    days: '0',
    action: 'Renew now',
    tone: 'danger' as const,
  },
] as const;

export default function ReportingPage() {
  return (
    <section aria-labelledby="reporting-heading">
      <WorkspaceIntro
        eyebrow="Stage 7E · privacy-safe reporting"
        title="Expiry and reporting"
        description="Evidence and claim renewal states plus fixed aggregate metrics. Document contents, storage references, private coordinates and private identifiers remain outside every report and export."
        headingId="reporting-heading"
      >
        <PermissionAction
          session={syntheticSupervisorSession}
          permission="operations.reporting.export"
          label="Export allowlisted metrics"
          deniedLabel="Export permission required"
          accessKey="e"
        />
      </WorkspaceIntro>

      <div className="metric-grid" aria-label="Operations metrics">
        <MetricCard
          label="Triage breached"
          value="1"
          note="Aggregate count from the current queue projection."
          tone="danger"
        />
        <MetricCard
          label="Corrections · 30d"
          value="3"
          note="No provider or case identifiers in the exported metric."
          tone="warning"
        />
        <MetricCard
          label="Field visits · 30d"
          value="7"
          note="Completed advisory work items only."
          tone="info"
        />
        <MetricCard
          label="Evidence due"
          value="2"
          note="Due soon or renew-now evidence records."
          tone="warning"
        />
      </div>

      <DenseTableRegion label="Synthetic expiry and renewal dashboard">
        <table>
          <caption>Evidence and claim expiry projection</caption>
          <thead>
            <tr>
              <th scope="col">Record</th>
              <th scope="col">Type</th>
              <th scope="col">Provider</th>
              <th scope="col">Label</th>
              <th scope="col">Expires</th>
              <th scope="col">Days</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {expiryItems.map((item) => (
              <tr key={item.record} data-queue-row tabIndex={0}>
                <th scope="row">{item.record}</th>
                <td>{item.type}</td>
                <td>{item.provider}</td>
                <td>{item.label}</td>
                <td>{item.expires}</td>
                <td>{item.days}</td>
                <td>
                  <StatusPill tone={item.tone}>{item.action}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <div className="split-workspace">
        <section className="workspace-panel" aria-labelledby="export-heading">
          <h2 id="export-heading">Fixed export allowlist</h2>
          <ul>
            <li>triageTotal, triageOverdue and triageBreached</li>
            <li>decisionsLast30Days and correctionsLast30Days</li>
            <li>fieldWorkActive and fieldWorkCompletedLast30Days</li>
            <li>escalationsActive, incidentsActive, evidenceDue and claimsDue</li>
          </ul>
        </section>
        <aside className="workspace-panel" aria-labelledby="excluded-heading">
          <h2 id="excluded-heading">Always excluded</h2>
          <ul>
            <li>Provider, evidence and case identifiers</li>
            <li>Document content, signatures and identity numbers</li>
            <li>Object keys, URLs, checksums and storage metadata</li>
            <li>Private coordinates and reviewer private notes</li>
          </ul>
        </aside>
      </div>

      <div className="workflow-state-grid" aria-label="Reporting critical states">
        <WorkflowStateCard
          state="loading"
          title="Metrics loading"
          description="Aggregate placeholders carry no private identifiers."
          tone="info"
        />
        <WorkflowStateCard
          state="empty"
          title="No expiries due"
          description="The projection can be empty while current evidence remains valid."
          tone="success"
        />
        <WorkflowStateCard
          state="access_denied"
          title="Export denied"
          description="Read permission does not imply aggregate export permission."
          tone="warning"
        />
        <WorkflowStateCard
          state="conflicting_action"
          title="Snapshot changed"
          description="A refreshed export uses one newly generated aggregate snapshot."
          tone="neutral"
        />
      </div>

      <p className="api-boundary-note">
        API boundaries: <code>/api/v1/operations/expiry-renewal</code>,{' '}
        <code>/api/v1/operations/reporting/metrics</code> and the allowlisted export route.
      </p>
    </section>
  );
}
