"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/Logo";
import CampaignCountdown from "@/components/CampaignCountdown";
import { useCart } from "@/components/CartProvider";
import { nav, product } from "@/lib/config";

export default function Header() {
  const pathname = usePathname();
  const { totals, hydrated } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  /* dark (transparent over the cinematic hero) only at the very top of the homepage */
  const dark = onHome && !scrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`hidden items-center justify-center gap-6 px-6 py-2 text-[0.66rem] uppercase tracking-[0.3em] transition-colors duration-500 sm:flex ${
          dark ? "bg-charcoal/60 text-champagne" : "bg-charcoal text-champagne"
        }`}
      >
        <span>
          {product.campaign.active ? `${product.campaign.name} · ₹1,000 off · ₹3,999` : "Now ₹3,999"}
        </span>
        <span className="h-3 w-px bg-champagne/30" aria-hidden />
        <span>
          Free delivery on your first order · <span className="line-through opacity-55">₹99</span>{" "}
          <strong className="text-amber">FREE</strong>
        </span>
        <span className="h-3 w-px bg-champagne/30" aria-hidden />
        <CampaignCountdown variant="dark" />
      </div>

      <div
        className={`transition-all duration-500 ${
          dark
            ? "bg-gradient-to-b from-charcoal/85 via-charcoal/45 to-transparent"
            : "border-b border-charcoal/8 bg-ivory/90 shadow-[0_10px_36px_-30px_rgba(23,21,16,.55)] backdrop-blur-xl"
        }`}
      >
        <div className="shell flex items-center justify-between gap-4 py-3">
          <Logo variant={dark ? "light" : "dark"} size="sm" />

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.split("#")[0]) && item.href !== "/#features";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative text-[0.72rem] font-semibold uppercase tracking-[0.2em] transition-colors ${
                    dark ? "text-champagne/85 hover:text-amber" : "text-charcoal/70 hover:text-gold-deep"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-2 left-0 h-px bg-gold transition-all duration-500 ${
                      active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-70"
                    }`}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={product.path}
              className={`btn hidden px-4 py-2 text-[0.64rem] md:inline-flex ${
                dark ? "btn-outline-light" : "btn-ink"
              }`}
            >
              Shop the lamp
            </Link>

            <Link
              href="/cart"
              aria-label={`Cart, ${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"}`}
              className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                dark
                  ? "border-champagne/30 text-champagne hover:border-amber"
                  : "border-charcoal/12 text-charcoal hover:border-gold"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
                <path
                  d="M6 8h12l-1.1 10.1a2 2 0 0 1-2 1.9H9.1a2 2 0 0 1-2-1.9L6 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M9.2 8V6.6a2.8 2.8 0 0 1 5.6 0V8" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <AnimatePresence>
                {hydrated && totals.itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-charcoal"
                  >
                    {totals.itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${
                dark ? "border-champagne/30 text-champagne" : "border-charcoal/12 text-charcoal"
              }`}
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                {menuOpen ? (
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-charcoal/8 bg-ivory lg:hidden"
            >
              <nav aria-label="Mobile" className="shell flex flex-col py-4">
                {nav.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between border-b border-charcoal/6 py-3 text-sm font-medium uppercase tracking-[0.16em] text-charcoal/80"
                  >
                    {item.label}
                    <span className="text-gold">→</span>
                  </Link>
                ))}
                <Link href={product.path} className="btn btn-gold mt-4">
                  Buy AuraGlow · ₹3,999
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
