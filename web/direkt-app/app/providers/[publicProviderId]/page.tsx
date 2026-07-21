import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerProviderActions } from "@/components/customer-provider-actions";
import { ShareProfileAction } from "@/components/share-profile-action";
import { DirektIcon } from "@/components/ui/direkt-icon";
import {
  DirektApiClient,
  DirektApiError,
} from "@/lib/server/direkt-api-client";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";
import type { PublicProviderBundle } from "@/lib/contracts/discovery";

export const dynamic = "force-dynamic";
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function PublicProviderPage({
  params,
}: {
  params: Promise<{ publicProviderId: string }>;
}) {
  const { publicProviderId } = await params;
  if (!UUID.test(publicProviderId)) notFound();
  const capabilities = getPublicRuntimeCapabilities();
  if (!capabilities.publicDiscoveryEnabled)
    return (
      <UnavailableProviderPage reason="Provider profiles are not available in this environment right now." />
    );

  let bundle: PublicProviderBundle;
  try {
    bundle = await new DirektApiClient().getPublicProviderBundle(
      publicProviderId,
    );
  } catch (error) {
    if (error instanceof DirektApiError && error.status === 404) notFound();
    return (
      <UnavailableProviderPage reason="This provider profile is temporarily unavailable." />
    );
  }

  const { profile, claims, availability, reviews, share } = bundle;
  const imageUrl = profile.image.standardUrl ?? profile.image.lowBandwidthUrl;

  return (
    <div className="provider-page-frame world-class-provider-page">
      <aside className="provider-page-side-nav" aria-label="DIREKT navigation">
        <Link className="provider-page-brand" href="/" aria-label="DIREKT home">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span>
            <strong>DIREKT</strong>
            <small>Local services. Clearer proof.</small>
          </span>
        </Link>
        <nav className="provider-page-nav-links" aria-label="Customer">
          <Link className="active" href="/">
            <DirektIcon name="home" />
            Discover
          </Link>
          <Link href="/?view=saved">
            <DirektIcon name="bookmark" />
            Saved
          </Link>
          <Link href="/?view=enquiries">
            <DirektIcon name="messages" />
            Enquiries
          </Link>
          <Link href="/?view=account">
            <DirektIcon name="user" />
            Account
          </Link>
        </nav>
        <div className="side-trust-note">
          <span className="side-trust-icon">
            <DirektIcon name="shield" />
          </span>
          <div>
            <strong>Public profile by design</strong>
            <p>
              Private evidence, private base coordinates and contact details
              stay protected unless their specific sharing rules allow them.
            </p>
          </div>
        </div>
      </aside>

      <div className="provider-page-content-column">
        <header className="provider-page-topbar">
          <Link className="back-link" href="/">
            <span aria-hidden="true">←</span> Back to results
          </Link>
          <span className={`availability-badge state-${availability.state}`}>
            {humanizeAvailability(availability.state)}
          </span>
        </header>
        <main id="main-content" className="provider-page-main">
          <section className="provider-world-hero">
            <div className="provider-world-media">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={
                    profile.image.altText ??
                    `${profile.displayName} service work`
                  }
                />
              ) : (
                <div
                  className="provider-world-media-fallback"
                  aria-hidden="true"
                >
                  <span>{profile.displayName.slice(0, 1).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="provider-world-summary">
              <p className="eyebrow">{profile.categoryName}</p>
              <h1>{profile.displayName}</h1>
              <div className="provider-world-meta">
                <span>
                  <DirektIcon name="location" />
                  {profile.locality}
                </span>
                <span>
                  <DirektIcon name="briefcase" />
                  {humanizeOperatingModel(profile.operatingModel)}
                </span>
              </div>
              <p className="provider-world-intro">
                Review the services this provider offers, where they operate and
                the current check information DIREKT can responsibly show.
              </p>
              <div className="provider-profile-actions">
                <CustomerProviderActions publicProviderId={publicProviderId} />
                <ShareProfileAction
                  title={share.title}
                  text={share.text}
                  path={share.path}
                />
              </div>
            </div>
          </section>

          <section
            className="provider-trust-notice world-class-trust-notice"
            aria-label="Trust interpretation"
          >
            <div className="trust-notice-icon">
              <DirektIcon name="shield" />
            </div>
            <div>
              <strong>Trust is shown check by check</strong>
              <p>{profile.trustSummary}</p>
              <small>
                A current check confirms only the stated fact and scope. It is
                not a guarantee of future workmanship, safety or service
                outcome.
              </small>
            </div>
          </section>

          <div className="provider-profile-grid world-class-profile-grid">
            <section className="surface-card provider-profile-main-card world-class-proof-card">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">DIREKT checks</p>
                  <h2>What can be supported right now</h2>
                  <p>
                    Each statement below is separate, dated and limited to what
                    was actually reviewed.
                  </p>
                </div>
                <span className="proof-count">{claims.length} current</span>
              </div>
              {claims.length > 0 ? (
                <div className="provider-claims-list world-class-claims-list">
                  {claims.map((claim) => (
                    <article
                      className="provider-claim-card world-class-claim-card"
                      key={claim.claimKey}
                    >
                      <div className="claim-status-icon">
                        <DirektIcon name="shield" />
                      </div>
                      <div className="claim-content">
                        <div className="provider-claim-heading">
                          <strong>{claim.statement}</strong>
                          <span>
                            {humanizeEvidenceClass(claim.evidenceClass)}
                          </span>
                        </div>
                        <p>{claim.limitation}</p>
                        <dl>
                          <div>
                            <dt>Checked</dt>
                            <dd>{formatDate(claim.checkedAt)}</dd>
                          </div>
                          <div>
                            <dt>Current until</dt>
                            <dd>{formatDate(claim.validUntil)}</dd>
                          </div>
                        </dl>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-proof-state">
                  <DirektIcon name="alert" />
                  <div>
                    <strong>No current public check information</strong>
                    <p>
                      Do not infer verification from the provider profile alone.
                      Consider service fit, reviews and the information
                      currently available.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <aside className="provider-profile-sidebar world-class-profile-sidebar">
              <section className="surface-card provider-info-card">
                <span className="info-card-icon">
                  <DirektIcon name="clock" />
                </span>
                <p className="eyebrow">Availability</p>
                <h2>{humanizeAvailability(availability.state)}</h2>
                <p className="card-copy">
                  {availability.nextAvailableAt
                    ? `Next indicated availability: ${formatDateTime(availability.nextAvailableAt)}`
                    : "No future availability time is currently published."}
                </p>
              </section>
              <section className="surface-card provider-info-card">
                <span className="info-card-icon">
                  <DirektIcon name="location" />
                </span>
                <p className="eyebrow">How they operate</p>
                <h2>{humanizeOperatingModel(profile.operatingModel)}</h2>
                <p className="card-copy">{profile.locationExplanation}</p>
              </section>
              <section className="surface-card provider-info-card">
                <span className="info-card-icon">
                  <DirektIcon name="search" />
                </span>
                <p className="eyebrow">Why you saw this provider</p>
                <ul className="check-list">
                  {profile.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>

          <section className="surface-card provider-reviews-section world-class-reviews-section">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Customer experience</p>
                <h2>Reviews from eligible tracked interactions</h2>
                <p>
                  Reviews are linked to qualifying DIREKT interactions rather
                  than open, unrelated submissions.
                </p>
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
                        {"☆".repeat(
                          Math.max(0, 5 - Math.min(5, review.rating)),
                        )}
                      </span>
                    </div>
                    <p>{review.body}</p>
                    <small>Published {formatDate(review.publishedAt)}</small>
                    {review.providerResponse ? (
                      <div className="provider-review-response">
                        <strong>Provider response</strong>
                        <p>{review.providerResponse.body}</p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-proof-state">
                <DirektIcon name="messages" />
                <div>
                  <strong>No published tracked reviews yet</strong>
                  <p>
                    This is not a negative signal. It means there is not enough
                    published interaction-backed review history to show here
                    yet.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section
            className="provider-share-safety world-class-share-safety"
            aria-label="Share safety"
          >
            <DirektIcon name="shield" />
            <div>
              <strong>Safe to share</strong>
              <p>{share.text}</p>
              <span>
                This public link does not include a private provider base
                location.
              </span>
            </div>
          </section>
        </main>
        <nav className="provider-page-mobile-nav" aria-label="Primary">
          <Link className="active" href="/">
            <DirektIcon name="home" />
            Discover
          </Link>
          <Link href="/?view=saved">
            <DirektIcon name="bookmark" />
            Saved
          </Link>
          <Link href="/?view=enquiries">
            <DirektIcon name="messages" />
            Enquiries
          </Link>
          <Link href="/?view=account">
            <DirektIcon name="user" />
            Account
          </Link>
        </nav>
      </div>
    </div>
  );
}

function UnavailableProviderPage({ reason }: { reason: string }) {
  return (
    <main className="offline-page" id="main-content">
      <div className="offline-card">
        <div className="brand-mark" aria-hidden="true">
          D
        </div>
        <p className="eyebrow">Provider profile</p>
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
    : new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
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
function humanizeAvailability(
  state: PublicProviderBundle["availability"]["state"],
) {
  switch (state) {
    case "available":
      return "Available now";
    case "limited":
      return "Limited availability";
    case "unavailable":
      return "Currently unavailable";
    case "unknown":
      return "Availability not stated";
  }
}
function humanizeOperatingModel(
  model: PublicProviderBundle["profile"]["operatingModel"],
) {
  switch (model) {
    case "fixed_premises":
      return "Customers visit this location";
    case "mobile":
      return "Travels to customers";
    case "hybrid":
      return "Location and mobile service";
  }
}
function humanizeEvidenceClass(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
