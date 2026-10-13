import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getOrderByRef } from "@/db";
import type { Order } from "@/db/schema";
import { formatPaise } from "@/lib/money";
import { product, shipping, variantImageFor } from "@/lib/config";
import { addBusinessDays, formatIndianDate } from "@/lib/india";

export const metadata: Metadata = {
  title: "Order confirmation · Anchorium Store",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ ref?: string; paid?: string; mode?: string }> };

export default async function OrderConfirmation({ searchParams }: Props) {
  const params = await searchParams;
  const ref = (params.ref ?? "").toUpperCase();

  let order: (Order & { items: unknown }) | null = null;
  let dbError = false;

  if (ref) {
    try {
      order = await getOrderByRef(ref);
    } catch {
      dbError = true;
    }
  }

  const status = order?.status ?? "not_found";
  const verified = Boolean(order?.paymentVerified);
  const items = Array.isArray(order?.items) ? (order!.items as unknown as Record<string, unknown>[]) : [];
  const created = order?.createdAt ? new Date(order.createdAt) : new Date();
  const windowStart = addBusinessDays(created, shipping.estimate.minBusinessDays);
  const windowEnd = addBusinessDays(created, shipping.estimate.maxBusinessDays);

  const tone =
    verified || params.paid === "1"
      ? { label: "Payment verified", copy: "The gateway signature was checked on our server and this order is confirmed.", cls: "border-emerald-300 bg-emerald-50 text-emerald-900" }
      : status === "payment_failed"
        ? { label: "Payment failed", copy: "The gateway reported a failed payment. Your cart is safe — try again or contact us.", cls: "border-red-300 bg-red-50 text-red-900" }
        : status === "pending_payment"
          ? {
              label: "Order recorded · awaiting payment",
              copy:
                params.mode === "demo"
                  ? "This deployment has no live payment gateway configured, so nothing has been charged and this order is NOT marked paid. Add Razorpay keys to .env to take real payments."
                  : "We are waiting for the gateway to confirm your payment. If you completed the transfer, contact us with this reference.",
              cls: "border-gold/45 bg-gold/8 text-charcoal",
            }
          : { label: "Order status", copy: "Here is what we have on file for this reference.", cls: "border-charcoal/12 bg-white text-charcoal" };

  return (
    <div className="min-h-screen bg-ivory pb-24 pt-28">
      <div className="shell max-w-4xl">
        <div className="text-center">
          <p className="eyebrow text-gold-deep">Anchorium Store</p>
          <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.2rem)] leading-tight text-charcoal">
            {status === "not_found" ? "We couldn’t find that reference" : "Thank you — your order is in."}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-charcoal/60">
            {status === "not_found"
              ? "Order confirmations are read from our database, so please check the link in your receipt email."
              : "Below is exactly what we recorded — no invented tracking numbers, no claims we cannot honour."}
          </p>
        </div>

        <div className={`mt-9 rounded-2xl border px-5 py-4 text-sm leading-relaxed ${tone.cls}`} role="status">
          <p className="font-semibold uppercase tracking-[0.18em] text-[0.66rem]">{tone.label}</p>
          <p className="mt-1.5">{tone.copy}</p>
        </div>

        {dbError ? (
          <p className="mt-6 rounded-xl border border-charcoal/10 bg-white px-5 py-4 text-sm text-charcoal/60">
            The order store is unreachable right now. Keep your reference — we will confirm by email.
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <section className="card p-6 md:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-[1.15rem] text-charcoal">Order {ref || "—"}</h2>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-charcoal/45">
                Placed {formatIndianDate(created)}
              </p>
            </div>

            {items.length > 0 ? (
              <ul className="mt-6 space-y-4">
                {items.map((it, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-charcoal/8 bg-white">
                      <Image src={variantImageFor(String(it.variantId ?? ""))} alt="" aria-hidden fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-charcoal">{product.title}</span>
                      <span className="block text-[0.76rem] text-charcoal/55">
                        {String(it.variantLabel)} · Qty {String(it.quantity)}
                      </span>
                    </span>
                    <span className="text-sm tabular-nums text-charcoal/80">
                      {formatPaise(Number(it.unitSellPaise) * Number(it.quantity))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-charcoal/55">
                No line items were returned for this reference.
              </p>
            )}

            <dl className="mt-6 space-y-2.5 border-t border-charcoal/8 pt-5 text-sm">
              <Row label="Items at reference price" value={formatPaise(Number(order?.mrpPaise ?? 0))} muted />
              <Row label={`${product.campaign.name} savings`} value={`− ${formatPaise(Number(order?.discountPaise ?? 0))}`} accent />
              <Row label="Subtotal" value={formatPaise(Number(order?.subtotalPaise ?? 0))} />
              <Row
                label={
                  <span>
                    Shipping
                    {Number(order?.shippingPaise ?? 0) === 0 ? (
                      <span className="mt-0.5 block text-[0.7rem] font-medium text-emerald-700">
                        {shipping.firstOrderNote}
                      </span>
                    ) : null}
                  </span>
                }
                value={
                  Number(order?.shippingPaise ?? 0) === 0 ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-charcoal/40 line-through">{formatPaise(shipping.standardPaise)}</span>
                      <span className="rounded-full bg-emerald-600/12 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-emerald-700">
                        Free
                      </span>
                    </span>
                  ) : (
                    formatPaise(Number(order?.shippingPaise ?? 0))
                  )
                }
              />
              <Row label="Total" value={formatPaise(Number(order?.totalPaise ?? 0))} strong />
            </dl>

            {order ? (
              <div className="mt-6 rounded-xl bg-ivory-soft p-4 text-[0.82rem] leading-relaxed text-charcoal/70">
                <p className="font-semibold text-charcoal">Delivering to</p>
                <p className="mt-1">
                  {order.customerName} · {order.phone}
                  <br />
                  {order.addressLine1}
                  {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city}, {order.state} {order.pincode}
                </p>
                <p className="mt-2 text-[0.74rem] text-charcoal/50">
                  Estimate: {formatIndianDate(windowStart)} – {formatIndianDate(windowEnd)} (business days, after
                  dispatch). Public holidays are not modelled.
                </p>
              </div>
            ) : null}
          </section>

          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="text-[1.05rem] text-charcoal">What happens next</h2>
              <ol className="mt-4 space-y-3 text-[0.84rem] leading-relaxed text-charcoal/68">
                {[
                  verified || params.paid === "1" ? "Payment verified — we confirm stock at origin and dispatch." : "Complete the payment when the gateway is live; we only ship verified orders.",
                  "You receive a dispatch email with the courier tracking reference.",
                  `${shipping.estimate.minBusinessDays}–${shipping.estimate.maxBusinessDays} business days in transit, tracked.`,
                  "Questions on fit, brightness or charging? Reply to the email or use the support page.",
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-[0.62rem] font-bold text-gold-deep">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-dark !border-transparent bg-charcoal p-6 text-champagne">
              <h2 className="text-[1.05rem] text-ivory">Anything wrong with the order?</h2>
              <p className="mt-2 text-[0.84rem] leading-relaxed text-champagne/65">
                Wrong finish, missing item or a damaged cover — tell us with the reference above and photos.
              </p>
              <Link href={`/contact?topic=order&ref=${ref}`} className="btn btn-outline-light mt-5 w-full px-4 py-2.5 text-[0.64rem]">
                Contact support
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={product.viewerPath} className="btn btn-outline w-full text-[0.66rem]">Explore the 3D model</Link>
              <Link href="/" className="btn btn-ink w-full text-[0.66rem]">Back to the store</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted, accent, strong }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean; accent?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className={muted ? "text-charcoal/45" : "text-charcoal/65"}>{label}</dt>
      <dd className={`tabular-nums ${accent ? "text-gold-deep" : strong ? "text-[1.05rem] font-semibold text-charcoal" : "text-charcoal/80"}`}>
        {value}
      </dd>
    </div>
  );
}
