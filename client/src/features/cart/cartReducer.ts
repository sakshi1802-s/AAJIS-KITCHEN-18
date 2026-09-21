import type { MenuItemDTO } from "@shared/api";
import type { CartLine } from "./cartContext";

export type CartAction =
  | { type: "add"; item: MenuItemDTO; quantity: number }
  | { type: "setQuantity"; menuItemId: string; quantity: number }
  | { type: "remove"; menuItemId: string }
  | { type: "reconcile"; item: MenuItemDTO }
  | { type: "clear" };

export const lineFrom = (item: MenuItemDTO, quantity: number): CartLine => ({
  menuItemId: item.id,
  name: item.name,
  nameMarathi: item.nameMarathi,
  unitLabel: item.unitLabel,
  price: item.price,
  quantity,
  minQuantity: item.minQuantity,
  imageUrl: item.imageUrl,
  category: item.category,
  isVeg: item.isVeg,
});

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add": {
      const existing = lines.find((line) => line.menuItemId === action.item.id);
      if (!existing) {
        // A first add always respects the dish's minimum order quantity.
        return [...lines, lineFrom(action.item, Math.max(action.quantity, action.item.minQuantity))];
      }
      return lines.map((line) =>
        line.menuItemId === action.item.id ? { ...line, quantity: line.quantity + action.quantity } : line,
      );
    }
    case "setQuantity": {
      if (action.quantity <= 0) return lines.filter((line) => line.menuItemId !== action.menuItemId);
      return lines.map((line) =>
        line.menuItemId === action.menuItemId ? { ...line, quantity: action.quantity } : line,
      );
    }
    case "remove":
      return lines.filter((line) => line.menuItemId !== action.menuItemId);
    case "reconcile":
      // Fresh data from the server replaces the stale snapshot, keeping the
      // quantity the customer chose (raised to the minimum if that moved).
      return lines.map((line) =>
        line.menuItemId === action.item.id
          ? lineFrom(action.item, Math.max(line.quantity, action.item.minQuantity))
          : line,
      );
    case "clear":
      return [];
  }
}

export const cartTotal = (lines: CartLine[]): number =>
  lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
