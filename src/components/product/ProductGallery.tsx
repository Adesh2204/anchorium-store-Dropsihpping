"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DimensionsDiagram, PortDiagram } from "@/components/Diagrams";

export type GalleryItem = {
  id: string;
  label: string;
  caption: string;
  credit: string;
  kind: "image" | "video" | "diagram";
  src?: string;
  poster?: string;
  fit?: "cover" | "contain";
  bg?: string;
  diagram?: "dimensions" | "port";
  variantId?: string;
};

/**
 * Product gallery — official HD studio photography, lifestyle shots,
 * feature infographics, and real hands-on product video.
 */
export default function ProductGallery({
  items,
  viewerHref,
  selectedVariantId,
  onSelectVariant,
}: {
  items: GalleryItem[];
  viewerHref: string;
  selectedVariantId?: string;
  onSelectVariant?: (variantId: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedVariantId) return;
    const matchIdx = items.findIndex((it) => it.variantId === selectedVariantId);
    if (matchIdx !== -1) {
      setIndex(matchIdx);
    }
  }, [selectedVariantId, items]);

  const selectSlide = (next: number) => {
    const normalized = ((next % items.length) + items.length) % items.length;
    setIndex(normalized);
    const target = items[normalized];
    if (target?.variantId && onSelectVariant) {
      onSelectVariant(target.variantId);
    }
  };

  const go = (next: number) => selectSlide(next);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!frame.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length]);

  const active = items[index] ?? items[0];

  return (
    <div className="lg:sticky lg:top-28">
      <div
        ref={frame}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="AuraGlow product media gallery"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          touch.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - touch.current.x;
          if (Math.abs(dx) > 42 && Math.abs(t.clientY - touch.current.y) < 80) go(index + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
        style={{ backgroundColor: active.bg ?? "#0f0e0c" }}
        className="group relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-charcoal/8 shadow-[var(--shadow-luxe)] transition-colors duration-500 outline-offset-4"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {active.kind === "video" ? (
              <video
                src={active.src}
                poster={active.poster}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : active.kind === "image" ? (
              <Image
                src={active.src!}
                alt={active.caption}
                fill
                sizes="(max-width: 1024px) 94vw, 560px"
                className={active.fit === "contain" ? "object-contain p-2 sm:p-3" : "object-cover"}
                priority={index === 0}
              />
            ) : active.diagram === "port" ? (
              <div className="grid h-full w-full place-items-center p-4">
                <PortDiagram className="h-auto w-full" />
              </div>
            ) : (
              <div className="grid h-full w-full place-items-center bg-ivory p-4">
                <DimensionsDiagram className="h-auto w-full" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-black/55 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-champagne backdrop-blur">
          {active.credit}
        </span>

        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 text-charcoal opacity-0 shadow transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 text-charcoal opacity-0 shadow transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
        >
          →
        </button>

        {active.kind !== "video" && (
          <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-5 pt-12 text-[0.78rem] leading-relaxed text-champagne/90">
            {active.caption}
          </p>
        )}
      </div>

      <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Media thumbnails">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => selectSlide(i)}
            style={{ backgroundColor: it.bg ?? "#171510" }}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 ${
              i === index ? "border-gold ring-2 ring-gold/30 opacity-100" : "border-charcoal/10 opacity-75 hover:opacity-100"
            }`}
            title={it.label}
          >
            {it.kind === "video" ? (
              <span className="relative block h-full w-full">
                {it.poster ? (
                  <Image src={it.poster} alt="" aria-hidden fill sizes="80px" className="object-cover opacity-80" />
                ) : null}
                <span className="absolute inset-0 grid place-items-center bg-black/35">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-charcoal shadow">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                    </svg>
                  </span>
                </span>
              </span>
            ) : it.kind === "image" ? (
              <Image src={it.src!} alt="" aria-hidden fill sizes="80px" className="object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center bg-ivory px-1 text-center text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-gold-deep">
                {it.diagram === "port" ? "Rear / USB-C" : "Dimensions"}
              </span>
            )}
          </button>
        ))}
      </div>

      <Link
        href={viewerHref}
        className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-charcoal/10 bg-charcoal px-5 py-4 text-champagne transition-colors hover:border-gold/40"
      >
        <span>
          <span className="block text-[0.6rem] uppercase tracking-[0.24em] text-amber">Explore the 3D model</span>
          <span className="mt-1 block text-sm">Rotate, zoom and inspect every face</span>
        </span>
        <span className="text-lg text-amber" aria-hidden>↗</span>
      </Link>
    </div>
  );
}
