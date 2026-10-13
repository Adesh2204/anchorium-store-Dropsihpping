"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

/** Global confirmation for Add to cart / Buy now — real interaction feedback. */
export default function CartToast() {
  const { toast, dismissToast, totals } = useCart();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-md items-center gap-4 rounded-full border border-gold/30 bg-charcoal/95 px-5 py-3 text-sm text-champagne shadow-[0_26px_60px_-30px_rgba(23,21,16,.9)] backdrop-blur"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                <path d="m5 13 4 4 10-11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="flex-1 leading-snug">{toast}</span>
            {totals.itemCount > 0 ? (
              <Link
                href="/checkout"
                onClick={dismissToast}
                className="shrink-0 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-amber hover:text-amber-glow"
              >
                Checkout
              </Link>
            ) : null}
            <button
              type="button"
              onClick={dismissToast}
              className="shrink-0 text-champagne/40 transition-colors hover:text-champagne"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
