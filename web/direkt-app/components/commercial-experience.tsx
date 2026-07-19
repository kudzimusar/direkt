"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProviderStateResponse } from "@/lib/contracts/provider";

type Product = {
  productId: string;
  productKey: string;
  name: string;
  description: string;
  status: "active" | "retired";
  policyVersion: string;
  prices: Array<{
    priceId: string;
    priceKey: string;
    currency: string;
    amountMinor: number;
    billingInterval: "monthly" | "annual" | "one_time";
    intervalCount: number;
    status: "active" | "retired";
  }>;
  entitlements: Array<{
    entitlementKey: string;
    displayName: string;
    description: string;
    limitValue: number | null;
    limitUnit: string | null;
    status: "active" | "retired";
  }>;
  verificationIncluded: false;
  publicationIncluded: false;
  rankingIncluded: false;
  synthetic: true;
};

type Subscription = {
  subscriptionId: string;
  productKey: string;
  productName: string;
  priceKey: string;
  currency: string;
  amountMinor: number;
  billingInterval: "monthly" | "annual" | "one_time";
  status: "pending" | "active" | "grace" | "past_due" | "cancelled" | "expired";
  revision: number;
  cancelAtPeriodEnd: boolean;
  policyVersion: string;
  entitlements: Array<{ entitlementKey: string; displayName: string; status: string; verificationEffect: false; publicationEffect: false; rankingEffect: false }>;
};

type Invoice = {
  invoiceId: string;
  subscriptionId: string | null;
  invoiceNumber: string;
  status: "open" | "paid" | "void" | "uncollectible";
  revision: number;
  currency: string;
  totalMinor: number;
  issuedAt: string;
  dueAt: string;
};

type PaymentIntent = {
  paymentIntentId: string;
  invoiceId: string;
  status: "pending" | "requires_action" | "processing" | "succeeded" | "failed" | "cancelled" | "expired" | "reversed";
  revision: number;
  currency: string;
  amountMinor: number;
  expiresAt: string;
  action: { mode: "synthetic" | "disabled"; state: "requires_action" | "unavailable"; instruction: string; productionMoneyMovement: false; credentialRequested: false };
  paymentCredentialIncluded: false;
  trustOrRankingMutation: false;
  synthetic: true;
};

type Receipt = {
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  totalMinor: number;
  paidAt: string;
  paymentIntentId: string;
  paymentCredentialIncluded: false;
  trustOrRankingMutation: false;
  synthetic: true;
};

export function CommercialExperience() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [state, setState] = useState<ProviderStateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const bootstrap = await fetch("/api/auth/bootstrap", { cache: "no-store" });
    if (!bootstrap.ok) throw new Error("Unable to initialize secure commercial state.");
    const bootstrapBody = (await bootstrap.json()) as { csrfToken: string; hasSession: boolean };
    setCsrfToken(bootstrapBody.csrfToken);
    if (!bootstrapBody.hasSession) return setState(null);
    const response = await fetch("/api/provider/state", { cache: "no-store" });
    if (!response.ok) return setState(null);
    setState((await response.json()) as ProviderStateResponse);
  }, []);

  useEffect(() => { void load().catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load commercial state.")); }, [load]);

  const products = useMemo(() => (state?.commercial.products ?? []) as unknown as Product[], [state]);
  const subscriptions = useMemo(() => (state?.commercial.subscriptions ?? []) as unknown as Subscription[], [state]);
  const invoices = useMemo(() => (state?.commercial.invoices ?? []) as unknown as Invoice[], [state]);
  const paymentIntents = useMemo(() => (state?.commercial.paymentIntents ?? []) as unknown as PaymentIntent[], [state]);
  const receipts = useMemo(() => (state?.commercial.receipts ?? []) as unknown as Receipt[], [state]);

  const mutate = useCallback(async (payload: Record<string, unknown>, success: string) => {
    if (!csrfToken) throw new Error("Secure browser state is not ready.");
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/provider/action", {
        method: "POST",
        headers: { "content-type": "application/json", "x-direkt-csrf": csrfToken },
        cache: "no-store",
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string; title?: string };
      if (!response.ok) throw new Error(body.message || body.title || `Commercial action failed (${response.status}).`);
      setMessage(success);
      await load();
    } finally {
      setBusy(false);
    }
  }, [csrfToken, load]);

  if (!state) return null;

  return <section className="commercial-experience" aria-labelledby="commercial-title">
    {message ? <p className="journey-message" role="status">{message}</p> : null}
    {error ? <p className="provider-error" role="alert">{error}</p> : null}
    <article className="journey-card wide-card">
      <p className="eyebrow">W6 commercial parity</p>
      <h2 id="commercial-title">Products, subscriptions and synthetic payment state</h2>
      <p className="privacy-note">Mode: <strong>{state.commercial.paymentProviderMode}</strong>. Commercial state never grants verification, publication or ranking. Production money movement and payment credentials remain unavailable.</p>
      <div className="commercial-product-grid">
        {products.length === 0 ? <p>No active commercial products are currently available.</p> : products.map((product) => <article className="nested-panel" key={product.productId}>
          <div className="card-topline"><span className="status-chip">{product.status}</span><span>{product.synthetic ? "Synthetic catalogue" : ""}</span></div>
          <h3>{product.name}</h3><p>{product.description}</p>
          <ul>{product.entitlements.map((entitlement) => <li key={entitlement.entitlementKey}><strong>{entitlement.displayName}</strong> — {entitlement.description}{entitlement.limitValue === null ? "" : ` (${entitlement.limitValue} ${entitlement.limitUnit || "units"})`}</li>)}</ul>
          {product.prices.filter((price) => price.status === "active").map((price) => <div className="commercial-price-row" key={price.priceId}><span>{formatMoney(price.amountMinor, price.currency)} · {price.billingInterval}</span><button disabled={busy || product.status !== "active"} onClick={() => void mutate({ action: "create-subscription", productKey: product.productKey, priceKey: price.priceKey, idempotencyKey: `web-commercial-${crypto.randomUUID()}` }, "Retry-safe provider subscription created.").catch((cause) => setError(cause instanceof Error ? cause.message : "Subscription failed."))}>Start synthetic subscription</button></div>)}
          <small>Verification included: no · publication included: no · ranking included: no</small>
        </article>)}
      </div>
    </article>

    <article className="journey-card wide-card">
      <h2>Subscriptions and entitlements</h2>
      {subscriptions.length === 0 ? <p>No provider subscriptions yet.</p> : <div className="provider-list">{subscriptions.map((subscription) => <div className="provider-list-row" key={subscription.subscriptionId}><div><strong>{subscription.productName}</strong><small>{subscription.status} · revision {subscription.revision} · {formatMoney(subscription.amountMinor, subscription.currency)} / {subscription.billingInterval}</small><ul>{subscription.entitlements.map((entitlement) => <li key={entitlement.entitlementKey}>{entitlement.displayName}: {entitlement.status}</li>)}</ul></div><div className="provider-row-actions"><button disabled={busy || ["cancelled", "expired"].includes(subscription.status)} onClick={() => void mutate({ action: "issue-invoice", subscriptionId: subscription.subscriptionId }, "Immutable subscription invoice issued or returned.").catch((cause) => setError(cause instanceof Error ? cause.message : "Invoice failed."))}>Issue invoice</button><button className="secondary-button" disabled={busy || ["cancelled", "expired"].includes(subscription.status)} onClick={() => void mutate({ action: "cancel-subscription", subscriptionId: subscription.subscriptionId, expectedRevision: subscription.revision, reason: "Provider cancelled this synthetic subscription from DIREKT Web" }, "Subscription cancellation recorded with revision control.").catch((cause) => setError(cause instanceof Error ? cause.message : "Cancellation failed."))}>Cancel subscription</button></div></div>)}</div>}
    </article>

    <article className="journey-card wide-card">
      <h2>Invoices</h2>
      {invoices.length === 0 ? <p>No invoices yet.</p> : <div className="provider-list">{invoices.map((invoice) => <div className="provider-list-row" key={invoice.invoiceId}><div><strong>{invoice.invoiceNumber}</strong><small>{invoice.status} · {formatMoney(invoice.totalMinor, invoice.currency)} · due {new Date(invoice.dueAt).toLocaleString()}</small></div><button disabled={busy || invoice.status !== "open" || state.commercial.paymentProviderMode !== "synthetic"} onClick={() => void mutate({ action: "create-payment-intent", invoiceId: invoice.invoiceId, idempotencyKey: `web-payment-${crypto.randomUUID()}` }, "Synthetic payment intent created. No real money movement occurred.").catch((cause) => setError(cause instanceof Error ? cause.message : "Payment intent failed."))}>Create synthetic payment intent</button></div>)}</div>}
    </article>

    <article className="journey-card wide-card">
      <h2>Payment intents</h2>
      {paymentIntents.length === 0 ? <p>No payment intents yet.</p> : <div className="provider-list">{paymentIntents.map((intent) => <div className="provider-list-row" key={intent.paymentIntentId}><div><strong>{formatMoney(intent.amountMinor, intent.currency)}</strong><small>{intent.status} · revision {intent.revision} · mode {intent.action.mode}</small><p>{intent.action.instruction}</p><small>Production money movement: no · credential requested: no</small></div><button className="secondary-button" disabled={busy || ["succeeded", "failed", "cancelled", "expired", "reversed"].includes(intent.status)} onClick={() => void mutate({ action: "cancel-payment-intent", paymentIntentId: intent.paymentIntentId, expectedRevision: intent.revision }, "Synthetic payment intent cancelled with revision control.").catch((cause) => setError(cause instanceof Error ? cause.message : "Payment cancellation failed."))}>Cancel intent</button></div>)}</div>}
    </article>

    <article className="journey-card wide-card">
      <h2>Receipts</h2>
      {receipts.length === 0 ? <p>No synthetic receipts yet.</p> : <div className="provider-list">{receipts.map((receipt) => <div className="provider-list-row" key={`${receipt.invoiceId}-${receipt.paymentIntentId}`}><div><strong>{receipt.invoiceNumber}</strong><small>{formatMoney(receipt.totalMinor, receipt.currency)} · paid {new Date(receipt.paidAt).toLocaleString()}</small></div><span className="status-chip">Synthetic receipt</span></div>)}</div>}
    </article>
  </section>;
}

function formatMoney(amountMinor: number, currency: string) {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amountMinor / 100); }
  catch { return `${currency} ${(amountMinor / 100).toFixed(2)}`; }
}
