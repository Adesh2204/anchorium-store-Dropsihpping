import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getOrderByRef } from "@/db";
import type { Order } from "@/db/schema";
import { product, shipping, variantImageFor } from "@/lib/config";
import { addBusinessDays, formatIndianDate } from "@/lib/india";
import { SHOPIFY_STORE_DOMAIN, verifyShopifyOrder } from "@/lib/shopify";
import ClearCartOnSuccess from "@/components/checkout/ClearCartOnSuccess";

export const metadata: Metadata = {
  title: "Order Status · Anchorium Store",
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
  const rawRef = (params.ref ?? params.order_id ?? params.checkout_token ?? "").trim();
  const hasCheckoutSignal = Boolean(params.order_id || params.checkout_token || params.paid === "1");

  // Authenticate order against real Shopify records
  let isShopifyVerified = false;
  let verifiedOrderNumber: string | null = null;
  let verifiedFinancialStatus: string | null = null;

  if (rawRef) {
    const shopifyResult = await verifyShopifyOrder(rawRef);
    if (shopifyResult.verified) {
      isShopifyVerified = true;
      verifiedOrderNumber = shopifyResult.orderNumber ?? rawRef;
      verifiedFinancialStatus = shopifyResult.financialStatus ?? "paid";
    }
  }

  // Check legacy local database if applicable
  let legacyOrder: Order | null = null;
  if (rawRef.toUpperCase().startsWith("ANC-")) {
    try {
      legacyOrder = await getOrderByRef(rawRef.toUpperCase());
    } catch {
      // ignore db errors
    }
  }

  const isLegacyVerified = Boolean(legacyOrder?.paymentVerified);
  const isOrderOfficiallyVerified = isShopifyVerified || isLegacyVerified;

  const created = legacyOrder?.createdAt ? new Date(legacyOrder.createdAt) : new Date();
  const windowStart = addBusinessDays(created, shipping.estimate.minBusinessDays);
  const windowEnd = addBusinessDays(created, shipping.estimate.maxBusinessDays);

  const shopifyAccountUrl = `https://${SHOPIFY_STORE_DOMAIN}/account/orders`;

  return (
    <div className="min-h-screen bg-ivory pb-24 pt-28">
      {/* Clean up local cart session upon returning from checkout */}
      {hasCheckoutSignal ? <ClearCartOnSuccess /> : null}

      <div className="shell max-w-4xl">
        <div className="text-center">
          <p className="eyebrow text-gold-deep">Anchorium Store</p>
          <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.2rem)] leading-tight text-charcoal">
            {isOrderOfficiallyVerified
              ? "Thank you — your order is confirmed."
              : "Shopify Order Status"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-charcoal/60">
            {isOrderOfficiallyVerified
              ? `Your payment was verified through Shopify. An official receipt, order invoice, and tracking updates will be delivered to your email.`
              : "All checkout transactions, order registrations, and payments are processed exclusively on Shopify's secure platform."}
          </p>
        </div>

        {/* Verification Status Card */}
        {isOrderOfficiallyVerified ? (
          <div
            className="mt-9 rounded-2xl border px-5 py-4 text-sm leading-relaxed border-emerald-300 bg-emerald-50 text-emerald-900"
            role="status"
          >
            <p className="font-semibold uppercase tracking-[0.18em] text-[0.66rem]">
              Payment &amp; Order Verified via Shopify
            </p>
            <p className="mt-1.5">
              Order reference: <strong>{verifiedOrderNumber || legacyOrder?.orderNo}</strong>
              {verifiedFinancialStatus ? ` (${verifiedFinancialStatus})` : ""}. Fulfilment has been
              queued, and live courier tracking will be emailed upon dispatch.
            </p>
          </div>
        ) : (
          <div
            className="mt-9 rounded-2xl border px-5 py-5 text-sm leading-relaxed border-charcoal/15 bg-white text-charcoal"
            role="status"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-deep">
                ℹ
              </span>
              <div>
                <p className="font-semibold uppercase tracking-[0.18em] text-[0.66rem] text-charcoal/60">
                  Shopify Checkout Confirmation
                </p>
                <p className="mt-1.5 text-charcoal/75 leading-relaxed">
                  If you just completed your checkout, Shopify has sent your official confirmation,
                  verified receipt, and delivery updates directly to your email address.
                </p>
                <p className="mt-2 text-xs text-charcoal/55">
                  To view your confirmed order number, tax invoice, and live courier status directly on
                  Shopify, visit your customer account or consult the link in your receipt email.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={shopifyAccountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold text-xs px-4 py-2"
                  >
                    View Orders on Shopify →
                  </a>
                  <Link href="/contact?topic=order" className="btn btn-outline text-xs px-4 py-2">
                    Contact Store Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <section className="card p-6 md:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-[1.15rem] text-charcoal">
                {isOrderOfficiallyVerified
                  ? `Order ${verifiedOrderNumber || legacyOrder?.orderNo}`
                  : "Order Information"}
              </h2>
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
                  ✓ Handled via Shopify Checkout
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-ivory-soft p-4 text-[0.82rem] leading-relaxed text-charcoal/70">
              <p className="font-semibold text-charcoal">Estimated Dispatch &amp; Delivery</p>
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
                  "Shopify registers your payment and updates our inventory.",
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
                href="/contact?topic=order"
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
