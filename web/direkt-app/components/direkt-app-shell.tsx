"use client";

import { useMemo, useState } from "react";
import { AccountExperience } from "@/components/account-experience";
import { CustomerJourneyExperience } from "@/components/customer-journey-experience";
import { CustomerDiscoveryExperience, type DiscoveryBootstrap } from "@/components/discovery-experience";
import { ProviderJourneyExperience } from "@/components/provider-journey-experience";
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

export function DirektAppShell({ discoveryBootstrap, initialDestination = "discover", initialProviderId = null }: {
  discoveryBootstrap: DiscoveryBootstrap;
  initialDestination?: DirektDestination;
  initialProviderId?: string | null;
}) {
  const [mode, setMode] = useState<DirektMode>("customer");
  const [destination, setDestination] = useState<DirektDestination>(initialDestination);
  const [providerModeAvailable, setProviderModeAvailable] = useState(false);
  const heading = useMemo(() => destinationHeading(mode, destination), [destination, mode]);
  const foundation = mode === "customer" ? customerFoundation : providerFoundation;
  const showDiscovery = mode === "customer" && destination === "discover";
  const showCustomerJourney = mode === "customer" && (destination === "saved" || destination === "enquiries");
  const showProviderJourney = mode === "provider" && providerModeAvailable;
  const showAccount = destination === "account";

  const switchMode = (nextMode: DirektMode) => {
    if (nextMode === "provider" && !providerModeAvailable) {
      setDestination("account");
      return;
    }
    setMode(nextMode);
    setDestination("discover");
  };

  const updateProviderAvailability = (available: boolean) => {
    setProviderModeAvailable(available);
    if (!available && mode === "provider") {
      setMode("customer");
      setDestination("account");
    }
  };

  return (
    <div className="app-frame" data-mode={mode}>
      <aside className="desktop-side-nav" aria-label="Primary">
        <Brand />
        <ModeControl mode={mode} onChange={switchMode} compact={false} providerEnabled={providerModeAvailable} />
        <Navigation mode={mode} destination={destination} onNavigate={setDestination} surface="side" />
        <div className="side-note"><span className="status-dot" aria-hidden="true" /><div><strong>Functional PWA workstream</strong><p>W5 provider lifecycle · backend authority unchanged</p></div></div>
      </aside>

      <aside className="tablet-rail" aria-label="Primary">
        <div className="rail-brand" aria-label="DIREKT">D</div>
        <Navigation mode={mode} destination={destination} onNavigate={setDestination} surface="rail" />
      </aside>

      <div className="app-content-column">
        <header className="top-bar"><div className="mobile-brand-row"><Brand compact /></div><ModeControl mode={mode} onChange={switchMode} compact providerEnabled={providerModeAvailable} /></header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          <section className="page-heading" aria-labelledby="page-title">
            <div><p className="eyebrow">{mode === "customer" ? "Customer" : "Provider"}</p><h1 id="page-title">{heading.title}</h1><p>{heading.summary}</p></div>
            <span className="foundation-chip">{showDiscovery ? "W2 closed" : mode === "customer" && showAccount ? "W3 closed" : mode === "customer" && showCustomerJourney ? "W4 closed" : showProviderJourney ? "W5 active" : "Parity foundation"}</span>
          </section>
          <section className="boundary-banner" aria-label="Implementation boundary"><div className="boundary-icon" aria-hidden="true">✓</div><div><strong>Same DIREKT product. Server authority stays canonical.</strong><p>Discovery, customer lifecycle and provider workspace state use reviewed same-origin BFF routes and the IAM-private API. Provider scope is actor-resolved; real participant admission and production authorization remain separately gated.</p></div></section>
          {showDiscovery ? <CustomerDiscoveryExperience bootstrap={discoveryBootstrap} /> : null}
          {showCustomerJourney ? <CustomerJourneyExperience destination={destination as "saved" | "enquiries"} initialProviderId={initialProviderId} /> : null}
          {showProviderJourney ? <>{showAccount ? <AccountExperience onProviderAvailabilityChange={updateProviderAvailability} /> : null}<ProviderJourneyExperience destination={destination} /></> : null}
          {!showDiscovery && !showCustomerJourney && !showProviderJourney && showAccount ? <AccountExperience onProviderAvailabilityChange={updateProviderAvailability} /> : null}
          {!showDiscovery && !showCustomerJourney && !showProviderJourney && !showAccount ? <FoundationContent headingTitle={heading.title} foundation={foundation} mode={mode} /> : null}
        </main>
        <nav className="mobile-bottom-nav" aria-label="Primary"><Navigation mode={mode} destination={destination} onNavigate={setDestination} surface="bottom" /></nav>
      </div>
    </div>
  );
}

function FoundationContent({ headingTitle, foundation, mode }: { headingTitle: string; foundation: string[]; mode: DirektMode }) {
  return <section className="content-grid" aria-label="Functional parity foundation">
    <article className="surface-card primary-card"><div className="card-header"><div><p className="eyebrow">Parity target</p><h2>{headingTitle}</h2></div><span className="trust-mark" aria-label="Backend-authoritative">API</span></div><p className="card-copy">W2 discovery, W3 account/session and W4 customer journeys are closed with managed evidence. W5 provider journeys are backend-backed while W6 commercial mutations remain fail-closed.</p></article>
    <article className="surface-card"><p className="eyebrow">No-regression boundary</p><h2>Android remains protected</h2><ul className="check-list"><li>No Kotlin Multiplatform conversion</li><li>No Gradle or Android dependency changes</li><li>No release/signing gate changes</li><li>Shared API changes remain backward compatible</li></ul></article>
    <article className="surface-card wide-card"><p className="eyebrow">Functional scope</p><h2>{mode === "customer" ? "Customer journey" : "Provider journey"}</h2><div className="capability-grid">{foundation.map((item) => <div className="capability-item" key={item}><span aria-hidden="true">→</span><span>{item}</span></div>)}</div></article>
  </section>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? "brand compact" : "brand"} aria-label="DIREKT"><span className="brand-mark" aria-hidden="true">D</span><span><strong>DIREKT</strong>{!compact && <small>Evidence-backed local services</small>}</span></div>;
}

function ModeControl({ mode, onChange, compact, providerEnabled }: { mode: DirektMode; onChange: (mode: DirektMode) => void; compact: boolean; providerEnabled: boolean }) {
  return <div className={compact ? "mode-control compact" : "mode-control"}>{!compact && <span className="mode-label">Surface</span>}<div className="segmented-control" role="group" aria-label="Product surface">{(["customer", "provider"] as const).map((value) => { const disabled = value === "provider" && !providerEnabled; return <button key={value} type="button" className={mode === value ? "active" : ""} aria-pressed={mode === value} disabled={disabled} title={disabled ? "Sign in with an authorized provider account to open provider mode" : undefined} onClick={() => onChange(value)}>{value === "customer" ? "Customer" : "Provider"}</button>; })}</div></div>;
}

function Navigation({ mode, destination, onNavigate, surface }: { mode: DirektMode; destination: DirektDestination; onNavigate: (destination: DirektDestination) => void; surface: "side" | "rail" | "bottom" }) {
  return <div className={`nav-items nav-${surface}`}>{navigationItems.map((item) => { const active = destination === item.id; const label = destinationLabel(mode, item); return <button key={item.id} type="button" className={active ? "nav-item active" : "nav-item"} aria-current={active ? "page" : undefined} onClick={() => onNavigate(item.id)}><span className="nav-glyph" aria-hidden="true">{item.glyph}</span>{surface !== "rail" && <span>{surface === "bottom" && mode === "customer" ? item.shortLabel : label}</span>}{surface === "rail" && <span className="sr-only">{label}</span>}</button>; })}</div>;
}
