"use client";

import { useEffect, useState } from "react";
import type { ProviderStateResponse } from "@/lib/contracts/provider";

export function ProviderInteractionExperience() {
  const [state, setState] = useState<ProviderStateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/provider/state", { cache: "no-store" });
        if (!response.ok) return;
        const body = (await response.json()) as ProviderStateResponse;
        if (!cancelled) setState(body);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load provider interactions.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) return <p className="provider-error" role="alert">{error}</p>;
  if (!state) return null;

  return <section className="journey-card" aria-labelledby="provider-interactions-title">
    <p className="eyebrow">Tracked lifecycle</p>
    <h2 id="provider-interactions-title">Interactions and consent-scoped handoffs</h2>
    <p className="privacy-note">Only masked contact hints granted by current customer consent are visible. Raw contact, private evidence and internal moderation remain excluded.</p>
    {state.interactions.items.length === 0 ? <p>No tracked provider interactions yet.</p> : <div className="provider-list">{state.interactions.items.map((interaction) => {
      const handoff = state.handoffs[interaction.enquiryId] ?? null;
      return <article className="nested-panel" key={interaction.interactionId}>
        <div className="card-topline"><span className="status-chip">{interaction.status}</span><span>Revision {interaction.revision}</span></div>
        <h3>{interaction.categoryName}</h3>
        {handoff ? <p><strong>{handoff.channel === "whatsapp" ? "WhatsApp" : "Call"} handoff:</strong> {handoff.contactDisplayHint} · {handoff.status} · expires {new Date(handoff.expiresAt).toLocaleString()}</p> : <p>No current consent-scoped contact handoff.</p>}
        <details><summary>Interaction history</summary><ol>{interaction.events.map((event) => <li key={event.eventId}><strong>{event.eventType.replaceAll("_", " ")}</strong> — {event.reason} · {new Date(event.occurredAt).toLocaleString()}</li>)}</ol></details>
      </article>;
    })}</div>}
  </section>;
}
