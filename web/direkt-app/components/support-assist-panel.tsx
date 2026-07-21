"use client";

import { FormEvent, useState } from "react";
import { DirektIcon } from "@/components/ui/direkt-icon";
import type { PublicSupportAssistResponse } from "@/lib/contracts/public-support";

export function SupportAssistPanel() {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PublicSupportAssistResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = question.replace(/\s+/g, " ").trim();
    if (normalized.length < 3 || busy) return;
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/support/assist", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ question: normalized }),
        cache: "no-store",
      });
      const body = (await response.json()) as
        PublicSupportAssistResponse | { message?: string };
      if (!response.ok) {
        throw new Error(
          "message" in body && body.message
            ? body.message
            : "Support assistance is temporarily unavailable.",
        );
      }
      setResult(body as PublicSupportAssistResponse);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Support assistance is temporarily unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="surface-card wide-card support-assist"
      aria-labelledby="support-assist-title"
    >
      <div className="card-header">
        <div>
          <p className="eyebrow">Help</p>
          <h2 id="support-assist-title">Ask about using DIREKT</h2>
        </div>
        <span className="trust-mark" aria-hidden="true">
          <DirektIcon name="messages" />
        </span>
      </div>
      <p className="card-copy">
        Ask about trust checks, location privacy, enquiries, provider onboarding
        or how AI assistance works. Answers are grounded in approved public
        DIREKT help facts only.
      </p>
      <form className="support-assist-form" onSubmit={submit}>
        <label>
          Your question
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            minLength={3}
            maxLength={500}
            rows={3}
            placeholder="e.g. Does DIREKT show a provider's private location?"
          />
        </label>
        <button
          className="secondary-action"
          type="submit"
          disabled={busy || question.trim().length < 3}
        >
          {busy ? "Checking approved help…" : "Get help"}
        </button>
      </form>

      {error ? (
        <div className="support-assist-state" role="status">
          <DirektIcon name="alert" />
          <p>{error} You can continue using DIREKT normally.</p>
        </div>
      ) : null}

      {result ? (
        <div className="support-assist-result" aria-live="polite">
          <span className="foundation-chip">
            {result.source === "ai"
              ? "AI-assisted, source-grounded help"
              : result.source === "deterministic"
                ? "DIREKT help"
                : "No approved answer found"}
          </span>
          <p>{result.answer}</p>
          {result.sources.length > 0 ? (
            <div className="support-source-list" aria-label="Answer sources">
              <strong>Based on</strong>
              <ul>
                {result.sources.map((source) => (
                  <li key={source.id}>{source.title}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <small>
            Help answers cannot change provider trust, account permissions,
            payments or canonical backend state.
          </small>
        </div>
      ) : null}
    </section>
  );
}
