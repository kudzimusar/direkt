import type { Metadata } from 'next';
import {
  DenseTableRegion,
  PermissionAction,
  StatusPill,
  WorkflowStateCard,
  WorkspaceIntro,
} from '@/components/operations-workspace';
import { syntheticSupervisorSession } from '@/lib/session';

export const metadata: Metadata = { title: 'Evidence review' };

const evidenceItems = [
  {
    evidenceId: 'EVD-S7-001',
    requirement: 'Identity evidence',
    version: 'Version 2',
    processing: 'Clean',
    access: 'Not issued',
    expires: 'On issue + 5 minutes',
  },
  {
    evidenceId: 'EVD-S7-002',
    requirement: 'Service experience',
    version: 'Version 1',
    processing: 'Clean',
    access: 'Revoked',
    expires: 'Revoked immediately',
  },
] as const;

export default function EvidenceReviewPage() {
  return (
    <section aria-labelledby="evidence-review-heading">
      <WorkspaceIntro
        eyebrow="Stage 7B · assigned private review"
        title="Evidence review"
        description="Safe workspace summaries and revocable authorization grants. Storage keys, persistent URLs, submitter identity and private reviewer notes are never rendered."
        headingId="evidence-review-heading"
      >
        <PermissionAction
          session={syntheticSupervisorSession}
          permission="evidence.read.private"
          label="Request 5-minute access"
          deniedLabel="Private access denied"
          accessKey="a"
        />
        <PermissionAction
          session={syntheticSupervisorSession}
          permission="operations.evidence_access.revoke"
          label="Revoke active grant"
          deniedLabel="Revocation denied"
        />
      </WorkspaceIntro>

      <div className="split-workspace">
        <section className="workspace-panel" aria-labelledby="review-context-heading">
          <h2 id="review-context-heading">Assigned review context</h2>
          <dl className="definition-grid">
            <div>
              <dt>Case</dt>
              <dd>CASE-S7-001</dd>
            </div>
            <div>
              <dt>Assignment</dt>
              <dd>
                <StatusPill tone="success">Active</StatusPill>
              </dd>
            </div>
            <div>
              <dt>Provider</dt>
              <dd>Synthetic Copperbelt Repairs</dd>
            </div>
            <div>
              <dt>Check</dt>
              <dd>Representative identity</dd>
            </div>
            <div>
              <dt>Policy</dt>
              <dd>phase7-evidence-v1</dd>
            </div>
            <div>
              <dt>Current recommendation</dt>
              <dd>Not submitted</dd>
            </div>
          </dl>
        </section>

        <aside className="workspace-panel" aria-labelledby="access-controls-heading">
          <h2 id="access-controls-heading">Access controls</h2>
          <ul>
            <li>One active authorization per reviewer and evidence context.</li>
            <li>Every redemption rechecks assignment and current evidence version.</li>
            <li>Expired, revoked or replaced grants return no private object.</li>
            <li>Audit records never retain the URL or private object key.</li>
          </ul>
        </aside>
      </div>

      <DenseTableRegion label="Assigned synthetic evidence items">
        <table>
          <caption>Evidence metadata only</caption>
          <thead>
            <tr>
              <th scope="col">Evidence</th>
              <th scope="col">Requirement</th>
              <th scope="col">Current version</th>
              <th scope="col">Processing</th>
              <th scope="col">Grant state</th>
              <th scope="col">Expiry behavior</th>
            </tr>
          </thead>
          <tbody>
            {evidenceItems.map((item) => (
              <tr key={item.evidenceId} data-queue-row tabIndex={0}>
                <th scope="row">{item.evidenceId}</th>
                <td>{item.requirement}</td>
                <td>{item.version}</td>
                <td>
                  <StatusPill tone="success">{item.processing}</StatusPill>
                </td>
                <td>{item.access}</td>
                <td>{item.expires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DenseTableRegion>

      <div className="workflow-state-grid" aria-label="Evidence review critical states">
        <WorkflowStateCard
          state="loading"
          title="Workspace loading"
          description="The shell remains safe while assignment and evidence metadata load."
          tone="info"
        />
        <WorkflowStateCard
          state="revoked_assignment"
          title="Assignment revoked"
          description="Private access fails immediately and action controls become unavailable."
          tone="danger"
        />
        <WorkflowStateCard
          state="expired_grant"
          title="Grant expired"
          description="The persisted authorization cannot redeem after its five-minute lifetime."
          tone="warning"
        />
        <WorkflowStateCard
          state="conflicting_action"
          title="Version changed"
          description="A replacement evidence version invalidates the earlier authorization context."
          tone="warning"
        />
      </div>

      <p className="api-boundary-note">
        API boundaries: <code>GET /api/v1/verification-cases/:caseId/review-workspace</code> and
        short-lived access grant routes only.
      </p>
    </section>
  );
}
