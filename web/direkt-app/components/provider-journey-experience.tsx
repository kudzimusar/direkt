"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type {
  ProviderEnquiry,
  ProviderReview,
  ProviderStateResponse,
  ProviderUploadGrant,
  ProviderUploadIntent,
} from "@/lib/contracts/provider";
import type { DirektDestination } from "@/lib/navigation";

type MutationResult = Record<string, unknown>;

type Mutate = (payload: Record<string, unknown>, success?: string) => Promise<MutationResult>;

export function ProviderJourneyExperience({ destination }: { destination: DirektDestination }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [state, setState] = useState<ProviderStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bootstrapResponse = await fetch("/api/auth/bootstrap", { cache: "no-store" });
      if (!bootstrapResponse.ok) throw new Error("Unable to initialize secure browser state.");
      const bootstrap = (await bootstrapResponse.json()) as { csrfToken: string; hasSession: boolean };
      setCsrfToken(bootstrap.csrfToken);
      if (!bootstrap.hasSession) {
        setState(null);
        return;
      }
      const response = await fetch("/api/provider/state", { cache: "no-store" });
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        setState(null);
        return;
      }
      if (!response.ok) throw new Error("Unable to load the actor-resolved provider workspace.");
      setState((await response.json()) as ProviderStateResponse);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load provider workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const mutate = useCallback<Mutate>(async (payload, success) => {
    if (!csrfToken) throw new Error("Secure browser state is not ready.");
    setError(null);
    const response = await fetch("/api/provider/action", {
      method: "POST",
      headers: { "content-type": "application/json", "x-direkt-csrf": csrfToken },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown> & { message?: string; title?: string };
    if (!response.ok) throw new Error(body.message || body.title || `DIREKT request failed (${response.status}).`);
    if (success) setMessage(success);
    return body;
  }, [csrfToken]);

  const mutateAndReload = useCallback(async (payload: Record<string, unknown>, success: string) => {
    try {
      await mutate(payload, success);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Provider action failed.");
    }
  }, [load, mutate]);

  if (loading) return <ProviderNotice title="Loading provider workspace…" />;
  if (!state) {
    return <ProviderNotice title="Provider access is not available" detail="Provider mode is granted only by the backend for the authenticated actor. No provider ID or role can be selected in the browser." />;
  }

  return <section className="provider-stack" aria-label="Provider workspace">
    {message ? <p className="journey-message" role="status">{message}</p> : null}
    {error ? <p className="provider-error" role="alert">{error}</p> : null}
    {destination === "discover" ? <ProviderOverview state={state} mutate={mutateAndReload} /> : null}
    {destination === "saved" ? <ProviderEvidence state={state} mutate={mutate} reload={load} setMessage={setMessage} setError={setError} /> : null}
    {destination === "enquiries" ? <ProviderEnquiries state={state} mutate={mutateAndReload} /> : null}
    {destination === "account" ? <ProviderCommercial state={state} /> : null}
  </section>;
}

function ProviderOverview({ state, mutate }: { state: ProviderStateResponse; mutate: (payload: Record<string, unknown>, success: string) => Promise<void> }) {
  const workspace = state.workspace;
  return <div className="provider-grid">
    <article className="journey-card provider-readiness">
      <div className="card-topline"><span className="status-chip">{workspace.provider.status.replaceAll("_", " ")}</span><span>{workspace.representativeRole.replaceAll("_", " ")}</span></div>
      <h2>{workspace.provider.displayName}</h2>
      <p>{workspace.provider.operatingModel.replaceAll("_", " ")} · {workspace.provider.localitySummary || "Locality not set"}</p>
      <div className="readiness-meter" aria-label={`Profile readiness ${workspace.readiness.completionPercent}%`}><span style={{ width: `${Math.max(0, Math.min(100, workspace.readiness.completionPercent))}%` }} /></div>
      <p><strong>{workspace.readiness.completionPercent}% ready</strong> · {workspace.readiness.currentClaims} current claims · {workspace.readiness.correctionRequired} corrections required.</p>
      <p className="privacy-note">{workspace.trustBoundary}</p>
    </article>

    <article className="journey-card">
      <h2>Profile</h2>
      <form className="mini-form" onSubmit={(event) => {
        event.preventDefault(); const data = new FormData(event.currentTarget);
        void mutate({
          action: "update-profile",
          displayName: String(data.get("displayName") || ""),
          operatingModel: String(data.get("operatingModel") || ""),
          localitySummary: String(data.get("localitySummary") || ""),
          serviceAreaSummary: String(data.get("serviceAreaSummary") || ""),
        }, "Provider profile updated without changing trust or publication state.");
      }}>
        <label>Display name<input name="displayName" defaultValue={workspace.provider.displayName} minLength={2} maxLength={160} required /></label>
        <label>Operating model<select name="operatingModel" defaultValue={workspace.provider.operatingModel}><option value="fixed_premises">Fixed premises</option><option value="mobile">Mobile</option><option value="hybrid">Hybrid</option></select></label>
        <label>Locality<input name="localitySummary" defaultValue={workspace.provider.localitySummary || ""} minLength={2} maxLength={160} /></label>
        <label>Service area summary<input name="serviceAreaSummary" defaultValue={workspace.provider.serviceAreaSummary} minLength={2} maxLength={240} required /></label>
        <button type="submit">Save profile</button>
      </form>
    </article>

    <article className="journey-card wide-card">
      <h2>Services and availability</h2>
      <form className="provider-inline-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutate({ action: "select-service", categoryKey: String(data.get("categoryKey") || "") }, "Service selection updated against the active requirement version."); }}>
        <label>Add category key<input name="categoryKey" pattern="[a-z][a-z0-9_-]{1,63}" placeholder="plumbing" required /></label><button type="submit">Add service</button>
      </form>
      <div className="provider-list">
        {workspace.categories.length === 0 ? <p>No services selected yet.</p> : workspace.categories.map((category) => {
          const availability = workspace.availability.find((item) => item.categoryKey === category.categoryKey);
          return <div className="provider-list-row" key={category.categoryKey}>
            <div><strong>{category.categoryName}</strong><small>{category.currentClaims} claims · {category.evidenceSubmitted}/{category.requiredRequirements} evidence · {category.publicationEligible ? "eligible" : "not eligible"}</small></div>
            <form className="provider-row-actions" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const stateValue = String(data.get("state") || "unknown"); void mutate({ action: "update-availability", categoryKey: category.categoryKey, state: stateValue, nextAvailableAt: stateValue === "limited" ? String(data.get("nextAvailableAt") || "") : "" }, "Availability updated independently of trust state."); }}>
              <select name="state" defaultValue={availability?.state || "unknown"}><option value="available">Available</option><option value="limited">Limited</option><option value="unavailable">Unavailable</option><option value="unknown">Unknown</option></select>
              <input name="nextAvailableAt" type="datetime-local" aria-label="Next available date when limited" />
              <button type="submit">Update</button>
              <button type="button" className="secondary-button" onClick={() => void mutate({ action: "remove-service", categoryKey: category.categoryKey, reason: "Provider removed this service from DIREKT Web workspace" }, "Service removed; historical evidence and cases were preserved.")}>Remove</button>
            </form>
          </div>;
        })}
      </div>
    </article>

    <article className="journey-card wide-card">
      <h2>Location and service area</h2>
      <p className="privacy-note">Private base coordinates are write-only in the workspace response. Public premises coordinates require explicit consent. The browser never reads private base coordinates back.</p>
      <form className="mini-form" onSubmit={(event) => {
        event.preventDefault(); const data = new FormData(event.currentTarget);
        const numberOrUndefined = (name: string) => { const value = String(data.get(name) || ""); return value ? Number(value) : undefined; };
        void mutate({
          action: "update-location",
          privateBaseLatitude: numberOrUndefined("privateBaseLatitude"), privateBaseLongitude: numberOrUndefined("privateBaseLongitude"),
          publicPremisesLatitude: numberOrUndefined("publicPremisesLatitude"), publicPremisesLongitude: numberOrUndefined("publicPremisesLongitude"),
          publicPremisesConsent: data.get("publicPremisesConsent") === "on",
          publicLocality: String(data.get("publicLocality") || ""), serviceAreaWkt: String(data.get("serviceAreaWkt") || ""),
        }, "Location model updated with separate private, public-consented and service-area boundaries.");
      }}>
        <div className="field-row"><label>Private base latitude<input name="privateBaseLatitude" type="number" step="any" min="-90" max="90" /></label><label>Private base longitude<input name="privateBaseLongitude" type="number" step="any" min="-180" max="180" /></label></div>
        <div className="field-row"><label>Public premises latitude<input name="publicPremisesLatitude" type="number" step="any" min="-90" max="90" /></label><label>Public premises longitude<input name="publicPremisesLongitude" type="number" step="any" min="-180" max="180" /></label></div>
        <label className="checkbox-label"><input name="publicPremisesConsent" type="checkbox" defaultChecked={workspace.location.publicPremisesConsent} /> I explicitly consent to publishing the premises point when supplied.</label>
        <label>Public locality<input name="publicLocality" defaultValue={workspace.location.publicLocality || workspace.provider.localitySummary || ""} minLength={2} maxLength={160} required /></label>
        <label>Service-area polygon (WKT)<textarea name="serviceAreaWkt" placeholder="POLYGON((28.25 -15.50, 28.45 -15.50, 28.45 -15.30, 28.25 -15.30, 28.25 -15.50))" required /></label>
        <button type="submit">Update location model</button>
      </form>
    </article>

    <article className="journey-card wide-card"><h2>Readiness tasks</h2>{workspace.tasks.length === 0 ? <p>No readiness tasks returned.</p> : <ul className="provider-task-list">{workspace.tasks.map((task) => <li key={task.key}><span className={`task-state ${task.state}`}>{task.state.replaceAll("_", " ")}</span><div><strong>{task.title}</strong><p>{task.detail}</p></div></li>)}</ul>}</article>
  </div>;
}

function ProviderEvidence({ state, mutate, reload, setMessage, setError }: { state: ProviderStateResponse; mutate: Mutate; reload: () => Promise<void>; setMessage: (value: string | null) => void; setError: (value: string | null) => void }) {
  const cases = useMemo(() => Array.from(new Map(state.timeline.map((event) => [event.caseId, event])).values()), [state.timeline]);

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) throw new Error("Choose an evidence file.");
    const caseId = String(data.get("caseId") || "");
    const matching = state.timeline.find((item) => item.caseId === caseId);
    if (!matching) throw new Error("Choose a verification case from the current provider timeline.");
    const result = await mutate({
      action: "create-upload-intent", caseId,
      clientIntentKey: `web-${crypto.randomUUID()}`,
      evidenceClass: String(data.get("evidenceClass") || matching.evidenceClass || "identity"),
      documentType: String(data.get("documentType") || "supporting_document"),
      contentType: file.type,
      maxBytes: Math.max(1024, file.size), consentConfirmed: data.get("consentConfirmed") === "on",
    });
    if (!("upload" in result)) {
      setMessage("The existing logical upload intent was returned; refresh or retry that intent if required.");
      await reload();
      return;
    }
    await uploadAndConfirm(result as unknown as ProviderUploadGrant, file, mutate);
    setMessage("Evidence submitted through the recoverable private upload flow.");
    form.reset();
    await reload();
  }

  return <div className="provider-grid">
    <article className="journey-card wide-card">
      <p className="eyebrow">Private evidence</p><h2>Verification timeline</h2>
      <p className="privacy-note">Reviewer identities, private rationale and storage object keys are excluded from this projection.</p>
      {state.timeline.length === 0 ? <p>No verification cases are currently visible.</p> : <ol className="provider-timeline">{state.timeline.map((event) => <li key={event.eventId}><div><strong>{event.requirementLabel}</strong> · {event.eventType.replaceAll("_", " ")} · {event.caseStatus.replaceAll("_", " ")}</div><p>{event.message}</p><small>{event.categoryName} · {new Date(event.occurredAt).toLocaleString()}</small></li>)}</ol>}
    </article>

    <article className="journey-card wide-card">
      <h2>Submit evidence</h2>
      {cases.length === 0 ? <p>A verification case is required before evidence can be submitted.</p> : <form className="mini-form" onSubmit={(event) => void submitUpload(event).catch((cause) => setError(cause instanceof Error ? cause.message : "Evidence upload failed."))}>
        <label>Verification case<select name="caseId" required>{cases.map((item) => <option key={item.caseId} value={item.caseId}>{item.categoryName} · {item.requirementLabel} · {item.caseStatus}</option>)}</select></label>
        <div className="field-row"><label>Evidence class<select name="evidenceClass" defaultValue="identity"><option>contact</option><option>identity</option><option>business</option><option>qualification</option><option>licence</option><option>experience</option><option>location</option><option>premises</option><option>field</option></select></label><label>Document type<input name="documentType" defaultValue="supporting_document" pattern="[a-z][a-z0-9_]{2,63}" required /></label></div>
        <label>File<input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required /></label>
        <label className="checkbox-label"><input name="consentConfirmed" type="checkbox" required /> I confirm consent to submit this evidence for the selected verification requirement.</label>
        <button type="submit">Upload private evidence</button>
      </form>}
    </article>

    <article className="journey-card wide-card"><h2>Recoverable upload intents</h2>{state.uploads.length === 0 ? <p>No upload intents yet.</p> : <div className="provider-list">{state.uploads.map((upload) => <UploadRecovery key={upload.uploadIntentId} upload={upload} mutate={mutate} reload={reload} setMessage={setMessage} setError={setError} />)}</div>}</article>
  </div>;
}

function UploadRecovery({ upload, mutate, reload, setMessage, setError }: { upload: ProviderUploadIntent; mutate: Mutate; reload: () => Promise<void>; setMessage: (value: string) => void; setError: (value: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  async function retry() {
    if (!file) throw new Error("Choose the replacement file before retrying.");
    const result = await mutate({ action: "retry-upload", uploadIntentId: upload.uploadIntentId });
    if (!("upload" in result)) throw new Error("Retry did not return a private upload grant.");
    await uploadAndConfirm(result as unknown as ProviderUploadGrant, file, mutate);
    setMessage("Interrupted evidence upload retried and confirmed.");
    setFile(null);
    await reload();
  }
  return <div className="provider-list-row upload-row"><div><strong>{upload.requirementLabel}</strong><small>{upload.categoryName} · {upload.state.replaceAll("_", " ")} · attempt {upload.attemptCount}{upload.lastErrorCode ? ` · ${upload.lastErrorCode}` : ""}</small></div><div className="provider-row-actions">{upload.safeToRetry ? <><input aria-label={`Retry file for ${upload.requirementLabel}`} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.currentTarget.files?.[0] || null)} /><button type="button" onClick={() => void retry().catch((cause) => setError(cause instanceof Error ? cause.message : "Retry failed."))}>Retry</button></> : null}{!["submitted", "cancelled"].includes(upload.state) ? <button className="secondary-button" type="button" onClick={() => void mutate({ action: "cancel-upload", uploadIntentId: upload.uploadIntentId, reason: "Provider cancelled this upload intent from DIREKT Web" }, "Upload intent cancelled.").then(reload).catch((cause) => setError(cause instanceof Error ? cause.message : "Cancel failed."))}>Cancel</button> : null}</div></div>;
}

async function uploadAndConfirm(grant: ProviderUploadGrant, file: File, mutate: Mutate) {
  try {
    const uploadResponse = await fetch(grant.upload.uploadUrl, { method: "PUT", headers: grant.upload.requiredHeaders, body: file, cache: "no-store" });
    if (!uploadResponse.ok) throw new Error(`Private upload failed (${uploadResponse.status}).`);
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    await mutate({ action: "confirm-upload", uploadIntentId: grant.uploadIntentId, sha256, sizeBytes: file.size, retentionClass: "standard" });
  } catch (cause) {
    await mutate({ action: "interrupt-upload", uploadIntentId: grant.uploadIntentId, errorCode: "WEB_UPLOAD_INTERRUPTED" }).catch(() => undefined);
    throw cause;
  }
}

function ProviderEnquiries({ state, mutate }: { state: ProviderStateResponse; mutate: (payload: Record<string, unknown>, success: string) => Promise<void> }) {
  return <div className="provider-grid">
    <article className="journey-card wide-card"><p className="eyebrow">Actor-resolved inbox</p><h2>Enquiries</h2><p className="privacy-note">No client provider ID is accepted. Full chat, private evidence and internal identifiers remain excluded.</p>{state.enquiries.items.length === 0 ? <p>No provider enquiries yet.</p> : state.enquiries.items.map((enquiry) => <ProviderEnquiryCard key={enquiry.enquiryId} enquiry={enquiry} mutate={mutate} />)}</article>
    <article className="journey-card wide-card"><h2>Reviews, responses and appeals</h2>{state.reviews.items.length === 0 ? <p>No provider-scoped reviews yet.</p> : state.reviews.items.map((review) => <ProviderReviewCard key={review.reviewId} review={review} mutate={mutate} />)}</article>
  </div>;
}

function ProviderEnquiryCard({ enquiry, mutate }: { enquiry: ProviderEnquiry; mutate: (payload: Record<string, unknown>, success: string) => Promise<void> }) {
  const terminal = ["declined", "closed", "cancelled"].includes(enquiry.status);
  return <div className="nested-panel provider-enquiry"><div className="card-topline"><span className="status-chip">{enquiry.status.replaceAll("_", " ")}</span><span>Revision {enquiry.revision}</span></div><h3>{enquiry.categoryName} · {enquiry.localitySummary}</h3><p>{enquiry.serviceSummary}</p><small>{enquiry.timing.replaceAll("_", " ")} · preferred {enquiry.preferredChannel}</small>{!terminal ? <form className="provider-inline-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutate({ action: "transition-enquiry", enquiryId: enquiry.enquiryId, expectedRevision: enquiry.revision, targetStatus: String(data.get("targetStatus") || "acknowledged"), reason: String(data.get("reason") || "") }, "Enquiry lifecycle updated with authoritative revision control."); }}><label>Next state<select name="targetStatus" defaultValue="acknowledged"><option value="acknowledged">Acknowledge</option><option value="needs_information">Needs information</option><option value="accepted">Accept</option><option value="declined">Decline</option><option value="closed">Close</option></select></label><label>Reason<input name="reason" minLength={8} maxLength={500} defaultValue="Provider response from DIREKT Web" required /></label><button type="submit">Apply transition</button></form> : null}<details><summary>Lifecycle history</summary><ol>{enquiry.events.map((event) => <li key={event.eventId}>{event.toStatus.replaceAll("_", " ")} — {event.reason} · {new Date(event.occurredAt).toLocaleString()}</li>)}</ol></details></div>;
}

function ProviderReviewCard({ review, mutate }: { review: ProviderReview; mutate: (payload: Record<string, unknown>, success: string) => Promise<void> }) {
  return <div className="nested-panel provider-review"><div className="card-topline"><span className="status-chip">{review.moderationStatus}</span><span>{review.rating}/5</span></div><h3>{review.title}</h3><p>{review.body}</p>{review.providerResponse ? <blockquote>{review.providerResponse.body}</blockquote> : <form className="mini-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutate({ action: "respond-review", reviewId: review.reviewId, body: String(data.get("body") || "") }, "Provider response recorded without changing trust or ranking."); }}><label>Public response<textarea name="body" minLength={10} maxLength={1000} required /></label><button type="submit">Respond</button></form>}<form className="mini-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutate({ action: "appeal-review", reviewId: review.reviewId, reason: String(data.get("reason") || "") }, "Provider review appeal submitted for moderation."); }}><label>Appeal reason<textarea name="reason" minLength={20} maxLength={1000} required /></label><button type="submit" className="secondary-button">Appeal review</button></form></div>;
}

function ProviderCommercial({ state }: { state: ProviderStateResponse }) {
  const commercial = state.commercial;
  return <article className="journey-card provider-commercial"><p className="eyebrow">Commercial state</p><h2>Subscriptions and entitlements</h2><p>Payment provider mode: <strong>{commercial.paymentProviderMode}</strong>. Real money movement is not activated by this surface.</p><div className="commercial-stats"><span><strong>{commercial.products.length}</strong> products</span><span><strong>{commercial.subscriptions.length}</strong> subscriptions</span><span><strong>{commercial.invoices.length}</strong> invoices</span><span><strong>{commercial.receipts.length}</strong> receipts</span></div>{commercial.subscriptions.length ? <details><summary>Subscription state</summary><pre className="safe-json">{JSON.stringify(commercial.subscriptions, null, 2)}</pre></details> : <p>No subscription exists for this provider.</p>}<p className="privacy-note">Commercial state cannot create verification, publication or ranking effects. Payment credentials, private interaction contact and private evidence are excluded.</p></article>;
}

function ProviderNotice({ title, detail }: { title: string; detail?: string }) {
  return <section className="journey-card"><h2>{title}</h2>{detail ? <p>{detail}</p> : null}</section>;
}
