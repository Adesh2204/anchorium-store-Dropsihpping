"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Accordion, PriceBlock, QtyStepper } from "@/components/ui";
import { useCart } from "@/components/CartProvider";
import { pricingFor, product, shipping } from "@/lib/config";
import { formatPaise } from "@/lib/money";

export default function BuyPanel({
  variantId: controlledVariantId,
  onVariantChange,
}: {
  variantId?: string;
  onVariantChange?: (id: string) => void;
} = {}) {
  const { add, totals } = useCart();
  const inStock = product.colorVariants.filter((v) => v.inStock);
  const [internalVariantId, setInternalVariantId] = useState(
    inStock[0]?.id ?? product.colorVariants[0].id,
  );
  const variantId = controlledVariantId ?? internalVariantId;
  const setVariantId = (id: string) => {
    setInternalVariantId(id);
    onVariantChange?.(id);
  };
  const [quantity, setQuantity] = useState(1);
  const price = pricingFor(quantity);
  const selected = product.colorVariants.find((v) => v.id === variantId) ?? product.colorVariants[0];

  const line = {
    variantId: selected.id,
    variantLabel: selected.label,
    outletId: product.outlet.id,
    quantity,
  };

  const estimate = `${shipping.estimate.minBusinessDays}–${shipping.estimate.maxBusinessDays} business days`;

  return (
    <div className="card !rounded-[1.75rem] p-6 md:p-8">
      <p className="eyebrow text-gold-deep">{product.campaign.active ? product.campaign.name : "AuraGlow"}</p>
      <h1 className="mt-3 text-[clamp(1.9rem,4.2vw,2.7rem)] leading-[1.05] text-charcoal">
        {product.title}
      </h1>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-charcoal/70">{product.shortDescription}</p>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-charcoal/50">
        <span>In stock · {inStock.length} finishes</span>
        <span aria-hidden>·</span>
        <span>SKU {product.supplier.sku}</span>
        <span aria-hidden>·</span>
        <span>Sourced via {product.supplier.source}</span>
      </div>

      <div className="mt-6 border-y border-charcoal/8 py-6">
        <PriceBlock size="lg" showCountdown />
      </div>

      {/* ---------------------------------------------------------- variants */}
      <fieldset className="mt-7">
        <legend className="field-label">Base finish — 3 authentic colours</legend>
        <div className="mt-1 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {product.colorVariants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={!v.inStock}
              onClick={() => setVariantId(v.id)}
              aria-pressed={v.id === variantId}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-all duration-300 ${
                v.id === variantId && v.inStock
                  ? "border-gold bg-gold/10 shadow-[0_0_0_3px_rgba(214,164,65,.14)]"
                  : "border-charcoal/12 hover:border-gold/50"
              } ${!v.inStock ? "cursor-not-allowed opacity-45" : ""}`}
            >
              <span className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/15" style={{ background: v.swatch }} />
              <span className="min-w-0">
                <span className="block truncate font-medium text-charcoal">{v.label}</span>
                <span className="block text-[0.66rem] text-charcoal/50">
                  {v.inStock ? "In stock" : "Not stocked"}
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[0.72rem] leading-relaxed text-charcoal/50">
          Select a finish above to preview its studio photograph in the gallery. All three finishes share the same
          high-transparency PC cylinder and warm 2700 K flexible filament.
        </p>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-charcoal/10 bg-white px-4 py-3">
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-charcoal/45">Power</span>
        <span className="text-sm font-medium text-charcoal">{product.outlet.label} (listed as USB)</span>
      </div>

      {/* ---------------------------------------------------------- actions */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <QtyStepper value={quantity} onChange={setQuantity} max={product.maxQuantityPerOrder} />
        <p className="text-[0.7rem] text-charcoal/50">Max {product.maxQuantityPerOrder} per order</p>
      </div>

      <motion.div className="mt-6 grid gap-3 sm:grid-cols-2" initial={false}>
        <button type="button" className="btn btn-ink w-full" onClick={() => add(line, { redirectTo: "cart" })}>
          Add to cart
        </button>
        <button
          type="button"
          className="btn btn-gold w-full"
          onClick={() => {
            add(line);
            window.setTimeout(() => (window.location.href = "/checkout"), 460);
          }}
        >
          Buy now · {formatPaise(price.sellPaise)}
        </button>
      </motion.div>

      {totals.itemCount > 0 ? (
        <Link href="/cart" className="mt-4 block text-center text-[0.72rem] text-charcoal/55 hover:text-gold-deep">
          {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"} in cart · {formatPaise(totals.subtotalPaise)} ·
          go to cart →
        </Link>
      ) : null}

      {/* ---------------------------------------------------------- delivery */}
      <ul className="mt-7 space-y-2.5 text-[0.8rem] text-charcoal/70">
        <li className="flex gap-2.5">
          <Dot /> <strong>Standard Insured Delivery:</strong> {estimate}
        </li>
        <li className="flex gap-2.5">
          <Dot />{" "}
          <span>
            <span className="mr-1.5 text-charcoal/40 line-through">{formatPaise(shipping.standardPaise)}</span>
            <strong className="font-semibold text-emerald-700">{shipping.firstOrderNote}</strong> across India
          </span>
        </li>
        <li className="flex gap-2.5">
          <Dot /> {shipping.codAvailable ? "Cash on delivery available" : "100% Prepaid premium product (via UPI, Cards, Net Banking — no COD)"}
        </li>
        <li className="flex gap-2.5">
          <Dot /> Fully insured transit with tracked courier dispatch
        </li>
      </ul>

      <Link
        href={product.viewerPath}
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-charcoal px-5 py-4 text-champagne transition-transform duration-300 hover:-translate-y-0.5"
      >
        <span className="text-sm">
          <span className="block text-[0.58rem] uppercase tracking-[0.24em] text-amber">Not sure about the size?</span>
          Hold it in 3D — rotate, zoom, check the inlet
        </span>
        <span aria-hidden className="text-lg text-amber">↗</span>
      </Link>

      {/* ---------------------------------------------------------- accordions */}
      <div className="mt-8">
        <Accordion
          items={[
            {
              id: "specifications",
              title: "Full specifications",
              content: (
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {product.specifications
                    .filter((s) => s.verified)
                    .map((s) => (
                      <div key={s.label} className="flex justify-between gap-4 border-b border-charcoal/6 pb-1.5">
                        <dt className="text-charcoal/50">{s.label}</dt>
                        <dd className="text-right font-medium text-charcoal">{s.value}</dd>
                      </div>
                    ))}
                </dl>
              ),
            },
            {
              id: "unverified",
              title: "What we have not been able to verify",
              content: (
                <ul className="space-y-2">
                  {product.specifications
                    .filter((s) => !s.verified)
                    .map((s) => (
                      <li key={s.label} className="flex gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/60" />
                        <span>
                          <strong className="font-medium text-charcoal">{s.label}:</strong> {s.value}
                        </span>
                      </li>
                    ))}
                </ul>
              ),
            },
            {
              id: "package",
              title: "What is in the box",
              content: (
                <ul className="space-y-2">
                  {product.packageContents.map((p) => (
                    <li key={p.label} className="flex gap-2.5">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${p.included ? "bg-gold" : "bg-charcoal/20"}`} />
                      <span>
                        {p.label}
                        {p.included ? "" : " — not confirmed"}
                        {p.note ? <span className="block text-[0.78rem] text-charcoal/50">{p.note}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              id: "delivery",
              title: "Standard Insured Delivery & Payment",
              content: (
                <p>
                  Standard Insured Delivery across India takes {estimate} after dispatch. Every order is fully transit-insured.
                  The standard <span className="line-through text-charcoal/45">{formatPaise(shipping.standardPaise)}</span> shipping
                  charge is waived with{" "}
                  <strong className="font-semibold text-emerald-700">free delivery on your first order</strong>. Marketed as a
                  100% Prepaid premium product via UPI, Cards, and Net Banking (Cash on Delivery is disabled).{" "}
                  <Link href="/shipping-policy" className="text-gold-deep underline">
                    Read the shipping policy
                  </Link>
                  .
                </p>
              ),
            },
            {
              id: "returns",
              title: "Returns &amp; refunds",
              content: (
                <p>
                  Our return window is not yet confirmed by the business, so we do not publish a number. If your lamp
                  arrives damaged or incorrect, contact us with photos and we will confirm the remedy in writing.{" "}
                  <Link href="/returns-refunds" className="text-gold-deep underline">Full policy</Link>.
                </p>
              ),
            },
            {
              id: "care",
              title: "Care &amp; safety",
              content: (
                <ul className="space-y-2">
                  {product.care.map((c) => (
                    <li key={c} className="flex gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/60" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              id: "faq",
              title: "Questions before buying",
              content: (
                <p>
                  Charging, brightness, modes, shipping and payment are answered on the{" "}
                  <Link href="/faq" className="text-gold-deep underline">FAQ page</Link>. Anything missing?{" "}
                  <Link href="/contact" className="text-gold-deep underline">Message us</Link>.
                </p>
              ),
            },
          ]}
        />
      </div>

      <p className="mt-6 text-[0.7rem] leading-relaxed text-charcoal/45">{product.claimGuardrails[0]}</p>
    </div>
  );
}

function Dot() {
  return <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />;
}
