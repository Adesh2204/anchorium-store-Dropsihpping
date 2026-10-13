import type { Metadata } from "next";
import Link from "next/link";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { payment, shipping } from "@/lib/config";

export const metadata: Metadata = {
  title: "Checkout · Anchorium Store",
  description: "Indian delivery details and secure prepaid checkout for the AuraGlow ambient lamp.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-ivory pb-24 pt-28">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-gold-deep">Secure checkout</p>
            <h1 className="mt-3 text-[clamp(2rem,4.4vw,3rem)] leading-tight text-charcoal">Almost lit.</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-charcoal/60">
              100% Prepaid premium product (via UPI, Cards, Net Banking){payment.liveConfiguredOnServer ? " via Razorpay" : ""}. Standard Insured Delivery:{" "}
              {shipping.estimate.minBusinessDays}–{shipping.estimate.maxBusinessDays} business days across India, with shipping{" "}
              <span className="line-through text-charcoal/40">₹{(shipping.standardPaise / 100).toFixed(0)}</span>{" "}
              <strong className="font-semibold text-emerald-700">FREE on your first order</strong>.
            </p>
          </div>
          <nav aria-label="Steps" className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.2em] text-charcoal/45">
            <span className="text-charcoal">Cart</span>
            <span aria-hidden>→</span>
            <span className="rounded-full bg-charcoal px-3 py-1 text-ivory">Checkout</span>
            <span aria-hidden>→</span>
            <span>Confirmation</span>
          </nav>
        </div>

        <CheckoutForm />

        <p className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.72rem] text-charcoal/45">
          <span>Prices include the {`Diwali Glow Sale`} discount.</span>
          <span aria-hidden>·</span>
          <Link href="/shipping-policy" className="underline underline-offset-4 hover:text-gold-deep">Shipping policy</Link>
          <span aria-hidden>·</span>
          <Link href="/returns-refunds" className="underline underline-offset-4 hover:text-gold-deep">Returns</Link>
          <span aria-hidden>·</span>
          <Link href="/contact" className="underline underline-offset-4 hover:text-gold-deep">Need help?</Link>
        </p>
      </div>
    </div>
  );
}
