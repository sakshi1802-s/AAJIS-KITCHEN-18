import { describe, expect, it } from "vitest";
import type { MenuItemDTO } from "@shared/api";
import { cartReducer, cartTotal, lineFrom } from "./cartReducer";

const dish = (over: Partial<MenuItemDTO> = {}): MenuItemDTO => ({
  id: "modak",
  name: "Ukadiche Modak",
  nameMarathi: "उकडीचे मोदक",
  description: "",
  category: "sweets",
  unitLabel: "per piece",
  price: 3000,
  minQuantity: 11,
  servesApprox: 1,
  isAvailable: true,
  stockCount: 21,
  imageUrl: null,
  isVeg: true,
  tags: [],
  ...over,
});

describe("cartReducer", () => {
  it("a first add is raised to the dish's minimum quantity", () => {
    const lines = cartReducer([], { type: "add", item: dish(), quantity: 1 });
    expect(lines).toHaveLength(1);
    expect(lines[0]!.quantity).toBe(11);
  });

  it("adding again increases the quantity instead of duplicating the line", () => {
    const once = cartReducer([], { type: "add", item: dish(), quantity: 11 });
    const twice = cartReducer(once, { type: "add", item: dish(), quantity: 5 });
    expect(twice).toHaveLength(1);
    expect(twice[0]!.quantity).toBe(16);
  });

  it("setting a quantity to zero removes the line", () => {
    const lines = cartReducer([lineFrom(dish(), 11)], { type: "setQuantity", menuItemId: "modak", quantity: 0 });
    expect(lines).toEqual([]);
  });

  it("reconcile takes the server's new price and keeps the chosen quantity", () => {
    const stale = [lineFrom(dish({ price: 2500 }), 20)];
    const fresh = cartReducer(stale, { type: "reconcile", item: dish({ price: 2800 }) });
    expect(fresh[0]).toMatchObject({ price: 2800, quantity: 20 });
  });

  it("reconcile raises the quantity when the minimum went up", () => {
    const stale = [lineFrom(dish({ minQuantity: 11 }), 11)];
    const fresh = cartReducer(stale, { type: "reconcile", item: dish({ minQuantity: 21 }) });
    expect(fresh[0]!.quantity).toBe(21);
  });

  it("totals multiply the snapshot price by quantity, in paise", () => {
    const lines = [lineFrom(dish({ price: 3000 }), 11), lineFrom(dish({ id: "pohe", price: 4000 }), 10)];
    expect(cartTotal(lines)).toBe(11 * 3000 + 10 * 4000);
  });

  it("clear empties everything", () => {
    expect(cartReducer([lineFrom(dish(), 11)], { type: "clear" })).toEqual([]);
  });
});
