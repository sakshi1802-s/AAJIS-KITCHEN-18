import { describe, expect, it } from "vitest";
import type { MenuItemDTO } from "@shared/api";
import { cartReducer, cartTotal, lineFrom } from "./cartReducer";

const dish = (over: Partial<MenuItemDTO> = {}): MenuItemDTO => ({
  id: "modak",
  name: "Ukadiche Modak",
  nameMarathi: "उकडीचे मोदक",
  description: "",
  category: "snacks",
  unitLabel: "per piece",
  price: 3000,
  minQuantity: 1,
  servesApprox: 1,
  isAvailable: true,
  stockCount: 21,
  imageUrl: null,
  isVeg: true,
  tags: [],
  ...over,
});

describe("cartReducer", () => {
  it("one tap adds one — never a whole tray", () => {
    const lines = cartReducer([], { type: "add", item: dish(), quantity: 1 });
    expect(lines).toHaveLength(1);
    expect(lines[0]!.quantity).toBe(1);
  });

  it("still respects a dish that genuinely has a minimum above one", () => {
    const lines = cartReducer([], { type: "add", item: dish({ minQuantity: 6 }), quantity: 1 });
    expect(lines[0]!.quantity).toBe(6);
  });

  it("adding again increases the quantity instead of duplicating the line", () => {
    const once = cartReducer([], { type: "add", item: dish(), quantity: 1 });
    const twice = cartReducer(once, { type: "add", item: dish(), quantity: 1 });
    expect(twice).toHaveLength(1);
    expect(twice[0]!.quantity).toBe(2);
  });

  it("setting a quantity to zero removes the line", () => {
    const lines = cartReducer([lineFrom(dish(), 3)], { type: "setQuantity", menuItemId: "modak", quantity: 0 });
    expect(lines).toEqual([]);
  });

  it("reconcile takes the server's new price and keeps the chosen quantity", () => {
    const stale = [lineFrom(dish({ price: 2500 }), 20)];
    const fresh = cartReducer(stale, { type: "reconcile", item: dish({ price: 2800 }) });
    expect(fresh[0]).toMatchObject({ price: 2800, quantity: 20 });
  });

  it("reconcile raises the quantity when the minimum went up", () => {
    const stale = [lineFrom(dish({ minQuantity: 1 }), 2)];
    const fresh = cartReducer(stale, { type: "reconcile", item: dish({ minQuantity: 6 }) });
    expect(fresh[0]!.quantity).toBe(6);
  });

  it("totals multiply the snapshot price by quantity, in paise", () => {
    const lines = [lineFrom(dish({ price: 3000 }), 11), lineFrom(dish({ id: "pohe", price: 4000 }), 10)];
    expect(cartTotal(lines)).toBe(11 * 3000 + 10 * 4000);
  });

  it("clear empties everything", () => {
    expect(cartReducer([lineFrom(dish(), 2)], { type: "clear" })).toEqual([]);
  });
});
