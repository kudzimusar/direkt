import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Provider workspaces' };

const syntheticWorkspaces = [
  {
    name: 'Synthetic Copperbelt Repairs',
    status: 'Ready for verification',
    readiness: '40%',
    selectedServices: 1,
    openCases: 1,
    corrections: 1,
    currentClaims: 0,
    uploadState: 'Interrupted · retryable',
    uploadAttempts: 1,
    location: 'Private base stored · public premises consented · service area configured',
  },
  {
    name: 'Synthetic Mobile Mechanic',
    status: 'Draft',
    readiness: '20%',
    selectedServices: 1,
    openCases: 0,
    corrections: 0,
    currentClaims: 0,
    uploadState: 'Not started',
    uploadAttempts: 0,
    location: 'Private base stored · no public premises · service area required',
  },
] as const;

export default function ProviderWorkspacesPage() {
  return (
    <section aria-labelledby="provider-workspaces-heading">
      <p className="eyebrow">Phase 6 operations visibility</p>
      <h1 id="provider-workspaces-heading">Provider workspaces</h1>
      <p className="lede">
        This synthetic readiness view shows aggregate profile, verification and recoverable-upload
        state. It deliberately excludes coordinates, evidence identifiers, object keys, document
        contents, reviewer identities and private rationale.
      </p>

      <div
        className="provider-table"
        role="region"
        aria-label="Synthetic provider workspace readiness"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">Provider</th>
              <th scope="col">Internal status</th>
              <th scope="col">Readiness</th>
              <th scope="col">Services</th>
              <th scope="col">Open cases</th>
              <th scope="col">Corrections</th>
              <th scope="col">Current claims</th>
              <th scope="col">Upload recovery</th>
              <th scope="col">Attempts</th>
            </tr>
          </thead>
          <tbody>
            {syntheticWorkspaces.map((workspace) => (
              <tr key={workspace.name}>
                <th scope="row">{workspace.name}</th>
                <td>{workspace.status}</td>
                <td>{workspace.readiness}</td>
                <td>{workspace.selectedServices}</td>
                <td>{workspace.openCases}</td>
                <td>{workspace.corrections}</td>
                <td>{workspace.currentClaims}</td>
                <td>{workspace.uploadState}</td>
                <td>{workspace.uploadAttempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="control-panel" aria-labelledby="workspace-location-heading">
        <h2 id="workspace-location-heading">Location and evidence boundary</h2>
        <ul>
          {syntheticWorkspaces.map((workspace) => (
            <li key={workspace.name}>
              <strong>{workspace.name}:</strong> {workspace.location}
            </li>
          ))}
        </ul>
        <p>
          The operations API returns booleans and counts only. It does not expose private or public
          coordinate values, evidence IDs, upload-session object keys, hashes or reviewer notes.
        </p>
      </section>

      <section className="control-panel" aria-labelledby="workspace-controls-heading">
        <h2 id="workspace-controls-heading">Enforced controls</h2>
        <ul>
          <li>Interrupted uploads remain provider-owned and idempotent.</li>
          <li>Availability is operational metadata and cannot create trust.</li>
          <li>Profile completion and uploads cannot publish a provider.</li>
          <li>Stage 8 enquiries and review responses use separate actor-scoped API workspaces.</li>
          <li>Subscription status remains a Phase 9 synthetic read-only boundary.</li>
        </ul>
      </section>
    </section>
  );
}
