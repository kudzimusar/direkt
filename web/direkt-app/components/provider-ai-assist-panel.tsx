"use client";

import { useState } from "react";
import { DirektIcon } from "@/components/ui/direkt-icon";
import type {
  ProviderOnboardingAssistResponse,
  ProviderProfileDraftResponse,
} from "@/lib/contracts/provider-ai";

type ProviderAiResult =
  | { kind: "guide"; value: ProviderOnboardingAssistResponse }
  | { kind: "draft"; value: ProviderProfileDraftResponse };

export function ProviderAiAssistPanel({
  csrfToken,
}: {
  csrfToken: string | null;
}) {
  const [busy, setBusy] = useState<"guide" | "draft" | null>(null);
  const [result, setResult] = useState<ProviderAiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "onboarding-guide" | "profile-draft") {
    if (!csrfToken || busy) return;
    const kind = action === "onboarding-guide" ? "guide" : "draft";
    setBusy(kind);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/provider/ai-assist", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-direkt-csrf": csrfToken,
        },
        cache: "no-store",
        body: JSON.stringify({ action }),
      });
      const body = (await response.json().catch(() => ({}))) as
        | ProviderOnboardingAssistResponse
        | ProviderProfileDraftResponse
        | { message?: string };
      if (!response.ok) {
        throw new Error(
          "message" in body && body.message
            ? body.message
            : "Provider assistance is temporarily unavailable.",
        );
      }
      setResult(
        kind === "guide"
          ? { kind, value: body as ProviderOnboardingAssistResponse }
          : { kind, value: body as ProviderProfileDraftResponse },
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Provider assistance is temporarily unavailable.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <article
      className="journey-card wide-card provider-ai-copilot"
      aria-label="Provider assistance"
    >
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Business assistant</p>
          <h2>Get help with your next step</h2>
          <p>
            Assistance can explain your readiness checklist or draft public
            profile wording. It cannot approve checks, publish services or
            change trust.
          </p>
        </div>
      </div>

      <div className="provider-ai-actions">
        <button
          type="button"
          className="secondary-action"
          disabled={!csrfToken || busy !== null}
          onClick={() => void run("onboarding-guide")}
        >
          <DirektIcon name="check" />
          {busy === "guide" ? "Preparing guidance…" : "Explain my next steps"}
        </button>
        <button
          type="button"
          className="secondary-action"
          disabled={!csrfToken || busy !== null}
          onClick={() => void run("profile-draft")}
        >
          <DirektIcon name="briefcase" />
          {busy === "draft" ? "Drafting…" : "Draft profile wording"}
        </button>
      </div>

      {error ? (
        <div className="provider-ai-state" role="status">
          <DirektIcon name="alert" />
          <div>
            <strong>Assistant unavailable</strong>
            <p>{error} Your normal provider workspace remains fully usable.</p>
          </div>
        </div>
      ) : null}

      {result?.kind === "guide" ? (
        <div className="provider-ai-result" aria-live="polite">
          <span className="foundation-chip">
            {result.value.source === "ai"
              ? "AI-assisted guidance"
              : "DIREKT checklist guidance"}
          </span>
          <h3>{result.value.headline}</h3>
          <ol>
            {result.value.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="provider-ai-limit">
            The backend checklist and human verification process remain
            authoritative.
          </p>
        </div>
      ) : null}

      {result?.kind === "draft" ? (
        <div className="provider-ai-result" aria-live="polite">
          <span className="foundation-chip">
            {result.value.source === "ai"
              ? "AI-assisted draft"
              : "DIREKT draft"}
          </span>
          <h3>Review before using</h3>
          <textarea
            className="provider-ai-draft"
            value={result.value.draft}
            readOnly
            rows={5}
            aria-label="Suggested public profile wording"
          />
          <p className="provider-ai-limit">
            This text is not saved or published automatically. Review and edit
            it, then use the existing business profile form to save confirmed
            facts.
          </p>
        </div>
      ) : null}
    </article>
  );
}
