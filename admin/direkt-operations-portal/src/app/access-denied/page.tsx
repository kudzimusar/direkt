import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Access denied' };

export default function AccessDeniedPage() {
  return (
    <main className="state-page">
      <section className="state-card" aria-labelledby="access-denied-heading">
        <p className="eyebrow">Authorization required</p>
        <h1 id="access-denied-heading">Access denied</h1>
        <p>
          Your current server-resolved role does not permit this operation. Hiding or changing
          browser controls cannot grant access.
        </p>
        <p>Request a reviewed role assignment through the approved administrative process.</p>
        <Link href="/operations">Return to mission control</Link>
      </section>
    </main>
  );
}
