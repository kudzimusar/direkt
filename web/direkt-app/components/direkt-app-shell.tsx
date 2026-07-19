"use client";

import { useMemo, useState } from "react";
import {
  destinationHeading,
  destinationLabel,
  navigationItems,
  type DirektDestination,
  type DirektMode,
} from "@/lib/navigation";

const customerFoundation = [
  "Canonical category and provider discovery",
  "Scoped trust claims and availability",
  "Saved-provider shortlist",
  "Tracked enquiries and consent-aware handoffs",
  "Interaction history, reviews and complaints",
  "Account, sessions and consent",
];

const providerFoundation = [
  "Actor-resolved provider workspace",
  "Profile, services and service-area readiness",
  "Verification requirements and evidence recovery",
  "Provider enquiry transitions and handoff state",
  "Reviews, responses and appeals",
  "Commercial and subscription state",
];

export function DirektAppShell() {
  const [mode, setMode] = useState<DirektMode>("customer");
  const [destination, setDestination] = useState<DirektDestination>("discover");

  const heading = useMemo(
    () => destinationHeading(mode, destination),
    [destination, mode],
  );
  const foundation = mode === "customer" ? customerFoundation : providerFoundation;

  const switchMode = (nextMode: DirektMode) => {
    setMode(nextMode);
    setDestination(nextMode === "customer" ? "discover" : "account");
  };

  return (
    <div className="app-frame" data-mode={mode}>
      <aside className="desktop-side-nav" aria-label="Primary">
        <Brand />
        <ModeControl mode={mode} onChange={switchMode} compact={false} />
        <Navigation
          mode={mode}
          destination={destination}
          onNavigate={setDestination}
          surface="side"
        />
        <div className="side-note">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>Functional PWA workstream</strong>
            <p>W1 foundation · backend authority unchanged</p>
          </div>
        </div>
      </aside>

      <aside className="tablet-rail" aria-label="Primary">
        <div className="rail-brand" aria-label="DIREKT">
          D
        </div>
        <Navigation
          mode={mode}
          destination={destination}
          onNavigate={setDestination}
          surface="rail"
        />
      </aside>

      <div className="app-content-column">
        <header className="top-bar">
          <div className="mobile-brand-row">
            <Brand compact />
          </div>
          <ModeControl mode={mode} onChange={switchMode} compact />
        </header>

        <main id="main-content" className="main-content" tabIndex={-1}>
          <section className="page-heading" aria-labelledby="page-title">
            <div>
              <p className="eyebrow">{mode === "customer" ? "Customer" : "Provider"}</p>
              <h1 id="page-title">{heading.title}</h1>
              <p>{heading.summary}</p>
            </div>
            <span className="foundation-chip">W1 foundation</span>
          </section>

          <section className="boundary-banner" aria-label="Implementation boundary">
            <div className="boundary-icon" aria-hidden="true">
              ✓
            </div>
            <div>
              <strong>Same DIREKT product. New browser client.</strong>
              <p>
                This foundation does not grant roles, provider scope, verification state or production
                access. Those remain authoritative in the existing backend and documented gates.
              </p>
            </div>
          </section>

          <section className="content-grid" aria-label="Functional parity foundation">
            <article className="surface-card primary-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">Parity target</p>
                  <h2>{heading.title}</h2>
                </div>
                <span className="trust-mark" aria-label="Backend-authoritative">
                  API
                </span>
              </div>
              <p className="card-copy">
                The UI shell is now responsive across phone, tablet and desktop. Functional slices are
                connected to canonical REST/OpenAPI one bounded capability at a time, starting with
                public discovery.
              </p>
              <div className="progress-row" aria-label="Workstream progress">
                <span>W1</span>
                <div className="progress-track" aria-hidden="true">
                  <span className="progress-fill" />
                </div>
                <span>W8</span>
              </div>
            </article>

            <article className="surface-card">
              <p className="eyebrow">No-regression boundary</p>
              <h2>Android remains protected</h2>
              <ul className="check-list">
                <li>No Kotlin Multiplatform conversion</li>
                <li>No Gradle or Android dependency changes</li>
                <li>No release/signing gate changes</li>
                <li>Shared API changes must remain backward compatible</li>
              </ul>
            </article>

            <article className="surface-card wide-card">
              <p className="eyebrow">Functional scope</p>
              <h2>{mode === "customer" ? "Customer journey" : "Provider journey"}</h2>
              <div className="capability-grid">
                {foundation.map((item) => (
                  <div className="capability-item" key={item}>
                    <span aria-hidden="true">→</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="surface-card wide-card architecture-card">
              <p className="eyebrow">Authority chain</p>
              <h2>Client → OpenAPI → NestJS → data</h2>
              <div className="authority-chain" aria-label="DIREKT authority chain">
                <span>{mode === "customer" ? "Customer Web/PWA" : "Provider Web/PWA"}</span>
                <b aria-hidden="true">→</b>
                <span>Reviewed BFF</span>
                <b aria-hidden="true">→</b>
                <span>Canonical API</span>
                <b aria-hidden="true">→</b>
                <span>PostgreSQL / PostGIS / Private Storage</span>
              </div>
              <p className="card-copy">
                The browser never becomes the database, authorization or trust authority and never
                receives privileged Supabase credentials.
              </p>
            </article>
          </section>
        </main>

        <nav className="mobile-bottom-nav" aria-label="Primary">
          <Navigation
            mode={mode}
            destination={destination}
            onNavigate={setDestination}
            surface="bottom"
          />
        </nav>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "brand compact" : "brand"} aria-label="DIREKT">
      <span className="brand-mark" aria-hidden="true">
        D
      </span>
      <span>
        <strong>DIREKT</strong>
        {!compact && <small>Evidence-backed local services</small>}
      </span>
    </div>
  );
}

function ModeControl({
  mode,
  onChange,
  compact,
}: {
  mode: DirektMode;
  onChange: (mode: DirektMode) => void;
  compact: boolean;
}) {
  return (
    <div className={compact ? "mode-control compact" : "mode-control"}>
      {!compact && <span className="mode-label">Surface</span>}
      <div className="segmented-control" role="group" aria-label="Preview product surface">
        {(["customer", "provider"] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={mode === value ? "active" : ""}
            aria-pressed={mode === value}
            onClick={() => onChange(value)}
          >
            {value === "customer" ? "Customer" : "Provider"}
          </button>
        ))}
      </div>
    </div>
  );
}

function Navigation({
  mode,
  destination,
  onNavigate,
  surface,
}: {
  mode: DirektMode;
  destination: DirektDestination;
  onNavigate: (destination: DirektDestination) => void;
  surface: "side" | "rail" | "bottom";
}) {
  return (
    <div className={`nav-items nav-${surface}`}>
      {navigationItems.map((item) => {
        const active = destination === item.id;
        const label = destinationLabel(mode, item);
        return (
          <button
            key={item.id}
            type="button"
            className={active ? "nav-item active" : "nav-item"}
            aria-current={active ? "page" : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-glyph" aria-hidden="true">
              {item.glyph}
            </span>
            {surface !== "rail" && <span>{surface === "bottom" ? item.shortLabel : label}</span>}
            {surface === "rail" && <span className="sr-only">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
