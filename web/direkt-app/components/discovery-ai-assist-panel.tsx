"use client";

import { useState } from "react";
import { DirektIcon } from "@/components/ui/direkt-icon";
import type {
  DiscoveryAiAssistResponse,
  DiscoveryAiAssistSuggestion,
} from "@/lib/contracts/discovery-ai";

export function DiscoveryAiAssistPanel({
  need,
  area,
  disabled,
  onApply,
}: {
  need: string;
  area: string;
  disabled: boolean;
  onApply: (suggestion: DiscoveryAiAssistSuggestion) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryAiAssistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedNeed = need.replace(/\s+/g, " ").trim();
  const canAssist = normalizedNeed.length >= 3 && !disabled;

  async function runAssist() {
    if (!canAssist || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/discovery/assist", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          need: normalizedNeed,
          ...(area.trim() ? { area: area.trim() } : {}),
        }),
        cache: "no-store",
      });
      const body = (await response.json()) as
        | DiscoveryAiAssistResponse
        | { message?: string };
      if (!response.ok) {
        throw new Error(
          "message" in body && body.message
            ? body.message
            : "Service guidance is temporarily unavailable.",
        );
      }
      setResult(body as DiscoveryAiAssistResponse);
    } catch (assistError) {
      setError(
        assistError instanceof Error
          ? assistError.message
          : "Service guidance is temporarily unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }

  function applySuggestion(suggestion: DiscoveryAiAssistSuggestion) {
    onApply(suggestion);
    setResult(null);
    setError(null);
  }

  return (
    <section className="discovery-ai-assist" aria-label="Service selection help">
      <div className="discovery-ai-assist-intro">
        <div>
          <p className="eyebrow">Need help choosing a service?</p>
          <p>
            DIREKT can turn your description into possible service categories. You
            always confirm the choice before searching.
          </p>
        </div>
        <button
          type="button"
          className="discovery-ai-assist-trigger"
          onClick={runAssist}
          disabled={!canAssist || loading}
        >
          <DirektIcon name="search" />
          {loading ? "Checking…" : "Help me choose"}
        </button>
      </div>

      {!canAssist && !loading && (
        <p className="discovery-ai-assist-hint">
          Describe the problem above in at least three characters to get service
          guidance.
        </p>
      )}

      {error && (
        <div className="discovery-ai-assist-state" role="status">
          <DirektIcon name="alert" />
          <div>
            <strong>Guidance unavailable</strong>
            <p>{error} You can still choose a category or search normally.</p>
          </div>
        </div>
      )}

      {result && (
        <div className="discovery-ai-assist-result" aria-live="polite">
          <div className="discovery-ai-assist-heading">
            <div>
              <span className="discovery-ai-source-chip">
                {result.source === "ai"
                  ? "AI-assisted suggestion"
                  : result.source === "deterministic"
                    ? "DIREKT category match"
                    : "More detail needed"}
              </span>
              <h3>Possible service matches</h3>
            </div>
            <p>
              Suggestions help classify your need. They do not endorse a provider
              or create any trust status.
            </p>
          </div>

          {result.clarificationQuestion && (
            <div className="discovery-ai-clarification">
              <DirektIcon name="messages" />
              <span>{result.clarificationQuestion}</span>
            </div>
          )}

          {result.suggestions.length > 0 ? (
            <div className="discovery-ai-suggestions">
              {result.suggestions.map((suggestion) => (
                <article
                  key={suggestion.categoryKey}
                  className="discovery-ai-suggestion-card"
                >
                  <div>
                    <p className="eyebrow">Possible match</p>
                    <h4>{suggestion.categoryName}</h4>
                    <p>{suggestion.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applySuggestion(suggestion)}
                    className="discovery-ai-apply"
                  >
                    Use {suggestion.categoryName}
                    <DirektIcon name="arrow-right" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="discovery-ai-empty">
              DIREKT could not confidently map that description to an active
              service. Add a little more detail or choose a category yourself.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
