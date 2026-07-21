"use client";

import { useMemo, useState } from "react";
import { AccountExperience } from "@/components/account-experience";
import { CommercialExperience } from "@/components/commercial-experience";
import { CustomerJourneyExperience } from "@/components/customer-journey-experience";
import {
  CustomerDiscoveryExperience,
  type DiscoveryBootstrap,
} from "@/components/discovery-experience";
import { ProviderInteractionExperience } from "@/components/provider-interaction-experience";
import { ProviderJourneyExperience } from "@/components/provider-journey-experience";
import { SupportAssistPanel } from "@/components/support-assist-panel";
import { DirektIcon } from "@/components/ui/direkt-icon";
import {
  destinationHeading,
  destinationIcon,
  destinationLabel,
  navigationItems,
  type DirektDestination,
  type DirektMode,
} from "@/lib/navigation";

// W5 closed: historical contract marker retained in source only; workstream labels are not rendered to users.
// W6 active; external providers gated: historical commercial-contract markers retained in source only.
const customerFoundation = [
  "Search by service need and area",
  "Compare scoped trust checks and availability",
  "Save providers to a private shortlist",
  "Send tracked enquiries with consent-aware contact sharing",
];

const providerFoundation = [
  "Keep your public profile and services current",
  "Track check requirements and evidence status",
  "Manage availability and customer enquiries",
  "Review commercial state separately from trust checks",
];

export function DirektAppShell({
  discoveryBootstrap,
  initialDestination = "discover",
  initialProviderId = null,
}: {
  discoveryBootstrap: DiscoveryBootstrap;
  initialDestination?: DirektDestination;
  initialProviderId?: string | null;
}) {
  const [mode, setMode] = useState<DirektMode>("customer");
  const [destination, setDestination] =
    useState<DirektDestination>(initialDestination);
  const [providerModeAvailable, setProviderModeAvailable] = useState(false);
  const heading = useMemo(
    () => destinationHeading(mode, destination),
    [destination, mode],
  );
  const foundation =
    mode === "customer" ? customerFoundation : providerFoundation;
  const showDiscovery = mode === "customer" && destination === "discover";
  const showCustomerJourney =
    mode === "customer" &&
    (destination === "saved" || destination === "enquiries");
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
    <div className="app-frame world-class-shell" data-mode={mode}>
      <aside className="desktop-side-nav" aria-label="Primary">
        <Brand />
        <ModeControl
          mode={mode}
          onChange={switchMode}
          compact={false}
          providerEnabled={providerModeAvailable}
        />
        <Navigation
          mode={mode}
          destination={destination}
          onNavigate={setDestination}
          surface="side"
        />
        <div className="side-trust-note">
          <span className="side-trust-icon">
            <DirektIcon name="shield" />
          </span>
          <div>
            <strong>Trust, clearly explained</strong>
            <p>
              See what DIREKT checked, when it was checked and what each result
              does not guarantee.
            </p>
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
          <ModeControl
            mode={mode}
            onChange={switchMode}
            compact
            providerEnabled={providerModeAvailable}
          />
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {!showDiscovery && (
            <section className="page-heading" aria-labelledby="page-title">
              <div>
                <p className="eyebrow">
                  {mode === "customer" ? "For you" : "Your business"}
                </p>
                <h1 id="page-title">{heading.title}</h1>
                <p>{heading.summary}</p>
              </div>
            </section>
          )}
          {!showDiscovery && <TrustPrincipleStrip />}
          {showDiscovery ? (
            <CustomerDiscoveryExperience bootstrap={discoveryBootstrap} />
          ) : null}
          {showCustomerJourney ? (
            <CustomerJourneyExperience
              destination={destination as "saved" | "enquiries"}
              initialProviderId={initialProviderId}
            />
          ) : null}
          {showProviderJourney ? (
            <>
              {showAccount ? (
                <AccountExperience
                  onProviderAvailabilityChange={updateProviderAvailability}
                />
              ) : null}
              <ProviderJourneyExperience destination={destination} />
              {destination === "enquiries" ? (
                <ProviderInteractionExperience />
              ) : null}
              {showAccount ? <CommercialExperience /> : null}
            </>
          ) : null}
          {!showDiscovery &&
          !showCustomerJourney &&
          !showProviderJourney &&
          showAccount ? (
            <AccountExperience
              onProviderAvailabilityChange={updateProviderAvailability}
            />
          ) : null}
          {showAccount ? <SupportAssistPanel /> : null}
          {!showDiscovery &&
          !showCustomerJourney &&
          !showProviderJourney &&
          !showAccount ? (
            <FoundationContent
              headingTitle={heading.title}
              foundation={foundation}
              mode={mode}
            />
          ) : null}
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

function TrustPrincipleStrip() {
  return (
    <section
      className="trust-principle-strip"
      aria-label="DIREKT trust principle"
    >
      <DirektIcon name="shield" />
      <div>
        <strong>Proof before persuasion</strong>
        <p>
          Trust information is check-specific. A payment or subscription never
          upgrades a provider&apos;s trust status.
        </p>
      </div>
    </section>
  );
}

function FoundationContent({
  headingTitle,
  foundation,
  mode,
}: {
  headingTitle: string;
  foundation: string[];
  mode: DirektMode;
}) {
  return (
    <section
      className="content-grid workspace-intro"
      aria-label={`${headingTitle} overview`}
    >
      <article className="surface-card primary-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Start here</p>
            <h2>{headingTitle}</h2>
          </div>
          <span className="trust-mark" aria-hidden="true">
            <DirektIcon name={mode === "customer" ? "search" : "briefcase"} />
          </span>
        </div>
        <p className="card-copy">
          {mode === "customer"
            ? "Find useful local providers, understand their current checks and keep your service request accountable."
            : "Keep your business information useful to customers while each trust check remains independently reviewed."}
        </p>
      </article>
      <article className="surface-card wide-card">
        <p className="eyebrow">What you can do</p>
        <h2>
          {mode === "customer"
            ? "Choose with more context"
            : "Manage your service presence"}
        </h2>
        <div className="capability-grid">
          {foundation.map((item) => (
            <div className="capability-item" key={item}>
              <DirektIcon name="check" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "brand compact" : "brand"} aria-label="DIREKT">
      <span className="brand-mark" aria-hidden="true">
        <span>D</span>
      </span>
      <span>
        <strong>DIREKT</strong>
        {!compact && <small>Local services. Clearer proof.</small>}
      </span>
    </div>
  );
}

function ModeControl({
  mode,
  onChange,
  compact,
  providerEnabled,
}: {
  mode: DirektMode;
  onChange: (mode: DirektMode) => void;
  compact: boolean;
  providerEnabled: boolean;
}) {
  return (
    <div className={compact ? "mode-control compact" : "mode-control"}>
      {!compact && <span className="mode-label">Use DIREKT as</span>}
      <div
        className="segmented-control"
        role="group"
        aria-label="Product surface"
      >
        {(["customer", "provider"] as const).map((value) => {
          const disabled = value === "provider" && !providerEnabled;
          return (
            <button
              key={value}
              type="button"
              className={mode === value ? "active" : ""}
              aria-pressed={mode === value}
              disabled={disabled}
              title={
                disabled
                  ? "Sign in with an authorized provider account to open provider mode"
                  : undefined
              }
              onClick={() => onChange(value)}
            >
              {value === "customer" ? "Customer" : "Provider"}
            </button>
          );
        })}
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
              <DirektIcon name={destinationIcon(mode, item)} />
            </span>
            {surface !== "rail" && (
              <span>
                {surface === "bottom" && mode === "customer"
                  ? item.shortLabel
                  : label}
              </span>
            )}
            {surface === "rail" && <span className="sr-only">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
