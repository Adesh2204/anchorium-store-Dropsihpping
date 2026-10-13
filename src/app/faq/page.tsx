import type { Metadata } from "next";
import Link from "next/link";
import { Accordion, Reveal } from "@/components/ui";
import { product, shipping } from "@/lib/config";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = {
  title: "FAQ · Anchorium Store",
  description:
    "Real answers about AuraGlow: brightness, 2700 K warmth, modes, Type-C charging, battery, IP20 rating, shipping, payment and returns.",
  alternates: { canonical: "/faq" },
};

const groups: { id: string; label: string; blurb: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    id: "product",
    label: "The lamp itself",
    blurb: "What it is, what it does, and what it is definitely not.",
    items: [
      {
        q: "Is AuraGlow a different product from the supplier listing?",
        a: (
          <>
            No. AuraGlow is the store-facing name for the exact item on the {product.supplier.source} listing (SKU{" "}
            {product.supplier.sku}). We have not redesigned the shell, moved the control, changed the filament or
            invented colourways — the geometry you see in our photos, diagrams and 3D viewer follows that listing.
          </>
        ),
      },
      {
        q: "Is it bright enough to light a room?",
        a: "No, and we will not pretend otherwise. The listing quotes 6LM – 60LM at 2700K Warm Yellow. That is an ambient accent glow for a nightstand, a shelf corner or a bedside wind-down — not primary or task lighting.",
      },
      {
        q: "What are the lighting modes?",
        a: "3-level dimming (Low, Medium, High) plus a soothing breathing mode that slowly rises and falls. You cycle between them by touching the front capacitive button.",
      },
      {
        q: "Can the filament be moved?",
        a: "Yes — the listing describes a flexible filament that can be bent, which is why two loop shapes appear in our imagery and in the 3D viewer. Bend it gently; forcing it past its natural curve is how filaments break.",
      },
      {
        q: "What do the buttons and ports actually do?",
        a: "There is exactly one control: the touch circle on the front face, with a small indicator pinhole below it. On the rear face of the base is the USB Type-C inlet. Nothing else on the lamp is interactive.",
      },
      {
        q: "Is it magnetic, and is the listing’s “waterproof” wording true?",
        a: (
          <>
            The listing mentions a magnetic element in the filament design and flags that the package contains
            magnets, but we cannot verify a mounting magnet, so we do not advertise one. As for water: the published
            rating is <strong>IP20</strong>, which means indoor use only and no protection against jets or immersion.
            Some supplier copy says “waterproof” — we do not repeat it.
          </>
        ),
      },
    ],
  },
  {
    id: "charging",
    label: "Charging & battery",
    blurb: "Type-C, 1,500 mAh and the numbers we refuse to guess.",
    items: [
      {
        q: "How do I charge it?",
        a: "Any standard 5 V USB Type-C supply — a phone charger, a laptop port or a power bank. Charge in a dry indoor location and do not leave it on charge unattended overnight for the first few cycles.",
      },
      {
        q: "How long does the battery last, and how long does a full charge take?",
        a: "A full charge takes approximately 3 hours via Type-C USB, providing 6–16 hours of warm ambient glow depending on the brightness level (6LM – 60LM, 3-level dimming or breathing mode).",
      },
      {
        q: "Is a cable included?",
        a: "Yes. As shown on our What’s in the Box card, every AuraGlow package includes the Lamp, a USB Type-C Charging Cable, and a User Manual.",
      },
      {
        q: "Can I use it while it is charging?",
        a: "The lamp charges over Type-C like any battery product; using it on charge is not something the listing describes, so treat it as a charge-then-unplug product.",
      },
      {
        q: "Battery care",
        a: "Lithium-ion: do not crush, puncture or store in a closed vehicle in direct sun. If you put it away for a season, leave it around half charged and top it up every couple of months.",
      },
    ],
  },
  {
    id: "ordering",
    label: "Shipping & delivery",
    blurb: "Where it goes, how long it takes, what it costs.",
    items: [
      {
        q: "Where do you ship, and for how long?",
        a: `Standard Insured Delivery: ${shipping.estimate.minBusinessDays}–${shipping.estimate.maxBusinessDays} business days across India to PIN codes serviced by our courier partners. Every order is fully insured against damage or loss in transit.`,
      },
      {
        q: "What is the shipping charge?",
        a: `Standard insured delivery is ₹${(shipping.standardPaise / 100).toFixed(0)}, which is completely waived (₹0) — you get free delivery on your first order across India.`,
      },
      {
        q: "Is cash on delivery available?",
        a: "No. The AuraGlow lamp is marketed and fulfilled as a 100% Prepaid premium product. All orders are processed securely via UPI, Cards, and Net Banking; Cash on Delivery (COD) is strictly disabled to ensure direct transit insurance and prioritized handling.",
      },
      {
        q: "How do I track my order?",
        a: "You get a dispatch email with the courier reference once the parcel is handed over. Before that, the order sits in “awaiting dispatch” and there is genuinely nothing to track — we would rather say so than show a fake progress bar.",
      },
    ],
  },
  {
    id: "payment",
    label: "Payment & orders",
    blurb: "How money moves here, and what “confirmed” means.",
    items: [
      {
        q: "Which payment methods work?",
        a: "Whatever your configured gateway supports: UPI, cards, net banking and wallets. Card, UPI PIN and bank credentials go to the gateway only — never to our database.",
      },
      {
        q: "When is an order “paid”?",
        a: "Only after our server verifies the gateway signature (HMAC on the order and payment identifiers). Until then the confirmation page says “awaiting payment”, in plain words.",
      },
      {
        q: "Do you take live payments right now?",
        a: (
          <>
            That depends on deployment. The checkout flow, order persistence and signature verification are built; live
            payment needs <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> in the environment. Without
            them the store records orders as unpaid rather than pretending otherwise.
          </>
        ),
      },
      {
        q: "Is the Diwali price automatic?",
        a: `Yes. The ${product.campaign.name} price of ${formatPaise(product.pricing.sellPaise)} against the ${formatPaise(product.pricing.mrpPaise)} reference is applied in the configuration layer, so the cart, checkout and order summary all compute the same ${formatPaise(product.pricing.mrpPaise - product.pricing.sellPaise)} saving per lamp. No coupon codes, no minimum spend.`,
      },
      {
        q: "Can I change my address after ordering?",
        a: "Message us with the order reference as soon as possible. Before dispatch we can usually correct it; after handover to the courier, re-direction is at the courier’s mercy.",
      },
    ],
  },
  {
    id: "aftercare",
    label: "Returns, care & warranty",
    blurb: "What we commit to, and what is still being confirmed.",
    items: [
      {
        q: "My lamp arrived damaged. What now?",
        a: "Photograph the parcel and the item, then write to us from the contact page with your ANC reference and “Damaged or wrong item” selected. We assess transit damage on the evidence and confirm the remedy in writing.",
      },
      {
        q: "Do you have a fixed return window?",
        a: (
          <>
            Not yet published — our returns page is an editable template precisely because we will not print a number the
            business has not confirmed. See{" "}
            <Link href="/returns-refunds" className="text-gold-deep underline">
              Returns &amp; refunds
            </Link>
            .
          </>
        ),
      },
      {
        q: "Is there a warranty?",
        a: "The supplier listing does not state one, so we do not claim one. Any warranty will be published on the terms page the day it is agreed.",
      },
      {
        q: "How do I clean it?",
        a: "Soft dry cloth on the PC cover. No solvents, no abrasives, no soaking — the shell is transparent polycarbonate and scratches show.",
      },
      {
        q: "It stopped turning on.",
        a: "Charge it for a while on a known-good Type-C cable and adapter, then press and hold the front touch circle. If the indicator never lights and the filament stays dark, treat it as a fault and contact us with a short video.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-ivory pb-24 pt-28">
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow text-gold-deep">Answers</p>
          <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.2rem)] leading-tight text-charcoal">
            Everything we will and will not promise.
          </h1>
          <p className="mt-4 text-[1rem] leading-relaxed text-charcoal/65">
            These answers follow the supplier listing. Where a figure is not published — runtime, charge time,
            warranty — the honest answer is “not confirmed”, and that is what you get here.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="rounded-full border border-charcoal/12 bg-white px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-charcoal/65 transition-colors hover:border-gold hover:text-gold-deep"
            >
              {g.label}
            </a>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="space-y-6">
            {groups.map((g) => (
              <Reveal key={g.id} as="section" className="card p-6 md:p-7">
                <h2 id={g.id} className="text-[1.3rem] text-charcoal">
                  {g.label}
                </h2>
                <p className="mt-1.5 text-[0.82rem] text-charcoal/55">{g.blurb}</p>
                <div className="mt-4">
                  <Accordion items={g.items.map((it) => ({ title: it.q, content: it.a, id: `${g.id}-${it.q.slice(0, 8)}` }))} />
                </div>
              </Reveal>
            ))}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <Reveal className="card-dark !border-transparent bg-charcoal p-6 text-champagne">
              <p className="eyebrow text-amber">Still stuck?</p>
              <p className="mt-3 text-[0.86rem] leading-relaxed text-champagne/70">
                Send a message with your order reference and a photo — a human reads every one of these.
              </p>
              <Link href="/contact" className="btn btn-gold mt-5 w-full px-4 py-2.5 text-[0.64rem]">
                Contact support
              </Link>
            </Reveal>

            <Reveal delay={0.06} className="card p-6">
              <h2 className="text-[1.05rem] text-charcoal">Verified at a glance</h2>
              <dl className="mt-4 space-y-2.5 text-[0.8rem]">
                {[
                  ["Size", "80 × 160 mm"],
                  ["Weight", "540g"],
                  ["Material", "ABS + PC"],
                  ["Colour temp", "2700K Warm Yellow"],
                  ["Output", "6LM – 60LM (3-level dimming + breathing)"],
                  ["Battery", "6–16h (3h full charge), Type-C USB"],
                  ["Rating", "IP20 indoor"],
                  ["Lamp life", "25,000 h (listed)"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-charcoal/6 pb-1.5 last:border-0">
                    <dt className="text-charcoal/45">{k}</dt>
                    <dd className="text-charcoal">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href={product.path} className="btn btn-outline mt-5 w-full px-4 py-2.5 text-[0.64rem]">
                Product page
              </Link>
              <Link href={product.viewerPath} className="mt-3 block text-center text-[0.7rem] uppercase tracking-[0.16em] text-gold-deep hover:text-gold">
                Explore in 3D →
              </Link>
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  );
}
