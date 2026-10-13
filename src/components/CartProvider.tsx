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
import { product } from "@/lib/config";
import { computeTotals, type CartLine, type Totals } from "@/lib/money";

const STORAGE_KEY = "anchorium.cart.v2";

type StoredLine = CartLine;

type CartContextValue = {
  lines: CartLine[];
  totals: Totals;
  hydrated: boolean;
  add: (line: Omit<CartLine, "lineId">, opts?: { redirectTo?: "cart" | "checkout" }) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  toast: string | null;
  dismissToast: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const lineKey = (variantId: string, outletId: string) => `${variantId}::${outletId}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<StoredLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* --- hydrate from storage (safe against corrupt payloads) --- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
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

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage may be unavailable (private mode) — cart still works in-memory */
    }
  }, [lines, hydrated]);

  const pushToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const add = useCallback<CartContextValue["add"]>(
    (line, opts) => {
      const id = lineKey(line.variantId, line.outletId);
      setLines((prev) => {
        const existing = prev.find((l) => l.lineId === id);
        const nextQty = clampQty((existing?.quantity ?? 0) + line.quantity);
        if (existing) {
          return prev.map((l) => (l.lineId === id ? { ...l, quantity: nextQty } : l));
        }
        return [...prev, { ...line, quantity: nextQty, lineId: id }];
      });
      pushToast(
        `${product.name} · ${line.variantLabel} added — ${plural(line.quantity)} in cart`,
      );
      const target = opts?.redirectTo;
      if (target && typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.href = target === "checkout" ? "/checkout" : "/cart";
        }, 420);
      }
    },
    [pushToast],
  );

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

  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(() => computeTotals(lines), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totals,
      hydrated,
      add,
      setQuantity,
      remove,
      clear,
      toast,
      dismissToast: () => setToast(null),
    }),
    [lines, totals, hydrated, add, setQuantity, remove, clear, toast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function optsredirectToPath(target: "cart" | "checkout") {
  return target === "checkout" ? "/checkout" : "/cart";
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
