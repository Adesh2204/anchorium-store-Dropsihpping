import { NextResponse } from "next/server";
import { getVariantShopifyId } from "@/lib/config";
import { createShopifyCart } from "@/lib/shopify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  lines?: { variantId?: string; outletId?: string; quantity?: number; shopifyVariantId?: string }[];
};

/**
 * Notice: Separate database e-commerce orders are discontinued.
 * Orders and payments are now handled directly through Shopify Checkout.
 * This endpoint converts any cart lines into a Shopify Storefront Cart and returns the secure checkoutUrl.
 */
export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const rawLines = Array.isArray(payload.lines) ? payload.lines : [];
  if (rawLines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  try {
    const shopifyLines = rawLines.map((l) => ({
      merchandiseId: l.shopifyVariantId || getVariantShopifyId(l.variantId),
      quantity: Math.max(1, Math.floor(Number(l.quantity ?? 1))),
    }));

    const cart = await createShopifyCart(shopifyLines);
    const domain =
      process.env.SHOPIFY_STORE_DOMAIN ||
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
      "xuazin-nd.myshopify.com";

    const checkoutUrl = cart?.checkoutUrl || `https://${domain}/cart`;

    return NextResponse.json({
      ok: true,
      message: "Order creation redirected to Shopify Secure Checkout.",
      checkoutUrl,
      redirect: checkoutUrl,
    });
  } catch (err: any) {
    console.error("[/api/orders] Error:", err);
    return NextResponse.json(
      {
        error: "Orders are now handled through Shopify Checkout.",
        checkoutUrl: "/cart",
      },
      { status: 200 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Orders and checkouts are managed directly via Shopify's Storefront Cart API and Checkout.",
  });
}
