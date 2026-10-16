"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

export default function ClearCartOnSuccess() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    try {
      window.localStorage.removeItem("anchorium.cart.v2");
      window.localStorage.removeItem("anchorium.shopify.cartId");
      window.localStorage.removeItem("anchorium.shopify.checkoutUrl");
    } catch {}
  }, [clear]);

  return null;
}

