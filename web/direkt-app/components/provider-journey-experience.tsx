"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ProviderAiAssistPanel } from "@/components/provider-ai-assist-panel";
import { DirektIcon } from "@/components/ui/direkt-icon";
import type { PublicCategory } from "@/lib/contracts/discovery";
import type {
  ProviderEnquiry,
  ProviderReview,
  ProviderStateResponse,
  ProviderUploadGrant,
  ProviderUploadIntent,
} from "@/lib/contracts/provider";
import type { DirektDestination } from "@/lib/navigation";

type MutationResult = Record<string, unknown>;
type Mutate = (
  payload: Record<string, unknown>,
  success?: string,
) => Promise<MutationResult>;

export function ProviderJourneyExperience({
  destination,
}: {
  destination: DirektDestination;
}) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [state, setState] = useState<ProviderStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bootstrapResponse = await fetch("/api/auth/bootstrap", {
        cache: "no-store",
      });
      if (!bootstrapResponse.ok)
        throw new Error("Unable to initialize secure browser state.");
      const bootstrap = (await bootstrapResponse.json()) as {
        csrfToken: string;
        hasSession: boolean;
      };
      setCsrfToken(bootstrap.csrfToken);
      if (!bootstrap.hasSession) {
        setState(null);
        return;
      }
      const response = await fetch("/api/provider/state", {
        cache: "no-store",
      });
      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 404
      ) {
        setState(null);
        return;
      }
      if (!response.ok)
        throw new Error("Unable to load your provider workspace.");
      setState((await response.json()) as ProviderStateResponse);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load provider workspace.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = useCallback<Mutate>(
    async (payload, success) => {
      if (!csrfToken) throw new Error("Secure browser state is not ready.");
      setError(null);
      const response = await fetch("/api/provider/action", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-direkt-csrf": csrfToken,
        },
        cache: "no-store",
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      > & { message?: string; title?: string };
      if (!response.ok)
        throw new Error(
          body.message ||
            body.title ||
            `DIREKT request failed (${response.status}).`,
        );
      if (success) setMessage(success);
      return body;
    },
    [csrfToken],
  );

  const mutateAndReload = useCallback(
    async (payload: Record<string, unknown>, success: string) => {
      try {
        await mutate(payload, success);
        await load();
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Provider action failed.",
        );
      }
    },
    [load, mutate],
  );

  if (loading)
    return <ProviderNotice title="Loading your business workspace…" />;
  if (!state) {
    // Provider mode is granted only by backend authority; this source marker is retained for the W5 regression contract.
    return (
      <ProviderNotice
        title="Provider access is not available"
        detail="Sign in with an account that is currently authorized to manage a provider. Provider access cannot be selected or created from this browser screen."
      />
    );
  }

  return (
    <section
      className="provider-stack provider-world-workspace"
      aria-label="Provider workspace"
    >
      {message ? (
        <p className="journey-message" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="provider-error" role="alert">
          {error}
        </p>
      ) : null}
      {destination === "discover" ? (
        <ProviderOverview
          state={state}
          mutate={mutateAndReload}
          csrfToken={csrfToken}
        />
      ) : null}
      {destination === "saved" ? (
        <ProviderEvidence
          state={state}
          mutate={mutate}
          reload={load}
          setMessage={setMessage}
          setError={setError}
        />
      ) : null}
      {destination === "enquiries" ? (
        <ProviderEnquiries state={state} mutate={mutateAndReload} />
      ) : null}
      {destination === "account" ? <ProviderCommercial state={state} /> : null}
    </section>
  );
}

function ProviderOverview({
  state,
  mutate,
  csrfToken,
}: {
  state: ProviderStateResponse;
  mutate: (payload: Record<string, unknown>, success: string) => Promise<void>;
  csrfToken: string | null;
}) {
  const workspace = state.workspace;
  const [categories, setCategories] = useState<PublicCategory[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/discovery/categories", { cache: "no-store" })
      .then(async (response) =>
        response.ok ? ((await response.json()) as PublicCategory[]) : [],
      )
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedKeys = new Set(
    workspace.categories.map((item) => item.categoryKey),
  );
  const addableCategories = categories.filter(
    (item) => !selectedKeys.has(item.key),
  );
  const priorityTasks = [...workspace.tasks].sort(
    (a, b) => a.priority - b.priority,
  );

  return (
    <div className="provider-grid provider-world-grid">
      <article className="journey-card provider-readiness provider-command-card wide-card">
        <div className="provider-command-heading">
          <div>
            <p className="eyebrow">Business overview</p>
            <h2>{workspace.provider.displayName}</h2>
            <p className="provider-command-meta">
              <DirektIcon name="location" />
              {workspace.provider.localitySummary || "Add your locality"}
              <span>·</span>
              {humanize(workspace.provider.operatingModel)}
            </p>
          </div>
          <span
            className={`business-status-pill state-${workspace.provider.status}`}
          >
            {humanize(workspace.provider.status)}
          </span>
        </div>
        <div className="provider-readiness-layout">
          <div className="readiness-visual">
            <div className="readiness-number">
              <strong>{workspace.readiness.completionPercent}%</strong>
              <span>profile readiness</span>
            </div>
            <div
              className="readiness-meter"
              aria-label={`Profile readiness ${workspace.readiness.completionPercent}%`}
            >
              <span
                style={{
                  width: `${Math.max(0, Math.min(100, workspace.readiness.completionPercent))}%`,
                }}
              />
            </div>
          </div>
          <div className="provider-stat-grid">
            <div>
              <strong>{workspace.categories.length}</strong>
              <span>services</span>
            </div>
            <div>
              <strong>{workspace.readiness.currentClaims}</strong>
              <span>current checks</span>
            </div>
            <div>
              <strong>{workspace.readiness.openCases}</strong>
              <span>open reviews</span>
            </div>
            <div>
              <strong>{workspace.readiness.correctionRequired}</strong>
              <span>need action</span>
            </div>
          </div>
        </div>
        <div className="provider-publication-note">
          <DirektIcon name="shield" />
          <div>
            <strong>
              {workspace.readiness.publicationEligibleCategories > 0
                ? "Some services can currently be published"
                : "Publication requirements still need attention"}
            </strong>
            <p>
              Profile completeness is not a trust score. Each service becomes
              eligible only when its required checks and publication rules are
              satisfied.
            </p>
          </div>
        </div>
      </article>

      <article className="journey-card provider-action-card">
        <div className="card-icon-heading">
          <span>
            <DirektIcon name="alert" />
          </span>
          <div>
            <p className="eyebrow">Next actions</p>
            <h2>What needs attention</h2>
          </div>
        </div>
        {priorityTasks.length === 0 ? (
          <div className="provider-empty-positive">
            <DirektIcon name="check" />
            <p>No readiness tasks are currently outstanding.</p>
          </div>
        ) : (
          <ul className="provider-task-list provider-task-list-polished">
            {priorityTasks.slice(0, 5).map((task) => (
              <li key={task.key}>
                <span className={`task-state ${task.state}`}>
                  {humanize(task.state)}
                </span>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      <ProviderAiAssistPanel csrfToken={csrfToken} />

      <article className="journey-card provider-action-card">
        <div className="card-icon-heading">
          <span>
            <DirektIcon name="briefcase" />
          </span>
          <div>
            <p className="eyebrow">Business profile</p>
            <h2>How customers see you</h2>
          </div>
        </div>
        <form
          className="mini-form provider-friendly-form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void mutate(
              {
                action: "update-profile",
                displayName: String(data.get("displayName") || ""),
                operatingModel: String(data.get("operatingModel") || ""),
                localitySummary: String(data.get("localitySummary") || ""),
                serviceAreaSummary: String(
                  data.get("serviceAreaSummary") || "",
                ),
              },
              "Business profile updated. Trust and publication decisions were not changed.",
            );
          }}
        >
          <label>
            Business or professional name
            <input
              name="displayName"
              defaultValue={workspace.provider.displayName}
              minLength={2}
              maxLength={160}
              required
            />
          </label>
          <label>
            How you provide services
            <select
              name="operatingModel"
              defaultValue={workspace.provider.operatingModel}
            >
              <option value="fixed_premises">
                Customers visit my premises
              </option>
              <option value="mobile">I travel to customers</option>
              <option value="hybrid">Both premises and mobile service</option>
            </select>
          </label>
          <label>
            Main locality
            <input
              name="localitySummary"
              defaultValue={workspace.provider.localitySummary || ""}
              minLength={2}
              maxLength={160}
              placeholder="e.g. Kabulonga, Lusaka"
            />
          </label>
          <label>
            Where you serve customers
            <input
              name="serviceAreaSummary"
              defaultValue={workspace.provider.serviceAreaSummary}
              minLength={2}
              maxLength={240}
              placeholder="e.g. Lusaka central and nearby neighbourhoods"
              required
            />
          </label>
          <button type="submit">Save business profile</button>
        </form>
      </article>

      <article className="journey-card wide-card provider-services-card">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Services & availability</p>
            <h2>What customers can ask you for</h2>
            <p>
              Add services from DIREKT&apos;s active catalogue, then keep
              availability current for each service.
            </p>
          </div>
        </div>
        <form
          className="provider-inline-form provider-service-add"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void mutate(
              {
                action: "select-service",
                categoryKey: String(data.get("categoryKey") || ""),
              },
              "Service added against the current requirements.",
            );
          }}
        >
          <label>
            Add a service
            <select name="categoryKey" required defaultValue="">
              <option value="" disabled>
                Choose a service
              </option>
              {addableCategories.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={addableCategories.length === 0}>
            Add service
          </button>
        </form>
        <div className="provider-list provider-service-list">
          {workspace.categories.length === 0 ? (
            <div className="provider-empty-state">
              <DirektIcon name="briefcase" />
              <div>
                <strong>No services selected yet</strong>
                <p>
                  Add the work you provide so DIREKT can show the correct
                  requirements and discovery eligibility.
                </p>
              </div>
            </div>
          ) : (
            workspace.categories.map((category) => {
              const availability = workspace.availability.find(
                (item) => item.categoryKey === category.categoryKey,
              );
              return (
                <div
                  className="provider-list-row provider-service-row"
                  key={category.categoryKey}
                >
                  <div className="provider-service-summary">
                    <span className="category-market-icon">
                      <DirektIcon name="briefcase" />
                    </span>
                    <div>
                      <strong>{category.categoryName}</strong>
                      <small>
                        {category.evidenceSubmitted}/
                        {category.requiredRequirements} evidence requirements
                        submitted · {category.currentClaims} current checks
                      </small>
                      <span
                        className={
                          category.publicationEligible
                            ? "service-eligibility eligible"
                            : "service-eligibility attention"
                        }
                      >
                        {category.publicationEligible
                          ? "Eligible for discovery"
                          : "Requirements still pending"}
                      </span>
                    </div>
                  </div>
                  <form
                    className="provider-row-actions provider-availability-controls"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const data = new FormData(event.currentTarget);
                      const stateValue = String(data.get("state") || "unknown");
                      void mutate(
                        {
                          action: "update-availability",
                          categoryKey: category.categoryKey,
                          state: stateValue,
                          nextAvailableAt:
                            stateValue === "limited"
                              ? String(data.get("nextAvailableAt") || "")
                              : "",
                        },
                        "Availability updated independently of trust state.",
                      );
                    }}
                  >
                    <select
                      name="state"
                      defaultValue={availability?.state || "unknown"}
                      aria-label={`Availability for ${category.categoryName}`}
                    >
                      <option value="available">Available</option>
                      <option value="limited">Limited availability</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="unknown">Not stated</option>
                    </select>
                    <input
                      name="nextAvailableAt"
                      type="datetime-local"
                      aria-label={`Next available date for ${category.categoryName}`}
                    />
                    <button type="submit">Save</button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        void mutate(
                          {
                            action: "remove-service",
                            categoryKey: category.categoryKey,
                            reason:
                              "Provider removed this service from DIREKT Web workspace",
                          },
                          "Service removed; historical evidence and cases were preserved.",
                        )
                      }
                    >
                      Remove
                    </button>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </article>

      <article className="journey-card wide-card provider-location-card">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Location & service area</p>
            <h2>Control what customers can see</h2>
            <p>
              Keep a useful public locality and service-area description without
              publishing your private base.
            </p>
          </div>
        </div>
        <div className="location-boundary-grid">
          <div className="location-boundary-item">
            <DirektIcon name="shield" />
            <div>
              <strong>Private base</strong>
              <p>
                {workspace.location.privateBaseStored
                  ? "Stored privately for approved operational purposes."
                  : "Not stored."}{" "}
                Never shown as a public customer pin.
              </p>
            </div>
          </div>
          <div className="location-boundary-item">
            <DirektIcon name="location" />
            <div>
              <strong>Public premises</strong>
              <p>
                {workspace.location.publicPremisesConfigured &&
                workspace.location.publicPremisesConsent
                  ? "A consented public premises point is configured."
                  : "No consented public premises point is currently published."}
              </p>
            </div>
          </div>
          <div className="location-boundary-item">
            <DirektIcon name="map" />
            <div>
              <strong>Service area</strong>
              <p>
                {workspace.location.serviceAreaConfigured
                  ? workspace.provider.serviceAreaSummary
                  : "Add a service-area description so customers understand where you work."}
              </p>
            </div>
          </div>
        </div>
        <p className="privacy-note">
          Private base coordinates remain write-only and are never returned to
          this workspace. Exact map editing will become the primary control only
          after the approved Maps runtime is active.
        </p>
        <details className="advanced-location-details">
          <summary>Advanced location setup</summary>
          <p>
            Use this technical fallback only when you already know the required
            coordinates and service-area polygon. This keeps the existing
            location capability available until map-based editing is activated.
          </p>
          <form
            className="mini-form"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const numberOrUndefined = (name: string) => {
                const value = String(data.get(name) || "");
                return value ? Number(value) : undefined;
              };
              void mutate(
                {
                  action: "update-location",
                  privateBaseLatitude: numberOrUndefined("privateBaseLatitude"),
                  privateBaseLongitude: numberOrUndefined(
                    "privateBaseLongitude",
                  ),
                  publicPremisesLatitude: numberOrUndefined(
                    "publicPremisesLatitude",
                  ),
                  publicPremisesLongitude: numberOrUndefined(
                    "publicPremisesLongitude",
                  ),
                  publicPremisesConsent:
                    data.get("publicPremisesConsent") === "on",
                  publicLocality: String(data.get("publicLocality") || ""),
                  serviceAreaWkt: String(data.get("serviceAreaWkt") || ""),
                },
                "Location boundaries updated. Private and public precision remain separate.",
              );
            }}
          >
            <div className="field-row">
              <label>
                Private base latitude
                <input
                  name="privateBaseLatitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                />
              </label>
              <label>
                Private base longitude
                <input
                  name="privateBaseLongitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                />
              </label>
            </div>
            <div className="field-row">
              <label>
                Public premises latitude
                <input
                  name="publicPremisesLatitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                />
              </label>
              <label>
                Public premises longitude
                <input
                  name="publicPremisesLongitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                />
              </label>
            </div>
            <label className="checkbox-label">
              <input
                name="publicPremisesConsent"
                type="checkbox"
                defaultChecked={workspace.location.publicPremisesConsent}
              />{" "}
              I explicitly consent to publishing this business premises point.
            </label>
            <label>
              Public locality
              <input
                name="publicLocality"
                defaultValue={
                  workspace.location.publicLocality ||
                  workspace.provider.localitySummary ||
                  ""
                }
                minLength={2}
                maxLength={160}
                required
              />
            </label>
            <label>
              Service-area polygon (advanced WKT)
              <textarea
                name="serviceAreaWkt"
                placeholder="POLYGON((28.25 -15.50, 28.45 -15.50, 28.45 -15.30, 28.25 -15.30, 28.25 -15.50))"
                required
              />
            </label>
            <button type="submit">Save advanced location setup</button>
          </form>
        </details>
      </article>
    </div>
  );
}

function ProviderEvidence({
  state,
  mutate,
  reload,
  setMessage,
  setError,
}: {
  state: ProviderStateResponse;
  mutate: Mutate;
  reload: () => Promise<void>;
  setMessage: (value: string | null) => void;
  setError: (value: string | null) => void;
}) {
  const cases = useMemo(
    () =>
      Array.from(
        new Map(state.timeline.map((event) => [event.caseId, event])).values(),
      ),
    [state.timeline],
  );

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0)
      throw new Error("Choose an evidence file.");
    const caseId = String(data.get("caseId") || "");
    const matching = state.timeline.find((item) => item.caseId === caseId);
    if (!matching)
      throw new Error(
        "Choose a verification case from the current provider timeline.",
      );
    const result = await mutate({
      action: "create-upload-intent",
      caseId,
      clientIntentKey: `web-${crypto.randomUUID()}`,
      evidenceClass: String(
        data.get("evidenceClass") || matching.evidenceClass || "identity",
      ),
      documentType: String(data.get("documentType") || "supporting_document"),
      contentType: file.type,
      maxBytes: Math.max(1024, file.size),
      consentConfirmed: data.get("consentConfirmed") === "on",
    });
    if (!("upload" in result)) {
      setMessage(
        "The existing upload was found. Refresh or retry it if action is still required.",
      );
      await reload();
      return;
    }
    await uploadAndConfirm(
      result as unknown as ProviderUploadGrant,
      file,
      mutate,
    );
    setMessage(
      "Evidence submitted through the recoverable private upload flow.",
    );
    form.reset();
    await reload();
  }

  return (
    <div className="provider-grid provider-evidence-world-grid">
      <article className="journey-card wide-card provider-evidence-timeline-card">
        <div className="card-icon-heading">
          <span>
            <DirektIcon name="shield" />
          </span>
          <div>
            <p className="eyebrow">Private verification</p>
            <h2>Your check timeline</h2>
            <p>
              Follow requirements, review progress, corrections and current
              outcomes without exposing reviewer-private information.
            </p>
          </div>
        </div>
        <p className="privacy-note">
          Reviewer identities, private rationale and storage references are
          excluded from this view.
        </p>
        {state.timeline.length === 0 ? (
          <div className="provider-empty-state">
            <DirektIcon name="shield" />
            <div>
              <strong>No verification cases yet</strong>
              <p>
                When a service requires a check, its timeline and next action
                will appear here.
              </p>
            </div>
          </div>
        ) : (
          <ol className="provider-timeline provider-timeline-polished">
            {state.timeline.map((event) => (
              <li key={event.eventId}>
                <span className="timeline-icon">
                  <DirektIcon
                    name={
                      event.caseStatus.includes("action") ? "alert" : "shield"
                    }
                  />
                </span>
                <div>
                  <div className="timeline-title-row">
                    <strong>{event.requirementLabel}</strong>
                    <span className={`task-state ${event.caseStatus}`}>
                      {humanize(event.caseStatus)}
                    </span>
                  </div>
                  <p>{event.message}</p>
                  {event.limitation ? (
                    <small className="timeline-limitation">
                      {event.limitation}
                    </small>
                  ) : null}
                  <small>
                    {event.categoryName} ·{" "}
                    {new Date(event.occurredAt).toLocaleString()}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        )}
      </article>

      <article className="journey-card wide-card provider-upload-card">
        <div className="card-icon-heading">
          <span>
            <DirektIcon name="briefcase" />
          </span>
          <div>
            <p className="eyebrow">Submit evidence</p>
            <h2>Add a private document</h2>
            <p>
              Choose the requirement first. Your file is uploaded through the
              private recoverable evidence flow and is not a public profile
              image.
            </p>
          </div>
        </div>
        {cases.length === 0 ? (
          <div className="provider-empty-state">
            <DirektIcon name="alert" />
            <div>
              <strong>No open requirement available</strong>
              <p>
                A verification case must exist before evidence can be submitted.
              </p>
            </div>
          </div>
        ) : (
          <form
            className="mini-form provider-friendly-form"
            onSubmit={(event) =>
              void submitUpload(event).catch((cause) =>
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Evidence upload failed.",
                ),
              )
            }
          >
            <label>
              Requirement
              <select name="caseId" required>
                {cases.map((item) => (
                  <option key={item.caseId} value={item.caseId}>
                    {item.categoryName} · {item.requirementLabel} ·{" "}
                    {humanize(item.caseStatus)}
                  </option>
                ))}
              </select>
            </label>
            <div className="field-row">
              <label>
                Evidence type
                <select name="evidenceClass" defaultValue="identity">
                  <option value="contact">Contact</option>
                  <option value="identity">Identity</option>
                  <option value="business">Business</option>
                  <option value="qualification">Qualification</option>
                  <option value="licence">Licence</option>
                  <option value="experience">Experience</option>
                  <option value="location">Location</option>
                  <option value="premises">Premises</option>
                  <option value="field">Field evidence</option>
                </select>
              </label>
              <label>
                Document label
                <input
                  name="documentType"
                  defaultValue="supporting_document"
                  pattern="[a-z][a-z0-9_]{2,63}"
                  required
                />
              </label>
            </div>
            <label>
              Choose file
              <input
                name="file"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                required
              />
            </label>
            <label className="checkbox-label">
              <input name="consentConfirmed" type="checkbox" required /> I
              confirm this evidence may be used for the selected verification
              requirement.
            </label>
            <button type="submit">Submit private evidence</button>
          </form>
        )}
      </article>

      <article className="journey-card wide-card">
        <div className="card-icon-heading">
          <span>
            <DirektIcon name="clock" />
          </span>
          <div>
            <p className="eyebrow">Upload recovery</p>
            <h2>Interrupted or pending uploads</h2>
          </div>
        </div>
        {state.uploads.length === 0 ? (
          <p>No upload recovery is needed right now.</p>
        ) : (
          <div className="provider-list">
            {state.uploads.map((upload) => (
              <UploadRecovery
                key={upload.uploadIntentId}
                upload={upload}
                mutate={mutate}
                reload={reload}
                setMessage={setMessage}
                setError={setError}
              />
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

function UploadRecovery({
  upload,
  mutate,
  reload,
  setMessage,
  setError,
}: {
  upload: ProviderUploadIntent;
  mutate: Mutate;
  reload: () => Promise<void>;
  setMessage: (value: string) => void;
  setError: (value: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  async function retry() {
    if (!file) throw new Error("Choose the replacement file before retrying.");
    const result = await mutate({
      action: "retry-upload",
      uploadIntentId: upload.uploadIntentId,
    });
    if (!("upload" in result))
      throw new Error("Retry did not return a private upload grant.");
    await uploadAndConfirm(
      result as unknown as ProviderUploadGrant,
      file,
      mutate,
    );
    setMessage("Interrupted evidence upload retried and confirmed.");
    setFile(null);
    await reload();
  }
  return (
    <div className="provider-list-row upload-row">
      <div>
        <strong>{upload.requirementLabel}</strong>
        <small>
          {upload.categoryName} · {humanize(upload.state)} · attempt{" "}
          {upload.attemptCount}
          {upload.lastErrorCode ? ` · ${upload.lastErrorCode}` : ""}
        </small>
      </div>
      <div className="provider-row-actions">
        {upload.safeToRetry ? (
          <>
            <input
              aria-label={`Retry file for ${upload.requirementLabel}`}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setFile(event.currentTarget.files?.[0] || null)
              }
            />
            <button
              type="button"
              onClick={() =>
                void retry().catch((cause) =>
                  setError(
                    cause instanceof Error ? cause.message : "Retry failed.",
                  ),
                )
              }
            >
              Retry
            </button>
          </>
        ) : null}
        {!["submitted", "cancelled"].includes(upload.state) ? (
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              void mutate(
                {
                  action: "cancel-upload",
                  uploadIntentId: upload.uploadIntentId,
                  reason:
                    "Provider cancelled this upload intent from DIREKT Web",
                },
                "Upload cancelled.",
              )
                .then(reload)
                .catch((cause) =>
                  setError(
                    cause instanceof Error ? cause.message : "Cancel failed.",
                  ),
                )
            }
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}

async function uploadAndConfirm(
  grant: ProviderUploadGrant,
  file: File,
  mutate: Mutate,
) {
  try {
    const uploadResponse = await fetch(grant.upload.uploadUrl, {
      method: "PUT",
      headers: grant.upload.requiredHeaders,
      body: file,
      cache: "no-store",
    });
    if (!uploadResponse.ok)
      throw new Error(`Private upload failed (${uploadResponse.status}).`);
    const digest = await crypto.subtle.digest(
      "SHA-256",
      await file.arrayBuffer(),
    );
    const sha256 = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    await mutate({
      action: "confirm-upload",
      uploadIntentId: grant.uploadIntentId,
      sha256,
      sizeBytes: file.size,
      retentionClass: "standard",
    });
  } catch (cause) {
    await mutate({
      action: "interrupt-upload",
      uploadIntentId: grant.uploadIntentId,
      errorCode: "WEB_UPLOAD_INTERRUPTED",
    }).catch(() => undefined);
    throw cause;
  }
}

function ProviderEnquiries({
  state,
  mutate,
}: {
  state: ProviderStateResponse;
  mutate: (payload: Record<string, unknown>, success: string) => Promise<void>;
}) {
  return (
    <div className="provider-grid provider-enquiries-world-grid">
      <article className="journey-card wide-card">
        <div className="card-icon-heading">
          <span>
            <DirektIcon name="messages" />
          </span>
          <div>
            <p className="eyebrow">Customer opportunities</p>
            <h2>Enquiries</h2>
            <p>
              Respond to structured requests and keep each interaction
              accountable. Contact details stay consent-scoped.
            </p>
          </div>
        </div>
        <p className="privacy-note">
          Provider access is resolved from your signed-in account. Full chat and
          private evidence are not included in this inbox.
        </p>
        {state.enquiries.items.length === 0 ? (
          <div className="provider-empty-state">
            <DirektIcon name="messages" />
            <div>
              <strong>No new enquiries</strong>
              <p>
                New customer requests for your eligible services will appear
                here.
              </p>
            </div>
          </div>
        ) : (
          state.enquiries.items.map((enquiry) => (
            <ProviderEnquiryCard
              key={enquiry.enquiryId}
              enquiry={enquiry}
              mutate={mutate}
            />
          ))
        )}
      </article>
      <article className="journey-card wide-card">
        <div className="card-icon-heading">
          <span>
            <DirektIcon name="sparkle" />
          </span>
          <div>
            <p className="eyebrow">Reputation</p>
            <h2>Reviews and responses</h2>
            <p>
              Respond professionally to eligible tracked reviews or use the
              appeal path when moderation needs another look.
            </p>
          </div>
        </div>
        {state.reviews.items.length === 0 ? (
          <div className="provider-empty-state">
            <DirektIcon name="sparkle" />
            <div>
              <strong>No provider-scoped reviews yet</strong>
              <p>
                Eligible review activity will appear after qualifying tracked
                interactions.
              </p>
            </div>
          </div>
        ) : (
          state.reviews.items.map((review) => (
            <ProviderReviewCard
              key={review.reviewId}
              review={review}
              mutate={mutate}
            />
          ))
        )}
      </article>
    </div>
  );
}

function ProviderEnquiryCard({
  enquiry,
  mutate,
}: {
  enquiry: ProviderEnquiry;
  mutate: (payload: Record<string, unknown>, success: string) => Promise<void>;
}) {
  const terminal = ["declined", "closed", "cancelled"].includes(enquiry.status);
  return (
    <div className="nested-panel provider-enquiry world-class-enquiry-card">
      <div className="card-topline">
        <span className="status-chip">{humanize(enquiry.status)}</span>
        <span>{new Date(enquiry.createdAt).toLocaleDateString()}</span>
      </div>
      <h3>{enquiry.categoryName}</h3>
      <p className="provider-locality-line">
        <DirektIcon name="location" />
        {enquiry.localitySummary}
      </p>
      <p>{enquiry.serviceSummary}</p>
      <small>
        {humanize(enquiry.timing)} · preferred contact:{" "}
        {humanize(enquiry.preferredChannel)}
      </small>
      {!terminal ? (
        <form
          className="provider-inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void mutate(
              {
                action: "transition-enquiry",
                enquiryId: enquiry.enquiryId,
                expectedRevision: enquiry.revision,
                targetStatus: String(
                  data.get("targetStatus") || "acknowledged",
                ),
                reason: String(data.get("reason") || ""),
              },
              "Enquiry updated.",
            );
          }}
        >
          <label>
            Response
            <select name="targetStatus" defaultValue="acknowledged">
              <option value="acknowledged">Acknowledge</option>
              <option value="needs_information">
                Ask for more information
              </option>
              <option value="accepted">Accept request</option>
              <option value="declined">Decline</option>
              <option value="closed">Close</option>
            </select>
          </label>
          <label>
            Short note
            <input
              name="reason"
              minLength={8}
              maxLength={500}
              defaultValue="Provider response from DIREKT Web"
              required
            />
          </label>
          <button type="submit">Update enquiry</button>
        </form>
      ) : null}
      <details>
        <summary>View history</summary>
        <ol>
          {enquiry.events.map((event) => (
            <li key={event.eventId}>
              {humanize(event.toStatus)} — {event.reason} ·{" "}
              {new Date(event.occurredAt).toLocaleString()}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

function ProviderReviewCard({
  review,
  mutate,
}: {
  review: ProviderReview;
  mutate: (payload: Record<string, unknown>, success: string) => Promise<void>;
}) {
  return (
    <div className="nested-panel provider-review world-class-review-card">
      <div className="card-topline">
        <span className="status-chip">{humanize(review.moderationStatus)}</span>
        <span aria-label={`${review.rating} out of 5`}>{review.rating}/5</span>
      </div>
      <h3>{review.title}</h3>
      <p>{review.body}</p>
      {review.providerResponse ? (
        <blockquote>
          <strong>Your response</strong>
          <p>{review.providerResponse.body}</p>
        </blockquote>
      ) : (
        <form
          className="mini-form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void mutate(
              {
                action: "respond-review",
                reviewId: review.reviewId,
                body: String(data.get("body") || ""),
              },
              "Public response recorded without changing trust or ranking.",
            );
          }}
        >
          <label>
            Public response
            <textarea name="body" minLength={10} maxLength={1000} required />
          </label>
          <button type="submit">Publish response</button>
        </form>
      )}
      <details>
        <summary>Appeal this review</summary>
        <form
          className="mini-form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void mutate(
              {
                action: "appeal-review",
                reviewId: review.reviewId,
                reason: String(data.get("reason") || ""),
              },
              "Review appeal submitted for moderation.",
            );
          }}
        >
          <label>
            Why should this be reviewed again?
            <textarea name="reason" minLength={20} maxLength={1000} required />
          </label>
          <button type="submit" className="secondary-button">
            Submit appeal
          </button>
        </form>
      </details>
    </div>
  );
}

function ProviderCommercial({ state }: { state: ProviderStateResponse }) {
  const commercial = state.commercial;
  return (
    <article className="journey-card provider-commercial world-class-commercial-card">
      <div className="card-icon-heading">
        <span>
          <DirektIcon name="briefcase" />
        </span>
        <div>
          <p className="eyebrow">Business plan</p>
          <h2>Subscription and billing</h2>
          <p>
            Your commercial plan controls paid product features only. It never
            upgrades verification, publication eligibility or trust.
          </p>
        </div>
      </div>
      <div className="commercial-stats">
        <span>
          <strong>{commercial.products.length}</strong> available products
        </span>
        <span>
          <strong>{commercial.subscriptions.length}</strong> subscriptions
        </span>
        <span>
          <strong>{commercial.invoices.length}</strong> invoices
        </span>
        <span>
          <strong>{commercial.receipts.length}</strong> receipts
        </span>
      </div>
      {commercial.subscriptions.length ? (
        <details>
          <summary>View subscription details</summary>
          <pre className="safe-json">
            {JSON.stringify(commercial.subscriptions, null, 2)}
          </pre>
        </details>
      ) : (
        <p>No subscription exists for this provider.</p>
      )}
      <p className="privacy-note">
        Real money movement remains unavailable unless the separately approved
        payment runtime is active. Commercial state cannot create verification,
        publication or ranking effects.
      </p>
    </article>
  );
}

function ProviderNotice({ title, detail }: { title: string; detail?: string }) {
  return (
    <section className="journey-card provider-notice-card">
      <span className="info-card-icon">
        <DirektIcon name="briefcase" />
      </span>
      <h2>{title}</h2>
      {detail ? <p>{detail}</p> : null}
    </section>
  );
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
