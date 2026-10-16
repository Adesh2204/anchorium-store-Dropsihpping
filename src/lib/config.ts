/**
 * Anchorium Store — central configuration layer.
 *
 * EVERY commercial value on the site (pricing, discount, campaign window, variants,
 * shipping, product claims) is defined once here. Pages and components must import from
 * this file rather than hard-coding numbers or copy.
 *
 * Product facts are transcribed from the original CJdropshipping listing (SKU CJJT180225501AZ)
 * which is the single source of truth for physical attributes. Anything we could not verify
 * on the supplier page is explicitly marked `verified: false` and is NOT published as a claim.
 */

const INR = "INR";

/* ------------------------------------------------------------------ *
 * Site / brand
 * ------------------------------------------------------------------ */

export const site = {
  brand: "Anchorium Store",
  brandShort: "Anchorium",
  /** Never allow a misspelling to creep in. */
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "Anchorium Store",
  tagline: "Thoughtful ambient lighting. Beautifully simple design.",
  heroHeadline: "Bring home a little more glow.",
  support: {
    /** Configurable through .env — replace with your registered business details. */
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@anchorium.store",
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "",
    hours: "Monday – Saturday, 10:00 – 19:00 IST",
    addressLines: (process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "").split("|").filter(Boolean),
    responsePromise: "We reply to every message — most within one working day.",
  },
  /**
   * True only when the store owner has supplied a registered address + phone.
   * The UI uses this to display an honest "pending configuration" note instead of
   * fabricating business details.
   */
  businessDetailsConfigured:
    Boolean(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS) && Boolean(process.env.NEXT_PUBLIC_SUPPORT_PHONE),
} as const;

/* ------------------------------------------------------------------ *
 * Product — the real supplier lamp, sold under the AuraGlow store name
 * ------------------------------------------------------------------ */

export type ColorVariant = {
  id: string;
  /** Store-facing label */
  label: string;
  /** Exact label used on the supplier listing */
  supplierLabel: string;
  swatch: string;
  image: string;
  inStock: boolean;
  priceDeltaPaise: number;
  shopifyVariantId: string;
};

export const PRODUCT_CONFIG = {
  sku: "CJJT180225502BY",
  weight: "540g",
  material: "ABS + PC",
  batteryLife: "6–16 hours (3h full charge)",
  colorTemperature: "2700K Warm Yellow",
  brightness: "6LM – 60LM (3-level dimming + breathing mode)",
  interface: "Type-C USB",
  // Update pricing
  originalPrice: 4999,
  salePrice: 3999,
  shippingEstimate: "10–14 business days",
  codAvailable: false, // Ensure COD remains false
};

export const product = {
  slug: "auraglow",
  path: "/product/auraglow",
  viewerPath: "/product/auraglow/3d-view",
  /** Store-facing brand name for the supplier lamp. Not a redesign — the same physical item. */
  name: "AuraGlow",
  title: "AuraGlow Rechargeable Ambient LED Lamp",
  shortDescription:
    "A transparent silhouette. A warm suspended filament. A softer atmosphere for everyday moments.",
  longDescription:
    "AuraGlow is a compact, Type-C rechargeable ambient light built around a high-transparency PC cover and a flexible, suspended LED filament. Touch the base to hold a steady warm glow or let it breathe. It is not a room light — it is the small, deliberate glow that makes a corner feel finished.",
  supplier: {
    source: "CJdropshipping",
    sku: PRODUCT_CONFIG.sku,
    listingUrl:
      "https://www.cjdropshipping.com/product/new-led-camping-light-type-c-rechargeable-portable-night-light-with-high-transparency-and-anti-drop-creative-atmosphere-light-p-1681170786222088192.html",
    listingTitle:
      "New LED Camping Light Type-C Rechargeable Portable Night Light With High Transparency And Anti Drop Creative Atmosphere Light",
  },
  /** Prices stored in paise so the maths can never drift. */
  pricing: {
    currency: INR,
    mrpPaise: 499_900 as number,
    sellPaise: 399_900 as number,
  },
  campaign: {
    name: "Diwali Glow Sale",
    active: true,
    /** Real, fixed configured end date. Do not reset to manufacture urgency. */
    endsAt: "2026-11-11T23:59:59+05:30",
  },
  /** Authentic base finishes matching the exact color names shown on CJ and mapped to Shopify variants. */
  colorVariants: [
    {
      id: "dark-grey",
      label: "Dark Grey",
      supplierLabel: "Dark Grey",
      swatch: "#505254",
      image: "/product/04_grey_lamp_studio.png",
      inStock: true as boolean,
      priceDeltaPaise: 0 as number,
      shopifyVariantId:
        process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_GREY ||
        "gid://shopify/ProductVariant/auraglow-dark-grey",
    },
    {
      id: "green",
      label: "Green",
      supplierLabel: "Green",
      swatch: "#1D5236",
      image: "/product/02_green_lamp_dimensions.png",
      inStock: true as boolean,
      priceDeltaPaise: 0 as number,
      shopifyVariantId:
        process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_GREEN ||
        "gid://shopify/ProductVariant/auraglow-green",
    },
    {
      id: "yellow",
      label: "Warm Yellow / Light",
      supplierLabel: "Warm Yellow / Light",
      swatch: "#F5B800",
      image: "/product/03_yellow_lamp_studio.png",
      inStock: true as boolean,
      priceDeltaPaise: 0 as number,
      shopifyVariantId:
        process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_YELLOW ||
        "gid://shopify/ProductVariant/auraglow-yellow",
    },
  ] as ColorVariant[],
  video: "/product/auraglow-showcase.mp4",
  heroImage: "/product/01_three_colour_studio_lineup.png",
  outlet: { id: "usb-type-c", label: PRODUCT_CONFIG.interface, supplierLabel: "USB" },
  /** Additional supplier colour names on regional listings. */
  unlistedSupplierColours: ["Deep Space Grey", "Elegant White"],
  maxQuantityPerOrder: 10,
  dimensions: { w: 80, d: 80, h: 160, unit: "mm" },
  weight: PRODUCT_CONFIG.weight,
  material: PRODUCT_CONFIG.material,
  batteryLife: PRODUCT_CONFIG.batteryLife,
  colorTemperature: PRODUCT_CONFIG.colorTemperature,
  brightness: PRODUCT_CONFIG.brightness,
  interface: PRODUCT_CONFIG.interface,
  model: { glb: "/models/auraglow.glb", source: "/assets/source/auraglow.blend" },
  modes: [
    {
      id: "constant",
      name: "Adjustable brightness (Low · Medium · High)",
      detail:
        "Three warm 2700 K brightness steps — Low for a subtle bedside glow, Medium for atmospheric warmth, and High for a rich golden accent.",
    },
    {
      id: "breathing",
      name: "Breathing light & magnetic filament",
      detail:
        "A slow, restful rise and fall of intensity, paired with a flexible magnetic LED filament that sways and snaps back into place.",
    },
  ],
  /** Verified real product specifications directly from the supplier listing. */
  specifications: [
    { label: "SKU", value: PRODUCT_CONFIG.sku, verified: true },
    { label: "Overall size", value: "80 mm × 160 mm (cylindrical silhouette)", verified: true },
    { label: "Weight", value: PRODUCT_CONFIG.weight, verified: true },
    { label: "Material", value: PRODUCT_CONFIG.material, verified: true },
    { label: "Light source", value: "Suspended flexible magnetic LED filament", verified: true },
    { label: "Colour temperature", value: PRODUCT_CONFIG.colorTemperature, verified: true },
    { label: "Brightness levels", value: PRODUCT_CONFIG.brightness, verified: true },
    { label: "Controls", value: "Front capacitive touch button + status indicator", verified: true },
    { label: "Battery", value: "1,500 mAh lithium-ion", verified: true },
    { label: "Battery life / runtime", value: PRODUCT_CONFIG.batteryLife, verified: true },
    { label: "Full charge time", value: "3 hours via Type-C USB", verified: true },
    { label: "Charging interface", value: PRODUCT_CONFIG.interface, verified: true },
    { label: "Lamp life", value: "25,000 hours (listed)", verified: true },
    { label: "Protection rating", value: "IP20 — indoor use only", verified: true },
    { label: "Energy efficiency grade", value: "G", verified: true },
    { label: "Warranty", value: "Not published by the supplier — confirm with Anchorium", verified: false },
  ],
  /** Confirmed by 10_whats_in_the_box.png in the official HD product media. */
  packageContents: [
    {
      label: "AuraGlow ambient lamp",
      included: true,
      verified: true,
      note: "High-transparency PC cylinder with suspended warm LED filament and matte ABS base.",
    },
    {
      label: "USB Type-C charging cable",
      included: true,
      verified: true,
      note: "Compatible with power banks, laptops, and standard 5 V USB wall adapters.",
    },
    {
      label: "User manual",
      included: true,
      verified: true,
      note: "Quick-start guide covering touch controls, brightness steps, and battery care.",
    },
  ],
  care: [
    "Wipe the PC cover with a soft, dry cloth. Do not use solvents or abrasive pads.",
    "Indoor use only — the IP20 rating does not protect against water or dust ingress.",
    "Recharge with a standard 5 V USB Type-C supply (power bank, laptop, or adapter) before storing for long periods.",
    "Lithium-ion battery: do not crush, puncture, or leave in direct sun inside a closed vehicle.",
    "The magnetic filament is flexible and can move naturally; avoid forcing or creasing the LED strip.",
  ],
  /** What the listing says vs what we refuse to claim. */
  claimGuardrails: [
    "Marketing copy on some supplier listings describes the shell as waterproof. The published rating is IP20, which does not support waterproof claims — so we do not make one.",
    "At 6LM – 60LM (3-level dimming + breathing mode) this is an ambient accent light, not a primary room or task light.",
    "The filament is physically flexible and held by a top magnet — the 3D viewer on this site is an inspection preview, not a remote control.",
  ],
  assetProvenance: {
    authentic:
      "Every photograph and video on this site comes directly from the official HD studio, lifestyle, and hands-on product media.",
    visualisations:
      "Shown in its three authentic finishes — Dark Grey, Green, and Warm Yellow / Light — alongside real hands-on footage.",
    model:
      "The interactive 3D viewer is a parametric reconstruction of the transparent PC cover, suspended filament, touch control, and Type-C base.",
  },
} as const;

/* ------------------------------------------------------------------ *
 * Derived pricing — single formula used by every page
 * ------------------------------------------------------------------ */

export function pricingFor(
  quantity = 1,
  pricingOverride?: { mrpPaise: number; sellPaise: number },
) {
  const { mrpPaise, sellPaise } = pricingOverride ?? product.pricing;
  const unitMrp = mrpPaise * quantity;
  const unitSell = sellPaise * quantity;
  const discountPaise = unitMrp - unitSell;
  const discountPercent = unitMrp > 0 ? Math.round((discountPaise / unitMrp) * 100) : 0;
  const savingsPerUnitPaise = mrpPaise - sellPaise;
  return {
    mrpPaise,
    sellPaise,
    quantity,
    unitMrpPaise: unitMrp,
    unitSellPaise: unitSell,
    discountPaise,
    discountPercent,
    savingsPerUnitPaise,
    savingsPaise: discountPaise,
    campaignActive: product.campaign.active,
  };
}

export function variantImageFor(variantId?: string): string {
  const match = product.colorVariants.find((v) => v.id === variantId);
  return match?.image ?? "/product/01_three_colour_studio_lineup.png";
}

export function getVariantShopifyId(variantId?: string): string {
  const match = product.colorVariants.find((v) => v.id === variantId);
  return (
    match?.shopifyVariantId ||
    process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_GREY ||
    "gid://shopify/ProductVariant/auraglow-dark-grey"
  );
}

export type ProductConfig = typeof product;

/**
 * Fetch live product prices and stock levels from Shopify.
 * If Shopify returns live data, merges it with the local product configuration.
 * Falls back safely to configured product defaults if offline or Shopify is unreachable.
 */
export async function getLiveProductConfig(): Promise<ProductConfig> {
  try {
    const { getShopifyProduct, mapColorToShopifyVariant } = await import("./shopify");
    const liveShopify = await getShopifyProduct(product.slug);

    if (!liveShopify) {
      return product;
    }

    const liveMinPrice = parseFloat(liveShopify.priceRange.minVariantPrice.amount);
    const liveSellPaise: number = Number.isFinite(liveMinPrice) && liveMinPrice > 0
      ? Math.round(liveMinPrice * 100)
      : product.pricing.sellPaise;

    let liveMrpPaise: number = product.pricing.mrpPaise;
    if (liveShopify.compareAtPriceRange?.minVariantPrice?.amount) {
      const parsedCompare = parseFloat(liveShopify.compareAtPriceRange.minVariantPrice.amount);
      if (Number.isFinite(parsedCompare) && parsedCompare > 0) {
        liveMrpPaise = Math.round(parsedCompare * 100);
      }
    }

    const updatedVariants = product.colorVariants.map((v) => {
      const shopifyVariantId = mapColorToShopifyVariant(v.id, liveShopify.variants);
      const matchedVariant = liveShopify.variants.find((sv) => sv.id === shopifyVariantId);

      const inStock = matchedVariant
        ? Boolean(
            matchedVariant.availableForSale &&
              (matchedVariant.quantityAvailable === null ||
                matchedVariant.quantityAvailable === undefined ||
                matchedVariant.quantityAvailable > 0),
          )
        : v.inStock;

      let priceDeltaPaise = v.priceDeltaPaise;
      if (matchedVariant) {
        const vPrice = parseFloat(matchedVariant.price.amount);
        if (Number.isFinite(vPrice)) {
          priceDeltaPaise = Math.round(vPrice * 100) - liveSellPaise;
        }
      }

      return {
        ...v,
        inStock,
        priceDeltaPaise,
        shopifyVariantId,
      };
    });

    return {
      ...product,
      pricing: {
        ...product.pricing,
        sellPaise: liveSellPaise,
        mrpPaise: liveMrpPaise,
      },
      colorVariants: updatedVariants,
    };
  } catch (err) {
    console.warn("[getLiveProductConfig] Falling back to default product configuration:", err);
    return product;
  }
}

/* ------------------------------------------------------------------ *
 * Shipping / fulfilment — configured, not aspirational
 * ------------------------------------------------------------------ */

export const shipping = {
  /** Flat standard rate (₹99), shown struck-through when first-order free delivery applies. */
  standardPaise: 99_00,
  expressPaise: null as number | null,
  /** Free delivery on first order (₹99 shipping waived). */
  freeFirstOrder: true,
  firstOrderNote: "Free delivery on your first order",
  freeThresholdPaise: 0 as number | null,
  /** Realistic window for dispatched Indian orders. */
  estimate: { minBusinessDays: 10, maxBusinessDays: 14 },
  shippingEstimate: PRODUCT_CONFIG.shippingEstimate,
  insuredTitle: "Standard Insured Delivery: 10–14 business days",
  dispatchNote: "Orders are dispatched once the supplier confirms stock at origin.",
  codAvailable: false,
  prepaidOnlyNote:
    "100% Prepaid premium product — orders are secured and processed via UPI, Cards, and Net Banking (Cash on Delivery is disabled).",
  tracked: true,
} as const;

/* ------------------------------------------------------------------ *
 * Payment
 * ------------------------------------------------------------------ */

export const payment = {
  provider: "razorpay" as const,
  /** Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env to activate live payments. */
  liveConfiguredOnServer: Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  ),
  enabled: true,
  methods: [
    { id: "upi", label: "UPI", note: "GPay / PhonePe / Paytm — handled by the gateway" },
    { id: "card", label: "Cards", note: "Visa, Mastercard, RuPay, Amex — handled by the gateway" },
    { id: "netbanking", label: "Net banking", note: "Major Indian banks" },
    { id: "wallet", label: "Wallets", note: "Gateway-supported wallets" },
  ],
} as const;

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

export const nav = [
  { label: "Home", href: "/" },
  { label: "Product", href: product.path },
  { label: "Features", href: "/#features" },
  { label: "Explore in 3D", href: product.viewerPath },
  { label: "FAQ", href: "/faq" },
] as const;

export const footerNav = {
  shop: [
    { label: "AuraGlow lamp", href: product.path },
    { label: "Explore in 3D", href: product.viewerPath },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "/checkout" },
  ],
  support: [
    { label: "Customer support", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Order tracking request", href: "/contact?topic=order" },
  ],
  policies: [
    { label: "Shipping policy", href: "/shipping-policy" },
    { label: "Returns & refunds", href: "/returns-refunds" },
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms & conditions", href: "/terms-and-conditions" },
  ],
} as const;

export const businessConfig = { site, product, pricingFor, shipping, payment } as const;
