import type { Metadata } from "next";
import LampViewer from "@/components/viewer/LampViewer";
import { product } from "@/lib/config";

export const metadata: Metadata = {
  title: `AuraGlow — interactive 3D viewer`,
  description:
    "Rotate, zoom and inspect the AuraGlow ambient lamp in a dedicated 3D viewer: transparent PC cover, suspended filament, touch control, Type-C inlet, 70 × 70 × 145 mm.",
  alternates: { canonical: `${product.viewerPath}` },
};

export default function ThreeDViewerPage() {
  return <LampViewer />;
}
