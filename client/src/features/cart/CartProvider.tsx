import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { CART_STORAGE_KEY, CartContext, type CartContextValue, type CartLine } from "./cartContext";
import { cartReducer, cartTotal } from "./cartReducer";

function readStoredCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Anything that doesn't look like a line is dropped rather than trusted.
    return parsed.filter(
      (line): line is CartLine =>
        typeof line === "object" &&
        line !== null &&
        typeof (line as CartLine).menuItemId === "string" &&
        typeof (line as CartLine).quantity === "number" &&
        typeof (line as CartLine).price === "number",
    );
  } catch {
    return [];
  }
}

/**
 * The cart lives in Context and is mirrored to localStorage, so a refresh —
 * or the round trip through Google sign-in at checkout — doesn't lose it.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, undefined, readStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // A cart that can't be saved still works for this visit.
    }
  }, [lines]);

  const quantityOf = useCallback(
    (menuItemId: string) => lines.find((line) => line.menuItemId === menuItemId)?.quantity ?? 0,
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      total: cartTotal(lines),
      itemCount: lines.reduce((count, line) => count + line.quantity, 0),
      // One tap adds one. The reducer still raises it if a dish ever carries a
      // minimum above 1.
      add: (item, quantity = 1) => dispatch({ type: "add", item, quantity }),
      setQuantity: (menuItemId, quantity) => dispatch({ type: "setQuantity", menuItemId, quantity }),
      remove: (menuItemId) => dispatch({ type: "remove", menuItemId }),
      clear: () => dispatch({ type: "clear" }),
      reconcile: (item) => dispatch({ type: "reconcile", item }),
      quantityOf,
    }),
    [lines, quantityOf],
  );

  return <CartContext value={value}>{children}</CartContext>;
}
