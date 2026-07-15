import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Verification queue' };

const syntheticCases = [
  {
    caseId: 'CASE-SYN-001',
    provider: 'Synthetic Phase 4 Repairs',
    check: 'Representative identity check',
    requirement: 'Plumbing · identity · version 1',
    status: 'Assigned',
    risk: 'Standard',
    evidence: '2 immutable metadata versions',
  },
  {
    caseId: 'CASE-SYN-002',
    provider: 'Synthetic Mobile Mechanic',
    check: 'Operating-base location check',
    requirement: 'Mechanics · location · version 1',
    status: 'Correction required',
    risk: 'Standard',
    evidence: '1 private metadata version',
  },
] as const;

export default function VerificationQueuePage() {
  return (
    <section aria-labelledby="verification-queue-heading">
      <p className="eyebrow">Phase 4 internal workspace</p>
      <h1 id="verification-queue-heading">Verification queue</h1>
      <p className="lede">
        This synthetic queue demonstrates separate evidence-backed checks, assignment boundaries,
        immutable review history and expiring claim output. It contains no real provider evidence.
      </p>

      <div className="provider-table" role="region" aria-label="Synthetic verification cases" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col">Case</th>
              <th scope="col">Provider</th>
              <th scope="col">Scoped check</th>
              <th scope="col">Requirement</th>
              <th scope="col">Evidence history</th>
              <th scope="col">Risk</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {syntheticCases.map((verificationCase) => (
              <tr key={verificationCase.caseId}>
                <th scope="row">{verificationCase.caseId}</th>
                <td>{verificationCase.provider}</td>
                <td>{verificationCase.check}</td>
                <td>{verificationCase.requirement}</td>
                <td>{verificationCase.evidence}</td>
                <td>{verificationCase.risk}</td>
                <td>{verificationCase.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="control-panel" aria-labelledby="synthetic-case-heading">
        <h2 id="synthetic-case-heading">Assigned synthetic case review</h2>
        <dl>
          <div>
            <dt>Evidence class</dt>
            <dd>Identity</dd>
          </div>
          <div>
            <dt>Current evidence version</dt>
            <dd>Version 2 — scan status clean</dd>
          </div>
          <div>
            <dt>Earlier outcome</dt>
            <dd>Version 1 retained — correction requested because the image was unreadable</dd>
          </div>
          <div>
            <dt>Issuing-source label</dt>
            <dd>Synthetic authority</dd>
          </div>
          <div>
            <dt>Private-object access</dt>
            <dd>Unavailable in this static portal fixture; production access is short-lived and audited</dd>
          </div>
        </dl>
        <h3>Reasoned recommendation</h3>
        <p>
          CHECK_PASSED — the scoped representative identity check passed against the synthetic
          review checklist. This does not verify qualifications, safety or future workmanship.
        </p>
      </section>

      <section className="control-panel" aria-labelledby="verification-controls-heading">
        <h2 id="verification-controls-heading">Enforced controls</h2>
        <ul>
          <li>A reviewer must be actively assigned before private evidence access is granted.</li>
          <li>A provider owner cannot review their own provider or evidence submission.</li>
          <li>Finance and commercial state cannot create or improve a verification claim.</li>
          <li>Evidence replacements append a new version instead of rewriting earlier records.</li>
          <li>Public output contains only a scoped claim, limitation, check date and expiry.</li>
          <li>Original files, identifiers, signatures, private addresses and notes remain private.</li>
        </ul>
      </section>
    </section>
  );
}