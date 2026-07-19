export default function OfflinePage() {
  return (
    <main className="offline-page" id="main-content">
      <div className="offline-card">
        <div className="brand-mark" aria-hidden="true">
          D
        </div>
        <p className="eyebrow">Offline</p>
        <h1>DIREKT needs a connection for live actions.</h1>
        <p>
          The application shell can open offline, but searches, authentication, enquiries, evidence,
          reviews and account changes are never shown as successful without durable backend
          acknowledgement.
        </p>
        <a href="/">Try again</a>
      </div>
    </main>
  );
}
