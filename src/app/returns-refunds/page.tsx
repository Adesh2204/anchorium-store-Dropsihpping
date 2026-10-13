import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Returns & refunds · Anchorium Store",
  description: "What we accept today, what is not covered, and how refunds are settled through the gateway.",
  alternates: { canonical: "/returns-refunds" },
};

export default function Page() {
  return <PolicyPage docKey="returns" />;
}
