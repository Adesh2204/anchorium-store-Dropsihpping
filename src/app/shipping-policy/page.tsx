import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Shipping policy · Anchorium Store",
  description: "Delivery window, charges, tracking and transit damage for AuraGlow orders across India.",
  alternates: { canonical: "/shipping-policy" },
};

export default function Page() {
  return <PolicyPage docKey="shipping" />;
}
