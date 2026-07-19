"use client";

import { useState } from "react";

export function CustomerProviderActions({ publicProviderId }: { publicProviderId: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setMessage(null);
    const bootstrap = await fetch("/api/auth/bootstrap", { cache: "no-store" });
    if (!bootstrap.ok) throw new Error("Unable to initialize secure browser state.");
    const state = (await bootstrap.json()) as { csrfToken: string; hasSession: boolean };
    if (!state.hasSession) {
      setMessage("Sign in from Account before saving providers.");
      return;
    }
    const response = await fetch("/api/customer/action", {
      method: "POST",
      headers: { "content-type": "application/json", "x-direkt-csrf": state.csrfToken },
      cache: "no-store",
      body: JSON.stringify({ action: "save-provider", publicProviderId }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { message?: string; title?: string };
      throw new Error(body.message || body.title || "Unable to save this provider.");
    }
    setMessage("Provider saved to your DIREKT account.");
  }

  return (
    <div className="profile-actions" aria-label="Customer provider actions">
      <a className="primary-button-link" href={`/?view=enquiries&provider=${encodeURIComponent(publicProviderId)}`}>Start tracked enquiry</a>
      <button className="secondary-button" type="button" onClick={() => void save().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to save provider."))}>Save provider</button>
      {message ? <span role="status">{message}</span> : null}
    </div>
  );
}
