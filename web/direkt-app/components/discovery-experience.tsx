"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
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

export function CustomerDiscoveryExperience({ bootstrap }: { bootstrap: DiscoveryBootstrap }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState(bootstrap.categories[0]?.key ?? "");
  const [availability, setAvailability] = useState("");
  const [results, setResults] = useState<PublicProviderSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(bootstrap.error);

  const categoryName = useMemo(
    () => bootstrap.categories.find((item) => item.key === category)?.name ?? "All categories",
    [bootstrap.categories, category],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      const response = await fetch(`/api/discovery/search?${params.toString()}`, {
        method: "GET",
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      const body = (await response.json()) as
        | PublicProviderSearchResponse
        | { title?: string; detail?: string };
      if (!response.ok) {
        throw new Error(
          "detail" in body && body.detail
            ? body.detail
            : "DIREKT discovery could not complete this search.",
        );
      }
      setResults(body as PublicProviderSearchResponse);
    } catch (searchError) {
      setResults(null);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "DIREKT discovery could not complete this search.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!bootstrap.enabled) {
    return (
      <section className="surface-card wide-card discovery-disabled" aria-label="Discovery status">
        <p className="eyebrow">W2 public discovery</p>
        <h2>Functional discovery is fail-closed in this environment</h2>
        <p className="card-copy">
          The browser UI is ready, but it will not invent providers or silently bypass the private API
          boundary. Enable the reviewed server runtime to load canonical categories and provider
          publications.
        </p>
      </section>
    );
  }

  return (
    <section className="discovery-experience" aria-label="Find a provider">
      <form className="surface-card discovery-form" onSubmit={submit}>
        <div className="discovery-form-heading">
          <div>
            <p className="eyebrow">Canonical discovery</p>
            <h2>Search DIREKT providers</h2>
          </div>
          <span className="live-contract-chip">API-backed</span>
        </div>

        <div className="discovery-fields">
          <label>
            <span>Service or provider</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={120}
              placeholder="e.g. water leak, electrician"
            />
          </label>
          <label>
            <span>Area or landmark</span>
            <input
              value={area}
              onChange={(event) => setArea(event.target.value)}
              maxLength={160}
              placeholder="e.g. Kabwata"
            />
          </label>
          <label>
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All active categories</option>
              {bootstrap.categories.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Availability</span>
            <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
              <option value="">Any state</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="unavailable">Unavailable</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
        </div>

        <div className="discovery-actions">
          <p>
            Manual area search remains first-class. Private provider base coordinates are never used as
            public pins.
          </p>
          <button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search providers"}
          </button>
        </div>
      </form>

      {error && (
        <div className="discovery-error" role="alert">
          <strong>Search unavailable</strong>
          <span>{error}</span>
        </div>
      )}

      {results && (
        <div className="discovery-results" aria-live="polite">
          <div className="results-heading">
            <div>
              <p className="eyebrow">Results</p>
              <h2>
                {results.searchContext.resultCount} {categoryName.toLowerCase()} provider
                {results.searchContext.resultCount === 1 ? "" : "s"}
              </h2>
            </div>
            {results.searchContext.manualArea && (
              <span className="context-chip">Area: {results.searchContext.manualArea}</span>
            )}
          </div>

          {results.items.length > 0 ? (
            <div className="provider-results-grid">
              {results.items.map((provider) => (
                <ProviderResultCard key={provider.publicProviderId} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="surface-card no-results">
              <h3>No matching published providers</h3>
              <ul>
                {results.searchContext.noResultsSuggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ProviderResultCard({ provider }: { provider: PublicProviderCard }) {
  const topClaims = provider.claims.slice(0, 2);
  return (
    <article className="surface-card provider-result-card">
      <div className="provider-result-topline">
        <div>
          <p className="eyebrow">{provider.categoryName}</p>
          <h3>{provider.displayName}</h3>
        </div>
        <AvailabilityBadge state={provider.availability} />
      </div>

      <p className="provider-locality">{provider.locality}</p>
      <div className="provider-reasons">
        {provider.reasons.slice(0, 3).map((reason) => (
          <span key={reason}>{reason}</span>
        ))}
      </div>

      {topClaims.length > 0 && (
        <div className="claim-preview-list">
          {topClaims.map((claim) => (
            <div className="claim-preview" key={claim.claimKey}>
              <strong>{claim.statement}</strong>
              <small>{claim.limitation}</small>
            </div>
          ))}
        </div>
      )}

      <div className="provider-card-footer">
        <span>
          {provider.distanceKm === null ? "Public service area" : `${provider.distanceKm} km`}
        </span>
        <Link href={`/providers/${provider.publicProviderId}`}>View provider</Link>
      </div>
    </article>
  );
}

function AvailabilityBadge({ state }: { state: PublicProviderCard["availability"] }) {
  return <span className={`availability-badge state-${state}`}>{state.replace("_", " ")}</span>;
}
