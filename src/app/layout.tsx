import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import CartToast from "@/components/CartToast";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL("https://anchorium.store"),
  title: {
    default: `${site.brand} — AuraGlow rechargeable ambient LED lamp`,
    template: `%s · ${site.brand}`,
  },
  description:
    "Anchorium Store sells AuraGlow: a transparent, Type-C rechargeable ambient LED lamp with a warm suspended filament. ₹3,999 during the Diwali Glow Sale with free delivery on your first order.",
  applicationName: site.brand,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: `${site.brand} — Bring home a little more glow.`,
    description: site.tagline,
    siteName: site.brand,
    type: "website",
    images: [{ url: "/product/01_three_colour_studio_lineup.png", width: 1596, height: 1284 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#171510",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..600&family=Manrope:wght@300..700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-ivory text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-charcoal focus:px-5 focus:py-3 focus:text-sm focus:text-ivory"
        >
          Skip to content
        </a>
        <CartProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartToast />
        </CartProvider>
      </body>
    </html>
  );
}
