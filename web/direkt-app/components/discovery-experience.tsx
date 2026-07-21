"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { DiscoveryAiAssistPanel } from "@/components/discovery-ai-assist-panel";
import { DirektIcon } from "@/components/ui/direkt-icon";
import type {
  PublicCategory,
  PublicProviderCard,
  PublicProviderSearchResponse,
} from "@/lib/contracts/discovery";

export interface DiscoveryBootstrap {
  enabled: boolean;
  categories: PublicCategory[];
  error: string | null;
}

export function CustomerDiscoveryExperience({
  bootstrap,
}: {
  bootstrap: DiscoveryBootstrap;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("");
  const [results, setResults] = useState<PublicProviderSearchResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(bootstrap.error);

  const categoryName = useMemo(
    () =>
      bootstrap.categories.find((item) => item.key === category)?.name ??
      "All services",
    [bootstrap.categories, category],
  );

  async function runSearch() {
    if (!bootstrap.enabled || loading) return;

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (area.trim()) params.set("area", area.trim());
    if (category) params.set("category", category);
    if (availability) params.set("availability", availability);
    params.set("limit", "20");

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/discovery/search?${params.toString()}`,
        {
          method: "GET",
          headers: { accept: "application/json" },
          cache: "no-store",
        },
      );
      const body = (await response.json()) as
        PublicProviderSearchResponse | { title?: string; detail?: string };
      if (!response.ok) {
        throw new Error(
          "detail" in body && body.detail
            ? body.detail
            : "DIREKT could not complete this search right now.",
        );
      }
      setResults(body as PublicProviderSearchResponse);
    } catch (searchError) {
      setResults(null);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "DIREKT could not complete this search right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch();
  }

  async function chooseCategory(nextCategory: string) {
    setCategory(nextCategory);
  }

  if (!bootstrap.enabled) {
    return (
      <section
        className="surface-card wide-card discovery-disabled world-class-disabled"
        aria-label="Discovery status"
      >
        <span className="disabled-icon">
          <DirektIcon name="search" />
        </span>
        <p className="eyebrow">Service discovery</p>
        <h2>Provider search is temporarily unavailable</h2>
        <p className="card-copy">
          We will not show invented listings while the live provider catalogue
          is unavailable. Your area and search choices can still be entered when
          service returns.
        </p>
      </section>
    );
  }

  return (
    <section
      className="discovery-experience marketplace-discovery"
      aria-label="Find a provider"
    >
      <section className="marketplace-hero" aria-labelledby="marketplace-title">
        <div className="marketplace-hero-copy">
          <p className="marketplace-kicker">
            <DirektIcon name="sparkle" /> Local help, with clearer proof
          </p>
          <h1 id="marketplace-title">What do you need help with?</h1>
          <p className="marketplace-hero-lead">
            Describe the job in your own words or choose a service. DIREKT helps
            you compare local providers using current, check-specific trust
            information.
          </p>
        </div>

        <form className="marketplace-search-card" onSubmit={submit}>
          <div className="marketplace-search-main">
            <DirektIcon name="search" />
            <label>
              <span>Service or problem</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                maxLength={120}
                placeholder="e.g. leaking sink, electrician, moving help"
                autoComplete="off"
              />
            </label>
          </div>
          <div className="marketplace-search-location">
            <DirektIcon name="location" />
            <label>
              <span>Area or landmark</span>
              <input
                value={area}
                onChange={(event) => setArea(event.target.value)}
                maxLength={160}
                placeholder="e.g. Kabwata"
                autoComplete="address-level3"
              />
            </label>
          </div>
          <button
            className="marketplace-search-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Searching…" : "Find providers"}
            <DirektIcon name="arrow-right" />
          </button>
        </form>

        <DiscoveryAiAssistPanel
          need={query}
          area={area}
          disabled={loading}
          onApply={(suggestion) => {
            setCategory(suggestion.categoryKey);
            setQuery(
              suggestion.searchTerms.length > 0
                ? suggestion.searchTerms.join(" ")
                : suggestion.categoryName,
            );
            setResults(null);
            setError(null);
          }}
        />

        <div className="discovery-secondary-controls">
          <label>
            <span>Service category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All active services</option>
              {bootstrap.categories.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Availability</span>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            >
              <option value="">Any availability</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="unavailable">Unavailable</option>
              <option value="unknown">Not stated</option>
            </select>
          </label>
        </div>
        <p className="search-privacy-note">
          <DirektIcon name="shield" /> Manual area search always works without
          sharing precise device location. Private provider base coordinates are
          never published as customer map pins.
        </p>
      </section>

      {bootstrap.categories.length > 0 && (
        <section className="category-section" aria-labelledby="category-title">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Browse services</p>
              <h2 id="category-title">Start with what you need</h2>
              <p>Choose a category, then narrow by area and availability.</p>
            </div>
          </div>
          <div className="category-market-grid">
            {bootstrap.categories.slice(0, 8).map((item) => (
              <button
                className={
                  category === item.key
                    ? "category-market-card active"
                    : "category-market-card"
                }
                key={item.key}
                type="button"
                aria-pressed={category === item.key}
                onClick={() =>
                  chooseCategory(category === item.key ? "" : item.key)
                }
              >
                <span className="category-market-icon">
                  <DirektIcon name={categoryIcon(item.name)} />
                </span>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section
        className="marketplace-confidence-section"
        aria-label="How DIREKT helps you choose"
      >
        <div className="marketplace-confidence-grid">
          <article className="confidence-card">
            <DirektIcon name="shield" />
            <div>
              <strong>Checks stay specific</strong>
              <p>
                See what was checked, when it was checked and the limitation of
                each result.
              </p>
            </div>
          </article>
          <article className="confidence-card">
            <DirektIcon name="location" />
            <div>
              <strong>Location without overexposure</strong>
              <p>
                Service areas and consented public premises are useful without
                revealing private provider bases.
              </p>
            </div>
          </article>
          <article className="confidence-card">
            <DirektIcon name="messages" />
            <div>
              <strong>Keep the interaction accountable</strong>
              <p>
                Tracked enquiries preserve context before any consent-aware call
                or messaging handoff.
              </p>
            </div>
          </article>
        </div>
      </section>

      {error && (
        <div className="discovery-error" role="alert">
          <DirektIcon name="alert" />
          <div>
            <strong>Search unavailable</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {results && (
        <section
          className="marketplace-results-section"
          aria-live="polite"
          aria-labelledby="results-title"
        >
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Providers</p>
              <h2 id="results-title">
                {results.searchContext.resultCount}{" "}
                {category ? `${categoryName.toLowerCase()} ` : ""}provider
                {results.searchContext.resultCount === 1 ? "" : "s"}
              </h2>
              <p>
                Compare service fit, area, availability and the trust
                information currently available for each provider.
              </p>
            </div>
          </div>

          <div className="marketplace-results-toolbar">
            <div className="results-context">
              {results.searchContext.manualArea && (
                <span className="context-chip">
                  Near {results.searchContext.manualArea}
                </span>
              )}
              {category && <span className="context-chip">{categoryName}</span>}
              {availability && (
                <span className="context-chip">{humanize(availability)}</span>
              )}
            </div>
            <div className="view-switch" role="group" aria-label="Results view">
              <button className="active" type="button" aria-pressed="true">
                <DirektIcon name="list" />
                List
              </button>
              <button
                type="button"
                disabled
                title="Map view becomes available when the approved map runtime is active"
              >
                <DirektIcon name="map" />
                Map
              </button>
            </div>
          </div>

          {results.items.length > 0 ? (
            <div className="provider-results-grid marketplace-provider-grid">
              {results.items.map((provider) => (
                <ProviderResultCard
                  key={provider.publicProviderId}
                  provider={provider}
                />
              ))}
            </div>
          ) : (
            <div className="surface-card no-results">
              <span className="disabled-icon">
                <DirektIcon name="search" />
              </span>
              <h3>No matching published providers yet</h3>
              <p>
                Try a broader area, remove a filter or choose a related service.
                DIREKT will not fabricate a match.
              </p>
              <ul>
                {results.searchContext.noResultsSuggestions.map(
                  (suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ),
                )}
              </ul>
            </div>
          )}
        </section>
      )}
    </section>
  );
}

function ProviderResultCard({ provider }: { provider: PublicProviderCard }) {
  const topClaims = provider.claims.slice(0, 2);
  const imageUrl = provider.image.standardUrl ?? provider.image.lowBandwidthUrl;
  return (
    <article className="surface-card provider-result-card marketplace-provider-card">
      <div className="provider-market-media">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- canonical public image URLs can be remote and are low-bandwidth-aware upstream.
          <img
            src={imageUrl}
            alt={
              provider.image.altText ?? `${provider.displayName} service work`
            }
            loading="lazy"
          />
        ) : (
          <div className="provider-media-fallback" aria-hidden="true">
            <span>{provider.displayName.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        <span className="provider-availability-overlay">
          <AvailabilityBadge state={provider.availability} />
        </span>
      </div>

      <div className="provider-market-body">
        <div className="provider-market-heading">
          <div>
            <p className="eyebrow">{provider.categoryName}</p>
            <h3>{provider.displayName}</h3>
          </div>
        </div>
        <p className="provider-locality-line">
          <DirektIcon name="location" />
          {provider.locality}
        </p>

        <div
          className="provider-fit-reasons"
          aria-label="Why this provider may fit"
        >
          {provider.reasons.slice(0, 3).map((reason) => (
            <span key={reason}>{reason}</span>
          ))}
        </div>

        {topClaims.length > 0 ? (
          <div
            className="provider-trust-preview"
            aria-label="Current DIREKT check information"
          >
            {topClaims.map((claim) => (
              <div className="provider-trust-line" key={claim.claimKey}>
                <DirektIcon name="shield" />
                <div>
                  <strong>{claim.statement}</strong>
                  <small>{claim.limitation}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="provider-trust-preview">
            <div className="provider-trust-line">
              <DirektIcon name="alert" />
              <div>
                <strong>No public check summary available</strong>
                <small>
                  Review the provider profile for current details before
                  deciding.
                </small>
              </div>
            </div>
          </div>
        )}

        <div className="provider-market-footer">
          <span className="provider-distance">
            <DirektIcon name="location" />
            {provider.distanceKm === null
              ? "Serves this area"
              : `${provider.distanceKm} km`}
          </span>
          <Link
            className="provider-market-action"
            href={`/providers/${provider.publicProviderId}`}
          >
            View profile
            <DirektIcon name="arrow-right" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function AvailabilityBadge({
  state,
}: {
  state: PublicProviderCard["availability"];
}) {
  const label =
    state === "unknown" ? "Availability not stated" : humanize(state);
  return <span className={`availability-badge state-${state}`}>{label}</span>;
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryIcon(
  name: string,
): "briefcase" | "home" | "sparkle" | "location" {
  const lower = name.toLowerCase();
  if (
    lower.includes("home") ||
    lower.includes("plumb") ||
    lower.includes("electric") ||
    lower.includes("repair")
  )
    return "home";
  if (lower.includes("beaut") || lower.includes("clean")) return "sparkle";
  if (lower.includes("transport") || lower.includes("moving"))
    return "location";
  return "briefcase";
}
