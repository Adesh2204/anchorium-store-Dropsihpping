"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import CampaignCountdown from "@/components/CampaignCountdown";
import { useCart } from "@/components/CartProvider";
import { pricingFor, product } from "@/lib/config";
import { formatPaise } from "@/lib/money";
import type { ViewName } from "@/components/viewer/LampCanvas";

const LampCanvas = dynamic(() => import("@/components/viewer/LampCanvas"), { ssr: false });

const VIEWS: { id: ViewName; label: string }[] = [
  { id: "three-quarter", label: "3/4" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "top", label: "Top" },
];

const MODELS = {
  loop: "/models/auraglow.glb",
  sculpt: "/models/auraglow-sculpt.glb",
} as const;

function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function LampViewer() {
  const { add } = useCart();
  const stage = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(8);
  const [hintVisible, setHintVisible] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [glbError, setGlbError] = useState(false);

  const [variantId, setVariantId] = useState<string>(product.colorVariants[0].id);
  const [glow, setGlow] = useState(0.85);
  const [mode, setMode] = useState<"steady" | "breathing">("steady");
  const [breathingGlow, setBreathingGlow] = useState(0.85);
  const [filament, setFilament] = useState<keyof typeof MODELS>("loop");
  const [distance, setDistance] = useState(3.15);
  const [view, setView] = useState<{ name: ViewName; token: number }>({ name: "three-quarter", token: 0 });

  useEffect(() => {
    if (mode !== "breathing") return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const wave = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(elapsed * (Math.PI * 2 / 8) - Math.PI / 2));
      setBreathingGlow(glow * wave);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode, glow]);

  const effectiveGlow = mode === "breathing" ? breathingGlow : glow;

  useEffect(() => {
    setWebgl(detectWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (ready) {
      setProgress(100);
      return;
    }
    const id = setInterval(() => setProgress((p) => Math.min(92, p + Math.max(2, (96 - p) / 9))), 90);
    return () => clearInterval(id);
  }, [ready]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setHintVisible(false), 6500);
    return () => clearTimeout(id);
  }, [ready]);

  const onFirstInteract = useCallback(() => {
    setHintVisible(false);
    setAutoRotate(false);
  }, []);

  const goView = useCallback((name: ViewName) => {
    setView((v) => ({ name, token: v.token + 1 }));
    setAutoRotate(false);
  }, []);

  const resetView = useCallback(() => {
    setDistance(3.15);
    setGlow(0.85);
    setAutoRotate(true);
    goView("three-quarter");
  }, [goView]);

  const toggleFullscreen = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => setHintVisible(false));
  }, []);

  const inStockVariants = useMemo(() => product.colorVariants.filter((v) => v.inStock), []);
  const selectedVariant = product.colorVariants.find((v) => v.id === variantId) ?? product.colorVariants[0];
  const price = pricingFor();
  const modelUrl = MODELS[filament];

  useEffect(() => {
    // If the exported GLB can't be fetched, the fallback panel explains itself honestly.
    let alive = true;
    setReady(false);
    setProgress(6);
    fetch(modelUrl, { method: "HEAD" })
      .then((r) => {
        if (!alive) return;
        if (!r.ok) setGlbError(true);
      })
      .catch(() => alive && setGlbError(true));
    return () => {
      alive = false;
    };
  }, [modelUrl]);

  return (
    <div className="relative min-h-screen bg-charcoal pt-28 pb-16 text-champagne">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Logo variant="light" size="sm" animated={false} />
            <p className="eyebrow mt-6 text-gold">Interactive 3D · dedicated viewer</p>
            <h1 className="mt-3 text-[clamp(2rem,4.4vw,3.1rem)] leading-[1.05] text-ivory">
              Inspect AuraGlow from every angle.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-champagne/62">
              A photo-derived 3D reconstruction of the supplier lamp at its listed{" "}
              <span className="text-champagne">70 × 70 × 145 mm</span> proportions — transparent PC cover, suspended
              filament, single touch control, Type-C inlet. It is a model, not a scan, and it cannot change your
              physical lamp.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={product.path} className="btn btn-outline-light px-5 py-2.5 text-[0.64rem]">
              Back to product
            </Link>
            <button
              type="button"
              className="btn btn-gold px-5 py-2.5 text-[0.64rem]"
              onClick={() =>
                add({
                  variantId: selectedVariant.id,
                  variantLabel: selectedVariant.label,
                  shopifyVariantId: selectedVariant.shopifyVariantId,
                  outletId: product.outlet.id,
                  quantity: 1,
                })
              }
            >
              Add to cart · {formatPaise(price.sellPaise)}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ------------------------------------------------------- stage */}
          <div
            ref={stage}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.6rem] border border-champagne/12 bg-[#141210] shadow-[0_40px_120px_-60px_rgba(0,0,0,.9)] lg:aspect-auto lg:min-h-[640px]"
          >
            {webgl === false || glbError ? (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <div className="max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/product/01_three_colour_studio_lineup.png"
                    alt="AuraGlow ambient lamp — official studio lineup"
                    className="mx-auto max-h-64 w-auto rounded-xl object-contain"
                  />
                  <h2 className="mt-5 text-xl text-ivory">3D is unavailable here</h2>
                  <p className="mt-2 text-sm leading-relaxed text-champagne/60">
                    {glbError
                      ? "The GLB model could not be loaded. Regenerate it with `npx tsx scripts/build-model.mts`, or browse the photography instead."
                      : "Your browser or device did not expose WebGL. This accurate photograph stands in for the model."}
                  </p>
                  <Link href={product.path} className="btn btn-gold mt-5 px-5 py-2.5 text-[0.64rem]">
                    View product gallery
                  </Link>
                </div>
              </div>
            ) : (
              webgl && (
                <LampCanvas
                  modelUrl={modelUrl}
                  variantId={variantId}
                  glow={effectiveGlow}
                  filament={filament}
                  view={view}
                  distance={distance}
                  autoRotate={autoRotate}
                  reducedMotion={reducedMotion}
                  onReady={() => setReady(true)}
                  onFirstInteract={onFirstInteract}
                />
              )
            )}

            {webgl !== false && !glbError && (
              <>
                <motion.div
                  animate={{ opacity: ready ? 0 : 1 }}
                  transition={{ duration: 0.4 }}
                  className="pointer-events-none absolute inset-0 grid place-items-center bg-charcoal"
                  aria-hidden={!ready}
                >
                  <div className="w-52 text-center">
                    <div className="mx-auto h-[2px] w-full overflow-hidden rounded-full bg-champagne/15">
                      <div className="h-full bg-gold transition-[width] duration-200" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-3 text-[0.66rem] uppercase tracking-[0.28em] text-champagne/55">
                      Loading GLB · {Math.round(progress)}%
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: ready && hintVisible ? 1 : 0, y: ready && hintVisible ? 0 : 10 }}
                  transition={{ duration: 0.5 }}
                  className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4"
                >
                  <p className="rounded-full border border-champagne/14 bg-charcoal/80 px-4 py-2 text-[0.68rem] tracking-[0.14em] text-champagne/75 backdrop-blur">
                    Drag to orbit · scroll or pinch to zoom · controls on the right
                  </p>
                </motion.div>

                <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-champagne/50">
                  <span className="rounded-full border border-champagne/14 px-2.5 py-1">auraglow{filament === "loop" ? "" : "-sculpt"}.glb</span>
                  <span className="rounded-full border border-champagne/14 px-2.5 py-1">PBR · transmission</span>
                  {autoRotate && !reducedMotion ? (
                    <span className="rounded-full border border-gold/35 px-2.5 py-1 text-amber">auto-orbit</span>
                  ) : null}
                </div>
              </>
            )}
          </div>

          {/* --------------------------------------------------- control rail */}
          <div className="flex flex-col gap-4">
            <section className="card-dark p-5">
              <h2 className="text-[0.66rem] uppercase tracking-[0.26em] text-gold">View presets</h2>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => goView(v.id)}
                    aria-pressed={view.name === v.id}
                    className={`rounded-xl border px-2 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] transition-colors ${
                      view.name === v.id
                        ? "border-gold bg-gold/12 text-amber"
                        : "border-champagne/14 text-champagne/70 hover:border-gold/50 hover:text-amber"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setDistance((d) => Math.max(1.7, d - 0.35))}
                  className="rounded-xl border border-champagne/14 py-2.5 text-lg text-champagne/80 transition-colors hover:border-gold/50 hover:text-amber"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setDistance((d) => Math.min(4.6, d + 0.35))}
                  className="rounded-xl border border-champagne/14 py-2.5 text-lg text-champagne/80 transition-colors hover:border-gold/50 hover:text-amber"
                  aria-label="Zoom out"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="rounded-xl border border-champagne/14 px-2 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-champagne/80 transition-colors hover:border-gold/50 hover:text-amber"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? "Exit" : "Full"}
                </button>
                <button
                  type="button"
                  onClick={() => setAutoRotate((v) => !v)}
                  aria-pressed={autoRotate}
                  className="rounded-xl border border-champagne/14 px-2 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-champagne/80 transition-colors hover:border-gold/50 hover:text-amber"
                >
                  {autoRotate ? "Stop" : "Spin"}
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="col-span-4 rounded-xl border border-champagne/14 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-champagne/70 transition-colors hover:border-gold hover:text-amber"
                >
                  Reset view
                </button>
              </div>
            </section>

            <section className="card-dark p-5">
              <h2 className="text-[0.66rem] uppercase tracking-[0.26em] text-gold">Lighting mode</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("steady")}
                  aria-pressed={mode === "steady"}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    mode === "steady"
                      ? "border-gold bg-gold/12 text-ivory"
                      : "border-champagne/14 text-champagne/70 hover:border-gold/50"
                  }`}
                >
                  <span className="block text-[0.72rem] font-semibold text-ivory">Constant</span>
                  <span className="block text-[0.62rem] text-champagne/50">Steady output</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("breathing")}
                  aria-pressed={mode === "breathing"}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    mode === "breathing"
                      ? "border-gold bg-gold/12 text-ivory"
                      : "border-champagne/14 text-champagne/70 hover:border-gold/50"
                  }`}
                >
                  <span className="block text-[0.72rem] font-semibold text-ivory">Breathing</span>
                  <span className="block text-[0.62rem] text-champagne/50">8-second wave</span>
                </button>
              </div>

              <div className="mt-5 flex items-baseline justify-between">
                <label htmlFor="glow" className="block text-[0.66rem] uppercase tracking-[0.26em] text-gold">
                  Light intensity
                </label>
                <span className="font-display text-sm text-amber-glow">
                  {Math.round(6 + glow * (60 - 6))} <small className="text-[0.65rem] text-champagne/50">lm</small>
                </span>
              </div>
              <input
                id="glow"
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={glow}
                onChange={(e) => setGlow(Number(e.target.value))}
                className="mt-3 w-full accent-[#D6A441]"
              />
              <div className="mt-1.5 flex justify-between text-[0.64rem] text-champagne/45">
                <span>6 lm (Soft glow)</span>
                <span>60 lm (Brightest)</span>
              </div>
            </section>

            <section className="card-dark p-5">
              <h2 className="text-[0.66rem] uppercase tracking-[0.26em] text-gold">Filament shape</h2>
              <p className="mt-2 text-xs leading-relaxed text-champagne/50">
                The listing describes a flexible magnetic filament that can be bent. Choose between the classic
                suspended loop and the straight vertical filament with brass fittings.
              </p>
              <div className="mt-3 space-y-2">
                {(["loop", "sculpt"] as const).map((id) => {
                  const label =
                    id === "loop" ? "Single suspended loop" : "Straight vertical filament";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFilament(id)}
                      aria-pressed={filament === id}
                      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
                        filament === id
                          ? "border-gold bg-gold/10 text-ivory"
                          : "border-champagne/12 text-champagne/70 hover:border-gold/40"
                      }`}
                    >
                      {label}
                      <span className={`text-[0.6rem] uppercase tracking-[0.18em] ${filament === id ? "text-amber" : "text-champagne/35"}`}>
                        {filament === id ? "Active" : "Switch"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="card-dark p-5">
              <h2 className="text-[0.66rem] uppercase tracking-[0.26em] text-gold">Base finish</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {inStockVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    aria-pressed={variantId === v.id}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
                      variantId === v.id ? "border-gold text-ivory" : "border-champagne/12 text-champagne/60 hover:border-gold/40"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full ring-1 ring-black/30" style={{ background: v.swatch }} />
                    {v.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[0.7rem] leading-relaxed text-champagne/45">
                Cover stays crystal-clear on every finish, as listed. Base reflects authentic ABS matte material.
              </p>
            </section>

            <section className="card-dark p-5">
              <h2 className="text-[0.66rem] uppercase tracking-[0.26em] text-gold">Model facts</h2>
              <dl className="mt-3 space-y-2 text-[0.78rem]">
                {[
                  ["Model source", "Component-accurate GLB reconstruction"],
                  ["Dimensions", "80 × 160 mm (or 70 × 145 mm listed)"],
                  ["Cover", "High-transparency PC shell with rolled rim"],
                  ["Base", "Matte ABS base with flush top plate"],
                  ["Controls", "Front touch button ring & indicator pinhole"],
                  ["Charging", "Rear USB Type-C port detail"],
                  ["Filament", "Suspended 2700 K LED filament with brass fittings"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-champagne/8 pb-1.5 last:border-0">
                    <dt className="text-champagne/45">{k}</dt>
                    <dd className="text-right text-champagne/80">{v}</dd>
                  </div>
                ))}
              </dl>
              <a
                href={modelUrl}
                download
                className="mt-4 inline-flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-amber hover:text-amber-glow"
              >
                Download .glb
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
                  <path d="M12 4v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </a>
            </section>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-champagne/12 px-5 py-4">
          <p className="text-xs text-champagne/55">
            Geometry, materials and dimensions follow the supplier listing — no invented screws, displays, buttons or accessories.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-champagne/60">{product.campaign.name}</span>
            <span className="font-display text-xl text-amber-glow">{formatPaise(price.sellPaise)}</span>
            <span className="text-champagne/40 line-through">{formatPaise(price.mrpPaise)}</span>
            <CampaignCountdown variant="dark" />
          </div>
        </div>
      </div>
    </div>
  );
}
