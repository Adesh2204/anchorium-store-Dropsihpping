import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: `${site.brand} — AuraGlow rechargeable ambient LED lamp`,
  description:
    "Bring home a little more glow. AuraGlow by Anchorium Store: a transparent ambient lamp with a warm suspended filament, Type-C charging and touch control. ₹3,999 (₹1,000 off ₹4,999) + free delivery on your first order.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomePage />;
}
