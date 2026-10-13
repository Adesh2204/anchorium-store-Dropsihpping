import Link from "next/link";

/**
 * Anchorium Store — brand logo system.
 *
 * A single shared component for every route (header, footer, product, 3D viewer,
 * cart, checkout, confirmation, policies) plus the standalone favicon in `app/icon.svg`.
 *
 * The mark is a geometric "A" whose crossbar is replaced by a suspended, sagging
 * LED filament — the exact gesture of the product. Pure vector, no raster text.
 */

export type LogoVariant = "dark" | "light";

export function AnchoriumMark({
  size = 36,
  variant = "dark",
  animated = false,
  className = "",
  title,
}: {
  size?: number;
  variant?: LogoVariant;
  animated?: boolean;
  className?: string;
  title?: string;
}) {
  const ink = variant === "light" ? "#F4E4B8" : "#171510";
  const gold = variant === "light" ? "#F5C84C" : "#D6A441";

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      fill="none"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="anc-gold" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F5C84C" />
          <stop offset="0.55" stopColor="#D6A441" />
          <stop offset="1" stopColor="#B9862A" />
        </linearGradient>
        <linearGradient id="anc-fil" x1="14" y1="30" x2="34" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFB52E" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#FFCF6B" />
          <stop offset="1" stopColor="#FFB52E" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* illumination arc — a soft halo over the apex */}
      <path
        d="M9 25A19 19 0 0 1 24 5a19 19 0 0 1 15 20"
        stroke={variant === "light" ? "rgba(244,228,184,.34)" : "rgba(214,164,65,.34)"}
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* the A */}
      <path
        d="M24 6.5 12.2 41.5"
        stroke={ink}
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <path
        d="M24 6.5 35.8 41.5"
        stroke="url(#anc-gold)"
        strokeWidth="3.1"
        strokeLinecap="round"
      />

      {/* suspended filament replaces the crossbar */}
      <path
        d="M15.6 27.4c2.4 6.2 14.4 6.2 16.8 0"
        stroke="url(#anc-fil)"
        strokeWidth="2.1"
        strokeLinecap="round"
        className={animated ? "anc-filament" : undefined}
      />
      <circle cx="24" cy="33.1" r="1.9" fill="#FFCF6B" />
      <circle cx="24" cy="6.5" r="2" fill="url(#anc-gold)" />

      <style>{`
        @keyframes ancPulse { 0%,100% { opacity:.72 } 50% { opacity:1 } }
        .anc-filament { animation: ancPulse 3.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .anc-filament { animation: none } }
      `}</style>
    </svg>
  );
}

export function Wordmark({
  variant = "dark",
  size = "md",
  showTag = true,
}: {
  variant?: LogoVariant;
  size?: "sm" | "md" | "lg";
  showTag?: boolean;
}) {
  const brand = variant === "light" ? "#FFF9ED" : "#171510";
  const sub = variant === "light" ? "rgba(244,228,184,.72)" : "rgba(23,21,16,.5)";
  const scale =
    size === "lg"
      ? { brand: "clamp(1.9rem,5vw,2.9rem)", sub: "0.72rem", gap: "0.62rem" }
      : size === "sm"
        ? { brand: "1.02rem", sub: "0.5rem", gap: "0.3rem" }
        : { brand: "1.32rem", sub: "0.56rem", gap: "0.42rem" };

  return (
    <span className="inline-flex flex-col leading-none" style={{ gap: scale.gap }}>
      <span
        className="font-display"
        style={{
          color: brand,
          fontSize: scale.brand,
          letterSpacing: "0.055em",
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        Anchorium
      </span>
      {showTag ? (
        <span
          style={{
            color: sub,
            fontSize: scale.sub,
            letterSpacing: "0.46em",
            textTransform: "uppercase",
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          Store
        </span>
      ) : null}
    </span>
  );
}

export default function Logo({
  variant = "dark",
  size = "md",
  href = "/",
  withLink = true,
  className = "",
  animated = true,
}: {
  variant?: LogoVariant;
  size?: "sm" | "md" | "lg";
  href?: string;
  withLink?: boolean;
  className?: string;
  animated?: boolean;
}) {
  const markSize = size === "lg" ? 54 : size === "sm" ? 26 : 36;

  const inner = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <AnchoriumMark size={markSize} variant={variant} animated={animated} title="Anchorium Store symbol" />
      <Wordmark variant={variant} size={size} />
    </span>
  );

  if (!withLink) return inner;

  return (
    <Link
      href={href}
      aria-label="Anchorium Store — home"
      className="inline-flex shrink-0 transition-opacity duration-300 hover:opacity-80"
    >
      {inner}
    </Link>
  );
}
