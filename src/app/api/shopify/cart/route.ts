import { NextResponse } from "next/server";
import {
  createShopifyCart,
  getShopifyCart,
  addLinesToShopifyCart,
  updateShopifyCartLines,
  removeShopifyCartLines,
  type ShopifyCart,
} from "@/lib/shopify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFallbackCart(lines: { merchandiseId: string; quantity: number }[]): ShopifyCart {
  const domain =
    process.env.SHOPIFY_STORE_DOMAIN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
    "xuazin-nd.myshopify.com";

  // Build a direct permalink checkout URL: https://{domain}/cart/{variant_id}:{quantity}
  const cleanLines = lines.map((l) => {
    // If merchandiseId is a gid like gid://shopify/ProductVariant/12345, extract the numeric ID if possible
    const parts = l.merchandiseId.split("/");
    const id = parts[parts.length - 1];
    return `${id}:${l.quantity}`;
  });

  const checkoutPath = cleanLines.length > 0 ? `/cart/${cleanLines.join(",")}` : "/cart";
  const checkoutUrl = `https://${domain}${checkoutPath}`;

  const totalQty = lines.reduce((acc, l) => acc + l.quantity, 0);

  return {
    id: `local-cart-${Date.now()}`,
    checkoutUrl,
    totalQuantity: totalQty,
    cost: {
      totalAmount: { amount: "0.00", currencyCode: "INR" },
      subtotalAmount: { amount: "0.00", currencyCode: "INR" },
    },
    lines: lines.map((l, i) => ({
      id: `local-line-${i}`,
      quantity: l.quantity,
      merchandise: {
        id: l.merchandiseId,
        title: "AuraGlow Lamp",
        price: { amount: "3999.00", currencyCode: "INR" },
      },
    })),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, cartId, lines, lineIds } = body;

    if (action === "create") {
      const formattedLines = Array.isArray(lines) ? lines : [];
      let cart = await createShopifyCart(formattedLines);
      if (!cart) {
        cart = getFallbackCart(formattedLines);
      }
      return NextResponse.json({ ok: true, cart });
    }

    if (action === "get") {
      if (!cartId) {
        return NextResponse.json({ error: "Missing cartId" }, { status: 400 });
      }
      const cart = await getShopifyCart(cartId);
      return NextResponse.json({ ok: true, cart });
    }

    if (action === "add") {
      const formattedLines = Array.isArray(lines) ? lines : [];
      if (!cartId) {
        let cart = await createShopifyCart(formattedLines);
        if (!cart) cart = getFallbackCart(formattedLines);
        return NextResponse.json({ ok: true, cart });
      }

      let cart = await addLinesToShopifyCart(cartId, formattedLines);
      if (!cart) {
        // If existing cartId expired, try creating a new one
        cart = await createShopifyCart(formattedLines);
        if (!cart) cart = getFallbackCart(formattedLines);
      }
      return NextResponse.json({ ok: true, cart });
    }

    if (action === "update") {
      if (!cartId || !Array.isArray(lines)) {
        return NextResponse.json({ error: "Missing cartId or lines" }, { status: 400 });
      }
      const cart = await updateShopifyCartLines(cartId, lines);
      return NextResponse.json({ ok: true, cart });
    }

    if (action === "remove") {
      if (!cartId || !Array.isArray(lineIds)) {
        return NextResponse.json({ error: "Missing cartId or lineIds" }, { status: 400 });
      }
      const cart = await removeShopifyCartLines(cartId, lineIds);
      return NextResponse.json({ ok: true, cart });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("[/api/shopify/cart error]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

