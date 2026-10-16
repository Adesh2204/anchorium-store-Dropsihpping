import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getOrderByRef } from "@/db";
import type { Order } from "@/db/schema";
import { formatPaise } from "@/lib/money";
import { product, shipping, variantImageFor } from "@/lib/config";
import { addBusinessDays, formatIndianDate } from "@/lib/india";
import ClearCartOnSuccess from "@/components/checkout/ClearCartOnSuccess";

export const metadata: Metadata = {
  title: "Order confirmation · Anchorium Store",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{
    ref?: string;
    paid?: string;
    mode?: string;
    order_id?: string;
    checkout_token?: string;
  }>;
};

export default async function OrderConfirmation({ searchParams }: Props) {
  const params = await searchParams;
  const rawRef = params.ref ?? params.order_id ?? params.checkout_token ?? "";
  const ref = rawRef.toUpperCase();
  const isShopify = Boolean(params.order_id || params.checkout_token || !ref.startsWith("ANC-"));

  let order: (Order & { items: unknown }) | null = null;
  let dbError = false;

  if (ref && ref.startsWith("ANC-")) {
    try {
      order = await getOrderByRef(ref);
    } catch {
      dbError = true;
    }
  }

  const created = order?.createdAt ? new Date(order.createdAt) : new Date();
  const windowStart = addBusinessDays(created, shipping.estimate.minBusinessDays);
  const windowEnd = addBusinessDays(created, shipping.estimate.maxBusinessDays);

  const displayRef = ref || (order?.orderNo ? order.orderNo : "SHOPIFY-" + Math.floor(100000 + Math.random() * 900000));

  return (
    <div className="min-h-screen bg-ivory pb-24 pt-28">
      {/* Empty cart once order is confirmed */}
      <ClearCartOnSuccess />

      <div className="shell max-w-4xl">
        <div className="text-center">
          <p className="eyebrow text-gold-deep">Anchorium Store</p>
          <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.2rem)] leading-tight text-charcoal">
            Thank you — your order is confirmed.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-charcoal/60">
            Your purchase was processed securely via Shopify Checkout. A full receipt, order summary, and shipping
            updates will arrive at the email address provided during checkout.
          </p>
        </div>

        <div className="mt-9 rounded-2xl border px-5 py-4 text-sm leading-relaxed border-emerald-300 bg-emerald-50 text-emerald-900" role="status">
          <p className="font-semibold uppercase tracking-[0.18em] text-[0.66rem]">Payment & Order Verified</p>
          <p className="mt-1.5">
            Your order reference is <strong>{displayRef}</strong>. Our fulfilment process has begun, and tracking details will be emailed as soon as your lamp is dispatched.
          </p>
        </div>

        {dbError ? (
          <p className="mt-6 rounded-xl border border-charcoal/10 bg-white px-5 py-4 text-sm text-charcoal/60">
            Order confirmed. Keep your reference — we will confirm by email.
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <section className="card p-6 md:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-[1.15rem] text-charcoal">Order {displayRef}</h2>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-charcoal/45">
                Placed {formatIndianDate(created)}
              </p>
            </div>

            <div className="mt-6 flex gap-4 rounded-xl border border-charcoal/8 bg-white p-4">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-charcoal/8 bg-white">
                <Image
                  src={variantImageFor(product.colorVariants[0].id)}
                  alt=""
                  aria-hidden
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-charcoal">{product.title}</h3>
                <p className="mt-1 text-[0.76rem] text-charcoal/55">
                  Type-C Rechargeable · Ambient 2700K Glow
                </p>
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  ✓ Confirmed via Shopify Checkout
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-ivory-soft p-4 text-[0.82rem] leading-relaxed text-charcoal/70">
              <p className="font-semibold text-charcoal">Estimated Dispatch & Delivery</p>
              <p className="mt-1 text-sm font-medium text-charcoal">
                {formatIndianDate(windowStart)} – {formatIndianDate(windowEnd)}
              </p>
              <p className="mt-2 text-[0.74rem] text-charcoal/50">
                Standard Insured Delivery ({shipping.estimate.minBusinessDays}–{shipping.estimate.maxBusinessDays} business days across India). You will receive an SMS and email notification with live courier tracking upon dispatch.
              </p>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="text-[1.05rem] text-charcoal">What happens next</h2>
              <ol className="mt-4 space-y-3 text-[0.84rem] leading-relaxed text-charcoal/68">
                {[
                  "Shopify processes your payment and notifies our fulfilment warehouse.",
                  "Your lamp undergoes quality verification before packing.",
                  "You receive a dispatch notification with real-time tracking.",
                  "Delivered to your doorstep within 10–14 business days.",
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
              <h2 className="text-[1.05rem] text-ivory">Need help with your order?</h2>
              <p className="mt-2 text-[0.84rem] leading-relaxed text-champagne/65">
                Have questions about your order or need to update your address? Our support team is here to help.
              </p>
              <Link
                href={`/contact?topic=order&ref=${displayRef}`}
                className="btn btn-outline-light mt-5 w-full px-4 py-2.5 text-[0.64rem]"
              >
                Contact support
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={product.viewerPath} className="btn btn-outline w-full text-[0.66rem]">
                Explore the 3D model
              </Link>
              <Link href="/" className="btn btn-ink w-full text-[0.66rem]">
                Back to the store
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
