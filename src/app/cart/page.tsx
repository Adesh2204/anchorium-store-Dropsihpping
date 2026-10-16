"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/components/CartProvider";
import { PriceBlock, QtyStepper } from "@/components/ui";
import { pricingFor, product, shipping, variantImageFor } from "@/lib/config";
import { formatPaise, unitMrpPaise, unitSellPaise } from "@/lib/money";

export default function CartPage() {
  const { lines, totals, setQuantity, remove, clear, hydrated, proceedToCheckout, isSyncing } = useCart();
  const single = pricingFor(1);

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-24">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-gold-deep">Your selection</p>
            <h1 className="mt-3 text-[clamp(2rem,4.4vw,3rem)] leading-tight text-charcoal">Shopping cart</h1>
            <p className="mt-2 text-sm text-charcoal/55">
              {totals.itemCount > 0
                ? `${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"} · ${product.campaign.name} price applied`
                : "Nothing here yet."}
            </p>
          </div>
          {lines.length > 0 ? (
            <div className="flex gap-3">
              <button type="button" onClick={clear} className="btn btn-outline px-4 py-2.5 text-[0.62rem]">
                Empty cart
              </button>
              <Link href={product.path} className="btn btn-outline px-4 py-2.5 text-[0.62rem]">
                Continue shopping
              </Link>
            </div>
          ) : null}
        </div>

        {!hydrated ? (
          <div className="mt-12 h-40 animate-pulse rounded-3xl bg-white" />
        ) : lines.length === 0 ? (
          <div className="mt-12 grid place-items-center rounded-[1.75rem] border border-dashed border-charcoal/15 bg-white px-6 py-20 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-champagne/50 text-gold-deep">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
                <path d="M6 8h12l-1.1 10.1a2 2 0 0 1-2 1.9H9.1a2 2 0 0 1-2-1.9L6 8Z" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9.2 8V6.6a2.8 2.8 0 0 1 5.6 0V8" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <h2 className="mt-6 text-2xl text-charcoal">Your cart is empty</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-charcoal/60">
              One lamp, one decision. Add AuraGlow and the {single.discountPercent}% festive price is applied
              automatically — no code, no minimum.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href={product.path} className="btn btn-gold">Shop the lamp</Link>
              <Link href={product.viewerPath} className="btn btn-outline">Explore in 3D</Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.85fr] lg:items-start">
            <ul className="space-y-4">
              {lines.map((line) => {
                const mrp = unitMrpPaise(line.variantId) * line.quantity;
                const sellLine = unitSellPaise(line.variantId) * line.quantity;
                return (
                  <motion.li
                    key={line.lineId}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-charcoal/8 bg-white">
                      <Image src={variantImageFor(line.variantId)} alt={`${product.name} — ${line.variantLabel}`} fill sizes="96px" className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                        <div>
                          <h2 className="text-[1.1rem] leading-tight text-charcoal">{product.title}</h2>
                          <p className="mt-1 text-[0.78rem] text-charcoal/55">
                            {line.variantLabel} · {product.outlet.label} · SKU {product.supplier.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-xl text-charcoal tabular-nums">{formatPaise(sellLine)}</p>
                          <p className="text-[0.74rem] text-charcoal/40 line-through tabular-nums">{formatPaise(mrp)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <QtyStepper
                          value={line.quantity}
                          onChange={(q) => setQuantity(line.lineId, q)}
                          label="Qty"
                        />
                        <div className="flex items-center gap-4">
                          <span className="text-[0.72rem] text-charcoal/45">
                            Saves {formatPaise(mrp - sellLine)}
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(line.lineId)}
                            className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-charcoal/45 underline-offset-4 transition-colors hover:text-red-700 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}

              <li className="rounded-2xl border border-charcoal/10 bg-white/60 px-5 py-4 text-[0.78rem] leading-relaxed text-charcoal/60">
                <span className="mr-2 inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span>✓ {shipping.firstOrderNote}</span>
                  <span className="text-charcoal/40 line-through font-normal">{formatPaise(shipping.standardPaise)}</span>
                </span>
                · <strong>Standard Insured Delivery:</strong> {shipping.estimate.minBusinessDays}–{shipping.estimate.maxBusinessDays} business
                days across India. {shipping.codAvailable ? "COD available." : "100% Prepaid premium product (via UPI, Cards, Net Banking — no COD)."}
              </li>
            </ul>

            <aside className="card p-6 lg:sticky lg:top-28">
              <h2 className="text-[1.15rem] text-charcoal">Order summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <Row label={`Items (${totals.itemCount})`} value={formatPaise(totals.mrpPaise)} muted />
                <Row label={`${product.campaign.name} discount`} value={`− ${formatPaise(totals.discountPaise)}`} accent />
                <Row label="Subtotal" value={formatPaise(totals.subtotalPaise)} strong />
                <Row
                  label={
                    <span>
                      Shipping
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
              {totals.freeShipping ? (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-600/20 bg-emerald-50/70 px-3.5 py-2.5 text-[0.74rem] text-emerald-900">
                  <span className="font-medium">✓ {shipping.firstOrderNote}</span>
                  <span className="tabular-nums font-semibold">
                    <span className="mr-1 text-emerald-900/45 line-through">{formatPaise(shipping.standardPaise)}</span>
                    ₹0
                  </span>
                </div>
              ) : null}
              <div className="my-5 rule-gold" />
              <div className="flex items-end justify-between">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-charcoal/45">Total payable</span>
                <span className="font-display text-[1.9rem] leading-none text-charcoal tabular-nums">
                  {formatPaise(totals.totalPaise)}
                </span>
              </div>
              <p className="mt-2 text-right text-[0.7rem] text-charcoal/45">
                Inclusive of all taxes · Free first-order delivery
              </p>

              <button
                type="button"
                onClick={proceedToCheckout}
                disabled={isSyncing}
                className="btn btn-gold mt-6 w-full"
              >
                {isSyncing ? "Preparing Shopify checkout..." : "Proceed to Shopify checkout"}
              </button>
              <Link href={product.viewerPath} className="btn btn-outline mt-3 w-full">
                Inspect in 3D first
              </Link>

              <div className="mt-6 border-t border-charcoal/8 pt-5">
                <PriceBlock size="sm" />
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  accent,
  strong,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  muted?: boolean;
  accent?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className={muted ? "text-charcoal/45" : "text-charcoal/65"}>{label}</dt>
      <dd
        className={`tabular-nums ${
          accent ? "text-gold-deep" : strong ? "font-semibold text-charcoal" : "text-charcoal/80"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
