"use client";

import { useState } from "react";

export function ShareProfileAction({
  title,
  text,
  path,
}: {
  title: string;
  text: string;
  path: string;
}) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied" | "error">("idle");

  async function share() {
    setStatus("idle");
    const url = new URL(path, window.location.origin).toString();

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
        setStatus("shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setStatus("copied");
        return;
      }

      throw new Error("Browser share and clipboard APIs are unavailable");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setStatus("error");
    }
  }

  return (
    <div className="share-profile-action">
      <button type="button" onClick={share}>
        Share profile
      </button>
      <span className="sr-only" aria-live="polite">
        {status === "shared" && "Share dialog completed."}
        {status === "copied" && "Profile link copied to clipboard."}
        {status === "error" && "This browser could not share or copy the profile link."}
      </span>
    </div>
  );
}
