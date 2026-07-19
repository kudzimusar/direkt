import Link from "next/link";
import { notFound } from "next/navigation";
import { DirektApiClient, DirektApiError } from "@/lib/server/direkt-api-client";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";
import type { PublicProviderBundle } from "@/lib/contracts/discovery";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function PublicProviderPage({
  params,
}: {
  params: Promise<{ publicProviderId: string }>;
}) {
  const { publicProviderId } = await params;
  if (!UUID.test(publicProviderId)) notFound();

  const capabilities = getPublicRuntimeCapabilities();
  if (!capabilities.publicDiscoveryEnabled) {
    return <UnavailableProviderPage reason="Functional discovery is not configured in this environment." />;
  }

  let bundle: PublicProviderBundle;
  try {
    bundle = await new DirektApiClient().getPublicProviderBundle(publicProviderId);
  } catch (error) {
    if (error instanceof DirektApiError && error.status === 404) notFound();
    return <UnavailableProviderPage reason="This public provider profile is temporarily unavailable." />;
  }

  const { profile, claims, availability, reviews, share } = bundle;

  return (
    <div className="provider-page-frame">
      <aside className="provider-page-side-nav" aria-label="DIREKT navigation">
        <Link className="provider-page-brand" href="/" aria-label="DIREKT home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>
            <strong>DIREKT</strong>
            <small>Evidence-backed local services</small>
          </span>
        </Link>
        <nav className="provider-page-nav-links" aria-label="Customer">
          <Link className="active" href="/">Discover</Link>
          <Link href="/?view=saved">Saved</Link>
          <Link href="/?view=enquiries">Enquiries</Link>
          <Link href="/?view=account">Account</Link>
        </nav>
        <p className="provider-page-side-note">
          Public profile only. Private evidence, contact details and private base coordinates are not exposed.
        </p>
      </aside>

      <div className="provider-page-content-column">
        <header className="provider-page-topbar">
          <Link className="back-link" href="/">← Back to discovery</Link>
          <span className={`availability-badge state-${availability.state}`}>
            {availability.state.replace("_", " ")}
          </span>
        </header>

        <main id="main-content" className="provider-page-main">
          <section className="provider-profile-hero">
            <div>
              <p className="eyebrow">{profile.categoryName}</p>
              <h1>{profile.displayName}</h1>
              <p className="provider-profile-locality">{profile.locality}</p>
            </div>
            <div className="provider-profile-actions">
              <a href={share.path} aria-label={`Share-safe DIREKT path for ${profile.displayName}`}>
                Share profile
              </a>
            </div>
          </section>

          <section className="provider-trust-notice" aria-label="Trust interpretation">
            <div className="boundary-icon" aria-hidden="true">i</div>
            <div>
              <strong>Scoped checks, not a blanket guarantee</strong>
              <p>{profile.trustSummary}</p>
            </div>
          </section>

          <div className="provider-profile-grid">
            <section className="surface-card provider-profile-main-card">
              <p className="eyebrow">Current checks</p>
              <h2>What DIREKT can currently say</h2>
              {claims.length > 0 ? (
                <div className="provider-claims-list">
                  {claims.map((claim) => (
                    <article className="provider-claim-card" key={claim.claimKey}>
                      <div className="provider-claim-heading">
                        <strong>{claim.statement}</strong>
                        <span>{claim.evidenceClass}</span>
                      </div>
                      <p>{claim.limitation}</p>
                      <dl>
                        <div>
                          <dt>Checked</dt>
                          <dd>{formatDate(claim.checkedAt)}</dd>
                        </div>
                        <div>
                          <dt>Valid until</dt>
                          <dd>{formatDate(claim.validUntil)}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="card-copy">No current public claim cards are available.</p>
              )}
            </section>

            <aside className="provider-profile-sidebar">
              <section className="surface-card">
                <p className="eyebrow">Availability</p>
                <h2>{humanizeAvailability(availability.state)}</h2>
                <p className="card-copy">
                  {availability.nextAvailableAt
                    ? `Next indicated availability: ${formatDateTime(availability.nextAvailableAt)}`
                    : "No future availability time is currently published."}
                </p>
              </section>

              <section className="surface-card">
                <p className="eyebrow">Location privacy</p>
                <h2>{humanizeOperatingModel(profile.operatingModel)}</h2>
                <p className="card-copy">{profile.locationExplanation}</p>
              </section>

              <section className="surface-card">
                <p className="eyebrow">Why this result</p>
                <ul className="check-list">
                  {profile.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>

          <section className="surface-card provider-reviews-section">
            <div className="results-heading">
              <div>
                <p className="eyebrow">Tracked reviews</p>
                <h2>Published customer reviews</h2>
              </div>
              <span className="context-chip">{reviews.length} published</span>
            </div>

            {reviews.length > 0 ? (
              <div className="public-review-list">
                {reviews.map((review) => (
                  <article className="public-review-card" key={review.reviewId}>
                    <div className="public-review-topline">
                      <strong>{review.title}</strong>
                      <span aria-label={`${review.rating} out of 5 stars`}>
                        {"★".repeat(Math.max(0, Math.min(5, review.rating)))}
                        {"☆".repeat(Math.max(0, 5 - Math.min(5, review.rating)))}
                      </span>
                    </div>
                    <p>{review.body}</p>
                    <small>Published {formatDate(review.publishedAt)}</small>
                    {review.providerResponse && (
                      <div className="provider-review-response">
                        <strong>Provider response</strong>
                        <p>{review.providerResponse.body}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="card-copy">No published tracked reviews are available for this provider yet.</p>
            )}
          </section>

          <section className="provider-share-safety" aria-label="Share safety">
            <strong>{share.title}</strong>
            <p>{share.text}</p>
            <span>Private location included: {share.containsPrivateLocation ? "yes" : "no"}</span>
          </section>
        </main>

        <nav className="provider-page-mobile-nav" aria-label="Primary">
          <Link className="active" href="/"><span aria-hidden="true">⌂</span>Discover</Link>
          <Link href="/?view=saved"><span aria-hidden="true">◇</span>Saved</Link>
          <Link href="/?view=enquiries"><span aria-hidden="true">↔</span>Enquiries</Link>
          <Link href="/?view=account"><span aria-hidden="true">○</span>Account</Link>
        </nav>
      </div>
    </div>
  );
}

function UnavailableProviderPage({ reason }: { reason: string }) {
  return (
    <main className="offline-page" id="main-content">
      <div className="offline-card">
        <div className="brand-mark" aria-hidden="true">D</div>
        <p className="eyebrow">Public provider profile</p>
        <h1>Profile unavailable</h1>
        <p>{reason}</p>
        <Link href="/">Return to discovery</Link>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unavailable"
    : new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

function humanizeAvailability(state: PublicProviderBundle["availability"]["state"]) {
  switch (state) {
    case "available":
      return "Available now";
    case "limited":
      return "Limited availability";
    case "unavailable":
      return "Currently unavailable";
    case "unknown":
      return "Availability not confirmed";
  }
}

function humanizeOperatingModel(model: PublicProviderBundle["profile"]["operatingModel"]) {
  switch (model) {
    case "fixed_premises":
      return "Fixed premises";
    case "mobile":
      return "Mobile service area";
    case "hybrid":
      return "Hybrid service model";
  }
}
