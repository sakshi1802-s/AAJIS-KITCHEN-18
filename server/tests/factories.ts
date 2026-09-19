import { MenuItem, type MenuItemDoc } from "../src/models/MenuItem";

let n = 0;

type MenuItemOverrides = Partial<Omit<MenuItemDoc, "createdAt" | "updatedAt">>;

export async function makeMenuItem(overrides: MenuItemOverrides = {}) {
  n += 1;
  return MenuItem.create({
    name: `Dish ${n}`,
    nameMarathi: "",
    description: "",
    category: "snacks",
    unitLabel: "per plate",
    price: 5000,
    minQuantity: 1,
    servesApprox: 1,
    isAvailable: true,
    stockCount: null,
    imageUrl: null,
    isVeg: true,
    tags: [],
    ...overrides,
  });
}
