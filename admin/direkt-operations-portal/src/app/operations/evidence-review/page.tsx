import type { Metadata } from 'next';
import { PermissionAction, StatusPill, WorkspaceIntro } from '@/components/operations-workspace';
import { syntheticSupervisorSession } from '@/lib/session';

export const metadata: Metadata = { title: 'Evidence review' };

const reviewQueue = [
  {
    id: 'CASE-S7-001',
    provider: 'Synthetic Copperbelt Repairs',
    check: 'Representative identity',
    priority: 'Due today',
    age: '42 min',
    active: true,
  },
  {
    id: 'CASE-S7-002',
    provider: 'Synthetic Lusaka Electrical',
    check: 'Technical qualification',
    priority: 'Normal',
    age: '3 h',
    active: false,
  },
  {
    id: 'CASE-S7-003',
    provider: 'Synthetic Kabulonga Plumbing',
    check: 'Operating premises',
    priority: 'SLA warning',
    age: '19 h',
    active: false,
  },
] as const;

export default function EvidenceReviewPage() {
  return (
    <section aria-labelledby="evidence-review-heading">
      {/* Historical Stage 7B assigned-private-review evidence is retained by repository tests; no stage label is rendered. */}
      <WorkspaceIntro
        eyebrow="Verification operations"
        title="Evidence review"
        description="Review one assigned case at a time with revocable private access, clear source context and an auditable decision path."
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

      <div className="evidence-mission-grid">
        <section className="evidence-mission-panel queue-panel" aria-labelledby="review-queue-heading">
          <header className="evidence-panel-header">
            <div>
              <h2 id="review-queue-heading">Assigned queue</h2>
              <p>Priority, age and current assignment</p>
            </div>
            <StatusPill tone="warning">3 open</StatusPill>
          </header>
          <ol className="review-queue-list">
            {reviewQueue.map((item) => (
              <li key={item.id}>
                <button className={item.active ? 'review-queue-item active' : 'review-queue-item'} type="button">
                  <strong>{item.provider}</strong>
                  <span>{item.check}</span>
                  <div className="review-queue-meta">
                    <small className={item.priority === 'Normal' ? undefined : 'review-priority'}>{item.priority}</small>
                    <small>{item.age}</small>
                  </div>
                </button>
              </li>
            ))}
          </ol>
          <div className="case-context-body">
            <p className="eyebrow">Selected case</p>
            <dl className="case-fact-list">
              <div>
                <dt>Case</dt>
                <dd>CASE-S7-001</dd>
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
                <dt>Assignment</dt>
                <dd>
                  <StatusPill tone="success">Active</StatusPill>
                </dd>
              </div>
              <div>
                <dt>Current outcome</dt>
                <dd>No decision submitted</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="evidence-mission-panel evidence-viewer-shell" aria-labelledby="document-viewer-heading">
          <header className="evidence-panel-header">
            <div>
              <h2 id="document-viewer-heading">Evidence viewer</h2>
              <p>Identity evidence · current version</p>
            </div>
            <StatusPill tone="success">Clean</StatusPill>
          </header>
          <div className="evidence-access-banner">
            Private access is assignment-scoped and expires five minutes after issue. The synthetic document below contains no real evidence.
          </div>
          <div className="evidence-document-stage" aria-label="Synthetic private evidence preview">
            <article className="synthetic-document">
              <div className="synthetic-document-watermark">Synthetic evidence preview</div>
              <h3>Identity document placeholder</h3>
              <p>
                This visual represents the secure review surface only. Real document bytes, object references and submitter identifiers are not part of this public repository fixture.
              </p>
              <div className="synthetic-document-lines" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </article>
          </div>
          <footer className="evidence-viewer-footer">
            <span>Version 2 · access not persisted</span>
            <span>Zoom and rotation become active only inside an authorized grant</span>
          </footer>
        </section>

        <aside className="evidence-mission-panel decision-panel" aria-labelledby="decision-workspace-heading">
          <header className="evidence-panel-header">
            <div>
              <h2 id="decision-workspace-heading">Review and decision</h2>
              <p>Source facts, checklist and accountable outcome</p>
            </div>
          </header>
          <div className="decision-workspace-body">
            <dl className="case-fact-list">
              <div>
                <dt>Requirement</dt>
                <dd>Representative identity</dd>
              </div>
              <div>
                <dt>Evidence version</dt>
                <dd>Version 2</dd>
              </div>
              <div>
                <dt>Policy</dt>
                <dd>phase7-evidence-v1</dd>
              </div>
            </dl>

            <div className="ai-assist-panel">
              <strong>AI review assistance</strong>
              <p>
                Not active in this synthetic environment. When an approved AI evidence-assist use case is enabled, it may summarize candidate fields or flag inconsistencies, but it cannot decide this case.
              </p>
              <small>Human review and server policy remain authoritative.</small>
            </div>

            <p className="eyebrow">Reviewer checklist</p>
            <ul className="review-checklist">
              <li>
                <input type="checkbox" aria-label="Identity name comparison complete" />
                <div>
                  <strong>Identity name comparison</strong>
                  <p>Compare the submitted identity context against the assigned provider representative.</p>
                </div>
              </li>
              <li>
                <input type="checkbox" aria-label="Document quality checked" />
                <div>
                  <strong>Document quality</strong>
                  <p>Confirm the authorized evidence is readable enough for the required facts.</p>
                </div>
              </li>
              <li>
                <input type="checkbox" aria-label="Scope and validity checked" />
                <div>
                  <strong>Scope and validity</strong>
                  <p>Confirm the evidence supports only the specific check being reviewed.</p>
                </div>
              </li>
            </ul>

            <div className="decision-button-grid" aria-label="Synthetic decision controls">
              <button className="decision-approve" type="button" disabled title="Synthetic review does not submit real decisions">
                Approve check
              </button>
              <button className="decision-action" type="button" disabled title="Synthetic review does not submit real decisions">
                Request action
              </button>
              <button className="decision-reject" type="button" disabled title="Synthetic review does not submit real decisions">
                Reject check
              </button>
            </div>
            <p className="api-boundary-note">
              Decision controls are deliberately disabled in synthetic review. In an authorized environment, actions must pass the normal permission, reason-code, lifecycle and audit controls.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
