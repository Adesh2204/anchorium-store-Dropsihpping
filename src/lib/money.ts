import { product, pricingFor, shipping } from "./config";

/** All amounts are integer paise end-to-end; rupee strings are never parsed. */
export const toRupees = (paise: number) => paise / 100;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPaise(paise: number, { precise = false } = {}) {
  return (precise ? inrPrecise : inr).format(toRupees(Math.round(paise)));
}

export function formatPaiseCompact(paise: number) {
  const rupees = toRupees(Math.round(paise));
  return rupees % 1 === 0 ? `₹${rupees.toLocaleString("en-IN")}` : inrPrecise.format(rupees);
}

export type CartLine = {
  /** variant id + outlet composite key */
  lineId: string;
  variantId: string;
  variantLabel: string;
  outletId: string;
  quantity: number;
  shopifyVariantId?: string | null;
  pricePaise?: number;
};

export type Totals = {
  itemCount: number;
  mrpPaise: number;
  subtotalPaise: number;
  discountPaise: number;
  discountPercent: number;
  shippingPaise: number;
  totalPaise: number;
  freeShipping: boolean;
};

export function unitSellPaise(variantId: string) {
  const variant = product.colorVariants.find((v) => v.id === variantId);
  return product.pricing.sellPaise + (variant?.priceDeltaPaise ?? 0);
}

export function unitMrpPaise(variantId: string) {
  const variant = product.colorVariants.find((v) => v.id === variantId);
  return product.pricing.mrpPaise + (variant?.priceDeltaPaise ?? 0);
}

export function computeTotals(lines: CartLine[]): Totals {
  let mrpPaise = 0;
  let subtotalPaise = 0;
  let itemCount = 0;

  for (const line of lines) {
    const qty = Math.max(0, Math.floor(line.quantity));
    itemCount += qty;
    subtotalPaise += unitSellPaise(line.variantId) * qty;
    mrpPaise += unitMrpPaise(line.variantId) * qty;
  }

  const discountPaise = Math.max(0, mrpPaise - subtotalPaise);
  const discountPercent = mrpPaise > 0 ? Math.round((discountPaise / mrpPaise) * 100) : pricingFor().discountPercent;
  const freeShipping =
    shipping.freeFirstOrder ||
    (shipping.freeThresholdPaise !== null && subtotalPaise >= shipping.freeThresholdPaise);
  const shippingPaise = itemCount === 0 ? 0 : freeShipping ? 0 : shipping.standardPaise;

  return {
    itemCount,
    mrpPaise,
    subtotalPaise,
    discountPaise,
    discountPercent,
    shippingPaise,
    totalPaise: subtotalPaise + shippingPaise,
    freeShipping,
  };
}

/** Server-side re-pricing used to validate anything the browser claims. */
export function serverQuote(lines: CartLine[]) {
  return computeTotals(lines);
}
