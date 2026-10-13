import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { Reveal, TemplateNote } from "@/components/ui";
import { product, shipping, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Customer support · Anchorium Store",
  description:
    "Talk to Anchorium Store about AuraGlow: orders, delivery, charging, brightness, damaged items and bulk gifting.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-ivory pb-24 pt-28">
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow text-gold-deep">Customer support</p>
          <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.2rem)] leading-tight text-charcoal">
            Questions about the lamp, the order or the glow?
          </h1>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-charcoal/65">
            A small store, one product, and a real person reading this inbox. Send photos for any damage claim and we
            will confirm the remedy in writing.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
          <Suspense fallback={<div className="card h-[520px] animate-pulse" />}>
            <ContactForm />
          </Suspense>

          <aside className="space-y-5">
            <Reveal className="card p-6">
              <h2 className="text-[1.1rem] text-charcoal">Direct channels</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="field-label !mb-1">Email</dt>
                  <dd>
                    <a href={`mailto:${site.support.email}`} className="text-gold-deep underline underline-offset-4 hover:text-gold">
                      {site.support.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="field-label !mb-1">Phone</dt>
                  <dd className="text-charcoal/70">
                    {site.support.phone ? (
                      <a href={`tel:${site.support.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
                        {site.support.phone}
                      </a>
                    ) : (
                      <span className="italic text-charcoal/45">Not yet configured by the business</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="field-label !mb-1">Hours</dt>
                  <dd className="text-charcoal/70">{site.support.hours}</dd>
                </div>
                <div>
                  <dt className="field-label !mb-1">Registered address</dt>
                  <dd className="text-charcoal/70">
                    {site.businessDetailsConfigured ? (
                      site.support.addressLines.map((l) => <span key={l} className="block">{l}</span>)
                    ) : (
                      <span className="italic text-charcoal/45">Pending configuration — set NEXT_PUBLIC_BUSINESS_ADDRESS</span>
                    )}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 text-[0.72rem] leading-relaxed text-charcoal/50">{site.support.responsePromise}</p>
            </Reveal>

            <Reveal delay={0.08} className="card-dark !border-transparent bg-charcoal p-6 text-champagne">
              <h2 className="text-[1.05rem] text-ivory">Answers that usually settle it</h2>
              <ul className="mt-4 space-y-2.5 text-[0.82rem] leading-relaxed text-champagne/68">
                <li>Charging: Type-C USB (3h full charge). Battery life: 6–16 hours.</li>
                <li>Warm atmosphere: 2700K Warm Yellow, 6LM – 60LM (3-level dimming + breathing mode).</li>
                <li>
                  Standard Insured Delivery: {shipping.estimate.minBusinessDays}–{shipping.estimate.maxBusinessDays} business days across India —{" "}
                  <span className="line-through opacity-55">₹{(shipping.standardPaise / 100).toFixed(0)}</span>{" "}
                  <strong className="text-amber">free delivery on your first order</strong>. 100% Prepaid (UPI, Cards, Net Banking — no COD).
                </li>
                <li>Not waterproof: the listing rates IP20, so keep it indoors.</li>
              </ul>
              <Link href="/faq" className="btn btn-outline-light mt-5 w-full px-4 py-2.5 text-[0.64rem]">
                Open the full FAQ
              </Link>
            </Reveal>

            <Reveal delay={0.12} className="card p-6">
              <h2 className="text-[1.05rem] text-charcoal">Order tracking</h2>
              <p className="mt-2 text-[0.84rem] leading-relaxed text-charcoal/62">
                Paste your <code className="rounded bg-ivory-soft px-1">{product.campaign.active ? "ANC-" : ""}</code>{" "}
                reference in the form and we will reply with the courier status. We only share tracking once the parcel
                is physically with the courier.
              </p>
              <Link href="/order-confirmation" className="mt-4 inline-flex text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-deep hover:text-gold">
                View an order confirmation →
              </Link>
            </Reveal>
          </aside>
        </div>

        <div className="mt-10">
          <TemplateNote>
            Support hours, email and phone are configuration values in <code>src/lib/config.ts</code> / your .env file.
            Replace them with your registered business channels before launch — we have deliberately not invented a
            phone number, GSTIN or address.
          </TemplateNote>
        </div>
      </div>
    </div>
  );
}
