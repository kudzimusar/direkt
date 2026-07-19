"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Installability/offline shell is progressive enhancement. The app remains usable online.
      }
    };

    void register();
  }, []);

  return null;
}
