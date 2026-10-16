"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getVariantShopifyId, product } from "@/lib/config";
import { computeTotals, type CartLine, type Totals } from "@/lib/money";

const STORAGE_KEY = "anchorium.cart.v2";
const SHOPIFY_CART_KEY = "anchorium.shopify.cartId";
const SHOPIFY_CHECKOUT_URL_KEY = "anchorium.shopify.checkoutUrl";

type StoredLine = CartLine;

export type CartContextValue = {
  lines: CartLine[];
  totals: Totals;
  hydrated: boolean;
  add: (line: Omit<CartLine, "lineId">, opts?: { redirectTo?: "cart" | "checkout" }) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  toast: string | null;
  dismissToast: () => void;
  checkoutUrl: string | null;
  isSyncing: boolean;
  proceedToCheckout: () => Promise<void>;
  buyNow: (line: Omit<CartLine, "lineId">) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

const lineKey = (variantId: string, outletId: string) => `${variantId}::${outletId}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<StoredLine[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* --- hydrate from storage (safe against corrupt payloads) --- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const storedCartId = window.localStorage.getItem(SHOPIFY_CART_KEY);
      const storedCheckoutUrl = window.localStorage.getItem(SHOPIFY_CHECKOUT_URL_KEY);

      if (storedCartId) setCartId(storedCartId);
      if (storedCheckoutUrl) setCheckoutUrl(storedCheckoutUrl);

      if (raw) {
        const parsed = JSON.parse(raw) as StoredLine[];
        if (Array.isArray(parsed)) {
          const fallbackVariant = product.colorVariants[0];
          const clean = parsed
            .filter((l) => l && typeof l.variantId === "string" && typeof l.quantity === "number")
            .map((l) => {
              const matched = product.colorVariants.find((v) => v.id === l.variantId) ?? fallbackVariant;
              return {
                ...l,
                variantId: matched.id,
                variantLabel: matched.label,
                shopifyVariantId: l.shopifyVariantId || matched.shopifyVariantId || getVariantShopifyId(matched.id),
                quantity: clampQty(l.quantity),
                lineId: lineKey(matched.id, l.outletId ?? product.outlet.id),
              };
            });
          setLines(clean);
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  /* --- sync lines to local storage --- */
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage may be unavailable */
    }
  }, [lines, hydrated]);

  /* --- sync lines with Shopify Storefront Cart API --- */
  const syncWithShopify = useCallback(async (currentLines: StoredLine[]): Promise<string | null> => {
    if (currentLines.length === 0) {
      setCheckoutUrl(null);
      setCartId(null);
      try {
        window.localStorage.removeItem(SHOPIFY_CART_KEY);
        window.localStorage.removeItem(SHOPIFY_CHECKOUT_URL_KEY);
      } catch {}
      return null;
    }

    setIsSyncing(true);
    try {
      const formattedLines = currentLines.map((l) => ({
        merchandiseId: l.shopifyVariantId || getVariantShopifyId(l.variantId),
        quantity: l.quantity,
      }));

      const res = await fetch("/api/shopify/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", lines: formattedLines }),
      });

      const data = await res.json();
      if (data?.cart?.checkoutUrl) {
        const url = data.cart.checkoutUrl;
        const newId = data.cart.id;
        setCheckoutUrl(url);
        setCartId(newId);
        try {
          window.localStorage.setItem(SHOPIFY_CART_KEY, newId);
          window.localStorage.setItem(SHOPIFY_CHECKOUT_URL_KEY, url);
        } catch {}
        return url;
      }
    } catch (err) {
      console.warn("[CartProvider] Failed to sync with Shopify Cart API:", err);
    } finally {
      setIsSyncing(false);
    }
    return null;
  }, []);

  // Sync with Shopify whenever lines change and hydrated
  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    // Debounce cart sync to avoid spamming the Shopify Cart API
    const timer = setTimeout(() => {
      if (initialSyncDone.current || lines.length > 0) {
        syncWithShopify(lines);
      }
      initialSyncDone.current = true;
    }, 350);

    return () => clearTimeout(timer);
  }, [lines, hydrated, syncWithShopify]);

  const pushToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const add = useCallback<CartContextValue["add"]>(
    (line, opts) => {
      const shopifyVariantId =
        line.shopifyVariantId || getVariantShopifyId(line.variantId);
      const id = lineKey(line.variantId, line.outletId);

      let nextLines: StoredLine[] = [];
      setLines((prev) => {
        const existing = prev.find((l) => l.lineId === id);
        const nextQty = clampQty((existing?.quantity ?? 0) + line.quantity);
        if (existing) {
          nextLines = prev.map((l) =>
            l.lineId === id ? { ...l, quantity: nextQty, shopifyVariantId } : l,
          );
        } else {
          nextLines = [...prev, { ...line, shopifyVariantId, quantity: nextQty, lineId: id }];
        }
        return nextLines;
      });

      pushToast(
        `${product.name} · ${line.variantLabel} added — ${plural(line.quantity)} in cart`,
      );

      const target = opts?.redirectTo;
      if (target === "checkout") {
        setIsSyncing(true);
        syncWithShopify(nextLines).then((url) => {
          if (url && typeof window !== "undefined") {
            window.location.href = url;
          } else if (typeof window !== "undefined") {
            window.location.href = "/checkout";
          }
        });
      } else if (target === "cart" && typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.href = "/cart";
        }, 420);
      }
    },
    [pushToast, syncWithShopify],
  );

  const buyNow = useCallback(
    async (line: Omit<CartLine, "lineId">) => {
      const shopifyVariantId =
        line.shopifyVariantId || getVariantShopifyId(line.variantId);
      const id = lineKey(line.variantId, line.outletId);
      const singleLine = [{ ...line, shopifyVariantId, lineId: id, quantity: line.quantity }];

      setIsSyncing(true);
      try {
        const url = await syncWithShopify(singleLine);
        if (url && typeof window !== "undefined") {
          window.location.href = url;
          return;
        }
      } catch (err) {
        console.warn("[buyNow] Error creating checkout:", err);
      }
      if (typeof window !== "undefined") {
        window.location.href = "/checkout";
      }
    },
    [syncWithShopify],
  );

  const proceedToCheckout = useCallback(async () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }

    setIsSyncing(true);
    const url = await syncWithShopify(lines);
    if (url) {
      window.location.href = url;
    } else {
      window.location.href = "/checkout";
    }
  }, [checkoutUrl, lines, syncWithShopify]);

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.lineId !== lineId)
        : prev.map((l) => (l.lineId === lineId ? { ...l, quantity: clampQty(quantity) } : l)),
    );
  }, []);

  const remove = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCartId(null);
    setCheckoutUrl(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(SHOPIFY_CART_KEY);
      window.localStorage.removeItem(SHOPIFY_CHECKOUT_URL_KEY);
    } catch {}
  }, []);

  const totals = useMemo(() => computeTotals(lines), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totals,
      hydrated,
      add,
      buyNow,
      proceedToCheckout,
      setQuantity,
      remove,
      clear,
      toast,
      checkoutUrl,
      isSyncing,
      dismissToast: () => setToast(null),
    }),
    [
      lines,
      totals,
      hydrated,
      add,
      buyNow,
      proceedToCheckout,
      setQuantity,
      remove,
      clear,
      toast,
      checkoutUrl,
      isSyncing,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function clampQty(q: number) {
  const n = Math.floor(Number(q));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, product.maxQuantityPerOrder);
}

function plural(n: number) {
  return n === 1 ? "1 item" : `${n} items`;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
