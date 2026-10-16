import { NextResponse } from "next/server";
import {
  createShopifyCart,
  getShopifyCart,
  addLinesToShopifyCart,
  updateShopifyCartLines,
  removeShopifyCartLines,
  isValidShopifyCheckoutUrl,
} from "@/lib/shopify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, cartId, lines, lineIds } = body;

    if (action === "create") {
      const formattedLines = Array.isArray(lines) ? lines : [];
      if (formattedLines.length === 0) {
        return NextResponse.json({ ok: false, error: "Cart is empty." }, { status: 400 });
      }

      const result = await createShopifyCart(formattedLines);
      if (!result.cart || !isValidShopifyCheckoutUrl(result.cart.checkoutUrl)) {
        return NextResponse.json(
          {
            ok: false,
            error:
              result.error ||
              "Unable to create a secure Shopify cart. Please verify your store configuration and try again.",
            userErrors: result.userErrors,
          },
          { status: 502 },
        );
      }

      return NextResponse.json({ ok: true, cart: result.cart });
    }

    if (action === "get") {
      if (!cartId) {
        return NextResponse.json({ ok: false, error: "Missing cartId" }, { status: 400 });
      }
      const cart = await getShopifyCart(cartId);
      if (!cart) {
        return NextResponse.json({ ok: false, error: "Cart not found or expired." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, cart });
    }

    if (action === "add") {
      const formattedLines = Array.isArray(lines) ? lines : [];
      if (formattedLines.length === 0) {
        return NextResponse.json({ ok: false, error: "No items to add." }, { status: 400 });
      }

      if (!cartId) {
        const createResult = await createShopifyCart(formattedLines);
        if (!createResult.cart || !isValidShopifyCheckoutUrl(createResult.cart.checkoutUrl)) {
          return NextResponse.json(
            {
              ok: false,
              error:
                createResult.error ||
                "Failed to create Shopify cart with selected items. Please try again.",
              userErrors: createResult.userErrors,
            },
            { status: 502 },
          );
        }
        return NextResponse.json({ ok: true, cart: createResult.cart });
      }

      const addResult = await addLinesToShopifyCart(cartId, formattedLines);
      if (!addResult.cart) {
        // If the cart expired on Shopify, attempt creating a fresh cart once
        const fallbackCreate = await createShopifyCart(formattedLines);
        if (fallbackCreate.cart && isValidShopifyCheckoutUrl(fallbackCreate.cart.checkoutUrl)) {
          return NextResponse.json({ ok: true, cart: fallbackCreate.cart });
        }

        return NextResponse.json(
          {
            ok: false,
            error:
              addResult.error ||
              fallbackCreate.error ||
              "Could not add items to Shopify cart. Please refresh and try again.",
            userErrors: addResult.userErrors,
          },
          { status: 502 },
        );
      }

      return NextResponse.json({ ok: true, cart: addResult.cart });
    }

    if (action === "update") {
      if (!cartId || !Array.isArray(lines)) {
        return NextResponse.json({ ok: false, error: "Missing cartId or lines" }, { status: 400 });
      }
      const updateResult = await updateShopifyCartLines(cartId, lines);
      if (!updateResult.cart) {
        return NextResponse.json(
          {
            ok: false,
            error: updateResult.error || "Failed to update item quantities in Shopify cart.",
            userErrors: updateResult.userErrors,
          },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true, cart: updateResult.cart });
    }

    if (action === "remove") {
      if (!cartId || !Array.isArray(lineIds)) {
        return NextResponse.json({ ok: false, error: "Missing cartId or lineIds" }, { status: 400 });
      }
      const removeResult = await removeShopifyCartLines(cartId, lineIds);
      if (!removeResult.cart) {
        return NextResponse.json(
          {
            ok: false,
            error: removeResult.error || "Failed to remove items from Shopify cart.",
            userErrors: removeResult.userErrors,
          },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true, cart: removeResult.cart });
    }

    return NextResponse.json({ ok: false, error: `Unsupported cart action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("[/api/shopify/cart error]", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error communicating with Shopify." },
      { status: 500 },
    );
  }
}
