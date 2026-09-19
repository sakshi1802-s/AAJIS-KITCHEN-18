import type { QueryFilter } from "mongoose";
import { CATEGORIES, type MenuItemDTO } from "@shared/api";
import { NotFound } from "../lib/errors";
import { MenuItem, toMenuItemDTO, type MenuItemDoc } from "../models/MenuItem";
import type { MenuQueryInput } from "../schemas/menu.schema";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Public menu. Unavailable dishes are included on purpose — the card shows
 * "Not available today" rather than the dish silently vanishing. Only
 * soft-deleted dishes are hidden.
 */
export async function listMenu(query: MenuQueryInput): Promise<MenuItemDTO[]> {
  const filter: QueryFilter<MenuItemDoc> = { isDeleted: false };
  if (query.category) filter.category = query.category;
  if (query.isVeg !== undefined) filter.isVeg = query.isVeg;
  if (query.search) {
    const re = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ name: re }, { nameMarathi: re }, { tags: re }];
  }

  const items = await MenuItem.find(filter).lean();

  // Menu order: by category as the roadmap lists them, then alphabetically.
  items.sort(
    (a, b) =>
      CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name),
  );
  return items.map(toMenuItemDTO);
}

export async function getMenuItem(id: string): Promise<MenuItemDTO> {
  const item = await MenuItem.findOne({ _id: id, isDeleted: false }).lean();
  if (!item) throw NotFound("Dish");
  return toMenuItemDTO(item);
}
