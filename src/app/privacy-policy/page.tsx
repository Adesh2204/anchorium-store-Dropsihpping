import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy policy · Anchorium Store",
  description: "What Anchorium Store collects at checkout, why it is stored, and who ever sees it.",
  alternates: { canonical: "/privacy-policy" },
};

export default function Page() {
  return <PolicyPage docKey="privacy" />;
}
