import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ItemCard } from "../types";

export interface CartLine {
  item: ItemCard;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  add: (item: ItemCard, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  remove: (itemId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "eventrenthub.cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const add: CartContextValue["add"] = (item, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.item.id === item.id ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { item, quantity }];
    });
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (itemId, quantity) =>
    setLines((prev) =>
      prev.map((l) =>
        l.item.id === itemId ? { ...l, quantity: Math.max(1, quantity) } : l,
      ),
    );

  const remove: CartContextValue["remove"] = (itemId) =>
    setLines((prev) => prev.filter((l) => l.item.id !== itemId));

  const clear = () => setLines([]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      add,
      updateQuantity,
      remove,
      clear,
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
