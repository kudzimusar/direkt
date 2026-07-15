import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Provider drafts' };

const syntheticProviders = [
  {
    name: 'Synthetic Copperbelt Repairs',
    pathway: 'Registered business',
    operatingModel: 'Fixed premises',
    locality: 'Woodlands, Lusaka',
    category: 'Plumbing · requirement version 1',
    status: 'Draft',
  },
  {
    name: 'Synthetic Mobile Mechanic',
    pathway: 'Experienced informal provider',
    operatingModel: 'Mobile',
    locality: 'Lusaka District service area',
    category: 'Mechanics · requirement version 1',
    status: 'Ready for verification',
  },
] as const;

export default function ProviderDraftsPage() {
  return (
    <section aria-labelledby="provider-drafts-heading">
      <p className="eyebrow">Phase 3 internal workspace</p>
      <h1 id="provider-drafts-heading">Provider drafts</h1>
      <p className="lede">
        This synthetic queue demonstrates private provider profiles, pathways, operating models and
        pinned category versions. It cannot publish a provider or display private evidence.
      </p>

      <div
        className="provider-table"
        role="region"
        aria-label="Synthetic provider drafts"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">Provider</th>
              <th scope="col">Pathway</th>
              <th scope="col">Operating model</th>
              <th scope="col">Public-safe area</th>
              <th scope="col">Category</th>
              <th scope="col">Internal status</th>
              <th scope="col">Discoverable</th>
            </tr>
          </thead>
          <tbody>
            {syntheticProviders.map((provider) => (
              <tr key={provider.name}>
                <th scope="row">{provider.name}</th>
                <td>{provider.pathway}</td>
                <td>{provider.operatingModel}</td>
                <td>{provider.locality}</td>
                <td>{provider.category}</td>
                <td>{provider.status}</td>
                <td>
                  <strong>No</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="control-panel" aria-labelledby="provider-controls-heading">
        <h2 id="provider-controls-heading">Enforced boundaries</h2>
        <ul>
          <li>Provider organizations remain separate from human identities.</li>
          <li>Representatives receive server-owned provider-scoped assignments.</li>
          <li>Activated category requirements cannot be silently rewritten.</li>
          <li>No profile field, payment or operator action creates a public listing.</li>
          <li>Evidence and verification decisions begin in Phase 4.</li>
        </ul>
      </section>
    </section>
  );
}
