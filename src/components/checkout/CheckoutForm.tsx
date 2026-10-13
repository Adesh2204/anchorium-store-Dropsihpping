"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/CartProvider";
import { Accordion } from "@/components/ui";
import { payment, product, shipping, variantImageFor } from "@/lib/config";
import { formatPaise } from "@/lib/money";
import { INDIAN_STATES, isEmail, isIndianMobile, isPincode } from "@/lib/india";

type Fields = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
};

const empty: Fields = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (p: unknown) => void) => void };
  }
}

export default function CheckoutForm() {
  const router = useRouter();
  const { lines, totals, hydrated, clear } = useCart();
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields | "form", string>>>({});
  const [method, setMethod] = useState<string>(payment.methods[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [gateway, setGateway] = useState<"unknown" | "razorpay" | "demo">("unknown");
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (hydrated && lines.length === 0 && !orderRef) router.replace("/cart");
  }, [hydrated, lines.length, orderRef, router]);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const v = e.target.value;
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (values.name.trim().length < 3) next.name = "Enter your full name.";
    if (!isEmail(values.email)) next.email = "We send the receipt here — check the address.";
    if (!isIndianMobile(values.phone)) next.phone = "A 10-digit Indian mobile number is required for delivery.";
    if (values.addressLine1.trim().length < 8) next.addressLine1 = "House / flat and street, please.";
    if (values.city.trim().length < 2) next.city = "City or town.";
    if (!values.state) next.state = "Select your state.";
    if (!isPincode(values.pincode)) next.pincode = "6-digit PIN code.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const summary = useMemo(
    () =>
      lines.map((l) => ({
        ...l,
        linePaise: product.pricing.sellPaise * l.quantity,
      })),
    [lines],
  );

  async function loadRazorpay() {
    if (window.Razorpay) return true;
    return new Promise<boolean>((resolve) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    if (lines.length === 0) {
      setBanner({ tone: "error", text: "Your cart is empty — add the lamp before checking out." });
      return;
    }
    if (!validate()) {
      setBanner({ tone: "error", text: "Some delivery details need attention — see the highlighted fields." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({ variantId: l.variantId, outletId: l.outletId, quantity: l.quantity })),
          customer: values,
          paymentMethod: method,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        orderNo?: string;
        checkoutMode?: "razorpay" | "demo";
        error?: string;
        fields?: Record<string, string>;
        razorpay?: { keyId?: string; orderId?: string } | null;
        note?: string | null;
      };

      if (!res.ok || !json.ok) {
        if (json.fields) setErrors(json.fields as Partial<Record<keyof Fields, string>>);
        setBanner({ tone: "error", text: json.error ?? "We could not create the order. Please try again." });
        setSubmitting(false);
        return;
      }

      const ref = json.orderNo!;
      setOrderRef(ref);
      setGateway(json.checkoutMode ?? "demo");
      clear();

      if (json.checkoutMode === "razorpay" && json.razorpay?.orderId) {
        const ready = await loadRazorpay();
        if (!ready || !window.Razorpay) {
          setBanner({
            tone: "info",
            text: `Order ${ref} is recorded as awaiting payment, but the Razorpay checkout script could not load.`,
          });
          setSubmitting(false);
          return;
        }
        const rzp = new window.Razorpay({
          key: json.razorpay.keyId,
          order_id: json.razorpay.orderId,
          amount: totals.totalPaise,
          currency: "INR",
          name: "Anchorium Store",
          description: `${product.name} × ${totals.itemCount}`,
          prefill: { name: values.name, email: values.email, contact: values.phone },
          notes: { orderNo: ref },
          theme: { color: "#D6A441" },
          handler: async (payload: unknown) => {
            const p = payload as { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
            const verify = await fetch(`/api/orders/${ref}/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(p),
            });
            const v = (await verify.json()) as { verified?: boolean };
            router.push(v.verified ? `/order-confirmation?ref=${ref}&paid=1` : `/order-confirmation?ref=${ref}&paid=0`);
          },
        });
        rzp.on("payment.failed", () => {
          setBanner({ tone: "error", text: "Payment failed. Your order is saved as awaiting payment." });
          setSubmitting(false);
        });
        rzp.open();
        return;
      }

      // No gateway credentials on this deployment: record + explain, never fake a payment.
      setSubmitting(false);
      router.push(`/order-confirmation?ref=${ref}&mode=demo`);
    } catch (err) {
      setBanner({
        tone: "error",
        text: err instanceof Error ? `Network problem: ${err.message}` : "Unexpected error while placing the order.",
      });
      setSubmitting(false);
    }
  }

  if (hydrated && lines.length === 0 && !orderRef) {
    return (
      <div className="grid min-h-[60vh] place-items-center py-24 text-center">
        <div>
          <h1 className="text-3xl text-charcoal">Nothing to check out yet</h1>
          <p className="mt-3 text-sm text-charcoal/60">Add AuraGlow to your cart and the ₹3,999 price follows you here.</p>
          <Link href={product.path} className="btn btn-gold mt-7">Shop the lamp</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <AnimatePresence>
          {banner && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`rounded-2xl border px-5 py-4 text-sm leading-relaxed ${
                banner.tone === "error"
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-gold/40 bg-gold/8 text-charcoal/75"
              }`}
            >
              {banner.text}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="card p-6 md:p-7">
          <h2 className="text-[1.25rem] text-charcoal">1 · Contact</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" id="name" value={values.name} onChange={set("name")} error={errors.name} autoComplete="name" required />
            <Field label="Mobile number" id="phone" value={values.phone} onChange={set("phone")} error={errors.phone} inputMode="numeric" autoComplete="tel" placeholder="10-digit number" required />
            <Field className="sm:col-span-2" label="Email" id="email" type="email" value={values.email} onChange={set("email")} error={errors.email} autoComplete="email" required />
          </div>
          <p className="mt-4 text-[0.72rem] leading-relaxed text-charcoal/45">
            Used only to send your order confirmation, tracking updates and the delivery OTP if the courier asks for one.
          </p>
        </section>

        <section className="card p-6 md:p-7">
          <h2 className="text-[1.25rem] text-charcoal">2 · Delivery address</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="House no., flat, street" id="addressLine1" value={values.addressLine1} onChange={set("addressLine1")} error={errors.addressLine1} autoComplete="address-line1" required />
            <Field className="sm:col-span-2" label="Area, landmark (optional)" id="addressLine2" value={values.addressLine2} onChange={set("addressLine2")} autoComplete="address-line2" />
            <Field label="City / town" id="city" value={values.city} onChange={set("city")} error={errors.city} autoComplete="address-level2" required />
            <label className="block">
              <span className="field-label">State / union territory</span>
              <select
                id="state"
                value={values.state}
                onChange={set("state")}
                aria-invalid={Boolean(errors.state)}
                className="field"
                required
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state ? <ErrorText>{errors.state}</ErrorText> : null}
            </label>
            <Field label="PIN code" id="pincode" value={values.pincode} onChange={set("pincode")} error={errors.pincode} inputMode="numeric" autoComplete="postal-code" required />
            <label className="block sm:col-span-2">
              <span className="field-label">Delivery note (optional)</span>
              <textarea id="notes" rows={2} value={values.notes} onChange={set("notes")} className="field resize-y" placeholder="Gate code, preferred time, floor…" />
            </label>
          </div>
        </section>

        <section className="card p-6 md:p-7">
          <h2 className="text-[1.25rem] text-charcoal">3 · Payment</h2>
          <fieldset className="mt-5">
            <legend className="sr-only">Payment method</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {payment.methods.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                    method === m.id ? "border-gold bg-gold/8 shadow-[0_0_0_3px_rgba(214,164,65,.12)]" : "border-charcoal/12 hover:border-gold/45"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="mt-1 h-4 w-4 accent-[#D6A441]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-charcoal">{m.label}</span>
                    <span className="mt-0.5 block text-[0.74rem] text-charcoal/55">{m.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 rounded-2xl border border-charcoal/10 bg-ivory-soft px-5 py-4 text-[0.8rem] leading-relaxed text-charcoal/70">
            <p className="eyebrow text-gold-deep">Integration status</p>
            <p className="mt-2">
              {payment.liveConfiguredOnServer ? (
                <>
                  Razorpay keys are present on this server, so orders open a real Razorpay checkout. Payment status is
                  verified server-side by HMAC signature before any order is called paid.
                </>
              ) : (
                <>
                  <strong className="font-semibold text-charcoal">Checkout interface is live; the payment gateway is not
                  connected.</strong> This deployment has no <code className="rounded bg-white px-1">RAZORPAY_KEY_ID</code>{" "}
                  / <code className="rounded bg-white px-1">RAZORPAY_KEY_SECRET</code>, so orders are stored as{" "}
                  <em>awaiting payment</em>. We will never show a paid confirmation without a verified signature. Add
                  the keys to <code className="rounded bg-white px-1">.env</code> to activate live payments.
                </>
              )}
            </p>
            <p className="mt-2 text-[0.74rem] text-charcoal/50">{shipping.prepaidOnlyNote}</p>
          </div>
        </section>

        <button type="submit" className="btn btn-gold w-full py-4 text-[0.72rem]" disabled={submitting}>
          {submitting ? "Placing your order…" : `Place order · ${formatPaise(totals.totalPaise)}`}
        </button>
        <p className="text-center text-[0.7rem] text-charcoal/45">
          By ordering you agree to the{" "}
          <Link href="/terms-and-conditions" className="underline hover:text-gold-deep">terms</Link> and{" "}
          <Link href="/privacy-policy" className="underline hover:text-gold-deep">privacy policy</Link>.
        </p>
      </form>

      <aside className="card p-6 lg:sticky lg:top-28">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[1.15rem] text-charcoal">Order summary</h2>
          <Link href="/cart" className="text-[0.7rem] uppercase tracking-[0.16em] text-gold-deep hover:text-gold">Edit</Link>
        </div>

        <ul className="mt-5 space-y-4">
          {summary.map((l) => (
            <li key={l.lineId} className="flex gap-3.5">
              <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-charcoal/8 bg-white">
                <Image src={variantImageFor(l.variantId)} alt="" aria-hidden fill sizes="56px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-charcoal">{product.name}</span>
                <span className="block text-[0.72rem] text-charcoal/50">{l.variantLabel} · Qty {l.quantity}</span>
              </span>
              <span className="text-sm tabular-nums text-charcoal/80">{formatPaise(l.linePaise)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2.5 border-t border-charcoal/8 pt-5 text-sm">
          <Line label={`Items (${totals.itemCount})`} value={formatPaise(totals.mrpPaise)} muted />
          <Line label={`${product.campaign.name} · ${totals.discountPercent}% off`} value={`− ${formatPaise(totals.discountPaise)}`} accent />
          <Line label="Subtotal" value={formatPaise(totals.subtotalPaise)} strong />
          <Line
            label={
              <span>
                Shipping · {shipping.tracked ? "tracked" : "standard"}
                {totals.freeShipping ? (
                  <span className="mt-0.5 block text-[0.7rem] font-medium text-emerald-700">
                    {shipping.firstOrderNote}
                  </span>
                ) : null}
              </span>
            }
            value={
              totals.freeShipping ? (
                <span className="inline-flex items-center gap-2">
                  <span className="text-charcoal/40 line-through">{formatPaise(shipping.standardPaise)}</span>
                  <span className="rounded-full bg-emerald-600/12 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-emerald-700">
                    Free
                  </span>
                </span>
              ) : (
                formatPaise(totals.shippingPaise)
              )
            }
          />
        </dl>
        <div className="mt-5 flex items-end justify-between border-t border-charcoal/8 pt-5">
          <span className="text-[0.66rem] uppercase tracking-[0.22em] text-charcoal/45">Total payable</span>
          <span className="font-display text-[1.8rem] leading-none text-charcoal tabular-nums">{formatPaise(totals.totalPaise)}</span>
        </div>

        <div className="mt-6">
          <Accordion
            items={[
              {
                title: "Standard Insured Delivery",
                content: `Standard Insured Delivery: ${shipping.estimate.minBusinessDays}–${shipping.estimate.maxBusinessDays} business days across India after dispatch. Every shipment is fully insured against transit loss or damage. ${shipping.firstOrderNote} (₹99 shipping waived). 100% Prepaid orders only (via UPI, Cards, Net Banking).`,
              },
              {
                title: "Why the price is lower",
                content: `The ${product.campaign.name} cuts ₹1,000 (${totals.discountPercent}% off) from the ₹4,999 reference price — bringing each lamp to ₹3,999 so you save ${formatPaise(totals.mrpPaise - totals.subtotalPaise)} on this order, plus free delivery on your first order.`,
              },
            ]}
          />
        </div>
      </aside>
    </div>
  );
}



function Field({
  label,
  id,
  value,
  onChange,
  error,
  type = "text",
  className = "",
  ...rest
}: {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field"
        {...rest}
      />
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : null}
    </label>
  );
}

function ErrorText({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <span id={id} className="mt-1.5 block text-[0.72rem] font-medium text-red-700">
      {children}
    </span>
  );
}

function Line({ label, value, muted, accent, strong }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean; accent?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className={muted ? "text-charcoal/45" : "text-charcoal/65"}>{label}</dt>
      <dd className={`tabular-nums ${accent ? "text-gold-deep" : strong ? "font-semibold text-charcoal" : "text-charcoal/80"}`}>{value}</dd>
    </div>
  );
}
