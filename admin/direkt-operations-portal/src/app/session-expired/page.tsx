import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Session expired' };

export default function SessionExpiredPage() {
  return (
    <main className="state-page">
      <section className="state-card" aria-labelledby="session-expired-heading">
        <p className="eyebrow">Session security</p>
        <h1 id="session-expired-heading">Your session has expired</h1>
        <p>
          DIREKT operations sessions are revocable and time limited. Unsaved sensitive work must not
          be restored from browser storage.
        </p>
        <Link href="/sign-in">Return to sign in</Link>
      </section>
    </main>
  );
}
