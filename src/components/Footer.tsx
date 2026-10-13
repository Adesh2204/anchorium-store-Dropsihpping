import Link from "next/link";
import Logo from "@/components/Logo";
import { footerNav, payment, product, shipping, site } from "@/lib/config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-charcoal text-champagne">
      <div className="pointer-events-none absolute inset-0 festive-pattern opacity-70" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,181,46,.55), transparent 65%)" }}
        aria-hidden
      />

      <div className="shell relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
          <div>
            <Logo variant="light" size="md" animated={false} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-champagne/65">{site.tagline}</p>
            <p className="mt-5 text-xs leading-relaxed text-champagne/45">
              One lamp, sold honestly. Product facts, specifications and imagery are traced to the original{" "}
              {product.supplier.source} listing (SKU {product.supplier.sku}); styling is brand art direction.
            </p>
            <Link
              href={product.supplier.listingUrl}
              target="_blank"
              rel="noreferrer noopener nofollow"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.2em] text-gold transition-colors hover:text-amber"
            >
              Supplier source listing
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
                <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
          </div>

          {[
            { title: "Shop", links: footerNav.shop },
            { title: "Support", links: footerNav.support },
            { title: "Policies", links: footerNav.policies },
          ].map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow text-gold">{col.title}</h2>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-champagne/72 transition-colors hover:text-amber">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 grid gap-8 border-t border-champagne/12 pt-8 md:grid-cols-2">
          <div>
            <h2 className="eyebrow text-gold">Payments</h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-champagne/72">
              {payment.methods.map((m) => (
                <li key={m.id}>
                  <span title={m.note}>{m.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-champagne/45">
              Processed securely by {payment.provider === "razorpay" ? "Razorpay" : "the configured gateway"}.{" "}
              {shipping.codAvailable
                ? "Cash on delivery available."
                : shipping.prepaidOnlyNote}
            </p>
          </div>

          <div className="md:text-right">
            <h2 className="eyebrow text-gold">Customer support</h2>
            <p className="mt-4 text-sm text-champagne/72">
              <a href={`mailto:${site.support.email}`} className="transition-colors hover:text-amber">
                {site.support.email}
              </a>
              {site.support.phone ? (
                <>
                  <span className="mx-2 text-champagne/30">·</span>
                  <a href={`tel:${site.support.phone.replace(/\s/g, "")}`} className="hover:text-amber">
                    {site.support.phone}
                  </a>
                </>
              ) : null}
            </p>
            <p className="mt-2 text-xs text-champagne/45">{site.support.hours}</p>
            <Link href="/contact" className="btn btn-outline-light mt-5 px-5 py-2.5 text-[0.66rem] md:inline-flex">
              Contact us
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-champagne/10 pt-6 text-[0.7rem] text-champagne/45 sm:flex-row sm:items-center">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="tracking-[0.14em] uppercase">
            Prices in INR · {product.campaign.active ? `${product.campaign.name} active` : "Standard pricing"}
          </p>
        </div>
      </div>
    </footer>
  );
}
