import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Terms & conditions · Anchorium Store",
  description: "The offer, pricing, order creation, product limits and image rights for this store.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function Page() {
  return <PolicyPage docKey="terms" />;
}
