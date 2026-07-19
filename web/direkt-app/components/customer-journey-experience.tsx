"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type {
  CustomerJourneyState,
  EnquiryView,
  InteractionView,
  ReviewView,
} from "@/lib/contracts/customer";

type Props = {
  destination: "saved" | "enquiries";
  initialProviderId?: string | null;
};

type Bootstrap = {
  csrfToken: string;
  hasSession: boolean;
};

export function CustomerJourneyExperience({ destination, initialProviderId }: Props) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [state, setState] = useState<CustomerJourneyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const bootstrapResponse = await fetch("/api/auth/bootstrap", { cache: "no-store" });
      if (!bootstrapResponse.ok) throw new Error("Unable to initialize secure browser state.");
      const bootstrap = (await bootstrapResponse.json()) as Bootstrap;
      setCsrfToken(bootstrap.csrfToken);
      if (!bootstrap.hasSession) {
        setState(null);
        return;
      }
      const response = await fetch("/api/customer/state", { cache: "no-store" });
      if (response.status === 401) {
        setState(null);
        return;
      }
      if (!response.ok) throw new Error("Unable to load your DIREKT customer activity.");
      setState((await response.json()) as CustomerJourneyState);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load customer activity.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = useCallback(
    async (payload: Record<string, unknown>, successMessage: string) => {
      if (!csrfToken) throw new Error("Secure browser state is not ready.");
      setMessage(null);
      const response = await fetch("/api/customer/action", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-direkt-csrf": csrfToken,
        },
        cache: "no-store",
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string; title?: string };
      if (!response.ok) {
        throw new Error(body.message || body.title || `DIREKT request failed (${response.status}).`);
      }
      setMessage(successMessage);
      await load();
    },
    [csrfToken, load],
  );

  if (loading) return <JourneyNotice title="Loading your DIREKT activity…" />;
  if (!state) {
    return (
      <JourneyNotice
        title="Sign in to continue"
        detail="Saved providers, enquiries, consent-scoped handoffs, reviews and complaints belong to your authenticated DIREKT account."
        actionHref="/?view=account"
        actionLabel="Open account"
        message={message}
      />
    );
  }

  if (destination === "saved") {
    return <SavedProviders state={state} mutate={mutate} message={message} />;
  }

  return (
    <EnquiriesWorkspace
      state={state}
      initialProviderId={initialProviderId}
      mutate={mutate}
      message={message}
    />
  );
}

function SavedProviders({
  state,
  mutate,
  message,
}: {
  state: CustomerJourneyState;
  mutate: (payload: Record<string, unknown>, success: string) => Promise<void>;
  message: string | null;
}) {
  return (
    <section className="journey-stack" aria-labelledby="saved-title">
      <header className="journey-heading">
        <p className="eyebrow">Customer workspace</p>
        <h1 id="saved-title">Saved providers</h1>
        <p>Saved providers are private account state. Publication eligibility is rechecked by the API.</p>
      </header>
      {message ? <p className="journey-message" role="status">{message}</p> : null}
      {state.savedProviders.length === 0 ? (
        <EmptyState text="You have not saved any providers yet." href="/?view=discover" label="Discover providers" />
      ) : (
        <div className="journey-grid">
          {state.savedProviders.map((provider) => (
            <article className="journey-card" key={provider.publicProviderId}>
              <p className="eyebrow">{provider.categoryName}</p>
              <h2>{provider.displayName}</h2>
              <p>{provider.locality}</p>
              <div className="journey-actions">
                <a className="button-link" href={`/providers/${encodeURIComponent(provider.publicProviderId)}`}>View profile</a>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void mutate(
                    { action: "unsave-provider", publicProviderId: provider.publicProviderId },
                    `${provider.displayName} removed from Saved.`,
                  ).catch((error) => window.alert(error instanceof Error ? error.message : "Unable to remove saved provider."))}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function EnquiriesWorkspace({
  state,
  initialProviderId,
  mutate,
  message,
}: {
  state: CustomerJourneyState;
  initialProviderId?: string | null;
  mutate: (payload: Record<string, unknown>, success: string) => Promise<void>;
  message: string | null;
}) {
  const interactionByEnquiry = useMemo(
    () => new Map(state.interactions.map((interaction) => [interaction.enquiryId, interaction])),
    [state.interactions],
  );

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await mutate(
      {
        action: "create-enquiry",
        publicProviderId: String(data.get("publicProviderId") || ""),
        serviceSummary: String(data.get("serviceSummary") || ""),
        timing: String(data.get("timing") || "flexible"),
        localitySummary: String(data.get("localitySummary") || ""),
        preferredChannel: String(data.get("preferredChannel") || "call"),
        idempotencyKey: crypto.randomUUID(),
      },
      "Your tracked enquiry was created.",
    );
    event.currentTarget.reset();
  }

  return (
    <section className="journey-stack" aria-labelledby="enquiries-title">
      <header className="journey-heading">
        <p className="eyebrow">Customer workspace</p>
        <h1 id="enquiries-title">Enquiries & interactions</h1>
        <p>Every action below is recorded against the canonical DIREKT lifecycle. No in-app chat or raw-contact shortcut is created.</p>
      </header>
      {message ? <p className="journey-message" role="status">{message}</p> : null}

      <form className="journey-card journey-form" onSubmit={(event) => void submitEnquiry(event).catch(showError)}>
        <h2>Start a tracked enquiry</h2>
        <label>Provider public ID<input name="publicProviderId" defaultValue={initialProviderId || ""} required /></label>
        <label>What do you need?<textarea name="serviceSummary" minLength={10} maxLength={800} required /></label>
        <div className="field-row">
          <label>Timing<select name="timing" defaultValue="within_week"><option value="urgent">Urgent</option><option value="today">Today</option><option value="within_week">Within a week</option><option value="flexible">Flexible</option></select></label>
          <label>Preferred handoff<select name="preferredChannel" defaultValue="call"><option value="call">Call</option><option value="whatsapp">WhatsApp</option></select></label>
        </div>
        <label>Locality<input name="localitySummary" minLength={2} maxLength={160} placeholder="Kabwata Ward, Lusaka" required /></label>
        <button type="submit">Send tracked enquiry</button>
      </form>

      <div className="journey-stack">
        {state.enquiries.length === 0 ? <EmptyState text="No tracked enquiries yet." href="/?view=discover" label="Find a provider" /> : null}
        {state.enquiries.map((enquiry) => (
          <EnquiryCard
            key={enquiry.enquiryId}
            enquiry={enquiry}
            interaction={interactionByEnquiry.get(enquiry.enquiryId)}
            contacts={state.contacts}
            mutate={mutate}
          />
        ))}
      </div>

      <ReviewAndComplaintWorkspace state={state} mutate={mutate} />
    </section>
  );
}

function EnquiryCard({ enquiry, interaction, contacts, mutate }: {
  enquiry: EnquiryView;
  interaction?: InteractionView;
  contacts: CustomerJourneyState["contacts"];
  mutate: (payload: Record<string, unknown>, success: string) => Promise<void>;
}) {
  const verifiedPhones = contacts.filter((contact) => contact.channel === "phone" && contact.verified);
  return (
    <article className="journey-card">
      <div className="card-topline"><span className="status-chip">{enquiry.status}</span><span>Revision {enquiry.revision}</span></div>
      <h2>{enquiry.providerDisplayName}</h2>
      <p><strong>{enquiry.categoryName}</strong> · {enquiry.localitySummary} · {enquiry.timing.replaceAll("_", " ")}</p>
      <p>{enquiry.serviceSummary}</p>
      <p className="privacy-note">Raw contact, chat, attachments and private evidence are excluded from this enquiry projection.</p>
      {(enquiry.status === "received") ? (
        <button
          className="secondary-button"
          type="button"
          onClick={() => void mutate({
            action: "cancel-enquiry",
            enquiryId: enquiry.enquiryId,
            expectedRevision: enquiry.revision,
            reason: "Cancelled by customer from DIREKT Web",
          }, "Enquiry cancelled.").catch(showError)}
        >Cancel enquiry</button>
      ) : null}

      {enquiry.status === "accepted" && interaction ? (
        <div className="nested-panel">
          <h3>Consent-scoped contact handoff</h3>
          {verifiedPhones.length === 0 ? (
            <p>Add and verify a phone contact through an approved DIREKT authentication flow before granting call or WhatsApp access.</p>
          ) : (
            <div className="journey-actions">
              {verifiedPhones.map((contact) => (
                <span key={contact.id} className="contact-action-group">
                  <span>{contact.displayHint}</span>
                  <button type="button" onClick={() => void mutate({ action: "create-handoff", enquiryId: enquiry.enquiryId, channel: "call", contactId: contact.id, idempotencyKey: crypto.randomUUID() }, "24-hour call handoff granted.").catch(showError)}>Grant call</button>
                  <button type="button" className="secondary-button" onClick={() => void mutate({ action: "create-handoff", enquiryId: enquiry.enquiryId, channel: "whatsapp", contactId: contact.id, idempotencyKey: crypto.randomUUID() }, "24-hour WhatsApp handoff granted.").catch(showError)}>Grant WhatsApp</button>
                </span>
              ))}
            </div>
          )}
          {interaction.handoffs.map((handoff) => (
            <div className="handoff-row" key={handoff.handoffId}>
              <span>{handoff.channel} · {handoff.contactDisplayHint} · {handoff.status}</span>
              {handoff.status === "active" ? <button type="button" className="text-button" onClick={() => void mutate({ action: "revoke-handoff", enquiryId: enquiry.enquiryId, handoffId: handoff.handoffId, reason: "Revoked by customer from DIREKT Web" }, "Contact handoff revoked.").catch(showError)}>Revoke</button> : null}
            </div>
          ))}
        </div>
      ) : null}

      {interaction ? (
        <details className="nested-panel">
          <summary>Private interaction history</summary>
          <p>Status: {interaction.status} · review eligibility: {interaction.reviewEligibility.eligible ? "eligible" : interaction.reviewEligibility.reasonCode}</p>
          <ol>{interaction.events.map((event) => <li key={`${event.sequence}-${event.occurredAt}`}><strong>{event.summary}</strong> <span>{new Date(event.occurredAt).toLocaleString()}</span></li>)}</ol>
        </details>
      ) : null}
    </article>
  );
}

function ReviewAndComplaintWorkspace({ state, mutate }: {
  state: CustomerJourneyState;
  mutate: (payload: Record<string, unknown>, success: string) => Promise<void>;
}) {
  const reviewByInteraction = new Map(state.reviews.map((review) => [review.interactionId, review]));
  return (
    <section className="journey-card">
      <h2>Reviews, reports & complaints</h2>
      {state.interactions.map((interaction) => {
        const review = reviewByInteraction.get(interaction.interactionId);
        return (
          <div className="review-workspace" key={interaction.interactionId}>
            <h3>{interaction.providerDisplayName}</h3>
            {interaction.reviewEligibility.eligible && !review ? (
              <ReviewForm interaction={interaction} mutate={mutate} />
            ) : review ? (
              <ExistingReview review={review} mutate={mutate} />
            ) : (
              <p>Review unavailable: {interaction.reviewEligibility.reasonCode}</p>
            )}
            <ComplaintForm interaction={interaction} mutate={mutate} />
          </div>
        );
      })}
      {state.complaints.length ? (
        <details><summary>Your complaints ({state.complaints.length})</summary>{state.complaints.map((complaint) => <p key={complaint.complaintId}><strong>{complaint.providerDisplayName}</strong> · {complaint.category.replaceAll("_", " ")} · {complaint.status}<br />{complaint.summary}</p>)}</details>
      ) : null}
    </section>
  );
}

function ReviewForm({ interaction, mutate }: { interaction: InteractionView; mutate: Mutation }) {
  return (
    <form className="mini-form" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      void mutate({ action: "create-review", interactionId: interaction.interactionId, rating: Number(data.get("rating")), title: String(data.get("title") || ""), body: String(data.get("body") || "") }, "Review submitted to the canonical moderation lifecycle.").catch(showError);
    }}>
      <label>Rating<select name="rating" defaultValue="5">{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}</select></label>
      <label>Title<input name="title" minLength={3} maxLength={120} required /></label>
      <label>Review<textarea name="body" minLength={10} maxLength={1500} required /></label>
      <button type="submit">Submit review</button>
    </form>
  );
}

function ExistingReview({ review, mutate }: { review: ReviewView; mutate: Mutation }) {
  return (
    <div className="nested-panel">
      <p><strong>{review.rating}/5 · {review.title}</strong> · {review.moderationStatus}</p>
      <p>{review.body}</p>
      <form className="mini-form" onSubmit={(event) => {
        event.preventDefault(); const data = new FormData(event.currentTarget);
        void mutate({ action: "appeal-review", reviewId: review.reviewId, reasonCode: String(data.get("reasonCode") || "customer_appeal"), statement: String(data.get("statement") || ""), expectedRevision: review.revision }, "Review appeal submitted.").catch(showError);
      }}>
        <label>Appeal reason code<input name="reasonCode" defaultValue="customer_appeal" minLength={2} maxLength={80} /></label>
        <label>Appeal statement<textarea name="statement" minLength={10} maxLength={1200} required /></label>
        <button type="submit" className="secondary-button">Submit appeal</button>
      </form>
      <form className="mini-form" onSubmit={(event) => {
        event.preventDefault(); const data = new FormData(event.currentTarget);
        void mutate({ action: "report-review", reviewId: review.reviewId, reason: String(data.get("reason") || "") }, "Review report accepted for moderation.").catch(showError);
      }}>
        <label>Report concern<textarea name="reason" minLength={3} maxLength={800} required /></label>
        <button type="submit" className="secondary-button">Report review</button>
      </form>
    </div>
  );
}

function ComplaintForm({ interaction, mutate }: { interaction: InteractionView; mutate: Mutation }) {
  return (
    <details className="nested-panel"><summary>Raise an interaction complaint</summary>
      <form className="mini-form" onSubmit={(event) => {
        event.preventDefault(); const data = new FormData(event.currentTarget);
        void mutate({ action: "create-complaint", interactionId: interaction.interactionId, category: String(data.get("category") || "other"), summary: String(data.get("summary") || "") }, "Complaint recorded separately from trust and verification decisions.").catch(showError);
      }}>
        <label>Category<select name="category" defaultValue="service_dispute"><option value="safety">Safety</option><option value="conduct">Conduct</option><option value="service_dispute">Service dispute</option><option value="privacy">Privacy</option><option value="other">Other</option></select></label>
        <label>Summary<textarea name="summary" minLength={10} maxLength={1200} required /></label>
        <button type="submit" className="secondary-button">Submit complaint</button>
      </form>
    </details>
  );
}

type Mutation = (payload: Record<string, unknown>, success: string) => Promise<void>;

function JourneyNotice({ title, detail, actionHref, actionLabel, message }: { title: string; detail?: string; actionHref?: string; actionLabel?: string; message?: string | null }) {
  return <section className="journey-card"><h1>{title}</h1>{detail ? <p>{detail}</p> : null}{message ? <p role="alert">{message}</p> : null}{actionHref && actionLabel ? <a className="button-link" href={actionHref}>{actionLabel}</a> : null}</section>;
}

function EmptyState({ text, href, label }: { text: string; href: string; label: string }) {
  return <div className="journey-card"><p>{text}</p><a className="button-link" href={href}>{label}</a></div>;
}

function showError(error: unknown) {
  window.alert(error instanceof Error ? error.message : "DIREKT could not complete that request.");
}
