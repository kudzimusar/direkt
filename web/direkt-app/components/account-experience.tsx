"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type {
  BrowserAuthBootstrap,
  BrowserSessionSummary,
  SessionView,
  SyntheticChallengeAccepted,
} from "@/lib/contracts/auth";

type Status = "loading" | "signed-out" | "challenge" | "signed-in" | "error";

export function AccountExperience({
  onProviderAvailabilityChange,
}: {
  onProviderAvailabilityChange: (available: boolean) => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [bootstrap, setBootstrap] = useState<BrowserAuthBootstrap | null>(null);
  const [summary, setSummary] = useState<BrowserSessionSummary | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [contact, setContact] = useState("");
  const [challenge, setChallenge] = useState<SyntheticChallengeAccepted | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadSummary = useCallback(async () => {
    const response = await fetch("/api/account/summary", { cache: "no-store" });
    if (response.status === 401) {
      setSummary(null);
      onProviderAvailabilityChange(false);
      setStatus("signed-out");
      return;
    }
    if (!response.ok) throw new Error("Account state could not be loaded.");
    const next = (await response.json()) as BrowserSessionSummary;
    setSummary(next);
    onProviderAvailabilityChange(next.modes.provider);
    setStatus("signed-in");
  }, [onProviderAvailabilityChange]);

  const bootstrapAuth = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/auth/bootstrap", { cache: "no-store" });
      if (!response.ok) throw new Error("Authentication boundary unavailable.");
      const next = (await response.json()) as BrowserAuthBootstrap;
      setBootstrap(next);
      setCsrfToken(next.csrfToken);
      if (next.hasSession) await loadSummary();
      else {
        onProviderAvailabilityChange(false);
        setStatus("signed-out");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication boundary unavailable.");
      setStatus("error");
    }
  }, [loadSummary, onProviderAvailabilityChange]);

  useEffect(() => {
    void bootstrapAuth();
  }, [bootstrapAuth]);

  async function requestChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!csrfToken) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await secureMutation("/api/auth/challenge", csrfToken, {
        channel: "phone",
        contact,
      });
      if (!response.ok) throw new Error(await readableError(response, "Challenge request rejected."));
      const next = (await response.json()) as SyntheticChallengeAccepted;
      setChallenge(next);
      setCode(next.synthetic?.code ?? "");
      setStatus("challenge");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Challenge request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge || !csrfToken) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await secureMutation("/api/auth/verify", csrfToken, {
        challengeId: challenge.challengeId,
        code,
        deviceLabel: "DIREKT Web browser",
      });
      if (!response.ok) throw new Error(await readableError(response, "Verification rejected."));
      const result = (await response.json()) as { csrfToken?: string };
      if (result.csrfToken) setCsrfToken(result.csrfToken);
      setChallenge(null);
      setCode("");
      await loadSummary();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  async function revokeOthers() {
    setBusy(true);
    setMessage("");
    try {
      const response = await secureMutation("/api/auth/sessions/revoke-others", csrfToken, {});
      if (!response.ok) throw new Error(await readableError(response, "Session revocation failed."));
      const result = (await response.json()) as { revokedCount?: number };
      setMessage(`${result.revokedCount ?? 0} other session(s) revoked.`);
      await loadSummary();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Session revocation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function revokeSession(session: SessionView) {
    if (session.current) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await secureMutation(
        `/api/auth/sessions/${encodeURIComponent(session.id)}/revoke`,
        csrfToken,
        { reason: "Revoked from DIREKT Web account security" },
      );
      if (!response.ok) throw new Error(await readableError(response, "Session revocation failed."));
      setMessage("Session revoked.");
      await loadSummary();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Session revocation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setMessage("");
    try {
      const response = await secureMutation("/api/auth/logout", csrfToken, {});
      if (!response.ok) throw new Error(await readableError(response, "Sign out failed."));
      const result = (await response.json()) as { csrfToken?: string };
      if (result.csrfToken) setCsrfToken(result.csrfToken);
      setSummary(null);
      onProviderAvailabilityChange(false);
      setStatus("signed-out");
      setMessage("Signed out securely.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign out failed.");
    } finally {
      setBusy(false);
    }
  }

  const profileEntries = useMemo(() => safeProfileEntries(summary?.profile ?? null), [summary]);

  if (status === "loading") {
    return <AccountState title="Checking your secure session…" copy="DIREKT is reading only server-side session state." />;
  }

  if (status === "error") {
    return (
      <AccountState title="Account boundary unavailable" copy={message || "The account service failed closed."}>
        <button className="primary-action" type="button" onClick={() => void bootstrapAuth()}>
          Try again
        </button>
      </AccountState>
    );
  }

  if (status === "signed-out" || status === "challenge") {
    const authDisabled = !bootstrap?.participantAuthenticationEnabled;
    const firebaseGated = bootstrap?.firebaseExchangeEnabled;
    return (
      <section className="account-grid" aria-label="DIREKT account sign in">
        <article className="surface-card primary-card account-auth-card">
          <p className="eyebrow">Secure account</p>
          <h2>{authDisabled ? "Sign-in is not active on this deployment" : "Sign in to DIREKT"}</h2>
          <p className="card-copy">
            DIREKT sessions are stored in HttpOnly, Secure, SameSite cookies. Browser JavaScript never receives
            access or refresh tokens, and provider scope is resolved by the backend.
          </p>

          {bootstrap?.syntheticAuthenticationEnabled && status === "signed-out" && (
            <form className="account-form" onSubmit={requestChallenge}>
              <label>
                Synthetic test phone
                <input
                  type="tel"
                  autoComplete="tel"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="+260…"
                  required
                  minLength={3}
                  maxLength={254}
                />
              </label>
              <button className="primary-action" disabled={busy || !contact.trim()} type="submit">
                {busy ? "Requesting…" : "Request synthetic code"}
              </button>
            </form>
          )}

          {bootstrap?.syntheticAuthenticationEnabled && status === "challenge" && challenge && (
            <form className="account-form" onSubmit={verifyChallenge}>
              <div className="synthetic-code" role="status">
                <strong>Synthetic staging code</strong>
                <span>{challenge.synthetic?.code ?? "Prepared by test backend"}</span>
                <small>No SMS or email was sent.</small>
              </div>
              <label>
                Verification code
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  pattern="[0-9]{6}"
                  required
                />
              </label>
              <button className="primary-action" disabled={busy || code.length !== 6} type="submit">
                {busy ? "Verifying…" : "Verify and create secure session"}
              </button>
            </form>
          )}

          {firebaseGated && (
            <div className="gated-note">
              <strong>Firebase phone sign-in is configured for BFF exchange.</strong>
              <p>Actual phone-possession UI remains gated until approved Firebase Web configuration is present.</p>
            </div>
          )}
          {authDisabled && (
            <div className="gated-note">
              <strong>Fail-closed by configuration.</strong>
              <p>Public discovery remains available; participant authentication is not silently enabled.</p>
            </div>
          )}
          {message && <p className="form-message" role="status">{message}</p>}
        </article>

        <article className="surface-card">
          <p className="eyebrow">W3 security boundary</p>
          <h2>Server-controlled session</h2>
          <ul className="check-list">
            <li>HttpOnly access and rotating refresh tokens</li>
            <li>Same-origin + CSRF enforcement on mutations</li>
            <li>Backend-authoritative admission and permissions</li>
            <li>No client-selected provider tenant or role</li>
          </ul>
        </article>
      </section>
    );
  }

  if (!summary) return null;

  return (
    <section className="account-grid" aria-label="DIREKT account">
      <article className="surface-card primary-card account-summary-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Authenticated account</p>
            <h2>{summary.contact.displayHint}</h2>
          </div>
          <span className="trust-mark">SESSION</span>
        </div>
        <p className="card-copy">
          Identity {compactId(summary.identityId)} · current session {compactId(summary.sessionId)}
        </p>
        <div className="account-mode-row">
          <span>Customer mode</span><strong>Available</strong>
          <span>Provider mode</span><strong>{summary.modes.provider ? "Backend-authorized" : "Not assigned"}</strong>
        </div>
        <div className="action-row">
          <button className="secondary-action" type="button" disabled={busy} onClick={() => void revokeOthers()}>
            Revoke other sessions
          </button>
          <button className="danger-action" type="button" disabled={busy} onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
        {message && <p className="form-message" role="status">{message}</p>}
      </article>

      <article className="surface-card account-profile-card">
        <p className="eyebrow">Account profile</p>
        <h2>Backend-derived profile</h2>
        {profileEntries.length > 0 ? (
          <dl className="profile-list">
            {profileEntries.map(([key, value]) => (
              <div key={key}><dt>{humanize(key)}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        ) : (
          <p className="card-copy">No displayable profile fields are currently present for this authenticated identity.</p>
        )}
      </article>

      <article className="surface-card wide-card">
        <div className="card-header">
          <div><p className="eyebrow">Security</p><h2>Active sessions</h2></div>
          <span className="foundation-chip">{summary.sessions.length} session(s)</span>
        </div>
        <div className="session-list">
          {summary.sessions.map((session) => (
            <div className="session-row" key={session.id}>
              <div>
                <strong>{session.deviceLabel}</strong>
                <p>{session.current ? "Current session" : `Last seen ${formatDate(session.lastSeenAt)}`}</p>
              </div>
              <div className="session-actions">
                {session.reuseDetected && <span className="warning-chip">Reuse detected</span>}
                {!session.current && !session.revokedAt && (
                  <button className="secondary-action compact-action" disabled={busy} type="button" onClick={() => void revokeSession(session)}>
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function AccountState({ title, copy, children }: { title: string; copy: string; children?: React.ReactNode }) {
  return (
    <section className="account-grid">
      <article className="surface-card primary-card">
        <p className="eyebrow">Secure account</p>
        <h2>{title}</h2>
        <p className="card-copy">{copy}</p>
        {children}
      </article>
    </section>
  );
}

async function secureMutation(path: string, csrfToken: string, body: unknown): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-direkt-csrf": csrfToken },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

async function readableError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return `${fallback} (${body.error.replaceAll("_", " ")})`;
  } catch {
    // Fall through to a stable user-safe message.
  }
  return fallback;
}

function safeProfileEntries(profile: Record<string, unknown> | null): Array<[string, string]> {
  if (!profile) return [];
  const prohibited = /(token|secret|hash|credential|password|evidence|coordinate|providerid)/i;
  return Object.entries(profile)
    .filter(([key, value]) => !prohibited.test(key) && ["string", "number", "boolean"].includes(typeof value))
    .slice(0, 12)
    .map(([key, value]) => [key, String(value)]);
}

function compactId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function humanize(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "unknown" : date.toLocaleString();
}
