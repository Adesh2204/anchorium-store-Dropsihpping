import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { GalleryItem } from "@/components/product/ProductGallery";
import ProductInteractiveSection from "@/components/product/ProductInteractiveSection";
import { Reveal, ProvenanceNote, TemplateNote } from "@/components/ui";
import { product } from "@/lib/config";

export const metadata: Metadata = {
  title: `${product.name} — rechargeable ambient LED lamp · Anchorium Store`,
  description: `${product.longDescription} ₹3,999 during the Diwali Glow Sale (₹1,000 off ₹4,999) with free delivery on your first order.`,
  alternates: { canonical: product.path },
  openGraph: {
    title: `${product.name} · Anchorium Store`,
    description: product.shortDescription,
    images: [{ url: "/product/01_three_colour_studio_lineup.png" }],
  },
};

const gallery: GalleryItem[] = [
  {
    id: "variant-yellow",
    label: "Finish — Warm Yellow / Light",
    caption: "Studio portrait of the Warm Yellow / Light finish — vibrant warm base, high-transparency PC cylinder, and suspended 2700 K filament.",
    credit: "HD Studio · Warm Yellow / Light",
    kind: "image",
    src: "/product/03_yellow_lamp_studio.png",
    bg: "#e4a602",
    fit: "cover",
    variantId: "yellow",
  },
  {
    id: "variant-green",
    label: "Finish — Green (80 × 160 mm)",
    caption: "Green finish with official 80 mm × 160 mm dimensions — deep green matte ABS base and crystal-clear cover.",
    credit: "HD Studio & Dimensions · Green",
    kind: "image",
    src: "/product/02_green_lamp_dimensions.png",
    bg: "#133e23",
    fit: "contain",
    variantId: "green",
  },
  {
    id: "variant-dark-grey",
    label: "Finish — Dark Grey",
    caption: "Studio portrait of the Dark Grey finish — understated matte slate base with warm golden filament reflections.",
    credit: "HD Studio · Dark Grey",
    kind: "image",
    src: "/product/04_grey_lamp_studio.png",
    bg: "#898383",
    fit: "cover",
    variantId: "dark-grey",
  },
  {
    id: "hands-on-video",
    label: "Hands-on video — Real lamp in motion",
    caption: "Watch the real AuraGlow lamp unboxed, switched on with a touch, and tilted to show the flexible magnetic LED filament in action.",
    credit: "Hands-on product video",
    kind: "video",
    src: "/product/auraglow-showcase.mp4",
    poster: "/product/01_three_colour_studio_lineup.png",
    bg: "#0f0e0c",
  },
  {
    id: "studio-lineup",
    label: "Studio lineup — All 3 finishes",
    caption: "Warm Yellow / Light, Green, and Dark Grey glowing side by side in warm 2700 K studio light.",
    credit: "HD Studio Lineup",
    kind: "image",
    src: "/product/01_three_colour_studio_lineup.png",
    bg: "#8d745a",
    fit: "contain",
  },
  {
    id: "three-colour-options",
    label: "3 Elegant Colours — Yellow, Green & Grey",
    caption: "Side-by-side comparison of the three official colourways: Yellow, Green, and Grey.",
    credit: "Colour Overview",
    kind: "image",
    src: "/product/09_three_colour_options.png",
    bg: "#ede4dd",
    fit: "contain",
  },
  {
    id: "lifestyle-bedside",
    label: "Lifestyle — Bedside table warmth",
    caption: "Green AuraGlow on a wooden nightstand — a calm, candle-warm 2700 K glow for evening wind-down.",
    credit: "Lifestyle Photography",
    kind: "image",
    src: "/product/08_green_lamp_lifestyle.png",
    bg: "#362619",
    fit: "cover",
  },
  {
    id: "adjustable-brightness",
    label: "Adjustable Brightness — Low, Medium & High",
    caption: "Three warm brightness levels (Low, Medium, High) controlled directly from the front capacitive touch button.",
    credit: "Lighting Modes",
    kind: "image",
    src: "/product/06_adjustable_brightness.png",
    bg: "#1b140e",
    fit: "contain",
  },
  {
    id: "side-profile",
    label: "Side view — Transparent cover & filament",
    caption: "Horizontal close-up showing the high-transparency anti-drop PC cylinder, top magnetic brass contact, and recessed touch switch.",
    credit: "Detail Close-up",
    kind: "image",
    src: "/product/11_lamp_side_view.png",
    bg: "#b89f88",
    fit: "contain",
  },
  {
    id: "type-c-charging",
    label: "Type-C Rechargeable — Power Bank, Laptop & Adapter",
    caption: "Rear USB Type-C charging port compatible with power banks, laptops, and standard 5 V wall adapters.",
    credit: "Charging Detail",
    kind: "image",
    src: "/product/07_type_c_charging_detail.png",
    bg: "#e3dad0",
    fit: "contain",
  },
  {
    id: "anti-slip-base",
    label: "Stable Base with Anti-Slip Pads",
    caption: "Underside of the base equipped with four soft anti-slip pads for stability on wood, glass, and stone.",
    credit: "Base Detail",
    kind: "image",
    src: "/product/12_anti_slip_base_detail.png",
    bg: "#e6dfd9",
    fit: "contain",
  },
  {
    id: "whats-in-the-box",
    label: "What's in the Box — Lamp, Type-C Cable & Manual",
    caption: "Every order includes the AuraGlow Lamp, a USB Type-C Charging Cable, and the User Manual.",
    credit: "Package Contents",
    kind: "image",
    src: "/product/10_whats_in_the_box.png",
    bg: "#eae2da",
    fit: "contain",
  },
];

export default function ProductPage() {
  return (
    <div className="bg-ivory pt-24 pb-24 md:pt-28">
      <div className="shell">
        <nav aria-label="Breadcrumb" className="text-[0.68rem] uppercase tracking-[0.2em] text-charcoal/40">
          <Link href="/" className="hover:text-gold-deep">Home</Link>
          <span className="mx-2" aria-hidden>/</span>
          <span className="text-charcoal/70">{product.name}</span>
        </nav>

        <ProductInteractiveSection items={gallery} viewerHref={product.viewerPath} />

        {/* -------------------------------------------------- editorial body */}
        <section className="mt-24 grid gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <Reveal>
              <p className="eyebrow text-gold-deep">Why it works</p>
              <h2 className="mt-4 text-[clamp(1.8rem,3.6vw,2.6rem)] leading-tight text-charcoal">
                A lamp that knows what it is.
              </h2>
              <p className="mt-5 text-[0.98rem] leading-relaxed text-charcoal/70">{product.longDescription}</p>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-charcoal/70">
                There is no app, no complicated setup, and no harsh glare. A flexible magnetic filament hangs inside a
                crystal-clear polycarbonate shell, a touch sensor on the front steps through 3-level dimming and breathing mode,
                and a Type-C port on the rear tops up the 1,500 mAh cell in 3 hours for 6–16 hours of continuous ambient glow.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  t: "High-transparency PC shell",
                  b: "Engineered for optical clarity and anti-drop durability, keeping the warm 2700K filament as the visual centrepiece.",
                },
                {
                  t: "Magnetic flexible filament",
                  b: "Held at the top by a magnetic contact, the flexible LED filament can sway naturally and snap right back into place.",
                },
                {
                  t: "6LM – 60LM brightness control",
                  b: "Tap the front touch button to cycle smoothly through 3-level dimming (Low, Medium, High) plus breathing mode.",
                },
                {
                  t: "Stable anti-slip base",
                  b: "Four soft rubberized pads underneath the matte ABS base (540g overall weight) keep the lamp firmly planted.",
                },
              ].map((f) => (
                <Reveal key={f.t} className="card p-5">
                  <h3 className="text-[1rem] text-charcoal">{f.t}</h3>
                  <p className="mt-2 text-[0.85rem] leading-relaxed text-charcoal/62">{f.b}</p>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-8 overflow-hidden rounded-[1.5rem] border border-charcoal/8 bg-[#ede4dd] shadow-[var(--shadow-card)]">
              <div className="relative aspect-[1596/1130] w-full">
                <Image
                  src="/product/09_three_colour_options.png"
                  alt="3 Elegant Colours: Yellow, Green, and Grey AuraGlow lamps side by side"
                  fill
                  sizes="(max-width: 1024px) 92vw, 640px"
                  className="object-contain p-2"
                />
              </div>
            </Reveal>
          </div>

          <div className="space-y-5">
            <Reveal className="overflow-hidden rounded-[1.5rem] border border-charcoal/8 bg-charcoal text-champagne shadow-[var(--shadow-card)]">
              <div className="relative aspect-[4/5] w-full bg-black">
                <video
                  src={product.video}
                  poster="/product/01_three_colour_studio_lineup.png"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-charcoal/85 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-amber backdrop-blur">
                  Hands-on product video
                </span>
              </div>
              <div className="p-5">
                <p className="text-[0.6rem] uppercase tracking-[0.24em] text-amber">Real product in hand</p>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-champagne/70">
                  Watch the unboxing, one-touch ignition, and the magnetic flexible filament moving inside the
                  transparent cylinder.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="overflow-hidden rounded-[1.5rem] border border-charcoal/8 bg-[#eae2da] shadow-[var(--shadow-card)]">
              <div className="relative aspect-[1593/1188] w-full">
                <Image
                  src="/product/10_whats_in_the_box.png"
                  alt="What's in the Box: Lamp, Type-C Cable, and User Manual"
                  fill
                  sizes="(max-width: 1024px) 92vw, 480px"
                  className="object-contain p-2"
                />
              </div>
            </Reveal>

            <Reveal delay={0.12} className="card p-6">
              <h3 className="text-[1.05rem] text-charcoal">Honest guardrails</h3>
              <ul className="mt-4 space-y-3 text-[0.84rem] leading-relaxed text-charcoal/65">
                {product.claimGuardrails.map((g) => (
                  <li key={g} className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                    {g}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15} className="card p-6">
              <h3 className="text-[1.05rem] text-charcoal">Care &amp; use</h3>
              <ul className="mt-4 space-y-2.5 text-[0.84rem] leading-relaxed text-charcoal/65">
                {product.care.map((c) => (
                  <li key={c} className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne ring-1 ring-gold/40" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------- visual feature breakdown */}
        <section className="mt-20">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-deep">Closer inspection</p>
            <h2 className="mt-3 text-[clamp(1.7rem,3.4vw,2.4rem)] leading-tight text-charcoal">
              Every detail, clearly photographed.
            </h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                src: "/product/06_adjustable_brightness.png",
                alt: "Adjustable Brightness: Low, Medium, High",
                title: "Adjustable Brightness",
                sub: "Low · Medium · High",
                bg: "#1b140e",
                fit: "contain" as const,
              },
              {
                src: "/product/07_type_c_charging_detail.png",
                alt: "Type-C Rechargeable: Power Bank, Laptop, Adapter",
                title: "Type-C Rechargeable",
                sub: "Power Bank · Laptop · Adapter",
                bg: "#e3dad0",
                fit: "contain" as const,
              },
              {
                src: "/product/12_anti_slip_base_detail.png",
                alt: "Stable Base with Anti-slip Pads",
                title: "Anti-Slip Base",
                sub: "4 cushioned rubber pads",
                bg: "#e6dfd9",
                fit: "contain" as const,
              },
              {
                src: "/product/11_lamp_side_view.png",
                alt: "Side view of AuraGlow lamp",
                title: "Side Profile",
                sub: "Crystal-clear PC & touch switch",
                bg: "#b89f88",
                fit: "cover" as const,
              },
            ].map((item) => (
              <Reveal key={item.title} className="card overflow-hidden">
                <div
                  className="relative aspect-[5/4] w-full overflow-hidden"
                  style={{ backgroundColor: item.bg }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 92vw, 300px"
                    className={item.fit === "contain" ? "object-contain p-1.5" : "object-cover"}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[0.98rem] text-charcoal">{item.title}</h3>
                  <p className="mt-1 text-[0.76rem] text-charcoal/55">{item.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="card p-7">
            <h2 className="text-[1.35rem] text-charcoal">Everything the listing states</h2>
            <dl className="mt-6 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {product.specifications.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5 border-b border-charcoal/6 pb-2">
                  <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-charcoal/45">{s.label}</dt>
                  <dd className={`text-[0.88rem] ${s.verified ? "text-charcoal" : "italic text-charcoal/45"}`}>{s.value}</dd>
                </div>
              ))}
            </dl>
            <ProvenanceNote>Italic lines are things we could not verify — they stay out of the marketing copy.</ProvenanceNote>
          </div>

          <div className="card-dark flex flex-col justify-between p-7 !border-transparent bg-charcoal text-champagne">
            <div>
              <p className="eyebrow text-amber">See it in your hand</p>
              <h2 className="mt-4 font-display text-[1.75rem] leading-tight text-ivory">
                Turn it, zoom it, find the inlet.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-champagne/65">
                The dedicated viewer loads the interactive 3D reconstruction — transparent cover, ABS base, filament,
                touch ring and USB-C recess — with orbit, zoom, presets, and base finish previews.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={product.viewerPath} className="btn btn-gold">Explore in 3D</Link>
              <Link href="/faq" className="btn btn-outline-light">Read the FAQ</Link>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <TemplateNote>
            Product copy, package contents and policy text are ready for your final business confirmation. Specification
            values are transcribed from the supplier listing and official HD product media.
          </TemplateNote>
        </section>
      </div>
    </div>
  );
}
