"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "framer-motion";
import { AnchoriumMark } from "@/components/Logo";
import { PriceBlock, ProvenanceNote, Reveal, SectionHeading } from "@/components/ui";
import { useCart } from "@/components/CartProvider";
import { pricingFor, product } from "@/lib/config";
import { formatPaise } from "@/lib/money";
import { fadeUp, imageReveal, stagger, viewportOnce } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const price = pricingFor();
const heroImage = "/product/01_three_colour_studio_lineup.png";

export default function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { add } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.colorVariants.find((v) => v.inStock)?.id ?? product.colorVariants[0].id,
  );
  const variant =
    product.colorVariants.find((v) => v.id === selectedVariantId) ?? product.colorVariants[0];

  /* ---------------- GSAP / ScrollTrigger choreography ---------------- */
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-progress]", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.3 },
      });

      gsap.to("[data-hero-copy]", {
        y: -70,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: "[data-scene='a']", start: "top top", end: "bottom top", scrub: 0.5 },
      });

      gsap.to("[data-hero-art]", {
        y: 90,
        scale: 1.05,
        ease: "none",
        scrollTrigger: { trigger: "[data-scene='a']", start: "top top", end: "bottom top", scrub: 0.5 },
      });

      // Scene B — restrained camera push-in on the real product frame
      gsap.fromTo(
        "[data-pushin]",
        { scale: 1.01, yPercent: 2 },
        {
          scale: 1.09,
          yPercent: -2,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-scene='b']",
            start: "top top",
            end: "+=95%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax || 32);
        gsap.fromTo(
          el,
          { y: amount },
          {
            y: -amount,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.7 },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-tilt-in]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40, rotate: Number(el.dataset.tiltIn || 0) },
          {
            opacity: 1,
            y: 0,
            rotate: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 84%" },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <div ref={root} className="bg-ivory">
      {/* scroll progress */}
      <div
        data-progress
        className="fixed left-0 top-0 z-40 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-gold via-amber to-champagne"
        aria-hidden
      />

      {/* ============================ SCENE A — brand reveal ============================ */}
      <section
        data-scene="a"
        className="relative flex min-h-[100svh] items-center overflow-hidden bg-charcoal pt-28 pb-16 text-champagne"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 70% at 62% 32%, rgba(255,181,46,.26), transparent 62%), radial-gradient(60% 50% at 12% 88%, rgba(214,164,65,.18), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="festive-pattern pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="grain pointer-events-none absolute inset-0" aria-hidden />

        <div className="shell relative grid items-center gap-10 lg:grid-cols-[0.98fr_1.08fr] lg:gap-14">
          <motion.div
            data-hero-copy
            variants={stagger(0.12)}
            initial="hidden"
            animate="show"
            className="max-w-xl"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <AnchoriumMark size={44} variant="light" animated />
              <span className="eyebrow text-gold">Anchorium Store · ambient lighting</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-7 text-[clamp(2.6rem,6.4vw,4.6rem)] leading-[0.98] text-ivory"
            >
              Bring home a little more glow.
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-champagne/70">
              Thoughtful ambient lighting in three signature finishes — Dark Grey, Green, and Warm Yellow / Light.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-7 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-full border border-champagne/16 bg-white/[0.03] px-5 py-3"
            >
              <span className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-amber">
                {product.campaign.name}
              </span>
              <span className="font-display text-2xl text-amber-glow">{formatPaise(price.sellPaise)}</span>
              <span className="text-sm text-champagne/45 line-through">{formatPaise(price.mrpPaise)}</span>
              <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-amber">
                {price.discountPercent}% off
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link href={product.path} className="btn btn-gold">
                Shop the lamp
              </Link>
              <a href="#features" className="btn btn-outline-light">
                Watch hands-on video
              </a>
              <Link href={product.viewerPath} className="btn btn-outline-light">
                Explore in 3D
              </Link>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 max-w-sm text-[0.74rem] leading-relaxed text-champagne/45">
              High-transparency PC cylinder, matte ABS base with anti-slip pads, suspended magnetic LED filament, touch
              brightness control, and USB Type-C charging.
            </motion.p>
          </motion.div>

          <motion.div
            data-hero-art
            initial={{ opacity: 0, scale: 0.96, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-[5/4] w-full max-w-[600px] overflow-hidden rounded-[2rem] border border-champagne/16 bg-[#8d745a] shadow-[0_60px_140px_-60px_rgba(0,0,0,.9)]">
              <Image
                src={heroImage}
                alt="AuraGlow ambient LED lamp studio lineup showing Dark Grey, Green, and Warm Yellow / Light finishes glowing warmly"
                fill
                priority
                loading="eager"
                sizes="(max-width: 1024px) 94vw, 600px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-champagne/15 bg-charcoal/75 px-4 py-2.5 text-[0.68rem] text-champagne/85 backdrop-blur">
                <span className="font-semibold uppercase tracking-[0.18em] text-amber">3 signature finishes</span>
                <span>Dark Grey · Green · Warm Yellow / Light</span>
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-full bg-amber/25 blur-3xl" aria-hidden />
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <span className="flex flex-col items-center gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-champagne/40">
            Scroll
            <span className="h-10 w-px bg-gradient-to-b from-gold/70 to-transparent" aria-hidden />
          </span>
        </div>
      </section>

      {/* ============================ SCENE B — product intro ============================ */}
      <section data-scene="b" className="relative flex min-h-screen items-center bg-ivory py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative">
            <div data-pushin className="relative aspect-[7/6] w-full overflow-hidden rounded-[2rem] bg-[#362619] shadow-[var(--shadow-luxe)]">
              <Image
                src="/product/08_green_lamp_lifestyle.png"
                alt="AuraGlow Green lamp glowing warmly on a wooden bedside nightstand in the evening"
                fill
                sizes="(max-width: 1024px) 92vw, 640px"
                className="object-cover"
              />
            </div>
            <div className="absolute -left-4 bottom-8 hidden rounded-2xl border border-charcoal/10 bg-white/95 px-5 py-4 shadow-[var(--shadow-card)] sm:block">
              <p className="text-[0.6rem] uppercase tracking-[0.24em] text-gold-deep">2700K Warm Yellow</p>
              <p className="mt-1 font-display text-2xl text-charcoal">Low · Med · High</p>
              <p className="text-[0.68rem] text-charcoal/50">6LM – 60LM · touch adjustable</p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow={product.name}
              title={<>Meet {product.name}.</>}
              intro="A crystal-clear silhouette. A warm suspended magnetic filament. A softer atmosphere for bedside tables, study desks, and evening corners."
            />
            <motion.ul
              variants={stagger(0.09)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="mt-8 grid gap-3 sm:grid-cols-2"
            >
              {[
                ["Cover", "High-transparency anti-drop PC"],
                ["Base", "Matte ABS + 4 anti-slip pads"],
                ["Battery", "1,500 mAh, USB Type-C"],
                ["Size", "80 mm × 160 mm"],
              ].map(([k, v]) => (
                <motion.li key={k} variants={fadeUp} className="card px-4 py-3.5">
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold-deep">{k}</p>
                  <p className="mt-1 text-sm font-medium text-charcoal">{v}</p>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={product.path} className="btn btn-ink">
                Shop the lamp
              </Link>
              <Link href={product.viewerPath} className="btn btn-outline">
                Explore in 3D
              </Link>
            </div>
            <div className="mt-6">
              <ProvenanceNote>{product.assetProvenance.visualisations}</ProvenanceNote>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ SCENE C — video & design details ============================ */}
      <section id="features" className="relative overflow-hidden bg-charcoal py-24 text-champagne md:py-32">
        <div className="shell relative">
          <SectionHeading
            tone="dark"
            align="center"
            eyebrow="Hands-on & details"
            title="Designed to catch the eye."
            intro="Watch the real lamp in action — from the touch-sensitive base and flexible magnetic filament to its crystal-clear cover and USB Type-C charging port."
          />

          <div className="mt-16 grid gap-6 lg:grid-cols-[0.9fr_1.3fr] lg:items-stretch">
            <motion.div
              variants={imageReveal}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-champagne/14 bg-[#110f0c] shadow-[var(--shadow-luxe)]"
            >
              <div className="relative aspect-[9/14] w-full overflow-hidden bg-black sm:aspect-[4/5] lg:h-full lg:aspect-auto">
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
                <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-charcoal/85 px-3.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-amber backdrop-blur">
                  Real hands-on video · magnetic filament
                </span>
              </div>
              <div className="border-t border-champagne/10 bg-charcoal/95 p-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold">
                  See it in motion
                </p>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-champagne/65">
                  Touch the front button to ignite the filament. Give it a gentle shake to watch the flexible LED loop
                  move and snap right back to its top magnetic contact.
                </p>
              </div>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  src: "/product/11_lamp_side_view.png",
                  alt: "Side view of AuraGlow lamp showing high-transparency PC cover, suspended filament, and green ABS base",
                  bg: "#b89f88",
                  fit: "cover" as const,
                  title: "High-transparency PC cylinder",
                  body: "A crystal-clear, anti-drop polycarbonate cover keeps the silhouette practically invisible until the warm 2700 K filament lights up.",
                },
                {
                  src: "/product/06_adjustable_brightness.png",
                  alt: "Adjustable brightness comparison showing Low, Medium, and High warm light levels",
                  bg: "#1b140e",
                  fit: "contain" as const,
                  title: "Adjustable brightness (Low · Med · High)",
                  body: "Step smoothly between Low bedside warmth, Medium ambient glow, and High golden accent lighting with the single front touch sensor.",
                },
                {
                  src: "/product/07_type_c_charging_detail.png",
                  alt: "Close-up of the rear USB Type-C charging port with Power Bank, Laptop, and Adapter icons",
                  bg: "#e3dad0",
                  fit: "contain" as const,
                  title: "USB Type-C rechargeable",
                  body: "A recessed Type-C port on the rear of the base recharges the 1,500 mAh battery from any power bank, laptop, or wall adapter.",
                },
                {
                  src: "/product/12_anti_slip_base_detail.png",
                  alt: "Underside of the green lamp base showing 4 black anti-slip rubber pads",
                  bg: "#e6dfd9",
                  fit: "contain" as const,
                  title: "Stable base with anti-slip pads",
                  body: "Four soft anti-slip pads on the underside of the matte ABS base keep the lamp steady and protect wood, glass, and bedside surfaces.",
                },
              ].map((c, i) => (
                <div key={c.title} data-tilt-in={i % 2 ? 1.2 : -1.2} className="card-dark flex flex-col overflow-hidden">
                  <div
                    className="relative aspect-[5/4] w-full overflow-hidden"
                    style={{ backgroundColor: c.bg }}
                  >
                    <Image
                      src={c.src}
                      alt={c.alt}
                      fill
                      sizes="(max-width: 640px) 92vw, 380px"
                      className={c.fit === "contain" ? "object-contain p-1.5" : "object-cover"}
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="text-[1.02rem] text-ivory">{c.title}</h3>
                      <p className="mt-2 text-[0.82rem] leading-relaxed text-champagne/60">{c.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <div className="text-center">
              <p className="eyebrow text-gold">Three authentic base finishes</p>
              <h3 className="mt-3 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ivory">
                Pick the colour that fits your corner.
              </h3>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {product.colorVariants.map((v) => {
                const isGreen = v.id === "green";
                const cardBg =
                  v.id === "yellow" ? "#e4a602" : isGreen ? "#133e23" : "#898383";
                return (
                  <Link
                    key={v.id}
                    href={product.path}
                    onClick={() => setSelectedVariantId(v.id)}
                    className="group card-dark overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
                  >
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden"
                      style={{ backgroundColor: cardBg }}
                    >
                      <Image
                        src={v.image}
                        alt={`${product.name} in ${v.label} (${v.supplierLabel})`}
                        fill
                        sizes="(max-width: 640px) 92vw, 380px"
                        className={`${
                          isGreen ? "object-contain p-2" : "object-cover"
                        } transition-transform duration-700 group-hover:scale-105`}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-5">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-5 w-5 shrink-0 rounded-full ring-2 ring-white/25"
                          style={{ background: v.swatch }}
                        />
                        <div>
                          <p className="text-base font-medium text-ivory">{v.label}</p>
                          <p className="text-[0.7rem] text-champagne/55">Colour: {v.supplierLabel}</p>
                        </div>
                      </div>
                      <span className="text-sm text-amber transition-transform duration-300 group-hover:translate-x-1">
                        Shop →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ SCENE D — atmosphere & lineup ============================ */}
      <section className="bg-ivory py-24 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="In the room"
            title="A little warmth changes everything."
            intro="Whether resting on a wooden nightstand, lined up across a living-room shelf, or glowing softly on its side, AuraGlow brings a calm 2700 K presence to any space."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {[
              {
                src: "/product/08_green_lamp_lifestyle.png",
                alt: "AuraGlow Green lamp glowing on a wooden bedside nightstand",
                title: "Bedside, after lights out",
                note: "Warm 2700 K glow — gentle enough for late nights",
                bg: "#362619",
                fit: "cover" as const,
              },
              {
                src: "/product/01_three_colour_studio_lineup.png",
                alt: "AuraGlow Yellow, Green, and Grey lamps glowing together in a studio lineup",
                title: "Evening living space",
                note: "Warm golden reflections across all three finishes",
                bg: "#8d745a",
                fit: "cover" as const,
              },
              {
                src: "/product/09_three_colour_options.png",
                alt: "3 Elegant Colours comparison showing Yellow, Green, and Grey AuraGlow lamps",
                title: "3 elegant colours",
                note: "Dark Grey, Green & Warm Yellow / Light",
                bg: "#ede4dd",
                fit: "contain" as const,
              },
              {
                src: "/product/11_lamp_side_view.png",
                alt: "Close-up horizontal side profile of the AuraGlow lamp",
                title: "Sculptural from every angle",
                note: "Suspended filament and crystal-clear PC shell",
                bg: "#b89f88",
                fit: "cover" as const,
              },
            ].map((s, i) => (
              <figure
                key={s.title}
                data-tilt-in={i === 1 || i === 2 ? 1 : -1}
                style={{ backgroundColor: s.bg }}
                className="group relative overflow-hidden rounded-[1.6rem] border border-charcoal/8 shadow-[var(--shadow-card)]"
              >
                <div data-parallax={i % 2 ? 14 : 20} className="relative aspect-[5/4]">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 768px) 92vw, 620px"
                    className={`${
                      s.fit === "contain" ? "object-contain p-3 pb-16" : "object-cover"
                    } transition-transform duration-[1.4s] group-hover:scale-[1.03]`}
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent p-5 pt-14">
                  <div>
                    <p className="text-[0.98rem] text-ivory">{s.title}</p>
                    <p className="text-[0.72rem] text-champagne/65">{s.note}</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-amber" aria-hidden />
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-6">
            <ProvenanceNote>{product.assetProvenance.authentic}</ProvenanceNote>
          </div>
        </div>
      </section>

      {/* ============================ SCENE E — lighting modes & adjustable brightness ============================ */}
      <section className="relative overflow-hidden bg-[#1b1810] py-24 text-champagne md:py-28">
        <div className="pointer-events-none absolute inset-0 festive-pattern opacity-70" aria-hidden />
        <div className="shell relative grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <SectionHeading
              tone="dark"
              eyebrow="Adjustable brightness & modes"
              title="Choose your kind of glow."
              intro="Tap the front touch sensor on the base to step through Low, Medium, and High brightness or switch into a gentle breathing rhythm."
            />
            <ul className="mt-8 space-y-4">
              {product.modes.map((m) => (
                <li key={m.id} className="rounded-2xl border border-champagne/12 bg-white/[0.03] p-5">
                  <p className="text-[0.6rem] uppercase tracking-[0.24em] text-amber">{m.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-champagne/70">{m.detail}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-md text-[0.74rem] leading-relaxed text-champagne/45">
              Output spans 6LM – 60LM (3-level dimming + breathing mode) at a 2700K Warm Yellow colour temperature —
              crafted for atmosphere and bedside comfort rather than harsh overhead illumination.
            </p>
          </div>

          <Reveal className="overflow-hidden rounded-[1.75rem] border border-champagne/14 bg-[#1a130d] shadow-[var(--shadow-luxe)]">
            <div className="relative aspect-[1592/1476] w-full">
              <Image
                src="/product/06_adjustable_brightness.png"
                alt="Adjustable Brightness chart showing Low, Medium, and High brightness levels on the AuraGlow lamp"
                fill
                sizes="(max-width: 1024px) 94vw, 620px"
                className="object-contain"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ SCENE F — portability, charging, dimensions & box ============================ */}
      <section className="bg-ivory py-24 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Everyday mechanics"
              title="Compact by design. Complete in the box."
              intro="Recharges over USB Type-C from a power bank, laptop, or wall adapter, stands steady on four anti-slip pads, and arrives with the lamp, Type-C cable, and user manual."
            />
            <dl className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {[
                ["USB Type-C charging", "Rear Type-C port recharges seamlessly from a Power Bank, Laptop, or 5 V USB Adapter."],
                ["1,500 mAh battery", "Cord-free placement on nightstands, shelves, dining tables, or festive corners."],
                ["Compact dimensions", "80 mm diameter × 160 mm height — easy to pick up and carry in one hand."],
                ["Anti-slip base", "Four cushioned anti-slip pads underneath the ABS base keep it stable on smooth surfaces."],
                ["Touch control", "Single front capacitive touch button with a discreet status indicator pinhole below."],
                ["What’s in the box", "Includes 1× AuraGlow Lamp, 1× USB Type-C Cable, and 1× User Manual."],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-gold-deep">{k}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-charcoal/70">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={product.path} className="btn btn-ink">
                Full specifications
              </Link>
              <Link href="/faq" className="btn btn-outline">
                Charging &amp; battery FAQ
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Reveal className="overflow-hidden rounded-[1.5rem] border border-charcoal/10 bg-[#133e23] shadow-[var(--shadow-card)]">
              <div className="relative aspect-[1373/1596] w-full">
                <Image
                  src="/product/02_green_lamp_dimensions.png"
                  alt="AuraGlow dimensions: 80 mm width by 160 mm height shown on the Green lamp"
                  fill
                  sizes="(max-width: 640px) 92vw, 320px"
                  className="object-contain p-2"
                />
              </div>
            </Reveal>

            <div className="grid gap-5">
              <Reveal delay={0.08} className="overflow-hidden rounded-[1.5rem] border border-charcoal/10 bg-[#e3dad0] shadow-[var(--shadow-card)]">
                <div className="relative aspect-[1589/1314] w-full">
                  <Image
                    src="/product/07_type_c_charging_detail.png"
                    alt="Type-C Rechargeable port compatible with Power Bank, Laptop, and Adapter"
                    fill
                    sizes="(max-width: 640px) 92vw, 320px"
                    className="object-contain p-1.5"
                  />
                </div>
              </Reveal>

              <Reveal delay={0.14} className="overflow-hidden rounded-[1.5rem] border border-charcoal/10 bg-[#eae2da] shadow-[var(--shadow-card)]">
                <div className="relative aspect-[1593/1188] w-full">
                  <Image
                    src="/product/10_whats_in_the_box.png"
                    alt="What's in the Box: AuraGlow Lamp, Type-C Cable, and User Manual"
                    fill
                    sizes="(max-width: 640px) 92vw, 320px"
                    className="object-contain p-1.5"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ SCENE G — Diwali campaign ============================ */}
      <section className="relative overflow-hidden bg-charcoal py-24 text-champagne md:py-32">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/product/01_three_colour_studio_lineup.png"
            alt=""
            fill
            sizes="100vw"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/35" />
          <div className="absolute inset-0 festive-pattern" />
        </div>

        <div className="shell relative grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <motion.div variants={stagger(0.11)} initial="hidden" whileInView="show" viewport={viewportOnce}>
            <motion.p variants={fadeUp} className="eyebrow text-amber">
              {product.campaign.name} · limited window
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-5 text-[clamp(2.3rem,5.4vw,4rem)] leading-[1.02] text-ivory">
              Let every corner glow.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-md text-[1rem] leading-relaxed text-champagne/70">
              Celebrate the season of light with a warm 2700 K golden filament and timeless cylindrical design.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 max-w-md rounded-[1.5rem] border border-champagne/14 bg-white/[0.04] p-6 backdrop-blur">
              <PriceBlock tone="dark" size="lg" showCountdown />
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={product.path} className="btn btn-gold">
                  Buy for {formatPaise(price.sellPaise)}
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={() =>
                    add({
                      variantId: variant.id,
                      variantLabel: variant.label,
                      shopifyVariantId: variant.shopifyVariantId,
                      outletId: product.outlet.id,
                      quantity: 1,
                    })
                  }
                >
                  Quick add · {variant.label}
                </button>
              </div>
              <p className="mt-4 text-[0.7rem] leading-relaxed text-champagne/45">
                Saving of {formatPaise(price.savingsPerUnitPaise)} per lamp, applied automatically. The campaign ends
                on the date shown — the timer never resets.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            data-parallax="24"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto hidden aspect-[1383/1596] w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-amber/25 bg-[#e4a602] shadow-[0_60px_140px_-60px_rgba(0,0,0,.95)] lg:block"
          >
            <Image
              src="/product/03_yellow_lamp_studio.png"
              alt="AuraGlow in Warm Yellow / Light finish glowing against a warm golden backdrop"
              fill
              sizes="420px"
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ============================ SCENE H — conversion ============================ */}
      <section className="bg-ivory py-24 md:py-28">
        <div className="shell">
          <div className="grid items-center gap-12 overflow-hidden rounded-[2rem] border border-charcoal/8 bg-white p-8 shadow-[var(--shadow-card)] md:p-12 lg:grid-cols-[1fr_1.05fr]">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-charcoal/8 transition-colors duration-500"
              style={{
                backgroundColor:
                  variant.id === "yellow" ? "#e4a602" : variant.id === "green" ? "#133e23" : "#898383",
              }}
            >
              <Image
                src={variant.image}
                alt={`AuraGlow lamp in ${variant.label} (${variant.supplierLabel})`}
                fill
                sizes="(max-width: 1024px) 88vw, 520px"
                className={variant.id === "green" ? "object-contain p-2" : "object-cover"}
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="Ready when you are"
                title="One glow. Two taps away."
                intro="Choose your finish — Dark Grey, Green, or Warm Yellow / Light — add it to your cart or go straight to checkout. The Diwali price is already applied."
              />
              <div className="mt-6">
                <p className="field-label">Select finish</p>
                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {product.colorVariants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      aria-pressed={v.id === variant.id}
                      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-xs transition-all ${
                        v.id === variant.id
                          ? "border-gold bg-gold/10 shadow-[0_0_0_3px_rgba(214,164,65,.14)]"
                          : "border-charcoal/12 hover:border-gold/50"
                      }`}
                    >
                      <span
                        className="h-5 w-5 shrink-0 rounded-full ring-1 ring-black/15"
                        style={{ background: v.swatch }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-charcoal">{v.label}</span>
                        <span className="block truncate text-[0.64rem] text-charcoal/50">{v.inStock ? "In stock" : "Not stocked"}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "2700 K warm filament · Low, Med, High",
                  "Type-C rechargeable · 1,500 mAh",
                  "Stable base with 4 anti-slip pads",
                  "Lamp + Type-C cable + manual in box",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-charcoal/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <PriceBlock size="md" showCountdown />
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={product.path} className="btn btn-ink">
                  View the product
                </Link>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={() =>
                    add(
                      {
                        variantId: variant.id,
                        variantLabel: variant.label,
                        shopifyVariantId: variant.shopifyVariantId,
                        outletId: product.outlet.id,
                        quantity: 1,
                      },
                      { redirectTo: "checkout" },
                    )
                  }
                >
                  Buy now · {variant.label}
                </button>
                <Link href={product.viewerPath} className="btn btn-outline">
                  Explore in 3D
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[0.72rem] text-charcoal/55">
                <Link href="/shipping-policy" className="hover:text-gold-deep">
                  Shipping &amp; delivery
                </Link>
                <Link href="/returns-refunds" className="hover:text-gold-deep">
                  Returns &amp; refunds
                </Link>
                <Link href="/contact" className="hover:text-gold-deep">
                  Talk to us
                </Link>
                <Link href="/faq" className="hover:text-gold-deep">
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
