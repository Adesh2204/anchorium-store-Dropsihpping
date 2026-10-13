"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { pricingFor, product } from "@/lib/config";
import { formatPaise } from "@/lib/money";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { useReducedMotion } from "framer-motion";
import CampaignCountdown from "@/components/CampaignCountdown";

/* ---------------------------------------------------------------- Reveal */

export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span" | "li" | "section" | "p";
}) {
  const MotionTag = motion[as as "div"] as typeof motion.div;
  const reduced = useReducedMotion() ?? false;
  return (
    <MotionTag
      variants={fadeUp}
      initial={reduced ? false : "hidden"}
      animate={reduced ? "show" : undefined}
      whileInView={reduced ? undefined : "show"}
      viewport={viewportOnce}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/* --------------------------------------------------------------- Headings */

export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "light",
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={`${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow ? (
        <p className={`eyebrow ${tone === "dark" ? "text-gold" : "text-gold-deep"}`}>{eyebrow}</p>
      ) : null}
      <h2
        className={`mt-4 text-[clamp(2rem,4.6vw,3.35rem)] leading-[1.06] ${
          tone === "dark" ? "text-ivory" : "text-charcoal"
        }`}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={`mt-5 text-[0.98rem] leading-relaxed ${
            tone === "dark" ? "text-champagne/70" : "text-charcoal/65"
          }`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- Pricing */

export function PriceBlock({
  tone = "light",
  size = "md",
  showSavings = true,
  showCountdown = false,
  className = "",
}: {
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showSavings?: boolean;
  showCountdown?: boolean;
  className?: string;
}) {
  const p = pricingFor();
  const priceSize =
    size === "lg"
      ? "text-[clamp(2.4rem,5.2vw,3.6rem)]"
      : size === "sm"
        ? "text-2xl"
        : "text-[2.15rem]";

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span
          className={`font-display font-medium tabular-nums leading-none ${priceSize} ${
            tone === "dark" ? "text-amber-glow" : "text-charcoal"
          }`}
        >
          {formatPaise(p.sellPaise)}
        </span>
        <span
          className={`text-lg line-through decoration-current/60 tabular-nums ${
            tone === "dark" ? "text-champagne/45" : "text-charcoal/35"
          }`}
        >
          {formatPaise(p.mrpPaise)}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.16em] ${
            tone === "dark" ? "bg-amber/18 text-amber-glow" : "bg-gold/14 text-gold-deep"
          }`}
        >
          {p.discountPercent}% off
        </span>
      </div>
      <div
        className={`mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.78rem] ${
          tone === "dark" ? "text-champagne/60" : "text-charcoal/55"
        }`}
        data-testid="price-meta"
      >
        {showSavings ? (
          <span>
            You save <strong className="font-semibold">{formatPaise(p.savingsPerUnitPaise)}</strong>
          </span>
        ) : null}
        <span>Inclusive of all taxes</span>
        <span
          className={`inline-flex items-center gap-1.5 font-medium ${
            tone === "dark" ? "text-emerald-300" : "text-emerald-700"
          }`}
        >
          <span>Free delivery on your first order</span>
          <span className={`line-through ${tone === "dark" ? "text-champagne/40" : "text-charcoal/35"}`}>
            ₹99
          </span>
        </span>
        {p.campaignActive ? (
          <span
            className={`inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em] ${
              tone === "dark" ? "text-amber" : "text-gold-deep"
            }`}
          >
            {product.campaign.name}
            {showCountdown ? <CampaignCountdown variant={tone === "dark" ? "dark" : "light"} /> : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Qty stepper */

export function QtyStepper({
  value,
  onChange,
  max,
  tone = "light",
  label = "Quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  tone?: "light" | "dark";
  label?: string;
}) {
  const cap = max ?? product.maxQuantityPerOrder;
  const btn = `grid h-10 w-10 place-items-center rounded-full border transition-colors ${
    tone === "dark"
      ? "border-champagne/22 text-champagne hover:border-amber hover:text-amber"
      : "border-charcoal/14 text-charcoal hover:border-gold hover:text-gold-deep"
  }`;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-[0.66rem] font-semibold uppercase tracking-[0.2em] ${
          tone === "dark" ? "text-champagne/55" : "text-charcoal/50"
        }`}
      >
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M6 12h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={cap}
          value={value}
          aria-label={label}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isFinite(next)) return;
            onChange(Math.min(cap, Math.max(1, Math.floor(next))));
          }}
          className={`h-10 w-14 rounded-full border text-center text-sm tabular-nums outline-none transition-colors ${
            tone === "dark"
              ? "border-champagne/22 bg-transparent text-champagne focus:border-amber"
              : "border-charcoal/14 bg-white text-charcoal focus:border-gold"
          }`}
        />
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.min(cap, value + 1))}
          disabled={value >= cap}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Accordion */

export function Accordion({
  items,
  tone = "light",
}: {
  items: { title: string; content: ReactNode; id?: string }[];
  tone?: "light" | "dark";
}) {
  return (
    <div className={`divide-y ${tone === "dark" ? "divide-champagne/12" : "divide-charcoal/8"}`}>
      {items.map((item) => (
        <details key={item.id ?? item.title} id={item.id} className="group py-1">
          <summary
            className={`flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[0.95rem] font-medium transition-colors ${
              tone === "dark" ? "text-champagne/85 hover:text-amber" : "text-charcoal hover:text-gold-deep"
            } [&::-webkit-details-marker]:hidden`}
          >
            {item.title}
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-transform duration-300 group-open:rotate-45 ${
                tone === "dark" ? "border-champagne/22" : "border-charcoal/14"
              }`}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </summary>
          <div
            className={`pb-5 pr-10 text-sm leading-relaxed ${
              tone === "dark" ? "text-champagne/62" : "text-charcoal/65"
            }`}
          >
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- Info notes */

export function TemplateNote({ children }: { children?: ReactNode }) {
  return (
    <aside className="rounded-2xl border border-gold/28 bg-gold/[0.07] px-5 py-4 text-sm leading-relaxed text-charcoal/72">
      <p className="eyebrow text-gold-deep">Editable template</p>
      <p className="mt-2">
        {children ??
          "This policy is a working template. Replace the text in src/lib/policies.ts with your registered business terms before launch — nothing here has been invented as a guarantee."}
      </p>
    </aside>
  );
}

export function ProvenanceNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-[0.72rem] leading-relaxed text-charcoal/45">
      <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

export function LinkArrow({
  href,
  children,
  tone = "light",
  external = false,
}: {
  href: string;
  children: ReactNode;
  tone?: "light" | "dark";
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener nofollow" } : {})}
      className={`group inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] transition-colors ${
        tone === "dark" ? "text-amber hover:text-amber-glow" : "text-gold-deep hover:text-gold"
      }`}
    >
      {children}
      <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
        →
      </span>
    </Link>
  );
}
