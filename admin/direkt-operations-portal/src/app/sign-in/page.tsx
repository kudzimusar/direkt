import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <main className="state-page">
      <section className="state-card" aria-labelledby="sign-in-heading">
        <p className="eyebrow">Internal operations access</p>
        <h1 id="sign-in-heading">Sign in to DIREKT Operations</h1>
        <div className="synthetic-banner" role="status">
          Synthetic Phase 2C screen. No SMS, email or identity provider is connected.
        </div>
        <form aria-describedby="sign-in-help">
          <label htmlFor="contact">Work phone or email</label>
          <input
            id="contact"
            name="contact"
            type="text"
            autoComplete="username"
            placeholder="operator@example.invalid"
            disabled
          />
          <p id="sign-in-help">
            Production privileged access will require an approved passwordless provider and MFA.
          </p>
          <button type="button" disabled>
            Request secure challenge
          </button>
        </form>
        <Link href="/operations">Open the synthetic reviewer shell</Link>
      </section>
    </main>
  );
}
