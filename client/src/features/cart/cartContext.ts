import { createContext, useContext } from "react";
import type { MenuItemDTO } from "@shared/api";

/**
 * A cart line keeps a snapshot of what the customer saw. The server re-checks
 * price and stock when the order is placed, so these values are for display
 * and for the 409 diff — never for deciding what anything costs.
 */
export interface CartLine {
  menuItemId: string;
  name: string;
  nameMarathi: string;
  unitLabel: string;
  /** paise, as shown when it went into the cart */
  price: number;
  quantity: number;
  minQuantity: number;
  imageUrl: string | null;
  category: MenuItemDTO["category"];
  isVeg: boolean;
}

export interface CartContextValue {
  lines: CartLine[];
  /** Total of the snapshot prices, in paise. */
  total: number;
  itemCount: number;
  add: (item: MenuItemDTO, quantity?: number) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  remove: (menuItemId: string) => void;
  clear: () => void;
  /** Applies a fresh menu item over a stale cart line (used by the 409 dialog). */
  reconcile: (item: MenuItemDTO) => void;
  quantityOf: (menuItemId: string) => number;
}

export const CartContext = createContext<CartContextValue | null>(null);

export const CART_STORAGE_KEY = "aji-cart";

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
