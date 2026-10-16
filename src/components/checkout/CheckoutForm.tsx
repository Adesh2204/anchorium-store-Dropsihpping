"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatPaise } from "@/lib/money";

export default function CheckoutForm() {
  const router = useRouter();
  const { lines, totals, hydrated, checkoutUrl, proceedToCheckout, isSyncing } = useCart();

  const statusMessage = checkoutUrl
    ? "Redirecting to Shopify secure checkout..."
    : isSyncing
    ? "Preparing your cart with Shopify..."
    : "Connecting to Shopify...";

  useEffect(() => {
    if (!hydrated) return;

    if (lines.length === 0) {
      router.replace("/cart");
      return;
    }

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      proceedToCheckout();
    }
  }, [hydrated, lines.length, checkoutUrl, proceedToCheckout, router]);

  return (
    <div className="mt-10 mx-auto max-w-xl">
      <div className="card !rounded-[1.75rem] p-8 md:p-10 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
          <svg
            className="h-8 w-8 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        <h2 className="mt-6 text-2xl font-serif text-charcoal">
          Transferring to Shopify Checkout
        </h2>
        <p className="mt-2 text-sm text-charcoal/65 leading-relaxed">
          {statusMessage}
        </p>

        <div className="mt-6 rounded-2xl border border-charcoal/8 bg-ivory/60 p-4 text-left">
          <div className="flex justify-between text-sm text-charcoal/70">
            <span>Items ({totals.itemCount})</span>
            <span className="font-medium text-charcoal tabular-nums">
              {formatPaise(totals.subtotalPaise)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm font-semibold text-charcoal">
            <span>Total Payable</span>
            <span className="tabular-nums">{formatPaise(totals.totalPaise)}</span>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              className="btn btn-gold w-full flex items-center justify-center gap-2"
            >
              Continue to Shopify Checkout →
            </a>
          ) : (
            <button
              type="button"
              onClick={proceedToCheckout}
              disabled={isSyncing}
              className="btn btn-gold w-full"
            >
              {isSyncing ? "Connecting..." : "Retry Checkout"}
            </button>
          )}

          <Link href="/cart" className="block text-xs text-charcoal/50 hover:text-charcoal pt-2">
            ← Return to cart
          </Link>
        </div>

        <div className="mt-8 border-t border-charcoal/8 pt-6">
          <div className="flex items-center justify-center gap-2 text-[0.72rem] text-charcoal/50">
            <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Secured by Shopify 256-bit encrypted checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
