"use client";

import { useEffect, useState } from "react";
import { product } from "@/lib/config";

/**
 * Honest countdown: it reads a single configured campaign end date.
 * Once the date passes the sale label disappears — the timer never resets or fakes urgency.
 */
export default function CampaignCountdown({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(product.campaign.endsAt).getTime();
    if (!Number.isFinite(end)) return;
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!product.campaign.active) return null;

  const finished = remaining !== null && remaining <= 0;

  const d = remaining ? Math.floor(remaining / 86_400_000) : null;
  const h = remaining ? Math.floor((remaining / 3_600_000) % 24) : null;
  const m = remaining ? Math.floor((remaining / 60_000) % 60) : null;
  const s = remaining ? Math.floor((remaining / 1000) % 60) : null;

  const tone =
    variant === "dark" ? "text-champagne/85" : "text-charcoal/70";

  return (
    <span className={`inline-flex items-center gap-2 text-[0.68rem] font-medium tracking-[0.18em] uppercase ${tone}`}>
      {finished ? (
        <span>{product.campaign.name} has ended</span>
      ) : (
        <>
          <span className="hidden sm:inline">Ends in</span>
          <span className="tabular-nums" aria-live="off">
            {d === null ? (
              <span className="opacity-60">…</span>
            ) : (
              [
                [d, "d"],
                [h, "h"],
                [m, "m"],
                [s, "s"],
              ]
                .filter(([, unit], i) => i === 3 || (i < 3 && Number(d) > 0) || (i === 1 && Number(d) === 0))
                .map(([value, unit]) => (
                  <span key={unit as string} className="mr-1">
                    {String(value).padStart(2, "0")}
                    <span className="opacity-60">{unit as string}</span>
                  </span>
                ))
            )}
          </span>
        </>
      )}
    </span>
  );
}
