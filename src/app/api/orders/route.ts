import { NextResponse } from "next/server";
import { getVariantShopifyId } from "@/lib/config";
import { createShopifyCart, isValidShopifyCheckoutUrl } from "@/lib/shopify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  lines?: { variantId?: string; outletId?: string; quantity?: number; shopifyVariantId?: string }[];
};

/**
 * Notice: Separate database e-commerce orders are discontinued.
 * Checkout is handled securely via Shopify's official hosted checkout.
 * This endpoint verifies the cart lines and initiates a real Shopify Storefront checkout session.
 */
export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request body." }, { status: 400 });
  }

  const rawLines = Array.isArray(payload.lines) ? payload.lines : [];
  if (rawLines.length === 0) {
    return NextResponse.json({ ok: false, error: "Your cart is empty." }, { status: 400 });
  }

  const shopifyLines: { merchandiseId: string; quantity: number }[] = [];
  for (const l of rawLines) {
    const variantId = l.shopifyVariantId || getVariantShopifyId(l.variantId);
    if (!variantId) {
      return NextResponse.json(
        {
          ok: false,
          error: `Selected finish (${l.variantId || "unknown"}) does not have an authentic Shopify variant ID. Purchasing is disabled for unverified options.`,
          code: "UNAVAILABLE_VARIANT",
        },
        { status: 422 },
      );
    }

    shopifyLines.push({
      merchandiseId: variantId,
      quantity: Math.max(1, Math.floor(Number(l.quantity ?? 1))),
    });
  }

  try {
    const result = await createShopifyCart(shopifyLines);

    if (!result.cart || !isValidShopifyCheckoutUrl(result.cart.checkoutUrl)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            result.error ||
            "Unable to generate an authentic Shopify Checkout URL. Please retry or contact support.",
          userErrors: result.userErrors,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl: result.cart.checkoutUrl,
    });
  } catch (err: any) {
    console.error("[/api/orders] Shopify Cart creation error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Shopify Checkout is currently unreachable. Please retry in a few moments.",
      },
      { status: 502 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Ecommerce orders are handled exclusively via Shopify Storefront Cart and Checkout.",
  });
}
